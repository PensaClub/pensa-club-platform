const storageController = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

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
    'profiles/'
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
            const sanitizedName = sanitizeFileName(req.file.originalname);
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

// ─── 8. DOWNLOAD file (stream) ────────────────────────────────────────────────
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

            const file = bucket.file(filePath);
            const [exists] = await file.exists();
            if (!exists) {
                return res.status(404).json({ error: 'File not found' });
            }

            const [metadata] = await file.getMetadata();
            const fileName = filePath.split('/').pop();

            res.setHeader('Content-Type', metadata.contentType || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
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

module.exports = storageController;
