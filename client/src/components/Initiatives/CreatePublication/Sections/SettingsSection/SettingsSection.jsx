import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './settingsSection.css';

const SettingsSection = ({ values, setValues }) => {
    const { t } = useTranslation();

    return (
        <div className="publication-form-section-card">
            <div className="publication-form-section-header">
                <h2 className="publication-form-section-title">
                    <FontAwesomeIcon icon={faCog} />
                    {t('publications.create.settings')}
                </h2>
            </div>
            <div className="publication-form-section-content">
                {/* Comments Enabled */}
                <div className="publication-form-group">
                    <label className="publication-checkbox-label">
                        <input
                            type="checkbox"
                            name="commentsEnabled"
                            checked={values.commentsEnabled}
                            onChange={(e) => setValues(prev => ({ ...prev, commentsEnabled: e.target.checked }))}
                        />
                        <span className="publication-checkbox-text">
                            {t('publications.create.commentsEnabled')}
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SettingsSection;
