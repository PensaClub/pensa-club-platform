const { google } = require('googleapis');
const fs = require('fs');

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
);

// Generate auth URL for admin to authorize
const getAuthUrl = () => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube'],
        prompt: 'consent',
    });
};

// Exchange code for tokens
const getTokens = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

// Set credentials
const setCredentials = (tokens) => {
    oauth2Client.setCredentials(tokens);
};

// Upload video to YouTube
const uploadVideo = async (filePath, metadata = {}) => {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
            snippet: {
                title: metadata.title || 'Untitled',
                description: metadata.description || '',
                tags: metadata.tags || [],
                categoryId: '27', // Education
            },
            status: {
                privacyStatus: metadata.privacyStatus || 'unlisted',
            },
        },
        media: {
            body: fs.createReadStream(filePath),
        },
    });

    return {
        videoId: response.data.id,
        videoUrl: `https://www.youtube.com/watch?v=${response.data.id}`,
        embedUrl: `https://www.youtube.com/embed/${response.data.id}`,
        title: response.data.snippet?.title,
        status: response.data.status?.privacyStatus,
    };
};

// Upload from buffer (for streams/uploads)
const uploadVideoFromBuffer = async (buffer, metadata = {}) => {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const { Readable } = require('stream');
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    const response = await youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
            snippet: {
                title: metadata.title || 'Untitled',
                description: metadata.description || '',
                tags: metadata.tags || [],
                categoryId: '27',
            },
            status: {
                privacyStatus: metadata.privacyStatus || 'unlisted',
            },
        },
        media: {
            body: readable,
        },
    });

    return {
        videoId: response.data.id,
        videoUrl: `https://www.youtube.com/watch?v=${response.data.id}`,
        embedUrl: `https://www.youtube.com/embed/${response.data.id}`,
        title: response.data.snippet?.title,
        status: response.data.status?.privacyStatus,
    };
};

// Delete video from YouTube
const deleteVideo = async (videoId) => {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    await youtube.videos.delete({ id: videoId });
    return { deleted: true, videoId };
};

// Extract videoId from YouTube URL
const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
};

module.exports = {
    oauth2Client,
    getAuthUrl,
    getTokens,
    setCredentials,
    uploadVideo,
    uploadVideoFromBuffer,
    deleteVideo,
    extractVideoId,
};
