// src/components/Home/NewsSubscribe/SubscribeForm/SubscribeForm.jsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import './subscribeForm.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SubscribeForm = ({ onSuccess }) => {
    const { t } = useTranslation('home');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const errs = {};
        if (!name.trim()) errs.name = t('news-subscribe.errors.required-field');
        else if (name.trim().length < 3) errs.name = t('news-subscribe.errors.name-min', 'Минимум 3 символа');
        if (!email.trim()) errs.email = t('news-subscribe.errors.required-field');
        else if (!emailRegex.test(email)) errs.email = t('news-subscribe.errors.invalid-email');
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await onSuccess(name.trim(), email.trim());
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="nsf-form" onSubmit={handleSubmit}>
            <div className="nsf-fields">
                <div className="nsf-field">
                    <div className={`nsf-input-wrap ${errors.name ? 'nsf-input-error' : ''}`}>
                        <User size={18} className="nsf-icon" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
                            placeholder={t('news-subscribe.name-placeholder')}
                            className="nsf-input"
                        />
                    </div>
                    {errors.name && <span className="nsf-error">{errors.name}</span>}
                </div>
                <div className="nsf-field">
                    <div className={`nsf-input-wrap ${errors.email ? 'nsf-input-error' : ''}`}>
                        <Mail size={18} className="nsf-icon" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                            placeholder={t('news-subscribe.email-placeholder')}
                            className="nsf-input"
                        />
                    </div>
                    {errors.email && <span className="nsf-error">{errors.email}</span>}
                </div>
            </div>
            <button type="submit" className="nsf-btn" disabled={isSubmitting}>
                {isSubmitting
                    ? <Loader2 size={18} className="nsf-spin" />
                    : <><span>{t('news-subscribe.subscribe-btn')}</span><ArrowRight size={18} /></>
                }
            </button>
        </form>
    );
};

export default SubscribeForm;
