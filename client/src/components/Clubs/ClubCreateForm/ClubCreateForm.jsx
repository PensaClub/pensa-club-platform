import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faChevronLeft,
    faChevronRight,
    faSave,
    faEye,
    faHome,
    faMapMarkerAlt,
    faUsers,
    faCalendarAlt,
    faImages,
    faPhone,
    faCog,
    faSpinner,
    faInfoCircle,
    faTimes,
    faUserTie,
    faCoins,
    faMapMarkedAlt,
    faTrophy,
    faHandsHelping,
    faUserMd
} from '@fortawesome/free-solid-svg-icons';
import './clubCreateForm.css';
import { useCreateClub } from '../../hooks/useCreateClub';
import TemplateSelector from './TemplateSelector/TemplateSelector';
import LocationPicker from './LocationPicker/LocationPicker';
import MembershipManager from './MembershipManager/MembershipManager';
import ActivitiesManager from './ActivitiesManager/ActivitiesManager';
import MediaManager from './MediaManager/MediaManager';
import ContactsManager from './ContactsManager/ContactsManager';
import MembersManager from './MembersManager/MembersManager';
import FinancesManager from './FinancesManager/FinancesManager';
import RegionalInfoManager from './RegionalInfoManager/RegionalInfoManager';
import AchievementsManager from './AchievementsManager/AchievementsManager';
import SocialImpactManager from './SocialImpactManager/SocialImpactManager';
import PensionersSpecificManager from './PensionersSpecificManager/PensionersSpecificManager';
import ClubPreviewModal from './ClubPreviewModal/ClubPreviewModal';

const ClubCreateForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('editId');
    const draftId = searchParams.get('draftId');
    const mode = searchParams.get('mode');
    const isEditMode = mode === 'edit' && editId;
    const isContinueMode = mode === 'continue' && draftId;
    const {
        formData,
        errors,
        isLoading,
        isDraft,
        lastSaved,
        hasUnsavedChanges,
        updateField,
        saveDraft,
        submitClub,
        validateForm,
        resetForm
    } = useCreateClub(editId || draftId, isEditMode, mode);

    const [currentStep, setCurrentStep] = useState(1);
    const [showPreview, setShowPreview] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const handleActivitiesChange = useCallback((type, data) => {

        updateField(`activities.${type}`, data);

    }, [updateField, formData.activities]);
    const getFormTitle = () => {
        if (isEditMode) return `Редактиране на ${formData.name || 'клуб'}`;
        if (isContinueMode) return `Продължи работа по ${formData.name || 'драфт'}`;
        return t('clubForm.title');
    };

    const getFormSubtitle = () => {
        if (isEditMode) return 'Обновете информацията за вашия клуб';
        if (isContinueMode) return 'Завършете създаването на вашия клуб';
        return t('clubForm.subtitle');
    };
    const steps = [
        {
            id: 1,
            title: t('clubForm.steps.basic.title'),
            subtitle: t('clubForm.steps.basic.subtitle'),
            icon: faHome,
            fields: ['name', 'slug', 'shortDescription', 'category', 'status']
        },
        {
            id: 2,
            title: t('clubForm.steps.location.title'),
            subtitle: t('clubForm.steps.location.subtitle'),
            icon: faMapMarkerAlt,
            fields: ['location']
        },
        {
            id: 3,
            title: t('clubForm.steps.membership.title'),
            subtitle: t('clubForm.steps.membership.subtitle'),
            icon: faUsers,
            fields: ['membership']
        },
        {
            id: 4,
            title: t('clubForm.steps.members.title'),
            subtitle: t('clubForm.steps.members.subtitle'),
            icon: faUsers,
            fields: ['members', 'management']
        },
        {
            id: 5,
            title: t('clubForm.steps.finances.title'),
            subtitle: t('clubForm.steps.finances.subtitle'),
            icon: faCoins,
            fields: ['finances']
        },
        {
            id: 6,
            title: t('clubForm.steps.regional.title'),
            subtitle: t('clubForm.steps.regional.subtitle'),
            icon: faMapMarkedAlt,
            fields: ['regionalInfo']
        },
        {
            id: 7,
            title: t('clubForm.steps.achievements.title'),
            subtitle: t('clubForm.steps.achievements.subtitle'),
            icon: faTrophy,
            fields: ['achievements']
        },
        {
            id: 8,
            title: t('clubForm.steps.socialImpact.title'),
            subtitle: t('clubForm.steps.socialImpact.subtitle'),
            icon: faHandsHelping,
            fields: ['socialImpact']
        },
        {
            id: 9,  // ⬅️ НОВО
            title: t('clubForm.steps.pensioners.title'),
            subtitle: t('clubForm.steps.pensioners.subtitle'),
            icon: faUserMd,
            fields: ['pensionersSpecific']
        },
        {
            id: 10,  // ⬅️ ПРОМЕНЕНО ОТ 9 НА 10
            title: t('clubForm.steps.activities.title'),
            subtitle: t('clubForm.steps.activities.subtitle'),
            icon: faCalendarAlt,
            fields: ['activities']
        },
        {
            id: 11,  // ⬅️ ПРОМЕНЕНО ОТ 10 НА 11
            title: t('clubForm.steps.media.title'),
            subtitle: t('clubForm.steps.media.subtitle'),
            icon: faImages,
            fields: ['logo', 'mainImage', 'gallery', 'media']
        },
        {
            id: 12,  // ⬅️ ПРОМЕНЕНО ОТ 11 НА 12
            title: t('clubForm.steps.contacts.title'),
            subtitle: t('clubForm.steps.contacts.subtitle'),
            icon: faPhone,
            fields: ['contacts']
        },
        {
            id: 13,  // ⬅️ ПРОМЕНЕНО ОТ 12 НА 13
            title: t('clubForm.steps.settings.title'),
            subtitle: t('clubForm.steps.settings.subtitle'),
            icon: faCog,
            fields: ['preferences', 'template']
        }
    ];
    const totalSteps = steps.length;

    // Навигация между стъпки
    const goToStep = (stepNumber) => {
        if (stepNumber >= 1 && stepNumber <= totalSteps) {
            setCurrentStep(stepNumber);
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };
    const handlePreview = () => {
        setShowPreviewModal(true);
    };

    // Проверка дали стъпката е завършена
    const isStepCompleted = (stepId) => {
        const step = steps.find(s => s.id === stepId);
        if (!step) return false;

        if (stepId === 1) {
            return formData.name && formData.name.length >= 3;
        }
        if (stepId === 2) {
            return (formData.location?.address && formData.location.address.trim().length > 0) ||
                (formData.location?.city && formData.location.city.trim().length > 0) ||
                (formData.location?.coordinates?.lat && formData.location?.coordinates?.lng);
        }
        if (stepId === 3) {
            return formData.membership?.type && formData.membership.type !== '';
        }
        if (stepId === 4) {
            return (formData.members && formData.members.length > 0) ||
                (formData.management?.board && formData.management.board.length > 0);
        }
        if (stepId === 5) {
            return true;
        }
        if (stepId === 6) {
            return true;
        }

        if (stepId === 7) {
            return true;
        }

        if (stepId === 8) {
            return true;
        }

        if (stepId === 9) {
            return true;
        }

        if (stepId === 10) {

            return (formData.activities?.regular && formData.activities.regular.length > 0) ||
                (formData.activities?.events && formData.activities.events.length > 0) ||
                (formData.activities?.trips && formData.activities.trips.length > 0) ||
                (formData.activities?.courses && formData.activities.courses.length > 0);
        }
        if (stepId === 11) {  // беше 10
            return formData.logo && formData.logo !== '';
        }
        if (stepId === 12) {  // беше 11
            return (formData.contacts?.basic?.phone && formData.contacts.basic.phone.trim()) ||
                (formData.contacts?.basic?.email && formData.contacts.basic.email.trim());
        }
        if (stepId === 13) {  // беше 12
            return formData.template && formData.template !== '';
        }
        return step.fields.some(field => {
            const value = field.includes('.')
                ? field.split('.').reduce((obj, key) => obj?.[key], formData)
                : formData[field];

            if (typeof value === 'string') return value.trim().length > 0;
            if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v =>
                    typeof v === 'string' ? v.trim().length > 0 :
                        typeof v === 'number' ? v > 0 : false
                );
            }
            return false;
        });
    };

    // Handle форма submission
    const handleSubmit = async () => {
        try {
            const result = await submitClub();
            if (result) {
                if (isEditMode) {
                    navigate(`/clubs/${result.slug}`);
                } else {
                    navigate('/profile/clubs');
                }
            }
        } catch (error) {
            console.error('Error submitting club:', error);
        }
    };

    // Handle draft save
    const handleSaveDraft = async () => {
        try {
            await saveDraft();
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    };

    // Handle template change
    const handleTemplateChange = (templateId) => {
        updateField('template', templateId);
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderBasicInfoStep();
            case 2:
                return renderLocationStep();
            case 3:
                return renderMembershipStep();
            case 4:
                return renderMembersStep();
            case 5:
                return renderFinancesStep();
            case 6:
                return renderRegionalInfoStep();
            case 7:
                return renderAchievementsStep();
            case 8:
                return renderSocialImpactStep();
            case 9:  // ⬅️ НОВО
                return renderPensionersStep();
            case 10:  // ⬅️ ПРОМЕНЕНО ОТ 9 НА 10
                return renderActivitiesStep();
            case 11:  // ⬅️ ПРОМЕНЕНО ОТ 10 НА 11
                return renderMediaStep();
            case 12:  // ⬅️ ПРОМЕНЕНО ОТ 11 НА 12
                return renderContactsStep();
            case 13:  // ⬅️ ПРОМЕНЕНО ОТ 12 НА 13
                return renderSettingsStep();
            default:
                return renderBasicInfoStep();
        }
    };

    // Стъпка 1: Основна информация
    const renderBasicInfoStep = () => (
        <div className="club-form-step">
            <div className="club-form-fields">

                {/* Име на клуба */}
                <div className="club-form-group">
                    <label className="club-form-label required">
                        {t('clubForm.fields.name.label')}
                    </label>
                    <input
                        type="text"
                        className={`club-form-input ${errors.name ? 'error' : ''}`}
                        placeholder={t('clubForm.fields.name.placeholder')}
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                    />
                    {errors.name && (
                        <span className="club-form-error">{errors.name}</span>
                    )}
                    <div className="club-form-help">
                        {t('clubForm.fields.name.help')}
                    </div>
                </div>

                {/* Slug (автоматично генериран) */}
                <div className="club-form-group">
                    <label className="club-form-label">
                        {t('clubForm.fields.slug.label')}
                    </label>
                    <input
                        type="text"
                        className="club-form-input"
                        placeholder={t('clubForm.fields.slug.placeholder')}
                        value={formData.slug}
                        onChange={(e) => updateField('slug', e.target.value)}
                    />
                    <div className="club-form-help">
                        {t('clubForm.fields.slug.help')}
                    </div>
                </div>

                {/* Кратко описание */}
                <div className="club-form-group">
                    <label className="club-form-label">
                        {t('clubForm.fields.shortDescription.label')}
                    </label>
                    <textarea
                        className="club-form-textarea"
                        placeholder={t('clubForm.fields.shortDescription.placeholder')}
                        value={formData.shortDescription}
                        onChange={(e) => updateField('shortDescription', e.target.value)}
                        rows={3}
                        maxLength={160}
                    />
                    <div className="club-form-counter">
                        {formData.shortDescription.length}/160
                    </div>
                </div>

                {/* Категория */}
                <div className="club-form-group">
                    <label className="club-form-label">
                        {t('clubForm.fields.category.label')}
                    </label>
                    <select
                        className="club-form-select"
                        value={formData.category}
                        onChange={(e) => updateField('category', e.target.value)}
                    >
                        <option value="general">{t('clubForm.categories.general')}</option>
                        <option value="cultural">{t('clubForm.categories.cultural')}</option>
                        <option value="sports">{t('clubForm.categories.sports')}</option>
                        <option value="social">{t('clubForm.categories.social')}</option>
                        <option value="traditional">{t('clubForm.categories.traditional')}</option>
                    </select>
                </div>

                {/* Статус на клуба */}
                <div className="club-form-group">
                    <label className="club-form-label">
                        {t('clubForm.fields.status.label')}
                    </label>
                    <select
                        className="club-form-select"
                        value={formData.status}
                        onChange={(e) => updateField('status', e.target.value)}
                    >
                        <option value="active">{t('clubForm.status.active')}</option>
                        <option value="inactive">{t('clubForm.status.inactive')}</option>
                        <option value="suspended">{t('clubForm.status.suspended')}</option>
                    </select>
                    <div className="club-form-help">
                        {t('clubForm.fields.status.help')}
                    </div>
                </div>

                {/* Година на основаване */}
                {/* Година на основаване */}
                <div className="club-form-group">
                    <label className="club-form-label">
                        {t('clubForm.fields.foundedYear.label')}
                    </label>
                    <input
                        type="number"
                        className="club-form-input"
                        placeholder={t('clubForm.fields.foundedYear.placeholder')}
                        value={formData.foundedYear}
                        onChange={(e) => updateField('foundedYear', e.target.value ? parseInt(e.target.value) : '')}
                        min="1900"
                        max={new Date().getFullYear()}
                    />
                    <div className="club-form-help">
                        {t('clubForm.fields.foundedYear.help')}
                    </div>
                </div>

                {/* Пълно описание */}
                <div className="club-form-group">
                    <label className="club-form-label">
                        {t('clubForm.fields.fullDescription.label')}
                    </label>
                    <textarea
                        className="club-form-textarea"
                        placeholder={t('clubForm.fields.fullDescription.placeholder')}
                        value={formData.fullDescription}
                        onChange={(e) => updateField('fullDescription', e.target.value)}
                        rows={6}
                        maxLength={1000}
                    />
                    <div className="club-form-counter">
                        {formData.fullDescription.length}/1000
                    </div>
                    <div className="club-form-help">
                        {t('clubForm.fields.fullDescription.help')}
                    </div>
                </div>

            </div>
        </div>
    );

    const renderMembersStep = () => (
        <div className="club-form-step">
            <MembersManager
                membersData={{
                    members: formData.members || [],
                    management: formData.management || { board: [] }
                }}
                onMembersChange={(membersData) => {
                    updateField('members', membersData.members);
                    updateField('management', membersData.management);
                }}
                disabled={isLoading}
            />
        </div>
    );

    const renderFinancesStep = () => (
        <div className="club-form-step">
            <FinancesManager
                financesData={formData.finances || { budget: { yearly: 0, currency: 'BGN' }, funding: [], sponsors: [] }}
                onFinancesChange={(financesData) => updateField('finances', financesData)}
                disabled={isLoading}
            />
        </div>
    );

    // Стъпка 10: Настройки (с TemplateSelector)
    const renderSettingsStep = () => (
        <div className="club-form-step">

            {/* Template Selection */}
            <div className="club-form-section">
                <TemplateSelector
                    selectedTemplate={formData.template}
                    onTemplateChange={handleTemplateChange}
                    disabled={isLoading}
                />
            </div>

            {/* Настройки за видимост */}
            <div className="club-form-section">
                <div className="club-form-section-header">
                    <h3 className="club-form-section-title">
                        {t('clubForm.settings.visibility.title')}
                    </h3>
                    <p className="club-form-section-subtitle">
                        {t('clubForm.settings.visibility.subtitle')}
                    </p>
                </div>

                <div className="club-form-preferences-grid">

                    {/* Публична галерия */}
                    <div className="club-form-preference-item">
                        <label className="club-form-switch">
                            <input
                                type="checkbox"
                                checked={formData.preferences.publicGallery}
                                onChange={(e) => updateField('preferences.publicGallery', e.target.checked)}
                            />
                            <span className="club-form-switch-slider"></span>
                        </label>
                        <div className="club-form-preference-content">
                            <h4>{t('clubForm.settings.preferences.publicGallery.title')}</h4>
                            <p>{t('clubForm.settings.preferences.publicGallery.description')}</p>
                        </div>
                    </div>

                    {/* Показвай статистики */}
                    <div className="club-form-preference-item">
                        <label className="club-form-switch">
                            <input
                                type="checkbox"
                                checked={formData.preferences.showStatistics}
                                onChange={(e) => updateField('preferences.showStatistics', e.target.checked)}
                            />
                            <span className="club-form-switch-slider"></span>
                        </label>
                        <div className="club-form-preference-content">
                            <h4>{t('clubForm.settings.preferences.showStatistics.title')}</h4>
                            <p>{t('clubForm.settings.preferences.showStatistics.description')}</p>
                        </div>
                    </div>

                    {/* Контактна форма */}
                    <div className="club-form-preference-item">
                        <label className="club-form-switch">
                            <input
                                type="checkbox"
                                checked={formData.preferences.showContactForm}
                                onChange={(e) => updateField('preferences.showContactForm', e.target.checked)}
                            />
                            <span className="club-form-switch-slider"></span>
                        </label>
                        <div className="club-form-preference-content">
                            <h4>{t('clubForm.settings.preferences.showContactForm.title')}</h4>
                            <p>{t('clubForm.settings.preferences.showContactForm.description')}</p>
                        </div>
                    </div>

                    {/* Онлайн записване */}
                    <div className="club-form-preference-item">
                        <label className="club-form-switch">
                            <input
                                type="checkbox"
                                checked={formData.preferences.allowOnlineRegistration}
                                onChange={(e) => updateField('preferences.allowOnlineRegistration', e.target.checked)}
                            />
                            <span className="club-form-switch-slider"></span>
                        </label>
                        <div className="club-form-preference-content">
                            <h4>{t('clubForm.settings.preferences.allowOnlineRegistration.title')}</h4>
                            <p>{t('clubForm.settings.preferences.allowOnlineRegistration.description')}</p>
                        </div>
                    </div>

                    {/* Календар */}
                    <div className="club-form-preference-item">
                        <label className="club-form-switch">
                            <input
                                type="checkbox"
                                checked={formData.preferences.enableCalendar}
                                onChange={(e) => updateField('preferences.enableCalendar', e.target.checked)}
                            />
                            <span className="club-form-switch-slider"></span>
                        </label>
                        <div className="club-form-preference-content">
                            <h4>{t('clubForm.settings.preferences.enableCalendar.title')}</h4>
                            <p>{t('clubForm.settings.preferences.enableCalendar.description')}</p>
                        </div>
                    </div>

                    {/* Коментари */}
                    <div className="club-form-preference-item">
                        <label className="club-form-switch">
                            <input
                                type="checkbox"
                                checked={formData.preferences.allowComments}
                                onChange={(e) => updateField('preferences.allowComments', e.target.checked)}
                            />
                            <span className="club-form-switch-slider"></span>
                        </label>
                        <div className="club-form-preference-content">
                            <h4>{t('clubForm.settings.preferences.allowComments.title')}</h4>
                            <p>{t('clubForm.settings.preferences.allowComments.description')}</p>
                        </div>
                    </div>

                    {/* Показвай финанси */}
                    <div className="club-form-preference-item">
                        <label className="club-form-switch">
                            <input
                                type="checkbox"
                                checked={formData.preferences.showFinances}
                                onChange={(e) => updateField('preferences.showFinances', e.target.checked)}
                            />
                            <span className="club-form-switch-slider"></span>
                        </label>
                        <div className="club-form-preference-content">
                            <h4>{t('clubForm.settings.preferences.showFinances.title')}</h4>
                            <p>{t('clubForm.settings.preferences.showFinances.description')}</p>
                        </div>
                    </div>

                    {/* Показвай списък с членове */}
                    <div className="club-form-preference-item">
                        <label className="club-form-switch">
                            <input
                                type="checkbox"
                                checked={formData.preferences.showMembersList}
                                onChange={(e) => updateField('preferences.showMembersList', e.target.checked)}
                            />
                            <span className="club-form-switch-slider"></span>
                        </label>
                        <div className="club-form-preference-content">
                            <h4>{t('clubForm.settings.preferences.showMembersList.title')}</h4>
                            <p>{t('clubForm.settings.preferences.showMembersList.description')}</p>
                        </div>
                    </div>

                    {/* Отзиви */}
                    <div className="club-form-preference-item">
                        <label className="club-form-switch">
                            <input
                                type="checkbox"
                                checked={formData.preferences.showTestimonials}
                                onChange={(e) => updateField('preferences.showTestimonials', e.target.checked)}
                            />
                            <span className="club-form-switch-slider"></span>
                        </label>
                        <div className="club-form-preference-content">
                            <h4>{t('clubForm.settings.preferences.showTestimonials.title')}</h4>
                            <p>{t('clubForm.settings.preferences.showTestimonials.description')}</p>
                        </div>
                    </div>

                    {/* Секция новини */}
                    <div className="club-form-preference-item">
                        <label className="club-form-switch">
                            <input
                                type="checkbox"
                                checked={formData.preferences.showNewsSection}
                                onChange={(e) => updateField('preferences.showNewsSection', e.target.checked)}
                            />
                            <span className="club-form-switch-slider"></span>
                        </label>
                        <div className="club-form-preference-content">
                            <h4>{t('clubForm.settings.preferences.showNewsSection.title')}</h4>
                            <p>{t('clubForm.settings.preferences.showNewsSection.description')}</p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );

    const renderLocationStep = () => (
        <div className="club-form-step">
            <LocationPicker
                locationData={formData.location}
                onLocationChange={(locationData) => updateField('location', locationData)}
                disabled={isLoading}
                showVenueDetails={true}
            />
        </div>
    );

    const renderMembershipStep = () => (
        <div className="club-form-step">
            <MembershipManager
                membershipData={formData.membership}
                onMembershipChange={(membershipData) => updateField('membership', membershipData)}
                disabled={isLoading}
            />
        </div>
    );

    const renderRegionalInfoStep = () => (
        <div className="club-form-step">
            <RegionalInfoManager
                regionalData={formData.regionalInfo || { regionalRole: 'local', isCentralClub: false, affiliatedClubs: [], coverageArea: '', centralClubId: '' }}
                onRegionalChange={(regionalData) => updateField('regionalInfo', regionalData)}
                disabled={isLoading}
            />
        </div>
    );
    // Добави тази функция някъде след другите render функции:
    const renderAchievementsStep = () => (
        <div className="club-form-step">
            <AchievementsManager
                achievementsData={formData.achievements || { awards: [], certificates: [], recognitions: [] }}
                onAchievementsChange={(achievementsData) => updateField('achievements', achievementsData)}
                disabled={isLoading}
            />
        </div>
    );
    const renderActivitiesStep = () => {

        if (!formData.activities) {
            updateField('activities', {
                regular: [],
                events: [],
                trips: [],
                courses: []
            });
        }

        return (
            <div className="club-form-step">
                <ActivitiesManager
                    activitiesData={formData.activities || {
                        regular: [],
                        events: [],
                        trips: [],
                        courses: []
                    }}
                    onActivitiesChange={handleActivitiesChange}
                    disabled={isLoading}
                />
            </div>
        );
    };
    const renderSocialImpactStep = () => (
        <div className="club-form-step">
            <SocialImpactManager
                socialImpactData={formData.socialImpact || { volunteering: [], communityProjects: [], partnerships: [] }}
                onSocialImpactChange={(socialImpactData) => updateField('socialImpact', socialImpactData)}
                disabled={isLoading}
            />
        </div>
    );
    const renderPensionersStep = () => (
        <div className="club-form-step">
            <PensionersSpecificManager
                pensionersData={formData.pensionersSpecific || {
                    healthServices: {
                        regularCheckups: false,
                        bloodPressureMonitoring: false,
                        healthLectures: [],
                        medicalPartners: [],
                        emergencyProtocol: {
                            hasEmergencyPlan: false,
                            emergencyContacts: [],
                            nearestHospital: '',
                            specialNeeds: []
                        }
                    },
                    supportServices: {
                        homeVisits: false,
                        shoppingAssistance: false,
                        documentHelp: false,
                        companionship: false,
                        transportService: false,
                        mealDelivery: false,
                        cleaningHelp: false,
                        techSupport: false
                    },
                    accessibility: {
                        wheelchairAccess: false,
                        elevatorAccess: false,
                        hearingLoop: false,
                        largeTextMaterials: false,
                        handrails: false,
                        nonSlipFloors: false,
                        goodLighting: false,
                        restingAreas: false
                    },
                    specialPrograms: {
                        memoryActivities: [],
                        intergenerationalPrograms: [],
                        volunteerPrograms: [],
                        mentalHealthSupport: []
                    },
                    ageSpecificNeeds: {
                        lowImpactActivities: [],
                        nutritionSupport: []
                    }
                }}
                onPensionersChange={(pensionersData) => updateField('pensionersSpecific', pensionersData)}
                disabled={isLoading}
            />
        </div>
    );
    const renderMediaStep = () => {
        const handleMediaChange = (value, path) => {

            if (path.startsWith('media.')) {
                // За nested media paths
                const mediaKey = path.split('.')[1];
                updateField('media', {
                    ...formData.media,
                    [mediaKey]: value
                });
            } else {

                updateField(path, value);
            }
        };

        return (
            <div className="club-form-step">
                <MediaManager
                    mediaData={{
                        logo: formData.logo || '',
                        mainImage: formData.mainImage || '',
                        gallery: formData.gallery || [],
                        media: {
                            videos: formData.media?.videos || [],
                            audioFiles: formData.media?.audioFiles || [],
                            virtualTour: formData.media?.virtualTour || ''
                        }
                    }}
                    onMediaChange={handleMediaChange}
                    disabled={isLoading}
                />
            </div>
        );
    };
    const renderContactsStep = () => (
        <div className="club-form-step">
            <ContactsManager
                contactsData={formData.contacts}
                onContactsChange={(contactsData) => updateField('contacts', contactsData)}
                disabled={isLoading}
            />
        </div>
    );

    return (
        <div className="club-create-form">

            {/* Header */}
            <div className="club-form-header">
                <div className="club-form-title-section">
                    <h1 className="club-form-title">
                        {getFormTitle()}
                    </h1>
                    <p className="club-form-subtitle">
                        {getFormSubtitle()}
                    </p>
                </div>

                {/* Status indicators */}
                <div className="club-form-status">
                    {isDraft && (
                        <div className="club-form-draft-badge">
                            <FontAwesomeIcon icon={faInfoCircle} />
                            {t('clubForm.status.draft')}
                        </div>
                    )}
                    {lastSaved && (
                        <div className="club-form-last-saved">
                            {t('clubForm.status.lastSaved', {
                                time: lastSaved.toLocaleTimeString()
                            })}
                        </div>
                    )}
                    {hasUnsavedChanges && (
                        <div className="club-form-unsaved">
                            {t('clubForm.status.unsavedChanges')}
                        </div>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div className="club-form-progress">
                <div className="club-form-progress-bar">
                    <div
                        className="club-form-progress-fill"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
                <div className="club-form-progress-text">
                    {t('clubForm.progress', { current: currentStep, total: totalSteps })}
                </div>
            </div>

            {/* Steps navigation */}
            <div className="club-form-steps-nav">
                {steps.map((step) => (
                    <button
                        key={step.id}
                        className={`club-form-step-btn ${currentStep === step.id ? 'active' : ''
                            } ${isStepCompleted(step.id) ? 'completed' : ''}`}
                        onClick={() => goToStep(step.id)}
                    >
                        <div className="club-form-step-icon">
                            {isStepCompleted(step.id) ? (
                                <FontAwesomeIcon icon={faCheck} />
                            ) : (
                                <FontAwesomeIcon icon={step.icon} />
                            )}
                        </div>
                        <div className="club-form-step-info">
                            <div className="club-form-step-title">{step.title}</div>
                            <div className="club-form-step-subtitle">{step.subtitle}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Main content */}
            <div className="club-form-main">
                <div className="club-form-content">
                    {renderCurrentStep()}
                </div>
            </div>

            {/* Footer actions */}
            <div className="club-form-footer">
                <div className="club-form-footer-left">
                    <button
                        type="button"
                        className="club-form-btn secondary"
                        onClick={() => navigate('/profile/clubs')}
                    >
                        {t('clubForm.actions.cancel')}
                    </button>

                    <button
                        type="button"
                        className="club-form-btn secondary"
                        onClick={handleSaveDraft}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                            <FontAwesomeIcon icon={faSave} />
                        )}
                        {t('clubForm.actions.saveDraft')}
                    </button>
                </div>

                <div className="club-form-footer-center">
                    <button
                        type="button"
                        className="club-form-btn secondary"
                        onClick={handlePreview}
                    >
                        <FontAwesomeIcon icon={faEye} />
                        {t('clubForm.actions.preview')}
                    </button>
                </div>

                <div className="club-form-footer-right">
                    <button
                        type="button"
                        className="club-form-btn secondary"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                        {t('clubForm.actions.previous')}
                    </button>

                    {currentStep < totalSteps ? (
                        <button
                            type="button"
                            className="club-form-btn primary"
                            onClick={nextStep}
                        >
                            {t('clubForm.actions.next')}
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="club-form-btn success"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                                <FontAwesomeIcon icon={faCheck} />
                            )}
                            {isEditMode ? 'Обнови клуб' : t('clubForm.actions.submit')}
                        </button>
                    )}
                </div>
            </div>

            {showPreviewModal && (
                <ClubPreviewModal
                    isOpen={showPreviewModal}
                    onClose={() => setShowPreviewModal(false)}
                    formData={formData}
                />
            )}
        </div>
    );
};

export default ClubCreateForm;