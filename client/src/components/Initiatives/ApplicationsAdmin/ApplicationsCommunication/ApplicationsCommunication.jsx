import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import './ApplicationsCommunication.css';

export const ApplicationsCommunication = ({
    applications,
    filteredApplications = null,
    onRefresh
}) => {
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.language === 'bg' ? bg : enUS;

    const [communicationMode, setCommunicationMode] = useState('individual'); // 'individual' or 'bulk'
    const [selectedTemplate, setSelectedTemplate] = useState('welcome');
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [customTemplate, setCustomTemplate] = useState({
        subject: '',
        content: '',
        useCustom: false
    });
    const [sendStatus, setSendStatus] = useState({
        isSending: false,
        success: false,
        error: null,
        sentEmails: []
    });
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);

    // Данни за работа
    const workingApplications = filteredApplications || applications;

    // Email templates
    const emailTemplates = {
        welcome: {
            subject: t('applications.communication.templates.welcome.subject'),
            content: t('applications.communication.templates.welcome.content'),
            variables: ['{{firstName}}', '{{lastName}}', '{{projectId}}', '{{companyName}}']
        },
        status_update: {
            subject: t('applications.communication.templates.statusUpdate.subject'),
            content: t('applications.communication.templates.statusUpdate.content'),
            variables: ['{{firstName}}', '{{lastName}}', '{{projectId}}', '{{status}}', '{{nextSteps}}']
        },
        interview_invitation: {
            subject: t('applications.communication.templates.interview.subject'),
            content: t('applications.communication.templates.interview.content'),
            variables: ['{{firstName}}', '{{lastName}}', '{{projectId}}', '{{date}}', '{{time}}', '{{location}}']
        },
        rejection: {
            subject: t('applications.communication.templates.rejection.subject'),
            content: t('applications.communication.templates.rejection.content'),
            variables: ['{{firstName}}', '{{lastName}}', '{{projectId}}', '{{reason}}']
        },
        follow_up: {
            subject: t('applications.communication.templates.followUp.subject'),
            content: t('applications.communication.templates.followUp.content'),
            variables: ['{{firstName}}', '{{lastName}}', '{{projectId}}', '{{additionalInfo}}']
        }
    };

    // Статистики
    const communicationStats = {
        totalRecipients: workingApplications.length,
        selectedRecipients: selectedRecipients.length,
        uniqueProjects: [...new Set(workingApplications.map(app => app.projectId))].length,
        sentToday: sendStatus.sentEmails.filter(email =>
            format(new Date(email.timestamp), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
        ).length
    };

    // Функции за управление на получатели
    const handleRecipientToggle = (applicationId) => {
        setSelectedRecipients(prev =>
            prev.includes(applicationId)
                ? prev.filter(id => id !== applicationId)
                : [...prev, applicationId]
        );
    };

    const selectAllRecipients = () => {
        setSelectedRecipients(workingApplications.map(app => app.id));
    };

    const deselectAllRecipients = () => {
        setSelectedRecipients([]);
    };

    const selectByProject = (projectId) => {
        const projectApplications = workingApplications
            .filter(app => app.projectId === projectId)
            .map(app => app.id);

        setSelectedRecipients(prev => [
            ...prev.filter(id => !projectApplications.includes(id)),
            ...projectApplications
        ]);
    };

    // Функции за template management
    const handleTemplateChange = (templateKey) => {
        setSelectedTemplate(templateKey);
        setCustomTemplate(prev => ({ ...prev, useCustom: false }));
    };

    const handleCustomTemplateToggle = () => {
        setCustomTemplate(prev => ({ ...prev, useCustom: !prev.useCustom }));
    };

    // Функция за заместване на променливи
    const replaceVariables = (template, application) => {
        return template
            .replace(/\{\{firstName\}\}/g, application.firstName || '')
            .replace(/\{\{lastName\}\}/g, application.lastName || '')
            .replace(/\{\{projectId\}\}/g, application.projectId || '')
            .replace(/\{\{email\}\}/g, application.email || '')
            .replace(/\{\{companyName\}\}/g, t('applications.communication.companyName'))
            .replace(/\{\{date\}\}/g, format(new Date(), 'dd.MM.yyyy', { locale: currentLocale }))
            .replace(/\{\{time\}\}/g, format(new Date(), 'HH:mm', { locale: currentLocale }))
            .replace(/\{\{status\}\}/g, t('applications.communication.statusUpdated'))
            .replace(/\{\{nextSteps\}\}/g, t('applications.communication.nextSteps'))
            .replace(/\{\{location\}\}/g, t('applications.communication.defaultLocation'))
            .replace(/\{\{reason\}\}/g, t('applications.communication.defaultReason'))
            .replace(/\{\{additionalInfo\}\}/g, t('applications.communication.additionalInfo'));
    };

    // Функция за изпращане на email
    const sendEmail = async (application, subject, content) => {
        // Симулация на изпращане на email
        // В реалния проект трябва да се интегрира с email API
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% успех
                    resolve({
                        success: true,
                        recipientEmail: application.email,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    reject(new Error(t('applications.communication.sendError')));
                }
            }, 1000 + Math.random() * 2000);
        });
    };

    // Функция за изпращане на единичен email
    const sendIndividualEmail = async () => {
        if (!selectedApplication) return;

        setSendStatus(prev => ({ ...prev, isSending: true, error: null }));

        try {
            const template = customTemplate.useCustom ? customTemplate : emailTemplates[selectedTemplate];
            const subject = replaceVariables(template.subject, selectedApplication);
            const content = replaceVariables(template.content, selectedApplication);

            const result = await sendEmail(selectedApplication, subject, content);

            setSendStatus(prev => ({
                ...prev,
                isSending: false,
                success: true,
                sentEmails: [...prev.sentEmails, result]
            }));

            // Изчистване на формата след успех
            setTimeout(() => {
                setSendStatus(prev => ({ ...prev, success: false }));
            }, 5000);

        } catch (error) {
            setSendStatus(prev => ({
                ...prev,
                isSending: false,
                error: error.message
            }));
        }
    };

    // Функция за bulk изпращане
    const sendBulkEmails = async () => {
        if (selectedRecipients.length === 0) return;

        setSendStatus(prev => ({ ...prev, isSending: true, error: null, sentEmails: [] }));

        const recipientApplications = workingApplications.filter(app =>
            selectedRecipients.includes(app.id)
        );

        const template = customTemplate.useCustom ? customTemplate : emailTemplates[selectedTemplate];
        let successCount = 0;
        let errorCount = 0;
        const results = [];

        for (const application of recipientApplications) {
            try {
                const subject = replaceVariables(template.subject, application);
                const content = replaceVariables(template.content, application);

                const result = await sendEmail(application, subject, content);
                results.push(result);
                successCount++;
            } catch (error) {
                errorCount++;
                console.error(`Failed to send email to ${application.email}:`, error);
            }
        }

        setSendStatus(prev => ({
            ...prev,
            isSending: false,
            success: successCount > 0,
            error: errorCount > 0 ? t('applications.communication.bulkError', {
                success: successCount,
                errors: errorCount
            }) : null,
            sentEmails: [...prev.sentEmails, ...results]
        }));

        // Изчистване на selections след успех
        if (successCount > 0) {
            setTimeout(() => {
                setSelectedRecipients([]);
                setSendStatus(prev => ({ ...prev, success: false, error: null }));
            }, 5000);
        }
    };

    // Preview функция
    const generatePreview = () => {
        const testApplication = workingApplications[0] || {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            projectId: 'Sample Project'
        };

        const template = customTemplate.useCustom ? customTemplate : emailTemplates[selectedTemplate];
        return {
            subject: replaceVariables(template.subject, testApplication),
            content: replaceVariables(template.content, testApplication)
        };
    };

    return (
        <div className="applications-communication-container">
            {/* Header */}
            <div className="applications-communication-header">
                <div className="applications-communication-header-main">
                    <h3 className="applications-communication-title">
                        <span className="applications-communication-title-icon">✉️</span>
                        {t('applications.communication.title')}
                    </h3>
                    <p className="applications-communication-subtitle">
                        {t('applications.communication.subtitle')}
                    </p>
                </div>

                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="applications-communication-refresh-btn"
                    >
                        🔄
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="applications-communication-stats">
                <div className="applications-communication-stats-grid">
                    <div className="applications-communication-stat-card">
                        <div className="applications-communication-stat-number">{communicationStats.totalRecipients}</div>
                        <div className="applications-communication-stat-label">{t('applications.communication.totalRecipients')}</div>
                    </div>

                    <div className="applications-communication-stat-card">
                        <div className="applications-communication-stat-number">{communicationStats.selectedRecipients}</div>
                        <div className="applications-communication-stat-label">{t('applications.communication.selectedRecipients')}</div>
                    </div>

                    <div className="applications-communication-stat-card">
                        <div className="applications-communication-stat-number">{communicationStats.uniqueProjects}</div>
                        <div className="applications-communication-stat-label">{t('applications.communication.uniqueProjects')}</div>
                    </div>

                    <div className="applications-communication-stat-card">
                        <div className="applications-communication-stat-number">{communicationStats.sentToday}</div>
                        <div className="applications-communication-stat-label">{t('applications.communication.sentToday')}</div>
                    </div>
                </div>
            </div>

            {/* Mode Selection */}
            <div className="applications-communication-mode-selection">
                <div className="applications-communication-mode-buttons">
                    <button
                        className={`applications-communication-mode-btn ${communicationMode === 'individual' ? 'active' : ''}`}
                        onClick={() => setCommunicationMode('individual')}
                    >
                        <span className="applications-communication-mode-icon">👤</span>
                        {t('applications.communication.individualMode')}
                    </button>

                    <button
                        className={`applications-communication-mode-btn ${communicationMode === 'bulk' ? 'active' : ''}`}
                        onClick={() => setCommunicationMode('bulk')}
                    >
                        <span className="applications-communication-mode-icon">👥</span>
                        {t('applications.communication.bulkMode')}
                    </button>
                </div>
            </div>

            <div className="applications-communication-content">
                {communicationMode === 'individual' ? (
                    /* Individual Email Mode */
                    <div className="applications-communication-individual">
                        {/* Recipient Selection */}
                        <div className="applications-communication-section">
                            <h4 className="applications-communication-section-title">
                                <span className="applications-communication-section-icon">🎯</span>
                                {t('applications.communication.selectRecipient')}
                            </h4>

                            <div className="applications-communication-recipient-select">
                                <select
    value={selectedApplication?.email || ''}
    onChange={(e) => {
        const app = workingApplications.find(a => a.email === e.target.value);
        setSelectedApplication(app);
    }}
    className="applications-communication-recipient-dropdown"
>
    <option value="">{t('applications.communication.chooseRecipient')}</option>
    {workingApplications.map(app => (
        <option key={app.email} value={app.email}>
            {app.firstName} {app.lastName} - {app.projectId}
        </option>
    ))}
</select>
                            </div>
                        </div>

                        {/* Template Selection */}
                        <div className="applications-communication-section">
                            <h4 className="applications-communication-section-title">
                                <span className="applications-communication-section-icon">📝</span>
                                {t('applications.communication.selectTemplate')}
                            </h4>

                            <div className="applications-communication-template-selection">
                                <div className="applications-communication-template-toggle">
                                    <label className="applications-communication-custom-toggle">
                                        <input
                                            type="checkbox"
                                            checked={customTemplate.useCustom}
                                            onChange={handleCustomTemplateToggle}
                                        />
                                        <span className="applications-communication-toggle-slider"></span>
                                        <span className="applications-communication-toggle-label">
                                            {t('applications.communication.useCustomTemplate')}
                                        </span>
                                    </label>
                                </div>

                                {!customTemplate.useCustom ? (
                                    <div className="applications-communication-template-grid">
                                        {Object.keys(emailTemplates).map(templateKey => (
                                            <label key={templateKey} className="applications-communication-template-option">
                                                <input
                                                    type="radio"
                                                    name="template"
                                                    value={templateKey}
                                                    checked={selectedTemplate === templateKey}
                                                    onChange={() => handleTemplateChange(templateKey)}
                                                    className="applications-communication-template-radio"
                                                />
                                                <div className="applications-communication-template-card">
                                                    <div className="applications-communication-template-name">
                                                        {t(`applications.communication.templates.${templateKey}.name`)}
                                                    </div>
                                                    <div className="applications-communication-template-description">
                                                        {t(`applications.communication.templates.${templateKey}.description`)}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="applications-communication-custom-template">
                                        <div className="applications-communication-form-group">
                                            <label className="applications-communication-form-label">
                                                {t('applications.communication.subject')}
                                            </label>
                                            <input
                                                type="text"
                                                value={customTemplate.subject}
                                                onChange={(e) => setCustomTemplate(prev => ({ ...prev, subject: e.target.value }))}
                                                className="applications-communication-form-input"
                                                placeholder={t('applications.communication.subjectPlaceholder')}
                                            />
                                        </div>

                                        <div className="applications-communication-form-group">
                                            <label className="applications-communication-form-label">
                                                {t('applications.communication.content')}
                                            </label>
                                            <textarea
                                                value={customTemplate.content}
                                                onChange={(e) => setCustomTemplate(prev => ({ ...prev, content: e.target.value }))}
                                                className="applications-communication-form-textarea"
                                                placeholder={t('applications.communication.contentPlaceholder')}
                                                rows={8}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Send Actions */}
                        <div className="applications-communication-actions">
                            <div className="applications-communication-actions-info">
                                {sendStatus.success && (
                                    <div className="applications-communication-success">
                                        <span className="applications-communication-success-icon">✅</span>
                                        {t('applications.communication.emailSent')}
                                    </div>
                                )}

                                {sendStatus.error && (
                                    <div className="applications-communication-error">
                                        <span className="applications-communication-error-icon">❌</span>
                                        {sendStatus.error}
                                    </div>
                                )}
                            </div>

                            <div className="applications-communication-actions-buttons">
                                <button
                                    onClick={() => setPreviewMode(true)}
                                    disabled={!selectedApplication}
                                    className="applications-communication-btn secondary"
                                >
                                    <span className="applications-communication-btn-icon">👁️</span>
                                    {t('applications.communication.preview')}
                                </button>

                                <button
                                    onClick={sendIndividualEmail}
                                    disabled={!selectedApplication || sendStatus.isSending}
                                    className="applications-communication-btn primary"
                                >
                                    <span className="applications-communication-btn-icon">📧</span>
                                    {sendStatus.isSending ? t('applications.communication.sending') : t('applications.communication.sendEmail')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Bulk Email Mode */
                    <div className="applications-communication-bulk">
                        {/* Recipient Selection */}
                        <div className="applications-communication-section">
                            <div className="applications-communication-section-header">
                                <h4 className="applications-communication-section-title">
                                    <span className="applications-communication-section-icon">👥</span>
                                    {t('applications.communication.selectRecipients')}
                                </h4>

                                <div className="applications-communication-recipient-actions">
                                    <button
                                        onClick={selectAllRecipients}
                                        className="applications-communication-select-btn"
                                    >
                                        {t('applications.communication.selectAll')}
                                    </button>
                                    <button
                                        onClick={deselectAllRecipients}
                                        className="applications-communication-select-btn"
                                    >
                                        {t('applications.communication.deselectAll')}
                                    </button>
                                </div>
                            </div>

                            {/* Project Groups */}
                            <div className="applications-communication-project-groups">
                                {[...new Set(workingApplications.map(app => app.projectId))].map(projectId => {
                                    const projectApplications = workingApplications.filter(app => app.projectId === projectId);
                                    const selectedInProject = projectApplications.filter(app => selectedRecipients.includes(app.id)).length;

                                    return (
                                        <div key={projectId} className="applications-communication-project-group">
                                            <div className="applications-communication-project-header">
                                                <h5 className="applications-communication-project-title">
                                                    {projectId}
                                                    <span className="applications-communication-project-count">
                                                        ({selectedInProject}/{projectApplications.length})
                                                    </span>
                                                </h5>
                                                <button
                                                    onClick={() => selectByProject(projectId)}
                                                    className="applications-communication-project-select-btn"
                                                >
                                                    {t('applications.communication.selectProject')}
                                                </button>
                                            </div>

                                            <div className="applications-communication-recipients-grid">
                                                {projectApplications.map(app => (
                                                    <label key={app.id} className="applications-communication-recipient-option">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRecipients.includes(app.id)}
                                                            onChange={() => handleRecipientToggle(app.id)}
                                                            className="applications-communication-recipient-checkbox"
                                                        />
                                                        <div className="applications-communication-recipient-card">
                                                            <div className="applications-communication-recipient-avatar">
                                                                {app.firstName[0]}{app.lastName[0]}
                                                            </div>
                                                            <div className="applications-communication-recipient-info">
                                                                <div className="applications-communication-recipient-name">
                                                                    {app.firstName} {app.lastName}
                                                                </div>
                                                                <div className="applications-communication-recipient-email">
                                                                    {app.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Template Selection (Same as Individual) */}
                        <div className="applications-communication-section">
                            <h4 className="applications-communication-section-title">
                                <span className="applications-communication-section-icon">📝</span>
                                {t('applications.communication.selectTemplate')}
                            </h4>

                            <div className="applications-communication-template-selection">
                                <div className="applications-communication-template-toggle">
                                    <label className="applications-communication-custom-toggle">
                                        <input
                                            type="checkbox"
                                            checked={customTemplate.useCustom}
                                            onChange={handleCustomTemplateToggle}
                                        />
                                        <span className="applications-communication-toggle-slider"></span>
                                        <span className="applications-communication-toggle-label">
                                            {t('applications.communication.useCustomTemplate')}
                                        </span>
                                    </label>
                                </div>

                                {!customTemplate.useCustom ? (
                                    <div className="applications-communication-template-grid">
                                        {Object.keys(emailTemplates).map(templateKey => (
                                            <label key={templateKey} className="applications-communication-template-option">
                                                <input
                                                    type="radio"
                                                    name="bulkTemplate"
                                                    value={templateKey}
                                                    checked={selectedTemplate === templateKey}
                                                    onChange={() => handleTemplateChange(templateKey)}
                                                    className="applications-communication-template-radio"
                                                />
                                                <div className="applications-communication-template-card">
                                                    <div className="applications-communication-template-name">
                                                        {t(`applications.communication.templates.${templateKey}.name`)}
                                                    </div>
                                                    <div className="applications-communication-template-description">
                                                        {t(`applications.communication.templates.${templateKey}.description`)}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="applications-communication-custom-template">
                                        <div className="applications-communication-form-group">
                                            <label className="applications-communication-form-label">
                                                {t('applications.communication.subject')}
                                            </label>
                                            <input
                                                type="text"
                                                value={customTemplate.subject}
                                                onChange={(e) => setCustomTemplate(prev => ({ ...prev, subject: e.target.value }))}
                                                className="applications-communication-form-input"
                                                placeholder={t('applications.communication.subjectPlaceholder')}
                                            />
                                        </div>

                                        <div className="applications-communication-form-group">
                                            <label className="applications-communication-form-label">
                                                {t('applications.communication.content')}
                                            </label>
                                            <textarea
                                                value={customTemplate.content}
                                                onChange={(e) => setCustomTemplate(prev => ({ ...prev, content: e.target.value }))}
                                                className="applications-communication-form-textarea"
                                                placeholder={t('applications.communication.contentPlaceholder')}
                                                rows={8}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Send Actions */}
                        <div className="applications-communication-actions">
                            <div className="applications-communication-actions-info">
                                {selectedRecipients.length === 0 && (
                                    <div className="applications-communication-warning">
                                        <span className="applications-communication-warning-icon">⚠️</span>
                                        {t('applications.communication.noRecipientsSelected')}
                                    </div>
                                )}

                                {sendStatus.success && (
                                    <div className="applications-communication-success">
                                        <span className="applications-communication-success-icon">✅</span>
                                        {t('applications.communication.bulkEmailsSent', { count: selectedRecipients.length })}
                                    </div>
                                )}

                                {sendStatus.error && (
                                    <div className="applications-communication-error">
                                        <span className="applications-communication-error-icon">❌</span>
                                        {sendStatus.error}
                                    </div>
                                )}
                            </div>

                            <div className="applications-communication-actions-buttons">
                                <button
                                    onClick={() => setPreviewMode(true)}
                                    disabled={selectedRecipients.length === 0}
                                    className="applications-communication-btn secondary"
                                >
                                    <span className="applications-communication-btn-icon">👁️</span>
                                    {t('applications.communication.preview')}
                                </button>

                                <button
                                    onClick={sendBulkEmails}
                                    disabled={selectedRecipients.length === 0 || sendStatus.isSending}
                                    className="applications-communication-btn primary"
                                >
                                    <span className="applications-communication-btn-icon">📧</span>
                                    {sendStatus.isSending ?
                                        t('applications.communication.sending') :
                                        t('applications.communication.sendBulkEmails', { count: selectedRecipients.length })
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewMode && (
                <div className="applications-communication-preview-overlay" onClick={() => setPreviewMode(false)}>
                    <div className="applications-communication-preview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="applications-communication-preview-header">
                            <h3 className="applications-communication-preview-title">
                                <span className="applications-communication-preview-icon">👁️</span>
                                {t('applications.communication.emailPreview')}
                            </h3>
                            <button
                                onClick={() => setPreviewMode(false)}
                                className="applications-communication-preview-close"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="applications-communication-preview-content">
                            <div className="applications-communication-preview-field">
                                <label className="applications-communication-preview-label">
                                    {t('applications.communication.subject')}:
                                </label>
                                <div className="applications-communication-preview-value">
                                    {generatePreview().subject}
                                </div>
                            </div>

                            <div className="applications-communication-preview-field">
                                <label className="applications-communication-preview-label">
                                    {t('applications.communication.content')}:
                                </label>
                                <div className="applications-communication-preview-value content">
                                    {generatePreview().content}
                                </div>
                            </div>

                            <div className="applications-communication-preview-variables">
                                <h4 className="applications-communication-preview-variables-title">
                                    {t('applications.communication.availableVariables')}:
                                </h4>
                                <div className="applications-communication-preview-variables-list">
                                    {emailTemplates[selectedTemplate]?.variables.map(variable => (
                                        <code key={variable} className="applications-communication-preview-variable">
                                            {variable}
                                        </code>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="applications-communication-preview-footer">
                            <button
                                onClick={() => setPreviewMode(false)}
                                className="applications-communication-btn secondary"
                            >
                                {t('applications.communication.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};