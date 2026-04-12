import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Share2, Trash2, Mail, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDrive } from '../../contexts/DriveProvider';
import './driveShareModal.css';

const ROLE_OPTIONS = [
    { value: 'reader', labelKey: 'googleDrive.share.viewer' },
    { value: 'commenter', labelKey: 'googleDrive.share.commenter' },
    { value: 'writer', labelKey: 'googleDrive.share.editor' },
];

const DriveShareModal = ({ item, onClose }) => {
    const { t } = useTranslation('admin');
    const { shareFile, getPermissions, removePermission } = useDrive();

    const [email, setEmail] = useState('');
    const [role, setRole] = useState('reader');
    const [sendNotification, setSendNotification] = useState(true);
    const [sharing, setSharing] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const [loadingPerms, setLoadingPerms] = useState(true);

    // Load current permissions
    useEffect(() => {
        const load = async () => {
            try {
                const result = await getPermissions(item.id);
                setPermissions(result.permissions || []);
            } catch {
                console.error('Failed to load permissions');
            } finally {
                setLoadingPerms(false);
            }
        };
        load();
    }, [item.id, getPermissions]);

    const handleShare = async () => {
        if (!email.trim()) return;
        setSharing(true);
        try {
            await shareFile(item.id, email.trim(), role, sendNotification);
            toast.success(t('googleDrive.share.success', { email: email.trim() }));
            setEmail('');
            // Reload permissions
            const result = await getPermissions(item.id);
            setPermissions(result.permissions || []);
        } catch {
            toast.error(t('googleDrive.share.failed'));
        } finally {
            setSharing(false);
        }
    };

    const handleRemovePermission = async (permId, permEmail) => {
        try {
            await removePermission(item.id, permId);
            setPermissions(prev => prev.filter(p => p.id !== permId));
            toast.success(t('googleDrive.share.removed', { email: permEmail }));
        } catch {
            toast.error(t('googleDrive.share.removeFailed'));
        }
    };

    const getRoleLabel = (r) => {
        const option = ROLE_OPTIONS.find(o => o.value === r);
        return option ? t(option.labelKey) : r;
    };

    return (
        <div className="dsm-overlay" onClick={onClose}>
            <div className="dsm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="dsm-header">
                    <Share2 size={20} />
                    <h3>{t('googleDrive.share.title')}</h3>
                    <button className="dsm-close" onClick={onClose}><X size={18} /></button>
                </div>

                <p className="dsm-file-name">{item.name}</p>

                {/* Add people */}
                <div className="dsm-add-section">
                    <div className="dsm-input-row">
                        <Mail size={16} className="dsm-input-icon" />
                        <input
                            type="email"
                            className="dsm-email-input"
                            placeholder={t('googleDrive.share.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleShare(); }}
                        />
                        <select
                            className="dsm-role-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            {ROLE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="dsm-options-row">
                        <label className="dsm-checkbox-label">
                            <input
                                type="checkbox"
                                checked={sendNotification}
                                onChange={(e) => setSendNotification(e.target.checked)}
                            />
                            <span>{t('googleDrive.share.notify')}</span>
                        </label>

                        <button
                            className="dsm-share-btn"
                            onClick={handleShare}
                            disabled={sharing || !email.trim()}
                        >
                            <UserPlus size={14} />
                            <span>{sharing ? '...' : t('googleDrive.share.send')}</span>
                        </button>
                    </div>
                </div>

                {/* Current permissions */}
                <div className="dsm-permissions">
                    <h4>{t('googleDrive.share.whoHasAccess')}</h4>
                    {loadingPerms ? (
                        <p className="dsm-loading">{t('googleDrive.loading')}</p>
                    ) : permissions.length === 0 ? (
                        <p className="dsm-no-perms">{t('googleDrive.share.noShares')}</p>
                    ) : (
                        <ul className="dsm-perm-list">
                            {permissions.map(perm => (
                                <li key={perm.id} className="dsm-perm-item">
                                    <div className="dsm-perm-info">
                                        <span className="dsm-perm-email">
                                            {perm.emailAddress || perm.displayName || perm.type}
                                        </span>
                                        <span className="dsm-perm-role">{getRoleLabel(perm.role)}</span>
                                    </div>
                                    {perm.role !== 'owner' && (
                                        <button
                                            className="dsm-perm-remove"
                                            onClick={() => handleRemovePermission(perm.id, perm.emailAddress)}
                                            title={t('googleDrive.share.remove')}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriveShareModal;
