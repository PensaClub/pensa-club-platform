import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { storageServiceFactory } from '../Services/storageService';
import './sharedDownload.css';

const SharedDownload = () => {
    const { token } = useParams();
    const storageService = useMemo(() => storageServiceFactory(), []);

    const [linkInfo, setLinkInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [password, setPassword] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');
    const [downloadSuccess, setDownloadSuccess] = useState(false);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const data = await storageService.getShareLinkInfo(token);
                if (data.error) {
                    // Backend returned a JSON error
                    if (data.statusCode === 404) setError('not_found');
                    else if (data.statusCode === 410) setError('expired');
                    else setError('general');
                } else if (data && (data.fileName || data.hasPassword !== undefined)) {
                    // Valid response with link info
                    setLinkInfo(data);
                } else {
                    // Got a response but it's not a link info object
                    // (likely React SPA HTML returned by NPM fallback)
                    setError('not_found');
                }
            } catch (err) {
                // Network error, JSON parse error (HTML returned), etc.
                if (err?.statusCode === 404 || err?.message?.toLowerCase?.().includes('not found')) {
                    setError('not_found');
                } else if (err?.statusCode === 410 || err?.message?.toLowerCase?.().includes('expired')) {
                    setError('expired');
                } else {
                    setError('general');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, [token, storageService]);

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Trigger native browser download via a programmatic click on a real <a> link.
    // Important: must use a REAL http URL (not blob:) and NOT set the `download`
    // attribute — let the server's Content-Disposition header handle the filename.
    // Mobile browsers (Android Chrome, Samsung Internet) treat this as a link click,
    // NOT as JS navigation, so they DON'T show the "leave site?" prompt.
    const triggerNativeDownload = (url) => {
        const a = document.createElement('a');
        a.href = url;
        a.rel = 'noopener noreferrer';
        // Intentionally no `download` attribute — server provides Content-Disposition
        // Intentionally no `target` — same context, browser triggers download in place
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDownload = async () => {
        setDownloading(true);
        setDownloadError('');
        try {
            // Quick guard for password-protected links with empty password
            if (linkInfo?.hasPassword && !password) {
                setDownloadError('wrong_password');
                setDownloading(false);
                return;
            }

            // ALWAYS pre-validate before triggering native download.
            // This catches: max_downloads_reached, expired, not_found, wrong_password.
            // Without this, the browser would navigate to the GET download URL and
            // show raw JSON error in the address bar if validation fails server-side.
            try {
                await storageService.verifySharedLinkPassword(token, password);
            } catch (err) {
                const status = err?.statusCode || err?.status;
                const msg = (err?.message || '').toLowerCase();
                if (msg.includes('limit') || msg.includes('max')) {
                    setDownloadError('max_downloads');
                } else if (status === 401 || msg.includes('password')) {
                    setDownloadError('wrong_password');
                } else if (status === 410 || msg.includes('expired')) {
                    setDownloadError('expired');
                } else if (status === 404 || msg.includes('not found')) {
                    setDownloadError('expired');
                } else {
                    setDownloadError('general');
                }
                setDownloading(false);
                return;
            }

            // All good — trigger native browser download via real <a> click
            const downloadUrl = storageService.getSharedDownloadUrl(
                token,
                password || undefined
            );
            triggerNativeDownload(downloadUrl);
            setDownloadSuccess(true);
        } catch (err) {
            setDownloadError('general');
        } finally {
            setDownloading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleDownload();
        }
    };

    const getErrorMessages = (code) => {
        const messages = {
            expired: {
                title: 'Линкът е изтекъл',
                message: 'Този линк за споделяне вече не е валиден.',
            },
            not_found: {
                title: 'Линкът не е намерен',
                message: 'Този линк за споделяне не съществува.',
            },
            max_downloads_reached: {
                title: 'Лимитът е достигнат',
                message: 'Максималният брой сваляния за този файл е достигнат.',
            },
            wrong_password: {
                title: '',
                message: 'Грешна парола. Опитайте отново.',
            },
            max_downloads: {
                title: '',
                message: 'Максималният брой сваляния за този файл е достигнат.',
            },
            general: {
                title: '',
                message: 'Възникна грешка при свалянето. Опитайте отново.',
            },
        };
        return messages[code] || messages.general;
    };

    return (
        <div className="sd-page">
            <div className="sd-card">
                <img
                    src="/images/homePage/logo-2.png"
                    alt="Pensa"
                    className="sd-logo"
                />
                <p className="sd-brand">Фондация ПЕНСА</p>

                {loading && (
                    <div className="sd-loading">
                        <div className="sd-spinner" />
                        <p className="sd-loading-text">Зареждане...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="sd-error">
                        <div className="sd-error-icon">
                            <AlertTriangle size={28} />
                        </div>
                        <h3 className="sd-error-title">{getErrorMessages(error).title}</h3>
                        <p className="sd-error-message">{getErrorMessages(error).message}</p>
                    </div>
                )}

                {linkInfo && !loading && !error && (
                    <>
                        <div className="sd-file-icon">
                            <FileText size={32} />
                        </div>
                        <h3 className="sd-file-name">{linkInfo.fileName}</h3>
                        {linkInfo.fileSize && (
                            <p className="sd-file-size">{formatFileSize(linkInfo.fileSize)}</p>
                        )}

                        {linkInfo.hasPassword && (
                            <div className="sd-password-group">
                                <label className="sd-password-label">Парола</label>
                                <input
                                    type="password"
                                    className="sd-password-input"
                                    placeholder="Въведете парола"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={downloading}
                                />
                            </div>
                        )}

                        {downloadError && (
                            <p className="sd-inline-error">
                                {getErrorMessages(downloadError).message}
                            </p>
                        )}

                        <button
                            className="sd-download-btn"
                            onClick={handleDownload}
                            disabled={downloading || (linkInfo.hasPassword && !password)}
                        >
                            <Download size={18} />
                            <span>{downloading ? 'Сваляне...' : 'Свали'}</span>
                        </button>

                        {downloadSuccess && (
                            <div className="sd-success">
                                <CheckCircle size={18} />
                                <span>Файлът е свален успешно</span>
                            </div>
                        )}

                        {linkInfo.downloadsLeft != null && (
                            <p className="sd-downloads-info">
                                Оставащи сваляния: {linkInfo.downloadsLeft}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SharedDownload;
