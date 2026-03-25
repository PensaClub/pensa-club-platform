const youtubeController = require('express').Router();
const multer = require('multer');
const { getAuthUrl, getTokens, setCredentials, uploadVideoFromBuffer } = require('../utils/youtubeService');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const fs = require('fs');
const path = require('path');

// Store tokens in a file (simple persistence)
const TOKENS_FILE = path.join(__dirname, '../../youtube-tokens.json');

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
    res.json({
        success: true,
        connected: !!tokens,
        hasRefreshToken: !!tokens?.refresh_token,
    });
});

// Multer for file upload (memory storage for small files, disk for large)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
    fileFilter: (req, file, cb) => {
        const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP4, WebM, MOV, AVI allowed.'));
        }
    },
});

// POST /api/youtube/upload — Upload video to YouTube
youtubeController.post('/upload', isAuth, rbac.checkPermission('seminar', 'update'), upload.single('video'), async (req, res) => {
    try {
        const tokens = loadTokens();
        if (!tokens) {
            return res.status(401).json({ success: false, message: 'YouTube not connected. Admin must authorize first.' });
        }
        setCredentials(tokens);

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No video file provided' });
        }

        const { title, description, tags, privacyStatus } = req.body;

        const result = await uploadVideoFromBuffer(req.file.buffer, {
            title: title || req.file.originalname,
            description: description || '',
            tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
            privacyStatus: privacyStatus || 'unlisted',
        });

        res.json({ success: true, ...result });
    } catch (err) {
        console.error('YouTube upload error:', err);

        if (err.message?.includes('invalid_grant') || err.message?.includes('Token has been expired')) {
            return res.status(401).json({ success: false, message: 'YouTube authorization expired. Admin must re-authorize.' });
        }

        res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
    }
});

// DELETE /youtube/delete/:videoId — Delete video from YouTube
youtubeController.delete('/delete/:videoId', isAuth, rbac.checkPermission('seminar', 'update'), async (req, res) => {
    try {
        const tokens = loadTokens();
        if (!tokens) {
            return res.status(401).json({ success: false, message: 'YouTube not connected' });
        }
        setCredentials(tokens);

        const { deleteVideo } = require('../utils/youtubeService');
        await deleteVideo(req.params.videoId);

        res.json({ success: true, message: 'Video deleted from YouTube' });
    } catch (err) {
        console.error('YouTube delete error:', err);
        res.status(500).json({ success: false, message: 'Delete failed', error: err.message });
    }
});

module.exports = youtubeController;
