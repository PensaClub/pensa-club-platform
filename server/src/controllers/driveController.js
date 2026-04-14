const driveController = require('express').Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const driveService = require('../utils/driveService');
const { drive_folder_password } = require('../sequelize/models');

// ─── Multer (memory storage, 500MB max) ────────────────────────────────────────
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 }
});

// ─── 1. STATUS — check if Drive is connected ──────────────────────────────────
driveController.get(
    '/status',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const status = await driveService.checkStatus();
            res.json(status);
        } catch (err) {
            next(err);
        }
    }
);

// ─── 2. LIST files and folders ─────────────────────────────────────────────────
driveController.get(
    '/list',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const folderId = req.query.folderId || 'root';
            const pageToken = req.query.pageToken || null;
            const pageSize = parseInt(req.query.pageSize) || 100;

            const result = await driveService.listFiles(folderId, pageToken, pageSize);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
);

// ─── 3. SEARCH files ──────────────────────────────────────────────────────────
driveController.get(
    '/search',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const q = req.query.q;
            if (!q || q.trim().length < 2) {
                return res.status(400).json({ error: 'Search query must be at least 2 characters' });
            }
            const results = await driveService.searchFiles(q.trim());
            res.json({ files: results });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 4. UPLOAD file ────────────────────────────────────────────────────────────
driveController.post(
    '/upload',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    upload.single('file'),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file provided' });
            }

            const folderId = req.body.folderId || 'root';
            // Multer parses multipart form-data filenames as latin1 by default,
            // which breaks Cyrillic / non-ASCII characters. Re-decode as UTF-8.
            const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
            const result = await driveService.uploadFile(
                req.file.buffer,
                originalName,
                req.file.mimetype,
                folderId
            );

            res.json(result);
        } catch (err) {
            next(err);
        }
    }
);

// ─── 5. CREATE folder ─────────────────────────────────────────────────────────
driveController.post(
    '/folder',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { name, parentId } = req.body;
            if (!name || !name.trim()) {
                return res.status(400).json({ error: 'Folder name is required' });
            }

            const result = await driveService.createFolder(name.trim(), parentId || 'root');
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
);

// ─── 6. DELETE file/folder ────────────────────────────────────────────────────
driveController.delete(
    '/file/:id',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const permanent = req.query.permanent === 'true';

            // Check if this folder is password-protected
            const protectedFolder = await drive_folder_password.findOne({ where: { folderId: id } });
            if (protectedFolder) {
                return res.status(403).json({ error: 'PROTECTED_FOLDER', message: 'Cannot delete a password-protected folder. Remove the password first.' });
            }

            const result = permanent
                ? await driveService.permanentDelete(id)
                : await driveService.deleteFile(id);

            res.json(result);
        } catch (err) {
            next(err);
        }
    }
);

// ─── 7. RENAME file/folder ───────────────────────────────────────────────────
driveController.put(
    '/rename/:id',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { newName } = req.body;
            if (!newName || !newName.trim()) {
                return res.status(400).json({ error: 'New name is required' });
            }

            const result = await driveService.renameFile(id, newName.trim());
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
);

// ─── 8. MOVE file/folder ─────────────────────────────────────────────────────
driveController.post(
    '/move/:id',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { newParentId } = req.body;
            if (!newParentId) {
                return res.status(400).json({ error: 'New parent folder ID is required' });
            }

            const result = await driveService.moveFile(id, newParentId);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
);

// ─── 9. DOWNLOAD file ────────────────────────────────────────────────────────
driveController.get(
    '/download/:id',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { stream, fileName, mimeType, size } = await driveService.downloadFile(id);

            res.setHeader('Content-Type', mimeType || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
            if (size) {
                res.setHeader('Content-Length', size);
            }

            stream.pipe(res);
        } catch (err) {
            next(err);
        }
    }
);

// ─── 10. FILE INFO ────────────────────────────────────────────────────────────
driveController.get(
    '/info/:id',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const info = await driveService.getFileInfo(req.params.id);
            res.json(info);
        } catch (err) {
            next(err);
        }
    }
);

// ─── 11. QUOTA ────────────────────────────────────────────────────────────────
driveController.get(
    '/quota',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const quota = await driveService.getQuota();
            res.json(quota);
        } catch (err) {
            next(err);
        }
    }
);

// ─── 12. SHARE file/folder ────────────────────────────────────────────────
driveController.post(
    '/share/:id',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { email, role, sendNotification } = req.body;
            if (!email || !email.trim()) {
                return res.status(400).json({ error: 'Email is required' });
            }
            const validRoles = ['reader', 'commenter', 'writer'];
            const shareRole = validRoles.includes(role) ? role : 'reader';

            const result = await driveService.shareFile(
                id,
                email.trim(),
                shareRole,
                sendNotification !== false
            );
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
);

// ─── 13. GET permissions ──────────────────────────────────────────────────
driveController.get(
    '/permissions/:id',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const permissions = await driveService.getPermissions(req.params.id);
            res.json({ permissions });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 14. REMOVE permission ───────────────────────────────────────────────
driveController.delete(
    '/permissions/:fileId/:permissionId',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const result = await driveService.removePermission(
                req.params.fileId,
                req.params.permissionId
            );
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
);

const SUPER_ADMIN_FOLDER_ID = '__super_admin__';

// ─── 15. SET folder password (new or change with old password) ───────────
driveController.post(
    '/folder-password/:id',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { password, oldPassword, folderName, lockTimeout } = req.body;
            const validTimeouts = [null, 5, 10, 15, 30];
            if (!password || password.length < 4) {
                return res.status(400).json({ error: 'Password must be at least 4 characters' });
            }

            const existing = await drive_folder_password.findOne({ where: { folderId: id } });

            if (existing) {
                // Must provide old password to change
                if (!oldPassword) {
                    return res.status(403).json({ error: 'OLD_PASSWORD_REQUIRED' });
                }
                const oldValid = await bcrypt.compare(oldPassword, existing.passwordHash);
                if (!oldValid) {
                    // Check super admin password as fallback
                    const superRecord = await drive_folder_password.findOne({ where: { folderId: SUPER_ADMIN_FOLDER_ID } });
                    const superValid = superRecord ? await bcrypt.compare(oldPassword, superRecord.passwordHash) : false;
                    if (!superValid) {
                        return res.status(403).json({ error: 'WRONG_OLD_PASSWORD' });
                    }
                }
                existing.passwordHash = await bcrypt.hash(password, 10);
                existing.folderName = folderName || existing.folderName;
                if (lockTimeout !== undefined) {
                    existing.lockTimeout = validTimeouts.includes(lockTimeout) ? lockTimeout : existing.lockTimeout;
                }
                await existing.save();
            } else {
                await drive_folder_password.create({
                    folderId: id,
                    folderName: folderName || 'Unknown',
                    passwordHash: await bcrypt.hash(password, 10),
                    lockTimeout: validTimeouts.includes(lockTimeout) ? lockTimeout : null,
                    createdBy: req.user.userId,
                });
            }

            res.json({ success: true, hasPassword: true });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 16. REMOVE folder password (requires old password) ─────────────────
driveController.delete(
    '/folder-password/:id',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const record = await drive_folder_password.findOne({ where: { folderId: req.params.id } });
            if (!record) {
                return res.json({ success: true, hasPassword: false });
            }

            const { password } = req.body || {};
            if (!password) {
                return res.status(403).json({ error: 'PASSWORD_REQUIRED' });
            }

            const valid = await bcrypt.compare(password, record.passwordHash);
            if (!valid) {
                // Check super admin password as fallback
                const superRecord = await drive_folder_password.findOne({ where: { folderId: SUPER_ADMIN_FOLDER_ID } });
                const superValid = superRecord ? await bcrypt.compare(password, superRecord.passwordHash) : false;
                if (!superValid) {
                    return res.status(403).json({ error: 'WRONG_PASSWORD' });
                }
            }

            await record.destroy();
            res.json({ success: true, hasPassword: false });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 16b. REQUEST password reset (sends email to pensa.club@gmail.com) ──
driveController.post(
    '/folder-password/:id/reset-request',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const record = await drive_folder_password.findOne({
                where: { folderId: req.params.id },
                include: [{ model: require('../sequelize/models').user_account, as: 'creator', attributes: ['id', 'email'] }],
            });
            if (!record) {
                return res.status(404).json({ error: 'No password found for this folder' });
            }

            // Generate a reset token
            const crypto = require('crypto');
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenHash = await bcrypt.hash(resetToken, 10);

            // Store token temporarily in folder name field (prefix with __RESET__)
            record.folderName = `__RESET__${resetTokenHash}__${record.folderName.replace(/^__RESET__.*?__/, '')}`;
            await record.save();

            // Send email
            const { sendEmail } = require('../utils/emailService');
            const resetUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/admin/drive-reset?folderId=${req.params.id}&token=${resetToken}`;

            await sendEmail({
                to: 'pensa.club@gmail.com',
                subject: 'Drive Folder Password Reset — PENSA',
                html: `
                    <h2>Заявка за нулиране на парола</h2>
                    <p>Админ <strong>${req.user.email}</strong> поиска нулиране на паролата за папка <strong>"${record.folderName.replace(/^__RESET__.*?__/, '')}"</strong>.</p>
                    <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4285f4;color:#fff;border-radius:8px;text-decoration:none;">Нулирай паролата</a></p>
                    <p>Или копирай линка: ${resetUrl}</p>
                    <p>Линкът е еднократен.</p>
                `,
            });

            res.json({ success: true, message: 'Reset email sent to pensa.club@gmail.com' });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 17. VERIFY folder password (also checks super admin password) ──────
driveController.post(
    '/folder-password/:id/verify',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { password } = req.body;
            const record = await drive_folder_password.findOne({
                where: { folderId: req.params.id },
            });

            if (!record) {
                return res.json({ valid: true, hasPassword: false });
            }

            // Check folder password
            const valid = await bcrypt.compare(password || '', record.passwordHash);
            if (valid) {
                return res.json({ valid: true, hasPassword: true });
            }

            // Check super admin password as fallback
            const superRecord = await drive_folder_password.findOne({
                where: { folderId: SUPER_ADMIN_FOLDER_ID },
            });
            if (superRecord) {
                const superValid = await bcrypt.compare(password || '', superRecord.passwordHash);
                if (superValid) {
                    return res.json({ valid: true, hasPassword: true });
                }
            }

            res.json({ valid: false, hasPassword: true });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 18. CHECK which folders have passwords (with creator info) ─────────
driveController.get(
    '/folder-passwords',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { user_account } = require('../sequelize/models');
            const records = await drive_folder_password.findAll({
                where: { folderId: { [require('sequelize').Op.ne]: SUPER_ADMIN_FOLDER_ID } },
                include: [{ model: user_account, as: 'creator', attributes: ['id', 'email'] }],
            });
            const map = {};
            records.forEach(r => {
                map[r.folderId] = {
                    createdBy: r.createdBy,
                    creatorEmail: r.creator?.email || 'Unknown',
                    lockTimeout: r.lockTimeout || null,
                };
            });
            res.json({ protectedFolders: map });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 19. SET super admin password ───────────────────────────────────────
driveController.post(
    '/super-password',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const { password } = req.body;
            if (!password || password.length < 4) {
                return res.status(400).json({ error: 'Password must be at least 4 characters' });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const [record, created] = await drive_folder_password.findOrCreate({
                where: { folderId: SUPER_ADMIN_FOLDER_ID },
                defaults: {
                    folderName: 'Super Admin Password',
                    passwordHash,
                    createdBy: req.user.userId,
                },
            });

            if (!created) {
                record.passwordHash = passwordHash;
                await record.save();
            }

            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 20. CHECK if super admin password exists ───────────────────────────
driveController.get(
    '/super-password',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            const record = await drive_folder_password.findOne({
                where: { folderId: SUPER_ADMIN_FOLDER_ID },
            });
            res.json({ hasSuperPassword: !!record });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 21. REMOVE super admin password ────────────────────────────────────
driveController.delete(
    '/super-password',
    isAuth,
    rbac.checkPermission('admin', 'update'),
    async (req, res, next) => {
        try {
            await drive_folder_password.destroy({ where: { folderId: SUPER_ADMIN_FOLDER_ID } });
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = driveController;
