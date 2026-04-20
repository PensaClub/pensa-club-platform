// src/components/Home/NewsSubscribe/PreferencesStep/PreferencesStep.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Save, Loader2 } from 'lucide-react';
import './preferencesStep.css';

const CATEGORIES = [
    { key: 'seminars', icon: '🎓' },
    { key: 'courses', icon: '📚' },
    { key: 'articles', icon: '📰' },
    { key: 'initiatives', icon: '🚀' },
    { key: 'clubs', icon: '🏠' },
    { key: 'games', icon: '🎮' },
    { key: 'platform', icon: '⚙️' },
];

const PreferencesStep = ({ onSave, subscriberName }) => {
    const { t } = useTranslation('home');
    const [prefs, setPrefs] = useState(
        CATEGORIES.reduce((acc, c) => ({ ...acc, [c.key]: false }), {})
    );
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const toggle = (key) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const preferences = CATEGORIES.map(c => ({
                category: c.key,
                enabled: prefs[c.key],
            }));
            await onSave(preferences);
            setSaved(true);
        } finally {
            setIsSaving(false);
        }
    };

    if (saved) {
        return (
            <div className="nsp-done">
                <CheckCircle size={40} className="nsp-done-icon" />
                <h3 className="nsp-done-title">{t('news-subscribe.preferences.done-title', 'Готово!')}</h3>
                <p className="nsp-done-text">{t('news-subscribe.preferences.done-text', 'Предпочитанията ви са запазени. Ще получавате бюлетин само за избраните категории.')}</p>
            </div>
        );
    }

    return (
        <div className="nsp-container">
            <div className="nsp-header">
                <CheckCircle size={28} className="nsp-success-icon" />
                <h3 className="nsp-title">
                    {t('news-subscribe.preferences.title', 'Успешно се абонирахте!')}
                </h3>
                <p className="nsp-subtitle">
                    {t('news-subscribe.preferences.subtitle', 'Изберете какво ви интересува, за да получавате само подходящите за вас новини.')}
                </p>
            </div>

            <div className="nsp-categories">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.key}
                        className={`nsp-cat ${prefs[cat.key] ? 'nsp-cat-active' : ''}`}
                        onClick={() => toggle(cat.key)}
                        type="button"
                    >
                        <span className="nsp-cat-icon">{cat.icon}</span>
                        <span className="nsp-cat-label">
                            {t(`news-subscribe.preferences.categories.${cat.key}`)}
                        </span>
                    </button>
                ))}
            </div>

            <button className="nsp-save-btn" onClick={handleSave} disabled={isSaving}>
                {isSaving
                    ? <Loader2 size={16} className="nsp-spin" />
                    : <Save size={16} />
                }
                <span>{t('news-subscribe.preferences.save', 'Запази предпочитанията')}</span>
            </button>
        </div>
    );
};

export default PreferencesStep;
