const userSharedFilesController = require('express').Router();
const path = require('path');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const isAuth = require('../middlewares/isAuth');

// ─── Helper: RFC 5987 compliant Content-Disposition header ────────────────────
function buildContentDisposition(filename) {
    // eslint-disable-next-line no-control-regex
    const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '\\"');
    const utf8Encoded = encodeURIComponent(filename);
    return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${utf8Encoded}`;
}

// ─── Google Cloud Storage Setup (reuse same config as storageController) ─────
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

// ─── GET FILES SHARED WITH ME ────────────────────────────────────────────────
userSharedFilesController.get(
    '/',
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

// ─── MARK SHARE AS READ ─────────────────────────────────────────────────────
userSharedFilesController.put(
    '/:id/read',
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

// ─── DOWNLOAD SHARED FILE ───────────────────────────────────────────────────
// Only allows downloading files that were shared with the current user
userSharedFilesController.get(
    '/:id/download',
    isAuth,
    async (req, res, next) => {
        try {
            const { file_share } = require('../sequelize/models/index');

            // Verify the file was shared with this user
            const share = await file_share.findOne({
                where: { id: req.params.id, sharedWith: req.user.userId },
            });

            if (!share) {
                return res.status(404).json({ error: 'Shared file not found' });
            }

            const file = bucket.file(share.filePath);
            const [exists] = await file.exists();
            if (!exists) {
                return res.status(404).json({ error: 'File not found in storage' });
            }

            const [metadata] = await file.getMetadata();

            res.setHeader('Content-Type', metadata.contentType || 'application/octet-stream');
            res.setHeader('Content-Disposition', buildContentDisposition(share.fileName));
            if (metadata.size) {
                res.setHeader('Content-Length', metadata.size);
            }

            // Mark as read on download
            if (!share.isRead) {
                share.isRead = true;
                await share.save();
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

module.exports = userSharedFilesController;
