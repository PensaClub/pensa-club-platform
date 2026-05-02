const youtubeController = require('express').Router();
const multer = require('multer');
const { getAuthUrl, getTokens, setCredentials, uploadVideoFromBuffer } = require('../utils/youtubeService');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const fs = require('fs');
const path = require('path');

// Store tokens in a persistent volume (Docker) or local file (dev)
const TOKENS_DIR = path.join(__dirname, '../../youtube-tokens');
const TOKENS_FILE = fs.existsSync(TOKENS_DIR) && fs.statSync(TOKENS_DIR).isDirectory()
    ? path.join(TOKENS_DIR, 'tokens.json')
    : path.join(__dirname, '../../youtube-tokens.json');

const loadTokens = () => {
    try {
        if (fs.existsSync(TOKENS_FILE)) {
            const data = fs.readFileSync(TOKENS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error loading YouTube tokens:', err);
    }
    return null;
};

const saveTokens = (tokens) => {
    try {
        fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
    } catch (err) {
        console.error('Error saving YouTube tokens:', err);
    }
};

// Initialize tokens on startup
const savedTokens = loadTokens();
if (savedTokens) {
    setCredentials(savedTokens);
    console.log('✅ YouTube tokens loaded');
}

// GET /youtube/auth — Redirect to Google OAuth (no auth required for initial setup)
youtubeController.get('/auth', (req, res) => {
    const url = getAuthUrl();
    res.redirect(url);
});

// GET /api/youtube/callback — OAuth callback
youtubeController.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ success: false, message: 'No code provided' });
    }

    try {
        const tokens = await getTokens(code);
        setCredentials(tokens);
        saveTokens(tokens);
        console.log('✅ YouTube tokens saved successfully');

        // Redirect to admin page with success message
        res.redirect('/academy/admin/seminars?youtube=connected');
    } catch (err) {
        console.error('YouTube OAuth error:', err);
        res.status(500).json({ success: false, message: 'OAuth failed', error: err.message });
    }
});

// GET /api/youtube/status — Check if YouTube is connected
youtubeController.get('/status', isAuth, (req, res) => {
    const tokens = loadTokens();
    let lastRefreshedAt = null;
    try {
        if (fs.existsSync(TOKENS_FILE)) {
            lastRefreshedAt = fs.statSync(TOKENS_FILE).mtime.toISOString();
        }
    } catch { /* ignore */ }
    res.json({
        success: true,
        connected: !!tokens,
        hasRefreshToken: !!tokens?.refresh_token,
        expiresAt: tokens?.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        lastRefreshedAt,
        scope: tokens?.scope || null,
    });
});

// DELETE /api/youtube/disconnect — Remove tokens (admin only)
youtubeController.delete('/disconnect', isAuth, rbac.checkPermission('seminar', 'update'), (req, res) => {
    try {
        if (fs.existsSync(TOKENS_FILE)) {
            fs.unlinkSync(TOKENS_FILE);
        }
        const { oauth2Client } = require('../utils/youtubeService');
        oauth2Client.setCredentials({});
        res.json({ success: true, message: 'YouTube disconnected' });
    } catch (err) {
        console.error('YouTube disconnect error:', err);
        res.status(500).json({ success: false, message: 'Disconnect failed', error: err.message });
    }
});

// Multer for file upload (memory storage for small files, disk for large)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
    fileFilter: (req, file, cb) => {
        const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
        console.log(`[YouTube upload] incoming file: name="${file.originalname}" mime="${file.mimetype}"`);
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.warn(`[YouTube upload] REJECTED — unsupported mime: ${file.mimetype}`);
            cb(new Error(`UNSUPPORTED_TYPE:${file.mimetype}`));
        }
    },
});

// Wrap multer so its errors return clean JSON instead of closing the connection
const handleMulter = (req, res, next) => {
    upload.single('video')(req, res, (err) => {
        if (err) {
            console.error('[YouTube upload] multer error:', err.message);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ success: false, message: 'Файлът надвишава 500MB лимит.', code: 'FILE_TOO_LARGE' });
            }
            if (err.message?.startsWith('UNSUPPORTED_TYPE:')) {
                return res.status(415).json({ success: false, message: 'Неподдържан формат. Поддържани: MP4, WebM, MOV, AVI, MKV.', code: 'UNSUPPORTED_TYPE', detail: err.message });
            }
            return res.status(400).json({ success: false, message: 'Грешка при качване на файла.', error: err.message });
        }
        next();
    });
};

// POST /api/youtube/upload — Upload video to YouTube
youtubeController.post('/upload', isAuth, rbac.checkPermission('seminar', 'update'), handleMulter, async (req, res) => {
    try {
        console.log(`[YouTube upload] starting upload — user=${req.user?.userId} file=${req.file?.originalname} size=${req.file?.size}`);

        let tokens = loadTokens();
        if (!tokens) {
            console.warn('[YouTube upload] no tokens — not connected');
            return res.status(401).json({ success: false, message: 'YouTube not connected. Admin must authorize first.' });
        }
        setCredentials(tokens);

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No video file provided' });
        }

        const { title, description, tags, privacyStatus } = req.body;

        // Multer parses multipart form-data filenames as latin1 by default,
        // which breaks Cyrillic / non-ASCII characters. Re-decode as UTF-8.
        const utf8OriginalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

        const doUpload = async () => {
            return uploadVideoFromBuffer(req.file.buffer, {
                title: title || utf8OriginalName,
                description: description || '',
                tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
                privacyStatus: privacyStatus || 'unlisted',
            });
        };

        let result;
        try {
            console.log('[YouTube upload] calling YouTube API...');
            result = await doUpload();
            console.log(`[YouTube upload] success — videoId=${result?.videoId}`);
        } catch (uploadErr) {
            console.error('[YouTube upload] doUpload threw:', uploadErr.message, '| code:', uploadErr.code);
            // If token expired, try forcing a refresh
            if (uploadErr.message?.includes('invalid_grant') || uploadErr.message?.includes('Token has been expired') || uploadErr.code === 401) {
                console.log('🔄 YouTube token expired, attempting refresh...');
                try {
                    const { oauth2Client } = require('../utils/youtubeService');
                    const { credentials } = await oauth2Client.refreshAccessToken();
                    const merged = { ...tokens, ...credentials };
                    saveTokens(merged);
                    setCredentials(merged);
                    result = await doUpload();
                } catch (refreshErr) {
                    console.error('YouTube refresh failed:', refreshErr);
                    return res.status(401).json({
                        success: false,
                        message: 'YouTube токенът е изтекъл. Моля, помолете администратор да свърже отново YouTube акаунта.',
                    });
                }
            } else {
                throw uploadErr;
            }
        }

        res.json({ success: true, ...result });
    } catch (err) {
        console.error('YouTube upload error:', err);

        if (err.message?.includes('exceeded the number of videos') || err.message?.includes('uploadLimitExceeded')) {
            return res.status(429).json({
                success: false,
                message: 'Дневният лимит за качване на видеа в YouTube е достигнат. Опитайте отново утре.',
            });
        }

        res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
    }
});

// DELETE /youtube/delete/:videoId — Delete video from YouTube
youtubeController.delete('/delete/:videoId', isAuth, rbac.checkPermission('seminar', 'update'), async (req, res) => {
    try {
        let tokens = loadTokens();
        if (!tokens) {
            return res.status(401).json({ success: false, message: 'YouTube not connected', code: 'NOT_CONNECTED' });
        }
        setCredentials(tokens);

        const { deleteVideo, oauth2Client } = require('../utils/youtubeService');

        try {
            await deleteVideo(req.params.videoId);
        } catch (delErr) {
            if (delErr.message?.includes('invalid_grant') || delErr.message?.includes('Token has been expired') || delErr.code === 401) {
                const { credentials } = await oauth2Client.refreshAccessToken();
                const merged = { ...tokens, ...credentials };
                saveTokens(merged);
                setCredentials(merged);
                await deleteVideo(req.params.videoId);
            } else {
                throw delErr;
            }
        }

        res.json({ success: true, message: 'Video deleted from YouTube' });
    } catch (err) {
        console.error('[YouTube delete] error:', err.message, '| code:', err.code);
        const msg = err.message || '';

        if (msg.includes('insufficient authentication scopes') || msg.includes('insufficientPermissions')) {
            return res.status(403).json({
                success: false,
                code: 'INSUFFICIENT_SCOPES',
                message: 'OAuth токенът няма права за изтриване. Прекъсни и свържи YouTube наново — обновени са разрешенията.',
                error: msg,
            });
        }
        if (err.code === 404 || msg.includes('Video not found') || msg.includes('videoNotFound')) {
            return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Видеото не съществува в YouTube.', error: msg });
        }
        if (err.code === 403 || msg.includes('forbidden') || msg.includes('do not have permission')) {
            return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Това видео не е качено от платформата — не може да го изтрием от YouTube.', error: msg });
        }
        res.status(500).json({ success: false, code: 'UNKNOWN', message: 'Грешка при изтриване от YouTube', error: msg });
    }
});

module.exports = youtubeController;
