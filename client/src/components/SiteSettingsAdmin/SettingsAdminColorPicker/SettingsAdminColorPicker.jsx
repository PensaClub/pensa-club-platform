import { useRef } from 'react';
import './settingsAdminColorPicker.css';

const SettingsAdminColorPicker = ({ label, value, onChange }) => {
    const inputRef = useRef(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="sacp-row">
            <span className="sacp-label">{label}</span>
            <div className="sacp-control" onClick={handleClick}>
                <div
                    className="sacp-swatch"
                    style={{ backgroundColor: value }}
                />
                <span className="sacp-hex">{value}</span>
                <input
                    ref={inputRef}
                    type="color"
                    className="sacp-input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
};

export default SettingsAdminColorPicker;
