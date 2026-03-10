import { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import './settingsAdminSection.css';

const SettingsAdminSection = ({ id, title, description, icon, color, isOpen, onToggle, children }) => {
    const collapseRef = useRef(null);
    const [animating, setAnimating] = useState(false);

    // After open animation ends, switch to auto height so content can grow freely
    const handleTransitionEnd = useCallback(() => {
        if (isOpen && collapseRef.current) {
            collapseRef.current.style.height = 'auto';
            collapseRef.current.style.overflow = 'visible';
        }
        setAnimating(false);
    }, [isOpen]);

    useEffect(() => {
        const el = collapseRef.current;
        if (!el) return;

        if (isOpen) {
            // Opening: set explicit height for animation, then auto after transition
            el.style.overflow = 'hidden';
            el.style.height = el.scrollHeight + 'px';
            setAnimating(true);
        } else {
            // Closing: first set explicit height from auto, then collapse to 0
            if (el.style.height === 'auto') {
                el.style.height = el.scrollHeight + 'px';
                el.style.overflow = 'hidden';
                // Force reflow so browser registers the explicit height
                el.offsetHeight; // eslint-disable-line no-unused-expressions
            }
            requestAnimationFrame(() => {
                el.style.height = '0px';
                el.style.overflow = 'hidden';
                setAnimating(true);
            });
        }
    }, [isOpen]);

    return (
        <div
            className={`sas-card ${isOpen ? 'sas-card--open' : ''}`}
            style={{ '--sas-color': color }}
        >
            {/* Clickable header */}
            <button className="sas-header" onClick={onToggle} aria-expanded={isOpen}>
                <div className="sas-header-left">
                    <div className="sas-icon-box">
                        {icon}
                    </div>
                    <div className="sas-header-text">
                        <h3 className="sas-title">{title}</h3>
                        {description && <p className="sas-desc">{description}</p>}
                    </div>
                </div>
                <div className={`sas-chevron ${isOpen ? 'sas-chevron--open' : ''}`}>
                    <ChevronDown size={20} />
                </div>
            </button>

            {/* Collapsible content */}
            <div
                ref={collapseRef}
                className="sas-collapse"
                style={{ height: 0 }}
                onTransitionEnd={handleTransitionEnd}
            >
                <div className="sas-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SettingsAdminSection;
