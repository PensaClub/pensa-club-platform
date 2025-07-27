import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faEdit, faFileAlt, faCog } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { createEditor, Element as SlateElement, Transforms, Editor } from 'slate';

// CSS
import './mainFormPublication.css';

// Components
import BasicInfoSection from '../Sections/BasicSection/BasicInfoSection';
import ContentSection from '../Sections/ContentSection/ContentSection';
import PublicationProgressBar from '../components/PublicationProgressBar';

// Hooks and utilities
import useCreatePublication from '../../../hooks/useCreatePublication';

const PublicationCreateForm = ({ initialValues, onSubmitHandler, isEditMode = false }) => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('basic-info');
    const [newTag, setNewTag] = useState('');

    const {
        values, setValues, errors, onChangeHandler, onBlurHandler, onSubmit,
        generateSlug,
        // Section management
        addSection,
        removeSection,
        updateSection,
        // Image management
        handleSectionImageUpload,
        addSectionImageFromUrl,
        removeSectionImage,
        updateSectionImageAlt,
        updateSectionImageCaption,
        clearSectionImages
    } = useCreatePublication(initialValues, onSubmitHandler);

    // Add tag
    const addTag = () => {
        if (newTag.trim() && !values.tags.includes(newTag.trim())) {
            setValues(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    // Remove tag
    const removeTag = (tagToRemove) => {
        setValues(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    // Navigation sections
    const navigationSections = [
        { id: 'basic-info', label: t('publications.sections.basicInfo') || 'Basic Information', icon: faInfoCircle },
        { id: 'content', label: t('publications.sections.content') || 'Content', icon: faEdit },
        { id: 'file', label: t('publications.sections.file') || 'File', icon: faFileAlt },
        { id: 'settings', label: t('publications.sections.settings') || 'Settings', icon: faCog }
    ];

    const handleSectionClick = (sectionId) => {
        setActiveSection(sectionId);
    };

    const sectionOrder = [
        'basic-info',
        'content',
        'file',
        'settings'
    ];

    const currentSectionIndex = sectionOrder.indexOf(activeSection);

    return (
        <div className="publication-create-container">
            {/* Header */}
            <div className="publication-form-header">
                <h1 className="publication-form-title">
                    {isEditMode ? t('publications.edit.title') : t('publications.create.title')}
                </h1>
                <p className="publication-form-subtitle">
                    {t('publications.create.description')}
                </p>
            </div>

            {/* Progress Bar */}
            <PublicationProgressBar
                values={values}
                activeSection={activeSection}
                onSectionClick={handleSectionClick}
            />

            {/* Layout */}
            <div className="publication-form-layout">
                {/* Sidebar Navigation */}
                <div className="publication-form-sidebar">
                    <nav className="publication-sidebar-nav">
                        {navigationSections.map((section) => (
                            <a key={section.id}
                                href={`#${section.id}`}
                                className={`publication-sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSectionClick(section.id);
                                }}
                            >
                                <FontAwesomeIcon icon={section.icon} />
                                {section.label}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Form Content */}
                <div className="publication-form-content">
                    <form onSubmit={onSubmit}>
                        {activeSection === 'basic-info' && (
                            <BasicInfoSection
                                values={values}
                                errors={errors}
                                onChangeHandler={onChangeHandler}
                                onBlurHandler={onBlurHandler}
                                setValues={setValues}
                                generateSlug={generateSlug}
                                newTag={newTag}
                                setNewTag={setNewTag}
                                addTag={addTag}
                                removeTag={removeTag}
                            />
                        )}

                        {activeSection === 'content' && (
                            <ContentSection
                                values={values}
                                errors={errors}
                                setValues={setValues}
                                addSection={addSection}
                                removeSection={removeSection}
                                updateSection={updateSection}
                                Transforms={Transforms}
                                Editor={Editor}
                                SlateElement={SlateElement}
                                handleSectionImageUpload={handleSectionImageUpload}
                                addSectionImageFromUrl={addSectionImageFromUrl}
                                removeSectionImage={removeSectionImage}
                                updateSectionImageAlt={updateSectionImageAlt}
                                updateSectionImageCaption={updateSectionImageCaption}
                                clearSectionImages={clearSectionImages}
                            />
                        )}

                        {activeSection === 'file' && (
                            <div className="publication-form-section-card">
                                <div className="publication-form-section-header">
                                    <h2 className="publication-form-section-title">
                                        <FontAwesomeIcon icon={faFileAlt} />
                                        File
                                    </h2>
                                </div>
                                <div className="publication-form-section-content">
                                    <p>File section coming soon...</p>
                                </div>
                            </div>
                        )}

                        {activeSection === 'settings' && (
                            <div className="publication-form-section-card">
                                <div className="publication-form-section-header">
                                    <h2 className="publication-form-section-title">
                                        <FontAwesomeIcon icon={faCog} />
                                        Settings
                                    </h2>
                                </div>
                                <div className="publication-form-section-content">
                                    <p>Settings section coming soon...</p>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        {/* <div className="publication-form-actions">
                            <button type="submit" className="publication-btn-submit">
                                {isEditMode ? t('publications.edit.submit') : t('publications.create.submit')}
                            </button>
                        </div> */}

                        {/* Navigation Buttons */}
                        <div className="publication-form-navigation">
                            <button
                                type="button"
                                className="publication-btn-publication secondary"
                                onClick={() => {
                                    const currentIndex = sectionOrder.indexOf(activeSection);
                                    if (currentIndex > 0) {
                                        setActiveSection(sectionOrder[currentIndex - 1]);
                                    }
                                }}
                                disabled={sectionOrder.indexOf(activeSection) === 0}
                            >
                                {t('publications.back')}
                            </button>

                            <button
                                type="button"
                                className="publication-btn-publication primary"
                                onClick={() => {
                                    const currentIndex = sectionOrder.indexOf(activeSection);
                                    if (currentIndex < sectionOrder.length - 1) {
                                        setActiveSection(sectionOrder[currentIndex + 1]);
                                    }
                                }}
                                disabled={sectionOrder.indexOf(activeSection) === sectionOrder.length - 1}
                            >
                                {t('publications.next')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PublicationCreateForm;
