import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Copy, Check, Link2 } from 'lucide-react';
import { storageServiceFactory } from '../../Services/storageService';

const storageService = storageServiceFactory();

const VALIDITY_OPTIONS = [
    { value: 1, labelKey: 'cloudStorage.1day' },
    { value: 7, labelKey: 'cloudStorage.7days' },
    { value: 30, labelKey: 'cloudStorage.30days' },
    { value: 0, labelKey: 'cloudStorage.never' },
];

const ShareFileModal = ({ filePath, fileName, onClose }) => {
    const { t } = useTranslation('admin');
    const [expiresInDays, setExpiresInDays] = useState(7);
    const [usePassword, setUsePassword] = useState(false);
    const [password, setPassword] = useState('');
    const [useMaxDownloads, setUseMaxDownloads] = useState(false);
    const [maxDownloads, setMaxDownloads] = useState(10);
    const [generating, setGenerating] = useState(false);
    const [shareResult, setShareResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setGenerating(true);
        setError('');
        try {
            const expiresMap = { 1: '1d', 7: '7d', 30: '30d', 0: 'never' };
            const data = {
                filePath,
                fileName,
                expiresIn: expiresMap[expiresInDays] || 'never',
            };
            if (usePassword && password) {
                data.password = password;
            }
            if (useMaxDownloads && maxDownloads > 0) {
                data.maxDownloads = maxDownloads;
            }

            const result = await storageService.createShareLink(data);
            const shareUrl = result.link?.url || `${window.location.origin}/shared/${result.link?.token || result.token}`;
            setShareResult(shareUrl);
        } catch (err) {
            setError(err?.message || 'Error generating link');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareResult);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
            const textArea = document.createElement('textarea');
            textArea.value = shareResult;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="csm-share-modal" onClick={handleOverlayClick}>
            <div className="csm-share-content">
                <h4>{t('cloudStorage.shareFile')}</h4>
                <p className="csm-share-filename">{fileName}</p>

                {!shareResult ? (
                    <>
                        {/* Validity */}
                        <div className="csm-share-option">
                            <span className="csm-share-option-label">
                                {t('cloudStorage.validity')}
                            </span>
                            <div className="csm-share-radios">
                                {VALIDITY_OPTIONS.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className={`csm-share-radio${expiresInDays === opt.value ? ' csm-share-radio--active' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="validity"
                                            checked={expiresInDays === opt.value}
                                            onChange={() => setExpiresInDays(opt.value)}
                                        />
                                        <span>{t(opt.labelKey)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Password */}
                        <div className="csm-share-option">
                            <label className="csm-share-checkbox">
                                <input
                                    type="checkbox"
                                    checked={usePassword}
                                    onChange={(e) => setUsePassword(e.target.checked)}
                                />
                                <span>{t('cloudStorage.protectWithPassword')}</span>
                            </label>
                            {usePassword && (
                                <input
                                    type="text"
                                    className="csm-share-input"
                                    placeholder={t('cloudStorage.password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            )}
                        </div>

                        {/* Max downloads */}
                        <div className="csm-share-option">
                            <label className="csm-share-checkbox">
                                <input
                                    type="checkbox"
                                    checked={useMaxDownloads}
                                    onChange={(e) => setUseMaxDownloads(e.target.checked)}
                                />
                                <span>{t('cloudStorage.limitDownloads')}</span>
                            </label>
                            {useMaxDownloads && (
                                <input
                                    type="number"
                                    className="csm-share-input csm-share-input--number"
                                    placeholder={t('cloudStorage.maxDownloads')}
                                    value={maxDownloads}
                                    onChange={(e) => setMaxDownloads(Number(e.target.value))}
                                    min={1}
                                />
                            )}
                        </div>

                        {error && <p className="csm-share-filename" style={{ color: '#f87171' }}>{error}</p>}

                        {/* Actions */}
                        <div className="csm-share-actions">
                            <button className="csm-btn" onClick={onClose}>
                                <X size={14} />
                                <span>{t('admin.cancel')}</span>
                            </button>
                            <button
                                className="csm-btn csm-btn--primary"
                                onClick={handleGenerate}
                                disabled={generating || (usePassword && !password)}
                            >
                                <Link2 size={14} />
                                <span>{generating ? '...' : t('cloudStorage.generateLink')}</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="csm-share-success">{t('cloudStorage.linkGenerated')}</p>
                        <div className="csm-share-link">
                            <span className="csm-share-link-url" onClick={handleCopy}>
                                {shareResult}
                            </span>
                            <button
                                className={`csm-share-link-copy${copied ? ' csm-share-link-copy--copied' : ''}`}
                                onClick={handleCopy}
                            >
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                <span>{copied ? t('cloudStorage.linkCopied') : t('cloudStorage.copyLink')}</span>
                            </button>
                        </div>
                        <div className="csm-share-actions">
                            <button className="csm-btn" onClick={onClose}>
                                <X size={14} />
                                <span>{t('admin.cancel')}</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShareFileModal;
