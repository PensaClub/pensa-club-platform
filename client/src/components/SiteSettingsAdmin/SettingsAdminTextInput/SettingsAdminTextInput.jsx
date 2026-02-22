import './settingsAdminTextInput.css';

const SettingsAdminTextInput = ({ label, value, onChange, placeholder, flag }) => {
    return (
        <div className="sati-row">
            <div className="sati-label-wrap">
                {flag && <span className="sati-flag">{flag}</span>}
                <span className="sati-label">{label}</span>
            </div>
            <input
                type="text"
                className="sati-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};

export default SettingsAdminTextInput;
