import './settingsAdminSlider.css';

const SettingsAdminSlider = ({ label, value, onChange, min, max, step, unit = '' }) => {
    return (
        <div className="sasl-row">
            <span className="sasl-label">{label}</span>
            <div className="sasl-control">
                <input
                    type="range"
                    className="sasl-range"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    min={min}
                    max={max}
                    step={step}
                />
                <span className="sasl-value">
                    {step < 1 ? value.toFixed(1) : value}{unit}
                </span>
            </div>
        </div>
    );
};

export default SettingsAdminSlider;
