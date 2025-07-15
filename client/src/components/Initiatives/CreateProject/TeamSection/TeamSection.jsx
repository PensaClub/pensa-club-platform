import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers, faPlus, faTrash, faUser, faEnvelope,
    faPhone, faImage, faUpload, faUserTie, faIdCard, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './teamSection.css';

const TeamSection = ({
    values,
    errors,
    setValues,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    handleTeamImageUpload,
    removeTeamImage,
    onChangeHandler
}) => {
    const { t } = useTranslation();

    // Handle team member field changes
    const handleTeamMemberChange = (index, field, value) => {
        updateTeamMember(index, { [field]: value });
    };

    // Handle team member image upload
    const handleImageUpload = async (e, memberIndex) => {
        const file = e.target.files[0];
        if (!file) return;

        await handleTeamImageUpload(file, memberIndex);
        e.target.value = ''; // Reset input
    };

    // Calculate team statistics
    const getTeamStats = () => {
        const totalMembers = values.team?.length || 0;
        const completeMembers = values.team?.filter(member =>
            member.name && member.role
        ).length || 0;
        const membersWithContact = values.team?.filter(member =>
            member.email || member.phone
        ).length || 0;
        const membersWithImages = values.team?.filter(member =>
            member.image && member.image.trim()
        ).length || 0;

        return {
            total: totalMembers,
            complete: completeMembers,
            withContact: membersWithContact,
            withImages: membersWithImages,
            completionRate: totalMembers > 0 ? Math.round((completeMembers / totalMembers) * 100) : 0
        };
    };
    
    const handleImageClick = (memberIndex) => {
        const fileInput = document.getElementById(`team-image-input-${memberIndex}`);
        if (fileInput) {
            fileInput.click();
        }
    };
    
    const stats = getTeamStats();

    return (
        <div className="project-team-section-card">
            <div className="project-team-section-header">
                <h2 className="project-team-section-title">
                    <FontAwesomeIcon icon={faUsers} />
                    {t('projects.create.team')}
                </h2>
                <button
                    type="button"
                    className="project-team-form-btn primary"
                    onClick={addTeamMember}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    {t('projects.create.addTeamMember')}
                </button>
            </div>

            <div className="project-form-section-content">
                <div className="project-team-help">
                    <p>{t('projects.create.team-help')}</p>
                </div>

                {(!values.team || values.team.length === 0) ? (
                    <div className="project-team-empty-state">
                        <div className="project-team-empty-content">
                            <FontAwesomeIcon icon={faUsers} className="project-team-empty-icon" />
                            <h3>{t('projects.create.noTeamMembers')}</h3>
                            <p>{t('projects.create.teamDescription')}</p>
                            <button
                                type="button"
                                className="project-team-form-btn primary"
                                onClick={addTeamMember}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                {t('projects.create.addFirstMember')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="project-team-members-list">
                        {values.team.map((member, index) => (
                            <div key={member.id || index} className="project-team-member-card">
                                <div className="project-team-member-header">
                                    <div className="project-team-member-info">
                                        <h4>
                                            <FontAwesomeIcon icon={faUser} />
                                            {member.name || t('projects.create.unnamedMember')}
                                            {(errors[`team[${index}].name`] || errors[`team[${index}].role`]) && (
                                                <span className="project-team-error-indicator">⚠️</span>
                                            )}
                                        </h4>
                                        {member.role && (
                                            <div className="project-team-member-role">
                                                <FontAwesomeIcon icon={faUserTie} />
                                                {member.role}
                                            </div>
                                        )}
                                    </div>

                                    <div className="project-team-member-actions">
                                        <button
                                            type="button"
                                            className="project-team-remove-btn"
                                            onClick={() => removeTeamMember(index)}
                                            title={t('projects.create.removeMember')}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            {t('projects.create.remove')}
                                        </button>
                                    </div>
                                </div>

                                <div className="project-team-member-content">
                                    {/* Profile Image */}
                                    <div className="project-team-image-upload">
                                        <div 
                                            className="project-team-image-preview" 
                                            onClick={() => handleImageClick(index)}
                                            title={t('projects.create.clickToChangeImage')}
                                        >
                                            {member.image ? (
                                                <>
                                                    <img src={member.image} alt={member.name || 'Team member'} />
                                                    {member.isUploading && (
                                                        <div className="project-team-image-uploading">
                                                            <div className="project-team-uploading-spinner"></div>
                                                        </div>
                                                    )}
                                                    <div className="project-team-image-overlay">
                                                        <button
                                                            type="button"
                                                            className="project-team-image-remove-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeTeamImage(index);
                                                            }}
                                                            title={t('projects.create.removeImage')}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="project-team-image-placeholder">
                                                    <FontAwesomeIcon icon={faUser} />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Hidden file input */}
                                        <input
                                            type="file"
                                            id={`team-image-input-${index}`}
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, index)}
                                            style={{ display: 'none' }}
                                            disabled={member.isUploading}
                                        />
                                        
                                        <label className="project-team-image-upload-btn">
                                            <FontAwesomeIcon icon={faUpload} />
                                            {member.image ? t('projects.create.changeImage') : t('projects.create.uploadImage')}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, index)}
                                                style={{ display: 'none' }}
                                                disabled={member.isUploading}
                                            />
                                        </label>
                                    </div>

                                    {/* Name */}
                                    <div className="project-team-form-group">
                                        <label htmlFor={`team-name-${index}`}>
                                            {t('projects.create.memberName')}
                                            <span className="project-required-indicator">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id={`team-name-${index}`}
                                            value={member.name || ''}
                                            onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                                            placeholder={t('projects.create.memberNamePlaceholder')}
                                            className={`project-team-form-input ${errors[`team[${index}].name`] ? 'error' : ''}`}
                                            maxLength={100}
                                        />
                                        {errors[`team[${index}].name`] && (
                                            <div className="project-team-error-message">{errors[`team[${index}].name`]}</div>
                                        )}
                                    </div>

                                    {/* Role */}
                                    <div className="project-team-form-group">
                                        <label htmlFor={`team-role-${index}`}>
                                            {t('projects.create.memberRole')}
                                            <span className="project-required-indicator">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id={`team-role-${index}`}
                                            value={member.role || ''}
                                            onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                                            placeholder={t('projects.create.memberRolePlaceholder')}
                                            className={`project-team-form-input ${errors[`team[${index}].role`] ? 'error' : ''}`}
                                            maxLength={100}
                                        />
                                        {errors[`team[${index}].role`] && (
                                            <div className="project-team-error-message">{errors[`team[${index}].role`]}</div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="project-team-form-group">
                                        <label htmlFor={`team-email-${index}`}>
                                            <FontAwesomeIcon icon={faEnvelope} />
                                            {t('projects.create.memberEmail')}
                                        </label>
                                        <input
                                            type="email"
                                            id={`team-email-${index}`}
                                            value={member.email || ''}
                                            onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                                            placeholder={t('projects.create.memberEmailPlaceholder')}
                                            className={`project-team-form-input ${errors[`team[${index}].email`] ? 'error' : ''}`}
                                        />
                                        <div className="project-team-field-help">
                                            {t('projects.create.member-email-help')}
                                        </div>
                                        {errors[`team[${index}].email`] && (
                                            <div className="project-team-error-message">{errors[`team[${index}].email`]}</div>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div className="project-team-form-group">
                                        <label htmlFor={`team-phone-${index}`}>
                                            <FontAwesomeIcon icon={faPhone} />
                                            {t('projects.create.memberPhone')}
                                        </label>
                                        <input
                                            type="tel"
                                            id={`team-phone-${index}`}
                                            value={member.phone || ''}
                                            onChange={(e) => handleTeamMemberChange(index, 'phone', e.target.value)}
                                            placeholder={t('projects.create.memberPhonePlaceholder')}
                                            className={`project-team-form-input ${errors[`team[${index}].phone`] ? 'error' : ''}`}
                                        />
                                        <div className="project-team-field-help">
                                            {t('projects.create.member-phone-help')}
                                        </div>
                                        {errors[`team[${index}].phone`] && (
                                            <div className="project-team-error-message">{errors[`team[${index}].phone`]}</div>
                                        )}
                                    </div>

                                    {/* Contact Info Display */}
                                    {(member.email || member.phone) && (
                                        <div className="project-team-contact-info">
                                            <h5>{t('projects.create.contactInfo')}</h5>
                                            {member.email && (
                                                <div className="project-team-contact-item">
                                                    <FontAwesomeIcon icon={faEnvelope} className="project-team-contact-icon" />
                                                    {member.email}
                                                </div>
                                            )}
                                            {member.phone && (
                                                <div className="project-team-contact-item">
                                                    <FontAwesomeIcon icon={faPhone} className="project-team-contact-icon" />
                                                    {member.phone}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Team Summary */}
                {values.team?.length > 0 && (
                    <div className="project-team-summary">
                        <h4>📊 {t('projects.create.teamSummary')}</h4>
                        <div className="project-team-summary-stats">
                            <div className="project-team-stat">
                                <span className="project-team-stat-label">{t('projects.create.totalMembers')}:</span>
                                <span className="project-team-stat-value">{stats.total}</span>
                            </div>
                            <div className="project-team-stat">
                                <span className="project-team-stat-label">{t('projects.create.completeMembers')}:</span>
                                <span className="project-team-stat-value">{stats.complete}</span>
                            </div>
                            <div className="project-team-stat">
                                <span className="project-team-stat-label">{t('projects.create.withContact')}:</span>
                                <span className="project-team-stat-value">{stats.withContact}</span>
                            </div>
                            <div className="project-team-stat">
                                <span className="project-team-stat-label">{t('projects.create.withImages')}:</span>
                                <span className="project-team-stat-value">{stats.withImages}</span>
                            </div>
                            <div className="project-team-stat">
                                <span className="project-team-stat-label">{t('projects.create.completionRate')}:</span>
                                <span className="project-team-stat-value">{stats.completionRate}%</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamSection;