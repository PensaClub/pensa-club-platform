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

module.exports = storageController;
