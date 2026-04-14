// ─── Shared helpers for download filename handling ──────────────────────────
// Used by file-download controllers (cloud storage, shared links, shared files,
// Google Drive) so we stay consistent about RFC 5987 headers and about giving
// UUID-only GCS uploads a usable extension on the way out.

// RFC 5987 compliant Content-Disposition header for attachments.
// Emits both an ASCII fallback and `filename*=UTF-8''` so that Cyrillic
// and other non-ASCII names survive the round-trip to the browser.
function buildContentDisposition(filename) {
    // eslint-disable-next-line no-control-regex
    const asciiFallback = String(filename || 'file')
        .replace(/[^\x20-\x7E]/g, '_')
        .replace(/"/g, '\\"');
    const utf8Encoded = encodeURIComponent(String(filename || 'file'));
    return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${utf8Encoded}`;
}

// Map common MIME types to the extension we want on disk.
const MIME_TO_EXT = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff',
    'image/x-icon': '.ico',
    'image/heic': '.heic',
    'image/avif': '.avif',
    'application/pdf': '.pdf',
    'application/zip': '.zip',
    'application/x-zip-compressed': '.zip',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/json': '.json',
    'application/xml': '.xml',
    'application/octet-stream': '',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'text/html': '.html',
    'text/xml': '.xml',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
    'video/x-matroska': '.mkv',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'audio/mp4': '.m4a',
    'audio/aac': '.aac',
    'audio/flac': '.flac',
};

// If filename already has an extension, leave it alone.
// Otherwise derive one from the Content-Type metadata.
// This matters for GCS objects uploaded with UUID-only names — without this
// the browser saves them as type-less blobs that Windows labels as just "Файл".
function ensureExtension(filename, contentType) {
    if (!filename) return filename;
    const hasExt = /\.[a-z0-9]{1,8}$/i.test(filename);
    if (hasExt) return filename;
    const mime = (contentType || '').toLowerCase().split(';')[0].trim();
    const ext = MIME_TO_EXT[mime];
    return ext ? `${filename}${ext}` : filename;
}

module.exports = {
    buildContentDisposition,
    ensureExtension,
    MIME_TO_EXT,
};
