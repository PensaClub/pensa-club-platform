const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

// ─── Google Drive Service (Service Account + Domain-Wide Delegation) ──────────
// Uses the Firebase service account to impersonate admin@pensa.club via
// domain-wide delegation configured in Google Workspace Admin Console.

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const IMPERSONATE_EMAIL = process.env.GOOGLE_DRIVE_IMPERSONATE_EMAIL || 'admin@pensa.club';

let driveClient = null;
let authClient = null;

/**
 * Initialize the Google Auth client with service account credentials
 * and domain-wide delegation (impersonation).
 */
const getAuthClient = () => {
    if (authClient) return authClient;

    let credentials;

    if (process.env.NODE_ENV !== 'production') {
        const serviceAccountPath = path.resolve(__dirname, '../config/firebase-service-account.json');
        if (fs.existsSync(serviceAccountPath)) {
            credentials = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        }
    } else {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            credentials = {
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };
        }
    }

    if (!credentials) {
        throw new Error('Google Drive: No service account credentials found');
    }

    authClient = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: SCOPES,
        subject: IMPERSONATE_EMAIL, // Domain-wide delegation — act as this user
    });

    return authClient;
};

/**
 * Get Google Drive API client instance.
 */
const getDrive = () => {
    if (driveClient) return driveClient;
    driveClient = google.drive({ version: 'v3', auth: getAuthClient() });
    return driveClient;
};

/**
 * Check if Drive connection works (delegation is configured correctly).
 */
const checkStatus = async () => {
    try {
        const drive = getDrive();
        const res = await drive.about.get({ fields: 'user,storageQuota' });
        return {
            connected: true,
            user: res.data.user?.emailAddress,
            displayName: res.data.user?.displayName,
            quota: res.data.storageQuota ? {
                limit: parseInt(res.data.storageQuota.limit || 0),
                usage: parseInt(res.data.storageQuota.usage || 0),
                usageInDrive: parseInt(res.data.storageQuota.usageInDrive || 0),
                usageInDriveTrash: parseInt(res.data.storageQuota.usageInDriveTrash || 0),
            } : null,
        };
    } catch (err) {
        console.error('Google Drive status check failed:', err.message);
        return { connected: false, error: err.message };
    }
};

/**
 * List files and folders in a specific folder.
 * @param {string} folderId - The folder ID ('root' for root folder)
 * @param {string} pageToken - Pagination token
 * @param {number} pageSize - Number of results per page
 */
const listFiles = async (folderId = 'root', pageToken = null, pageSize = 100) => {
    const drive = getDrive();
    const query = `'${folderId}' in parents and trashed = false`;

    const res = await drive.files.list({
        q: query,
        fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, parents, iconLink, thumbnailLink, webViewLink)',
        orderBy: 'folder,name',
        pageSize,
        pageToken: pageToken || undefined,
    });

    const folders = [];
    const files = [];

    for (const item of res.data.files || []) {
        const entry = {
            id: item.id,
            name: item.name,
            mimeType: item.mimeType,
            size: parseInt(item.size || 0),
            modifiedTime: item.modifiedTime,
            createdTime: item.createdTime,
            iconLink: item.iconLink,
            thumbnailLink: item.thumbnailLink,
            webViewLink: item.webViewLink,
        };

        if (item.mimeType === 'application/vnd.google-apps.folder') {
            folders.push(entry);
        } else {
            files.push(entry);
        }
    }

    return {
        folders,
        files,
        nextPageToken: res.data.nextPageToken || null,
    };
};

/**
 * Search files by name across the entire Drive.
 */
const searchFiles = async (query, pageSize = 50) => {
    const drive = getDrive();
    const res = await drive.files.list({
        q: `name contains '${query.replace(/'/g, "\\'")}' and trashed = false`,
        fields: 'files(id, name, mimeType, size, modifiedTime, parents, iconLink, thumbnailLink, webViewLink)',
        orderBy: 'modifiedTime desc',
        pageSize,
    });

    return res.data.files || [];
};

/**
 * Upload a file to Google Drive.
 * @param {Buffer} buffer - File content
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @param {string} folderId - Parent folder ID ('root' for root)
 */
const uploadFile = async (buffer, fileName, mimeType, folderId = 'root') => {
    const drive = getDrive();
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    const res = await drive.files.create({
        requestBody: {
            name: fileName,
            parents: [folderId],
        },
        media: {
            mimeType,
            body: readable,
        },
        fields: 'id, name, mimeType, size, modifiedTime, webViewLink',
    });

    return res.data;
};

/**
 * Create a folder in Google Drive.
 */
const createFolder = async (folderName, parentId = 'root') => {
    const drive = getDrive();
    const res = await drive.files.create({
        requestBody: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        },
        fields: 'id, name, mimeType, modifiedTime, webViewLink',
    });

    return res.data;
};

/**
 * Delete a file or folder (move to trash).
 */
const deleteFile = async (fileId) => {
    const drive = getDrive();
    await drive.files.update({
        fileId,
        requestBody: { trashed: true },
    });
    return { deleted: true, fileId };
};

/**
 * Permanently delete a file or folder.
 */
const permanentDelete = async (fileId) => {
    const drive = getDrive();
    await drive.files.delete({ fileId });
    return { deleted: true, fileId };
};

/**
 * Rename a file or folder.
 */
const renameFile = async (fileId, newName) => {
    const drive = getDrive();
    const res = await drive.files.update({
        fileId,
        requestBody: { name: newName },
        fields: 'id, name, mimeType, modifiedTime',
    });

    return res.data;
};

/**
 * Move a file to a different folder.
 */
const moveFile = async (fileId, newParentId) => {
    const drive = getDrive();

    // Get current parents
    const file = await drive.files.get({
        fileId,
        fields: 'parents',
    });

    const previousParents = (file.data.parents || []).join(',');

    const res = await drive.files.update({
        fileId,
        addParents: newParentId,
        removeParents: previousParents,
        fields: 'id, name, mimeType, parents, modifiedTime',
    });

    return res.data;
};

/**
 * Download a file — returns a readable stream.
 */
const downloadFile = async (fileId) => {
    const drive = getDrive();

    // First get file metadata to check if it's a Google Workspace file
    const meta = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size',
    });

    const mimeType = meta.data.mimeType;

    // Google Workspace files need to be exported
    const exportMap = {
        'application/vnd.google-apps.document': { mimeType: 'application/pdf', ext: '.pdf' },
        'application/vnd.google-apps.spreadsheet': { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: '.xlsx' },
        'application/vnd.google-apps.presentation': { mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: '.pptx' },
        'application/vnd.google-apps.drawing': { mimeType: 'application/pdf', ext: '.pdf' },
    };

    if (exportMap[mimeType]) {
        const exportInfo = exportMap[mimeType];
        const res = await drive.files.export({
            fileId,
            mimeType: exportInfo.mimeType,
        }, { responseType: 'stream' });

        return {
            stream: res.data,
            fileName: meta.data.name + exportInfo.ext,
            mimeType: exportInfo.mimeType,
        };
    }

    // Regular files — direct download
    const res = await drive.files.get({
        fileId,
        alt: 'media',
    }, { responseType: 'stream' });

    return {
        stream: res.data,
        fileName: meta.data.name,
        mimeType: meta.data.mimeType,
        size: meta.data.size,
    };
};

/**
 * Get file metadata.
 */
const getFileInfo = async (fileId) => {
    const drive = getDrive();
    const res = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, modifiedTime, createdTime, parents, iconLink, thumbnailLink, webViewLink, description',
    });

    return res.data;
};

/**
 * Get storage quota information.
 */
const getQuota = async () => {
    const drive = getDrive();
    const res = await drive.about.get({ fields: 'storageQuota' });

    const q = res.data.storageQuota;
    return {
        limit: parseInt(q.limit || 0),
        usage: parseInt(q.usage || 0),
        usageInDrive: parseInt(q.usageInDrive || 0),
        usageInDriveTrash: parseInt(q.usageInDriveTrash || 0),
    };
};

/**
 * Share a file or folder with an email address.
 * @param {string} fileId - File/folder ID
 * @param {string} email - Email to share with
 * @param {string} role - 'reader', 'commenter', or 'writer'
 * @param {boolean} sendNotification - Send email notification
 */
const shareFile = async (fileId, email, role = 'reader', sendNotification = true) => {
    const drive = getDrive();
    const res = await drive.permissions.create({
        fileId,
        sendNotificationEmail: sendNotification,
        requestBody: {
            type: 'user',
            role,
            emailAddress: email,
        },
        fields: 'id, type, role, emailAddress',
    });

    return res.data;
};

/**
 * List permissions (who has access) for a file/folder.
 */
const getPermissions = async (fileId) => {
    const drive = getDrive();
    const res = await drive.permissions.list({
        fileId,
        fields: 'permissions(id, type, role, emailAddress, displayName)',
    });

    return res.data.permissions || [];
};

/**
 * Remove a permission (revoke access).
 */
const removePermission = async (fileId, permissionId) => {
    const drive = getDrive();
    await drive.permissions.delete({ fileId, permissionId });
    return { removed: true, permissionId };
};

module.exports = {
    getDrive,
    checkStatus,
    listFiles,
    searchFiles,
    uploadFile,
    createFolder,
    deleteFile,
    permanentDelete,
    renameFile,
    moveFile,
    downloadFile,
    getFileInfo,
    getQuota,
    shareFile,
    getPermissions,
    removePermission,
};
