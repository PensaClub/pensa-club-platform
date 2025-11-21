import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../contexts/AcademyProvider';
import { Loader } from '../Loader/Loader';
import './digiMentorProfile.css';

export const DigiMentorProfile = () => {
    const { t } = useTranslation();
    const { getMentorProfile, updateMentorProfile } = useAcademy();

    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const result = await getMentorProfile();

            if (result.success) {
                setProfile(result.mentor);
                setFormData({
                    phone: result.mentor.phone || '',
                    country: result.mentor.country || '',
                    specialization: result.mentor.specialization || '',
                    education: result.mentor.education || '',
                    experience: result.mentor.experience || '',
                    motivation: result.mentor.motivation || '',
                    availability: result.mentor.availability || '',
                    languages: result.mentor.languages || [],
                    viber: result.mentor.viber || '',
                    facebook: result.mentor.facebook || '',
                    linkedin: result.mentor.linkedin || '',
                    otherContact: result.mentor.otherContact || '',
                    priorityContact: result.mentor.priorityContact || 'email'
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLanguageToggle = (lang) => {
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.includes(lang)
                ? prev.languages.filter(l => l !== lang)
                : [...prev.languages, lang]
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateMentorProfile(formData);

            if (result.success) {
                setProfile(result.mentor);
                setIsEditing(false);
                await fetchProfile(); // Refresh data
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form to profile data
        setFormData({
            phone: profile.phone || '',
            country: profile.country || '',
            specialization: profile.specialization || '',
            education: profile.education || '',
            experience: profile.experience || '',
            motivation: profile.motivation || '',
            availability: profile.availability || '',
            languages: profile.languages || [],
            viber: profile.viber || '',
            facebook: profile.facebook || '',
            linkedin: profile.linkedin || '',
            otherContact: profile.otherContact || '',
            priorityContact: profile.priorityContact || 'email'
        });
        setIsEditing(false);
    };

    if (isLoading) {
        return <Loader />;
    }

    if (!profile) {
        return (
            <div className="digi-mentor-profile-error">
                <p>{t('mentorProfile.errorLoading')}</p>
            </div>
        );
    }

    const availableLanguages = [
        { code: 'bg', label: 'Български' },
        { code: 'en', label: 'English' },
        { code: 'de', label: 'Deutsch' },
        { code: 'fr', label: 'Français' },
        { code: 'es', label: 'Español' }
    ];

    return (
        <div className="digi-mentor-profile">
            {/* HEADER */}
            <div className="digi-mentor-profile-header">
                <h1 className="digi-mentor-profile-title">
                    {t('mentorProfile.title')}
                </h1>
                <div className="digi-mentor-profile-actions">
                    {!isEditing ? (
                        <button
                            className="digi-mentor-profile-btn digi-mentor-profile-btn-edit"
                            onClick={() => setIsEditing(true)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {t('mentorProfile.edit')}
                        </button>
                    ) : (
                        <>
                            <button
                                className="digi-mentor-profile-btn digi-mentor-profile-btn-cancel"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                {t('mentorProfile.cancel')}
                            </button>
                            <button
                                className="digi-mentor-profile-btn digi-mentor-profile-btn-save"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? t('mentorProfile.saving') : t('mentorProfile.save')}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* PROFILE CARD */}
            <div className="digi-mentor-profile-card">
                {/* AVATAR & BASIC INFO - DISABLED */}
                <div className="digi-mentor-profile-basic">
                    <div className="digi-mentor-profile-avatar-section">
                        <div className="digi-mentor-profile-avatar">
                            {profile.photoUrl ? (
                                <img src={profile.photoUrl} alt={profile.name} />
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <div className="digi-mentor-profile-badge">
                            {profile.status === 'active' ? '✓ ' : ''}
                            {t(`mentorProfile.status.${profile.status}`)}
                        </div>
                    </div>

                    <div className="digi-mentor-profile-info-disabled">
                        <div className="digi-mentor-profile-field-disabled">
                            <label>{t('mentorProfile.name')}</label>
                            <input type="text" value={profile.name} disabled />
                        </div>
                        <div className="digi-mentor-profile-field-disabled">
                            <label>{t('mentorProfile.email')}</label>
                            <input type="email" value={profile.email} disabled />
                        </div>
                        <div className="digi-mentor-profile-field-disabled">
                            <label>{t('mentorProfile.age')}</label>
                            <input type="number" value={profile.age} disabled />
                        </div>
                    </div>
                </div>
                {isEditing && (
                    <div className="digi-mentor-profile-help-text">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <p>{t('mentorProfile.basicFieldsHelp')}</p>
                    </div>
                )}
                {/* STATS ROW */}
                <div className="digi-mentor-profile-stats">
                    <div className="digi-mentor-profile-stat">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M21 17C21 15.7635 19.7085 14.7012 18 14.25M3 17C3 15.7635 4.29153 14.7012 6 14.25M18 10.5C19.1046 10.5 20 9.60457 20 8.5C20 7.39543 19.1046 6.5 18 6.5M6 10.5C4.89543 10.5 4 9.60457 4 8.5C4 7.39543 4.89543 6.5 6 6.5M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div>
                            <span className="digi-mentor-profile-stat-value">{profile.studentsCount}</span>
                            <span className="digi-mentor-profile-stat-label">{t('mentorProfile.students')}</span>
                        </div>
                    </div>

                    <div className="digi-mentor-profile-stat">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div>
                            <span className="digi-mentor-profile-stat-value">{profile.reviewsAvgRating || '0'}</span>
                            <span className="digi-mentor-profile-stat-label">{t('mentorProfile.rating')}</span>
                        </div>
                    </div>

                    <div className="digi-mentor-profile-stat">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 10H16M8 14H11M6 20L3 17V7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V15C21 16.1046 20.1046 17 19 17H9L6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div>
                            <span className="digi-mentor-profile-stat-value">{profile.reviewsCount}</span>
                            <span className="digi-mentor-profile-stat-label">{t('mentorProfile.reviews')}</span>
                        </div>
                    </div>

                    <div className="digi-mentor-profile-stat">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div>
                            <span className="digi-mentor-profile-stat-value">{profile.sessionsCount}</span>
                            <span className="digi-mentor-profile-stat-label">{t('mentorProfile.sessions')}</span>
                        </div>
                    </div>
                </div>

                {/* EDITABLE FIELDS */}
                <div className="digi-mentor-profile-form">
                    {/* CONTACT INFO */}
                    <div className="digi-mentor-profile-section">
                        <h3 className="digi-mentor-profile-section-title">
                            {t('mentorProfile.contactInfo')}
                        </h3>
                        <div className="digi-mentor-profile-grid">
                            <div className="digi-mentor-profile-field">
                                <label>{t('mentorProfile.phone')}</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="+359..."
                                />
                            </div>

                            <div className="digi-mentor-profile-field">
                                <label>{t('mentorProfile.country')}</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="BG"
                                />
                            </div>

                            <div className="digi-mentor-profile-field">
                                <label>{t('mentorProfile.priorityContact')}</label>
                                <select
                                    value={formData.priorityContact}
                                    onChange={(e) => handleChange('priorityContact', e.target.value)}
                                    disabled={!isEditing}
                                >
                                    <option value="email">{t('mentorProfile.contactEmail')}</option>
                                    <option value="phone">{t('mentorProfile.contactPhone')}</option>
                                    <option value="viber">{t('mentorProfile.contactViber')}</option>
                                    <option value="facebook">{t('mentorProfile.contactFacebook')}</option>
                                    <option value="linkedin">{t('mentorProfile.contactLinkedIn')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* PROFESSIONAL INFO */}
                    <div className="digi-mentor-profile-section">
                        <h3 className="digi-mentor-profile-section-title">
                            {t('mentorProfile.professionalInfo')}
                        </h3>
                        <div className="digi-mentor-profile-grid">
                            <div className="digi-mentor-profile-field">
                                <label>{t('mentorProfile.specialization')}</label>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => handleChange('specialization', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="digi-mentor-profile-field">
                                <label>{t('mentorProfile.education')}</label>
                                <input
                                    type="text"
                                    value={formData.education}
                                    onChange={(e) => handleChange('education', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="digi-mentor-profile-field">
                                <label>{t('mentorProfile.experience')}</label>
                                <input
                                    type="text"
                                    value={formData.experience}
                                    onChange={(e) => handleChange('experience', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder={t('mentorProfile.experiencePlaceholder')}
                                />
                            </div>

                            <div className="digi-mentor-profile-field">
                                <label>{t('mentorProfile.availability')}</label>
                                <input
                                    type="text"
                                    value={formData.availability}
                                    onChange={(e) => handleChange('availability', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    {/* LANGUAGES */}
                    <div className="digi-mentor-profile-section">
                        <h3 className="digi-mentor-profile-section-title">
                            {t('mentorProfile.languages')}
                        </h3>
                        <div className="digi-mentor-profile-languages">
                            {availableLanguages.map(lang => (
                                <button
                                    key={lang.code}
                                    className={`digi-mentor-profile-lang-btn ${formData.languages.includes(lang.code) ? 'active' : ''}`}
                                    onClick={() => isEditing && handleLanguageToggle(lang.code)}
                                    disabled={!isEditing}
                                    type="button"
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SOCIAL CONTACTS */}
                    <div className="digi-mentor-profile-section">
                        <h3 className="digi-mentor-profile-section-title">
                            {t('mentorProfile.socialContacts')}
                        </h3>
                        <div className="digi-mentor-profile-grid">
                            <div className="digi-mentor-profile-field">
                                <label>{t('mentorProfile.viber')}</label>
                                <input
                                    type="text"
                                    value={formData.viber}
                                    onChange={(e) => handleChange('viber', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="+359..."
                                />
                            </div>

                            <div className="digi-mentor-profile-field">
                                <label>{t('mentorProfile.facebook')}</label>
                                <input
                                    type="text"
                                    value={formData.facebook}
                                    onChange={(e) => handleChange('facebook', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="facebook.com/..."
                                />
                            </div>

                            <div className="digi-mentor-profile-field">
                                <label>{t('mentorProfile.linkedin')}</label>
                                <input
                                    type="text"
                                    value={formData.linkedin}
                                    onChange={(e) => handleChange('linkedin', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="linkedin.com/in/..."
                                />
                            </div>

                            <div className="digi-mentor-profile-field">
                                <label>{t('mentorProfile.otherContact')}</label>
                                <input
                                    type="text"
                                    value={formData.otherContact}
                                    onChange={(e) => handleChange('otherContact', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    {/* MOTIVATION */}
                    <div className="digi-mentor-profile-section">
                        <h3 className="digi-mentor-profile-section-title">
                            {t('mentorProfile.motivation')}
                        </h3>
                        <div className="digi-mentor-profile-field-full">
                            <textarea
                                value={formData.motivation}
                                onChange={(e) => handleChange('motivation', e.target.value)}
                                disabled={!isEditing}
                                rows="6"
                                placeholder={t('mentorProfile.motivationPlaceholder')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};