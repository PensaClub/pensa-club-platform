const sharedLinksController = require('express').Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const customError = require('../utils/customError');
const { shared_link, shared_link_download, user_account } = require('../sequelize/models');
const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');
const { getFirebaseApp, admin } = require('../firebase/firebaseAdmin');

/**
 * Helper: validate a shared link token and return the link or throw appropriate error
 */
async function validateSharedLink(token) {
    const link = await shared_link.findOne({
        where: { token },
        include: [
            {
                model: user_account,
                as: 'creator',
                attributes: ['id', 'email'],
            },
        ],
    });

    if (!link || !link.isActive) {
        throw new customError({
            message: 'Link not found',
            statusCode: 404,
        });
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        throw new customError({
            message: 'Link expired',
            statusCode: 410,
        });
    }

    if (link.maxDownloads !== null && link.downloadCount >= link.maxDownloads) {
        throw new customError({
            message: 'Download limit reached',
            statusCode: 410,
        });
    }

    return link;
}

/**
 * Helper: parse expiresIn string to a Date
 */
function parseExpiresIn(expiresIn) {
    if (!expiresIn || expiresIn === 'never') return null;

    const now = new Date();
    const map = {
        '1d': 1,
        '7d': 7,
        '30d': 30,
    };

    const days = map[expiresIn];
    if (!days) return null;

    now.setDate(now.getDate() + days);
    return now;
}

// POST /shared-links — Create a share link (admin)
sharedLinksController.post('/', isAuth, checkPermission('sharedLink', 'create'), async (req, res, next) => {
    try {
        const { filePath, fileName, password, expiresIn, maxDownloads } = req.body;

        const errors = {};
        if (!filePath) errors.filePath = 'File path is required';
        if (!fileName) errors.fileName = 'File name is required';

        if (Object.keys(errors).length > 0) {
            throw new customError({
                message: 'Validation errors',
                statusCode: 400,
                details: errors,
            });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const passwordHash = password ? await bcrypt.hash(password, 10) : null;
        const expiresAt = parseExpiresIn(expiresIn);

        const link = await shared_link.create({
            token,
            filePath,
            fileName,
            createdBy: req.user.userId,
            passwordHash,
            expiresAt,
            maxDownloads: maxDownloads || null,
        });

        const clientUrl = process.env.CLIENT_URL || 'https://pensa.club';

        return res.status(201).json({
            success: true,
            link: {
                id: link.id,
                token: link.token,
                url: `${clientUrl}/shared/${link.token}`,
                expiresAt: link.expiresAt,
                hasPassword: !!passwordHash,
            },
        });
    } catch (err) {
        next(err);
    }
});

// GET /shared-links — List all share links (admin)
sharedLinksController.get('/', isAuth, checkPermission('sharedLink', 'readAll'), async (req, res, next) => {
    try {
        const links = await shared_link.findAll({
            include: [
                {
                    model: user_account,
                    as: 'creator',
                    attributes: ['id', 'email'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        return res.json({
            links: links.map((link) => ({
                id: link.id,
                token: link.token,
                fileName: link.fileName,
                filePath: link.filePath,
                createdBy: link.creator
                    ? { id: link.creator.id, email: link.creator.email }
                    : null,
                hasPassword: !!link.passwordHash,
                expiresAt: link.expiresAt,
                maxDownloads: link.maxDownloads,
                downloadCount: link.downloadCount,
                isActive: link.isActive,
                url: `${process.env.CLIENT_URL || 'https://pensa.club'}/shared/${link.token}`,
                createdAt: link.createdAt,
                updatedAt: link.updatedAt,
            })),
        });
    } catch (err) {
        next(err);
    }
});

// DELETE /shared-links/:id — Deactivate a share link (admin)
sharedLinksController.delete('/:id', isAuth, checkPermission('sharedLink', 'delete'), async (req, res, next) => {
    try {
        const link = await shared_link.findByPk(req.params.id);

        if (!link) {
            throw new customError({
                message: 'Link not found',
                statusCode: 404,
            });
        }

        await link.update({ isActive: false });

        return res.json({ success: true, message: 'Link deactivated' });
    } catch (err) {
        next(err);
    }
});

// GET /shared-links/:token/info — Public file info
sharedLinksController.get('/:token/info', async (req, res, next) => {
    try {
        const link = await validateSharedLink(req.params.token);

        return res.json({
            fileName: link.fileName,
            hasPassword: !!link.passwordHash,
            createdBy: link.creator ? link.creator.email : null,
            expiresAt: link.expiresAt,
        });
    } catch (err) {
        next(err);
    }
});

// POST /shared-links/:token/download — Public download
sharedLinksController.post('/:token/download', async (req, res, next) => {
    try {
        const link = await validateSharedLink(req.params.token);

        // Check password if required
        if (link.passwordHash) {
            const { password } = req.body || {};
            if (!password) {
                throw new customError({
                    message: 'Password is required',
                    statusCode: 401,
                });
            }

            const isValid = await bcrypt.compare(password, link.passwordHash);
            if (!isValid) {
                throw new customError({
                    message: 'Invalid password',
                    statusCode: 401,
                });
            }
        }

        // Get the file from Firebase Storage
        let fileStream;
        let fileMetadata;
        try {
            const app = getFirebaseApp();
            const bucket = admin.storage().bucket();
            const file = bucket.file(link.filePath);

            const [exists] = await file.exists();
            if (!exists) {
                throw new customError({
                    message: 'File not found in storage',
                    statusCode: 404,
                });
            }

            [fileMetadata] = await file.getMetadata();
            fileStream = file.createReadStream();
        } catch (err) {
            if (err instanceof customError) throw err;
            throw new customError({
                message: 'File not found in storage',
                statusCode: 404,
            });
        }

        // Increment download count and create download record
        await Promise.all([
            link.increment('downloadCount'),
            shared_link_download.create({
                sharedLinkId: link.id,
                ipAddress: req.ip || req.connection?.remoteAddress || null,
                userAgent: req.headers['user-agent']
                    ? req.headers['user-agent'].substring(0, 500)
                    : null,
            }),
        ]);

        // Set response headers
        const contentType = fileMetadata?.contentType || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${encodeURIComponent(link.fileName)}"`
        );
        if (fileMetadata?.size) {
            res.setHeader('Content-Length', fileMetadata.size);
        }

        // Stream file to response
        fileStream.on('error', (err) => {
            if (!res.headersSent) {
                next(
                    new customError({
                        message: 'Error streaming file',
                        statusCode: 500,
                    })
                );
            }
        });

        fileStream.pipe(res);
    } catch (err) {
        next(err);
    }
});

module.exports = sharedLinksController;
