import './settingsAdminSection.css';

const SettingsAdminSection = ({ title, icon, description, children }) => {
    return (
        <div className="sas-card">
            <div className="sas-header">
                <div className="sas-header-left">
                    {icon && <span className="sas-icon">{icon}</span>}
                    <div className="sas-header-text">
                        <h3 className="sas-title">{title}</h3>
                        {description && <p className="sas-desc">{description}</p>}
                    </div>
                </div>
            </div>
            <div className="sas-divider" />
            <div className="sas-content">
                {children}
            </div>
        </div>
    );
};

export default SettingsAdminSection;
