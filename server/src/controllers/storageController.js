const storageController = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { Storage } = require('@google-cloud/storage');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

// ─── Helper: RFC 5987 compliant Content-Disposition header ────────────────────
// Properly encodes UTF-8 / Cyrillic filenames using both ASCII fallback
// and filename* parameter (RFC 5987).
function buildContentDisposition(filename) {
    // Strip any non-ASCII for the fallback
    // eslint-disable-next-line no-control-regex
    const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '\\"');
    const utf8Encoded = encodeURIComponent(filename);
    return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${utf8Encoded}`;
}

// ─── Google Cloud Storage Setup ────────────────────────────────────────────────
// Firebase Storage IS Google Cloud Storage. We reuse the Firebase service account
// credentials for authentication.

let storage;

if (process.env.NODE_ENV !== 'production') {
    const serviceAccountPath = path.resolve(__dirname, '../config/firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
        storage = new Storage({
            projectId: 'pensaclub-909e0',
            keyFilename: serviceAccountPath
        });
    } else {
        storage = new Storage({ projectId: 'pensaclub-909e0' });
    }
} else {
    // Production: use env vars to build credentials inline
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        storage = new Storage({
            projectId: process.env.FIREBASE_PROJECT_ID,
            credentials: {
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            }
        });
    } else {
        storage = new Storage({ projectId: 'pensaclub-909e0' });
    }
}

const BUCKET_NAME = process.env.GCS_BUCKET || 'pensaclub-909e0.appspot.com';
const bucket = storage.bucket(BUCKET_NAME);

// ─── Multer (memory storage, 500MB max) ────────────────────────────────────────
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PROTECTED_ROOT_FOLDERS = [
    'seminars/',
    'academy/',
    'ads/',
    'articles/',
    'initiatives/',
    'projects/',
    'publications/',
    'stories/',
    'clubs/',
    'profiles/',
    'pensa-foundation/',
    'courses/'
];

const isProtectedPath = (filePath) => {
    return PROTECTED_ROOT_FOLDERS.includes(filePath);
};

const sanitizeFileName = (name) => {
    // Allow unicode letters, numbers, dots, hyphens, underscores, spaces
    return name.replace(/[^\w\s.\-\u00C0-\u024F\u0400-\u04FF]/g, '_').trim();
};

const getMimeType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
        '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf', '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.mp4': 'video/mp4', '.webm': 'video/webm', '.avi': 'video/x-msvideo',
        '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
        '.zip': 'application/zip', '.rar': 'application/vnd.rar',
        '.json': 'application/json', '.xml': 'application/xml',
        '.txt': 'text/plain', '.csv': 'text/csv', '.html': 'text/html',
        '.css': 'text/css', '.js': 'application/javascript'
    };
    return mimeTypes[ext] || 'application/octet-stream';
};

// ─── Sync state ───────────────────────────────────────────────────────────────
let syncLock = false;
let lastSyncResult = null;
let lastSyncTime = null;

// ─── Usage cache ───────────────────────────────────────────────────────────────
let usageCache = { value: null, timestamp: 0 };
const USAGE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// ─── 1. LIST files and folders ─────────────────────────────────────────────────
storageController.get(
    '/list',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const prefix = req.query.path || '';
            const pageToken = req.query.pageToken || undefined;
            const maxResults = parseInt(req.query.maxResults) || 500;

            const [files, , apiResponse] = await bucket.getFiles({
                prefix,
                delimiter: '/',
                maxResults,
                pageToken,
                autoPaginate: false
            });

            // Extract folders from prefixes
            const folders = (apiResponse.prefixes || []).map(p => p);

            // Build file list (exclude the "folder" placeholder files)
            const fileList = files
                .filter(f => f.name !== prefix && !f.name.endsWith('/'))
                .map(f => ({
                    name: f.name.split('/').pop(),
                    fullPath: f.name,
                    size: parseInt(f.metadata.size || 0),
                    contentType: f.metadata.contentType || 'application/octet-stream',
                    updated: f.metadata.updated
                }));

            res.json({
                folders,
                files: fileList,
                nextPageToken: apiResponse.nextPageToken || null
            });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 2. UPLOAD file ────────────────────────────────────────────────────────────
storageController.post(
    '/upload',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    upload.single('file'),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file provided' });
            }

            const destFolder = req.body.path || '';
            // Multer parses multipart form-data filenames as latin1 by default,
            // which breaks Cyrillic / non-ASCII characters. Re-decode as UTF-8.
            const utf8Name = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
            const sanitizedName = sanitizeFileName(utf8Name);
            const fullPath = destFolder ? `${destFolder.replace(/\/$/, '')}/${sanitizedName}` : sanitizedName;

            const file = bucket.file(fullPath);
            const contentType = req.file.mimetype || getMimeType(sanitizedName);

            await file.save(req.file.buffer, {
                metadata: {
                    contentType,
                    metadata: {
                        uploadedBy: req.user.userId,
                        uploadedAt: new Date().toISOString()
                    }
                },
                resumable: false
            });

            // Generate a public Firebase Storage URL
            const encodedPath = encodeURIComponent(fullPath);
            const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodedPath}?alt=media`;

            res.json({
                success: true,
                file: {
                    name: sanitizedName,
                    fullPath,
                    size: req.file.size,
                    contentType,
                    url
                }
            });

            // Send branded email notification for foundation uploads
            if (fullPath.startsWith('pensa-foundation/')) {
                try {
                    const { forwardEmailsViaZoho } = require('../utils/zohoEmails');
                    const foundationEmails = require('../utils/foundationEmailTemplates');
                    const { user_account, user_details } = require('../sequelize/models/index');

                    const uploader = await user_account.findByPk(req.user.userId, {
                        include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
                    });
                    const uploaderName = uploader?.details
                        ? `${uploader.details.firstName || ''} ${uploader.details.lastName || ''}`.trim()
                        : uploader?.email || 'Потребител';

                    let context = 'документ';
                    if (fullPath.includes('/financial-reports/')) context = 'финансов отчет';
                    else if (fullPath.includes('/contracts/')) context = 'договор';
                    else if (fullPath.includes('/meetings/')) context = 'протокол от среща';
                    else if (fullPath.includes('/press-releases/')) context = 'прес съобщение';
                    else if (fullPath.includes('/logos/') || fullPath.includes('/templates/')) context = 'брандинг материал';

                    const folderPath = fullPath.substring(0, fullPath.lastIndexOf('/') + 1);
                    const emailData = foundationEmails.fileUploaded({ uploaderName, fileName: sanitizedName, folderPath, context });

                    await forwardEmailsViaZoho({
                        userEmail: uploader?.email,
                        subject: emailData.subject,
                        toAddresses: 'pensa.club@gmail.com',
                        formattedBody: emailData.html,
                    });
                } catch (emailErr) {
                    console.error('Email notification failed:', emailErr);
                }
            }
        } catch (err) {
            next(err);
        }
    }
);

// ─── 3. CREATE folder ──────────────────────────────────────────────────────────
storageController.post(
    '/folder',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            let { path: folderPath } = req.body;

            if (!folderPath) {
                return res.status(400).json({ error: 'Folder path is required' });
            }

            // Ensure trailing slash
            if (!folderPath.endsWith('/')) {
                folderPath += '/';
            }

            const file = bucket.file(folderPath);
            await file.save('', {
                metadata: {
                    contentType: 'application/x-directory',
                    metadata: {
                        createdBy: req.user.userId,
                        createdAt: new Date().toISOString()
                    }
                },
                resumable: false
            });

            res.json({ success: true, folder: folderPath });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 4. DELETE file ────────────────────────────────────────────────────────────
storageController.delete(
    '/file',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { path: filePath } = req.body;

            if (!filePath) {
                return res.status(400).json({ error: 'File path is required' });
            }

            if (isProtectedPath(filePath)) {
                return res.status(403).json({ error: 'Cannot delete protected root folder' });
            }

            const file = bucket.file(filePath);
            const [exists] = await file.exists();
            if (!exists) {
                return res.status(404).json({ error: 'File not found' });
            }

            await file.delete();

            res.json({ success: true, deleted: filePath });

            // Email notification for foundation file deletion
            if (filePath.startsWith('pensa-foundation/')) {
                try {
                    const { forwardEmailsViaZoho } = require('../utils/zohoEmails');
                    const foundationEmails = require('../utils/foundationEmailTemplates');
                    const { user_account, user_details } = require('../sequelize/models/index');

                    const deleter = await user_account.findByPk(req.user.userId, {
                        include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
                    });
                    const deleterName = deleter?.details
                        ? `${deleter.details.firstName || ''} ${deleter.details.lastName || ''}`.trim()
                        : 'Потребител';
                    const fileName = filePath.split('/').pop();

                    const emailData = foundationEmails.fileDeleted({ deleterName, fileName, filePath });
                    await forwardEmailsViaZoho({
                        userEmail: deleter?.email,
                        subject: emailData.subject,
                        toAddresses: 'pensa.club@gmail.com',
                        formattedBody: emailData.html,
                    });
                } catch (emailErr) {
                    console.error('Delete email notification failed:', emailErr);
                }
            }
        } catch (err) {
            next(err);
        }
    }
);

// ─── 5. DELETE folder (recursive) ──────────────────────────────────────────────
storageController.delete(
    '/folder',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            let { path: folderPath } = req.body;

            if (!folderPath) {
                return res.status(400).json({ error: 'Folder path is required' });
            }

            if (!folderPath.endsWith('/')) {
                folderPath += '/';
            }

            if (isProtectedPath(folderPath)) {
                return res.status(403).json({ error: 'Cannot delete protected root folder' });
            }

            // List all files with this prefix
            const [files] = await bucket.getFiles({ prefix: folderPath });

            if (files.length === 0) {
                return res.status(404).json({ error: 'Folder not found or already empty' });
            }

            // Delete in batches of 100
            const batchSize = 100;
            let deletedCount = 0;

            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);
                await Promise.all(batch.map(f => f.delete()));
                deletedCount += batch.length;
            }

            res.json({ success: true, deleted: folderPath, filesDeleted: deletedCount });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 6. RENAME file/folder ────────────────────────────────────────────────────
storageController.post(
    '/rename',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { oldPath, newPath } = req.body;

            if (!oldPath || !newPath) {
                return res.status(400).json({ error: 'Both oldPath and newPath are required' });
            }

            if (isProtectedPath(oldPath)) {
                return res.status(403).json({ error: 'Cannot rename protected root folder' });
            }

            // Check if it's a folder rename (ends with /)
            if (oldPath.endsWith('/')) {
                // Rename all files under the old prefix
                const [files] = await bucket.getFiles({ prefix: oldPath });

                if (files.length === 0) {
                    return res.status(404).json({ error: 'Source folder not found' });
                }

                const renamedFiles = [];
                for (const file of files) {
                    const newFilePath = file.name.replace(oldPath, newPath.endsWith('/') ? newPath : newPath + '/');
                    await file.copy(newFilePath);
                    await file.delete();
                    renamedFiles.push(newFilePath);
                }

                return res.json({ success: true, oldPath, newPath, filesRenamed: renamedFiles.length });
            }

            // Single file rename
            const sourceFile = bucket.file(oldPath);
            const [exists] = await sourceFile.exists();
            if (!exists) {
                return res.status(404).json({ error: 'Source file not found' });
            }

            await sourceFile.copy(newPath);
            await sourceFile.delete();

            res.json({ success: true, oldPath, newPath });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 7. MOVE file ─────────────────────────────────────────────────────────────
storageController.post(
    '/move',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { sourcePath, destinationFolder } = req.body;

            if (!sourcePath || !destinationFolder) {
                return res.status(400).json({ error: 'Both sourcePath and destinationFolder are required' });
            }

            if (isProtectedPath(sourcePath)) {
                return res.status(403).json({ error: 'Cannot move protected root folder' });
            }

            const fileName = sourcePath.split('/').pop();
            const destFolder = destinationFolder.endsWith('/') ? destinationFolder : destinationFolder + '/';
            const newPath = destFolder + fileName;

            const sourceFile = bucket.file(sourcePath);
            const [exists] = await sourceFile.exists();
            if (!exists) {
                return res.status(404).json({ error: 'Source file not found' });
            }

            await sourceFile.copy(newPath);
            await sourceFile.delete();

            res.json({ success: true, oldPath: sourcePath, newPath });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 8. DOWNLOAD file or folder (stream / ZIP) ────────────────────────────────
// Supports both single files and entire folders (zipped on the fly).
// A folder path is detected by trailing slash or by querying GCS.
storageController.get(
    '/download',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const filePath = req.query.path;

            if (!filePath) {
                return res.status(400).json({ error: 'File path is required' });
            }

            // Normalize: folder if path ends with '/' OR no file exists at the exact path
            const isFolderPath = filePath.endsWith('/');
            const folderPrefix = isFolderPath ? filePath : `${filePath}/`;

            if (isFolderPath) {
                // ── FOLDER DOWNLOAD AS ZIP ──
                return await streamFolderAsZip(bucket, folderPrefix, res, next);
            }

            // ── SINGLE FILE DOWNLOAD ──
            const file = bucket.file(filePath);
            const [exists] = await file.exists();
            if (!exists) {
                // Maybe user passed a folder path without trailing slash — try as folder
                const [folderFiles] = await bucket.getFiles({ prefix: folderPrefix, maxResults: 1 });
                if (folderFiles && folderFiles.length > 0) {
                    return await streamFolderAsZip(bucket, folderPrefix, res, next);
                }
                return res.status(404).json({ error: 'File not found' });
            }

            const [metadata] = await file.getMetadata();
            const fileName = filePath.split('/').pop();

            res.setHeader('Content-Type', metadata.contentType || 'application/octet-stream');
            res.setHeader('Content-Disposition', buildContentDisposition(fileName));
            if (metadata.size) {
                res.setHeader('Content-Length', metadata.size);
            }

            file.createReadStream()
                .on('error', (err) => {
                    if (!res.headersSent) {
                        next(err);
                    }
                })
                .pipe(res);
        } catch (err) {
            next(err);
        }
    }
);

// Helper: stream a folder as a ZIP archive
async function streamFolderAsZip(bucket, folderPrefix, res, next) {
    try {
        const [files] = await bucket.getFiles({ prefix: folderPrefix });

        // Filter out folder placeholder files (ending with '/')
        const realFiles = files.filter(f => !f.name.endsWith('/'));

        if (realFiles.length === 0) {
            return res.status(404).json({ error: 'Folder is empty or does not exist' });
        }

        // Derive ZIP filename from the last folder segment
        const folderName = folderPrefix.replace(/\/$/, '').split('/').pop() || 'folder';
        const zipName = `${folderName}.zip`;

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', buildContentDisposition(zipName));

        // forceZip64 false + standard zlib. Archiver automatically sets the
        // UTF-8 bit flag (0x800) on entries with non-ASCII names — Cyrillic
        // file names inside the archive will be correctly extracted.
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', (err) => {
            if (!res.headersSent) {
                next(err);
            } else {
                res.end();
            }
        });

        archive.pipe(res);

        for (const file of realFiles) {
            // Strip the folder prefix so files appear at the ZIP root with their relative path
            const relativeName = file.name.slice(folderPrefix.length);
            if (!relativeName) continue;
            archive.append(file.createReadStream(), { name: relativeName });
        }

        await archive.finalize();
    } catch (err) {
        if (!res.headersSent) {
            next(err);
        }
    }
}

// ─── 9. FILE INFO (metadata) ──────────────────────────────────────────────────
storageController.get(
    '/info',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const filePath = req.query.path;

            if (!filePath) {
                return res.status(400).json({ error: 'File path is required' });
            }

            const file = bucket.file(filePath);
            const [exists] = await file.exists();
            if (!exists) {
                return res.status(404).json({ error: 'File not found' });
            }

            const [metadata] = await file.getMetadata();

            res.json({
                name: filePath.split('/').pop(),
                fullPath: filePath,
                size: parseInt(metadata.size || 0),
                contentType: metadata.contentType || 'application/octet-stream',
                created: metadata.timeCreated,
                updated: metadata.updated,
                md5Hash: metadata.md5Hash,
                crc32c: metadata.crc32c,
                generation: metadata.generation,
                customMetadata: metadata.metadata || {}
            });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 10. STORAGE USAGE ────────────────────────────────────────────────────────
storageController.get(
    '/usage',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const now = Date.now();
            const forceRefresh = req.query.refresh === 'true';

            // Return cached value if still valid
            if (!forceRefresh && usageCache.value !== null && (now - usageCache.timestamp) < USAGE_CACHE_TTL) {
                return res.json({ ...usageCache.value, cached: true });
            }

            let totalSize = 0;
            let totalFiles = 0;
            const folderSizes = {};

            // Stream through all files
            const [files] = await bucket.getFiles();

            for (const file of files) {
                const size = parseInt(file.metadata.size || 0);
                totalSize += size;
                totalFiles++;

                // Track top-level folder sizes
                const topFolder = file.name.split('/')[0];
                if (topFolder) {
                    if (!folderSizes[topFolder]) {
                        folderSizes[topFolder] = { size: 0, files: 0 };
                    }
                    folderSizes[topFolder].size += size;
                    folderSizes[topFolder].files++;
                }
            }

            const result = {
                totalSize,
                totalSizeFormatted: formatBytes(totalSize),
                totalFiles,
                folderBreakdown: Object.entries(folderSizes)
                    .sort((a, b) => b[1].size - a[1].size)
                    .map(([folder, data]) => ({
                        folder,
                        size: data.size,
                        sizeFormatted: formatBytes(data.size),
                        files: data.files
                    })),
                calculatedAt: new Date().toISOString()
            };

            // Cache the result
            usageCache = { value: result, timestamp: now };

            res.json({ ...result, cached: false });
        } catch (err) {
            next(err);
        }
    }
);

// ─── Utility ───────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ─── SYNC: Core logic ─────────────────────────────────────────────────────────

/**
 * Detects mediaType from the file path within a seminar folder.
 * Returns { mediaType, table } or null to skip.
 */
function detectMediaType(filePath) {
    const parts = filePath.split('/');
    // Expected: seminars/{slug}/{subfolder}/...
    if (parts.length < 4) return { mediaType: 'document', table: 'seminar_media' };

    const subfolder = parts[2].toLowerCase();

    if (subfolder === 'photos') return { mediaType: 'photo', table: 'seminar_media' };
    if (subfolder === 'presentations') return { mediaType: 'presentation', table: 'seminar_media' };
    if (subfolder === 'lists') return { mediaType: null, table: 'seminar_attendance_list' };
    if (subfolder === 'videos') return null; // skip videos (YouTube)
    return { mediaType: 'document', table: 'seminar_media' };
}

/**
 * Runs the storage-to-DB sync. Shared between the endpoint and the cron job.
 * Returns { synced, orphans, errors }.
 */
async function runStorageSync() {
    const { seminar: Seminar, seminar_media, seminar_attendance_list } = require('../sequelize/models/index');

    const synced = [];
    const orphans = [];
    const errors = [];

    // 1. List all files under seminars/ prefix
    const BATCH_SIZE = 500;
    let pageToken;
    const storageFiles = [];

    do {
        const [files, , apiResponse] = await bucket.getFiles({
            prefix: 'seminars/',
            maxResults: BATCH_SIZE,
            pageToken,
            autoPaginate: false,
        });
        storageFiles.push(...files);
        pageToken = apiResponse.nextPageToken;
    } while (pageToken);

    // Filter out directory placeholders
    const realFiles = storageFiles.filter(f => !f.name.endsWith('/'));

    // Cache seminar lookups by slug
    const seminarCache = {};

    // 2. Process each storage file
    for (const file of realFiles) {
        try {
            const parts = file.name.split('/');
            // Expected: seminars/{slug}/...
            if (parts.length < 3) {
                continue; // not a proper seminar file path
            }

            const slug = parts[1];
            if (!slug) continue;

            // Skip old ID-based paths (seminars/photos/12/, seminars/lists/12/)
            // and paths where slug is a media type folder name
            const reservedNames = ['photos', 'lists', 'presentations', 'videos', 'documents'];
            if (reservedNames.includes(slug) || /^\d+$/.test(slug)) continue;

            const detection = detectMediaType(file.name);
            if (!detection) continue; // skip (e.g. videos)

            // Look up seminar by slug (cached)
            if (!(slug in seminarCache)) {
                seminarCache[slug] = await Seminar.findOne({ where: { slug } });
            }
            const foundSeminar = seminarCache[slug];

            if (!foundSeminar) {
                errors.push({ file: file.name, error: `Seminar not found for slug: ${slug}` });
                continue;
            }

            const fileName = file.name.split('/').pop();
            const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(file.name)}?alt=media`;

            if (detection.table === 'seminar_attendance_list') {
                // Check if already exists
                const existing = await seminar_attendance_list.findOne({
                    where: { seminarId: foundSeminar.id, fileName },
                });
                if (existing) continue;

                await seminar_attendance_list.create({
                    seminarId: foundSeminar.id,
                    uploadedBy: null,
                    fileUrl,
                    fileName,
                    fileType: file.metadata.contentType || 'application/octet-stream',
                    fileSize: parseInt(file.metadata.size || 0),
                });
                synced.push({ file: file.name, table: 'seminar_attendance_list', seminarId: foundSeminar.id });
            } else {
                // seminar_media — check by fileName + seminarId or fileUrl
                const existing = await seminar_media.findOne({
                    where: { seminarId: foundSeminar.id, fileName },
                });
                if (existing) continue;

                await seminar_media.create({
                    seminarId: foundSeminar.id,
                    uploadedBy: null,
                    mediaType: detection.mediaType,
                    fileUrl,
                    fileName,
                    fileType: file.metadata.contentType || 'application/octet-stream',
                    fileSize: parseInt(file.metadata.size || 0),
                });
                synced.push({ file: file.name, table: 'seminar_media', mediaType: detection.mediaType, seminarId: foundSeminar.id });
            }
        } catch (err) {
            errors.push({ file: file.name, error: err.message });
        }
    }

    // 3. Find orphans: DB records whose files don't exist in Storage
    // Build a Set of all storage file paths for quick lookup
    const storageFileNames = new Set(realFiles.map(f => f.name));

    // Check seminar_media records
    const allMedia = await seminar_media.findAll({
        attributes: ['id', 'seminarId', 'fileUrl', 'fileName', 'mediaType'],
        include: [{ model: Seminar, as: 'seminar', attributes: ['slug'] }],
    });

    for (const record of allMedia) {
        if (!record.seminar) continue; // seminar was deleted
        // Try to reconstruct the expected storage path
        const slug = record.seminar.slug;
        let subfolder;
        switch (record.mediaType) {
            case 'photo': subfolder = 'photos'; break;
            case 'presentation': subfolder = 'presentations'; break;
            default: subfolder = 'documents'; break;
        }
        const expectedPath = `seminars/${slug}/${subfolder}/${record.fileName}`;

        // Also check if the fileUrl decodes to a known storage file
        let urlPath = null;
        try {
            const urlMatch = record.fileUrl.match(/\/o\/(.+?)\?/);
            if (urlMatch) urlPath = decodeURIComponent(urlMatch[1]);
        } catch (_) { /* ignore */ }

        if (!storageFileNames.has(expectedPath) && (!urlPath || !storageFileNames.has(urlPath))) {
            orphans.push({
                table: 'seminar_media',
                id: record.id,
                seminarId: record.seminarId,
                fileName: record.fileName,
                expectedPath,
            });
        }
    }

    // Check seminar_attendance_list records
    const allLists = await seminar_attendance_list.findAll({
        attributes: ['id', 'seminarId', 'fileUrl', 'fileName'],
        include: [{ model: Seminar, as: 'seminar', attributes: ['slug'] }],
    });

    for (const record of allLists) {
        if (!record.seminar) continue;
        const expectedPath = `seminars/${record.seminar.slug}/lists/${record.fileName}`;

        let urlPath = null;
        try {
            const urlMatch = record.fileUrl.match(/\/o\/(.+?)\?/);
            if (urlMatch) urlPath = decodeURIComponent(urlMatch[1]);
        } catch (_) { /* ignore */ }

        if (!storageFileNames.has(expectedPath) && (!urlPath || !storageFileNames.has(urlPath))) {
            orphans.push({
                table: 'seminar_attendance_list',
                id: record.id,
                seminarId: record.seminarId,
                fileName: record.fileName,
                expectedPath,
            });
        }
    }

    return { synced: synced.length, syncedDetails: synced, orphans, errors };
}

// Expose sync state for cron
storageController.getSyncState = () => ({ syncLock, lastSyncResult, lastSyncTime });
storageController.setSyncState = (state) => {
    if ('syncLock' in state) syncLock = state.syncLock;
    if ('lastSyncResult' in state) lastSyncResult = state.lastSyncResult;
    if ('lastSyncTime' in state) lastSyncTime = state.lastSyncTime;
};
storageController.runStorageSync = runStorageSync;

// ─── 11. SYNC: Manual trigger ────────────────────────────────────────────────
storageController.post(
    '/sync',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            if (syncLock) {
                return res.status(409).json({ error: 'A sync is already in progress. Please wait.' });
            }

            syncLock = true;

            try {
                const result = await runStorageSync();
                lastSyncResult = result;
                lastSyncTime = new Date().toISOString();
                res.json(result);
            } finally {
                syncLock = false;
            }
        } catch (err) {
            syncLock = false;
            next(err);
        }
    }
);

// ─── 12. SYNC STATUS ────────────────────────────────────────────────────────
storageController.get(
    '/sync-status',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res) => {
        res.json({
            syncInProgress: syncLock,
            lastSyncTime,
            lastSyncResult: lastSyncResult
                ? { synced: lastSyncResult.synced, orphans: lastSyncResult.orphans.length, errors: lastSyncResult.errors.length }
                : null,
            nextScheduledSync: getNextHourlyCron(),
        });
    }
);

function getNextHourlyCron() {
    const now = new Date();
    const next = new Date(now);
    next.setMinutes(0, 0, 0);
    if (next <= now) {
        next.setHours(next.getHours() + 1);
    }
    return next.toISOString();
}

// ─── 13. INITIALIZE FOUNDATION STRUCTURE ─────────────────────────────────────
storageController.post(
    '/initialize-structure',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const FOUNDATION_STRUCTURE = [
                'pensa-foundation/',
                'pensa-foundation/administration/',
                'pensa-foundation/administration/contracts/',
                'pensa-foundation/administration/financial-reports/',
                'pensa-foundation/administration/hr/',
                'pensa-foundation/projects/',
                'pensa-foundation/projects/project-reaction/',
                'pensa-foundation/projects/project-reaction/documents/',
                'pensa-foundation/projects/project-reaction/reports/',
                'pensa-foundation/projects/project-reaction/media/',
                'pensa-foundation/projects/digibridge-academy/',
                'pensa-foundation/projects/digibridge-academy/documents/',
                'pensa-foundation/projects/digibridge-academy/reports/',
                'pensa-foundation/communications/',
                'pensa-foundation/communications/branding/',
                'pensa-foundation/communications/branding/logos/',
                'pensa-foundation/communications/branding/templates/',
                'pensa-foundation/communications/press-releases/',
                'pensa-foundation/meetings/',
                'pensa-foundation/meetings/2026/',
                'courses/',
            ];

            let created = 0;
            let existing = 0;

            for (const folderPath of FOUNDATION_STRUCTURE) {
                const file = bucket.file(folderPath);
                const [exists] = await file.exists();

                if (exists) {
                    existing++;
                } else {
                    await file.save('', {
                        metadata: {
                            contentType: 'application/x-directory',
                            metadata: {
                                createdBy: req.user.userId,
                                createdAt: new Date().toISOString()
                            }
                        },
                        resumable: false
                    });
                    created++;
                }
            }

            res.json({ success: true, created, existing });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 14. CREATE PROJECT ──────────────────────────────────────────────────────
storageController.post(
    '/create-project',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { name } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({ error: 'Project name is required' });
            }

            // Sanitize: lowercase, replace spaces with hyphens, remove non-alphanumeric except hyphens
            const sanitized = name.trim().toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9\-\u00C0-\u024F\u0400-\u04FF]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            if (!sanitized) {
                return res.status(400).json({ error: 'Invalid project name' });
            }

            const basePath = `pensa-foundation/projects/${sanitized}/`;
            const subfolders = [
                basePath,
                `${basePath}documents/`,
                `${basePath}reports/`,
                `${basePath}media/`,
            ];

            for (const folderPath of subfolders) {
                const file = bucket.file(folderPath);
                const [exists] = await file.exists();

                if (!exists) {
                    await file.save('', {
                        metadata: {
                            contentType: 'application/x-directory',
                            metadata: {
                                createdBy: req.user.userId,
                                createdAt: new Date().toISOString()
                            }
                        },
                        resumable: false
                    });
                }
            }

            res.json({ success: true, projectPath: basePath });

            // Send branded email notification for new project
            try {
                const { forwardEmailsViaZoho } = require('../utils/zohoEmails');
                const foundationEmails = require('../utils/foundationEmailTemplates');
                const { user_account, user_details } = require('../sequelize/models/index');

                const creator = await user_account.findByPk(req.user.userId, {
                    include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
                });
                const creatorName = creator?.details
                    ? `${creator.details.firstName || ''} ${creator.details.lastName || ''}`.trim()
                    : creator?.email || 'Потребител';

                const emailData = foundationEmails.projectCreated({ creatorName, projectName: name, projectPath: basePath });

                await forwardEmailsViaZoho({
                    userEmail: creator?.email,
                    subject: emailData.subject,
                    toAddresses: 'pensa.club@gmail.com',
                    formattedBody: emailData.html,
                });
            } catch (emailErr) {
                console.error('Email notification failed:', emailErr);
            }
        } catch (err) {
            next(err);
        }
    }
);

// ─── 15. SHARE FILE WITH USER ───────────────────────────────────────────────
storageController.post(
    '/share',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { filePath, fileName, sharedWithUserId, message } = req.body;

            if (!filePath || !fileName || !sharedWithUserId) {
                return res.status(400).json({ error: 'filePath, fileName and sharedWithUserId are required' });
            }

            // Detect if path is a folder (ends with '/' or matches an existing folder prefix)
            const isFolder = filePath.endsWith('/');

            const { file_share, user_account, user_details, user_notification } = require('../sequelize/models/index');

            // Verify recipient exists
            const recipient = await user_account.findByPk(sharedWithUserId);
            if (!recipient) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Get sharer name
            const sharer = await user_account.findByPk(req.user.userId, {
                include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
            });
            const sharerName = sharer?.details
                ? `${sharer.details.firstName || ''} ${sharer.details.lastName || ''}`.trim()
                : sharer?.email || 'Потребител';

            // Create file share record
            const share = await file_share.create({
                filePath,
                fileName,
                sharedBy: req.user.userId,
                sharedWith: sharedWithUserId,
                message: message || null,
                isFolder,
            });

            // Create notification for recipient
            await user_notification.create({
                userId: sharedWithUserId,
                type: 'file_shared',
                title: isFolder ? 'Споделена папка' : 'Споделен файл',
                message: `${sharerName} сподели с вас ${isFolder ? 'папка' : 'файл'}: ${fileName}`,
                data: {
                    fileShareId: share.id,
                    filePath,
                    fileName,
                    isFolder,
                },
            });

            res.json({ success: true, share });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 16. GET FILES SHARED WITH ME ───────────────────────────────────────────
storageController.get(
    '/shared-with-me',
    isAuth,
    async (req, res, next) => {
        try {
            const { file_share, user_account, user_details } = require('../sequelize/models/index');

            const shares = await file_share.findAll({
                where: { sharedWith: req.user.userId },
                include: [{
                    model: user_account,
                    as: 'sharer',
                    attributes: ['id', 'email'],
                    include: [{
                        model: user_details,
                        as: 'details',
                        attributes: ['firstName', 'lastName', 'imageURL'],
                    }],
                }],
                order: [['createdAt', 'DESC']],
            });

            res.json({ shares });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 17. MARK SHARE AS READ ────────────────────────────────────────────────
storageController.put(
    '/shared-with-me/:id/read',
    isAuth,
    async (req, res, next) => {
        try {
            const { file_share } = require('../sequelize/models/index');

            const share = await file_share.findOne({
                where: { id: req.params.id, sharedWith: req.user.userId },
            });

            if (!share) {
                return res.status(404).json({ error: 'Share not found' });
            }

            share.isRead = true;
            await share.save();

            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 18. DELETE SHARE ──────────────────────────────────────────────────────
storageController.delete(
    '/share/:id',
    isAuth,
    async (req, res, next) => {
        try {
            const { file_share, user_account } = require('../sequelize/models/index');

            const share = await file_share.findByPk(req.params.id);
            if (!share) {
                return res.status(404).json({ error: 'Share not found' });
            }

            // Only sharer or admin can delete
            const user = await user_account.findByPk(req.user.userId);
            if (share.sharedBy !== req.user.userId && user?.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to delete this share' });
            }

            await share.destroy();
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 19. SEARCH FILES (recursive) ─────────────────────────────────────────────
storageController.get(
    '/search',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const q = (req.query.q || '').toLowerCase().trim();
            const type = req.query.type || 'all';
            const prefix = req.query.path || '';
            const maxResults = parseInt(req.query.maxResults) || 50;

            if (!q) {
                return res.json({ files: [], query: q });
            }

            const [allFiles] = await bucket.getFiles({ prefix });

            const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'];
            const presExtensions = ['ppt', 'pptx'];

            const filtered = allFiles
                .filter(f => !f.name.endsWith('/'))
                .filter(f => {
                    const name = f.name.toLowerCase();
                    if (!name.includes(q)) return false;

                    const contentType = f.metadata.contentType || '';
                    if (type === 'image' && !contentType.startsWith('image/')) return false;
                    if (type === 'video' && !contentType.startsWith('video/')) return false;
                    if (type === 'document') {
                        const ext = name.split('.').pop();
                        if (!docExtensions.includes(ext)) return false;
                    }
                    if (type === 'presentation') {
                        const ext = name.split('.').pop();
                        if (!presExtensions.includes(ext)) return false;
                    }
                    return true;
                })
                .slice(0, maxResults)
                .map(f => ({
                    name: f.name.split('/').pop(),
                    fullPath: f.name,
                    size: parseInt(f.metadata.size || 0),
                    contentType: f.metadata.contentType || 'application/octet-stream',
                    updated: f.metadata.updated,
                }));

            res.json({ files: filtered, query: q, total: filtered.length });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 20. ANALYTICS ───────────────────────────────────────────────────────────
storageController.get(
    '/analytics',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            // 1. Usage data (reuse cache logic)
            const now = Date.now();
            let usageData;

            if (usageCache.value !== null && (now - usageCache.timestamp) < USAGE_CACHE_TTL) {
                usageData = usageCache.value;
            } else {
                let totalSize = 0;
                let totalFiles = 0;
                const folderSizes = {};

                const [files] = await bucket.getFiles();
                for (const file of files) {
                    const size = parseInt(file.metadata.size || 0);
                    totalSize += size;
                    totalFiles++;
                    const topFolder = file.name.split('/')[0];
                    if (topFolder) {
                        if (!folderSizes[topFolder]) folderSizes[topFolder] = { size: 0, files: 0 };
                        folderSizes[topFolder].size += size;
                        folderSizes[topFolder].files++;
                    }
                }

                usageData = {
                    totalSize,
                    totalSizeFormatted: formatBytes(totalSize),
                    totalFiles,
                    folderBreakdown: Object.entries(folderSizes)
                        .sort((a, b) => b[1].size - a[1].size)
                        .map(([folder, data]) => ({
                            folder,
                            size: data.size,
                            sizeFormatted: formatBytes(data.size),
                            files: data.files,
                        })),
                };
                usageCache = { value: usageData, timestamp: now };
            }

            // 2. Recent files (last 20 by updated date)
            const [allFiles] = await bucket.getFiles();
            const recentFiles = allFiles
                .filter(f => !f.name.endsWith('/'))
                .sort((a, b) => new Date(b.metadata.updated) - new Date(a.metadata.updated))
                .slice(0, 20)
                .map(f => ({
                    name: f.name.split('/').pop(),
                    path: f.name,
                    size: parseInt(f.metadata.size || 0),
                    uploadedAt: f.metadata.updated,
                    contentType: f.metadata.contentType || 'application/octet-stream',
                }));

            // 3. Activity log from DB (last 7 days)
            const activityLog = [];
            try {
                const { Op } = require('sequelize');
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

                const { file_share, seminar_media, user_account, user_details } = require('../sequelize/models/index');

                // Recent file shares
                if (file_share) {
                    const recentShares = await file_share.findAll({
                        where: { createdAt: { [Op.gte]: sevenDaysAgo } },
                        include: [{
                            model: user_account, as: 'sharer',
                            attributes: ['id', 'email'],
                            include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
                        }],
                        order: [['createdAt', 'DESC']],
                        limit: 20,
                    });

                    for (const share of recentShares) {
                        const userName = share.sharer?.details
                            ? `${share.sharer.details.firstName || ''} ${share.sharer.details.lastName || ''}`.trim()
                            : share.sharer?.email || 'Unknown';
                        activityLog.push({
                            action: 'share',
                            fileName: share.fileName,
                            userName,
                            date: share.createdAt,
                        });
                    }
                }

                // Recent seminar media uploads
                if (seminar_media) {
                    const recentMedia = await seminar_media.findAll({
                        where: { createdAt: { [Op.gte]: sevenDaysAgo } },
                        order: [['createdAt', 'DESC']],
                        limit: 20,
                    });

                    for (const media of recentMedia) {
                        activityLog.push({
                            action: 'upload',
                            fileName: media.fileName,
                            userName: 'System Sync',
                            date: media.createdAt,
                        });
                    }
                }
            } catch (dbErr) {
                console.error('Analytics activity log error:', dbErr.message);
            }

            // Sort activity log by date descending
            activityLog.sort((a, b) => new Date(b.date) - new Date(a.date));

            res.json({
                usage: usageData,
                recentFiles,
                activityLog: activityLog.slice(0, 30),
            });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 21. SEARCH USERS (for share modal) ─────────────────────────────────────
storageController.get(
    '/search-users',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { Op } = require('sequelize');
            const { user_account, user_details } = require('../sequelize/models/index');

            const q = (req.query.q || '').trim();
            if (!q || q.length < 2) {
                return res.json({ users: [] });
            }

            const users = await user_account.findAll({
                include: [{
                    model: user_details,
                    as: 'details',
                    attributes: ['firstName', 'lastName', 'imageURL'],
                    where: {
                        [Op.or]: [
                            { firstName: { [Op.iLike]: `%${q}%` } },
                            { lastName: { [Op.iLike]: `%${q}%` } },
                        ],
                    },
                    required: false,
                }],
                where: {
                    [Op.or]: [
                        { email: { [Op.iLike]: `%${q}%` } },
                        { '$details.first_name$': { [Op.iLike]: `%${q}%` } },
                        { '$details.last_name$': { [Op.iLike]: `%${q}%` } },
                    ],
                },
                attributes: ['id', 'email', 'role'],
                limit: 10,
                subQuery: false,
            });

            res.json({
                users: users.map(u => ({
                    id: u.id,
                    email: u.email,
                    role: u.role,
                    firstName: u.details?.firstName || null,
                    lastName: u.details?.lastName || null,
                    imageURL: u.details?.imageURL || null,
                })),
            });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = storageController;
