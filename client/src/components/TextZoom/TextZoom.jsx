import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faUndo, faCog, faHome } from '@fortawesome/free-solid-svg-icons';
import './TextZoom.css';

export const TextZoom = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [position, setPosition] = useState('center-left');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#3182ce');
  const [transparency, setTransparency] = useState(100);

  useEffect(() => {
    const savedSettings = localStorage.getItem('textZoomSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setFontSize(settings.fontSize || 100);
      setPosition(settings.position || 'center-left');
      setBackgroundColor(settings.backgroundColor || '#ffffff');
      setAccentColor(settings.accentColor || '#3182ce');
      setTransparency(settings.transparency || 100);
    }
  }, []);

// Persist settings to localStorage whenever they change.
// Kept separate from DOM mutations so non-fontSize changes (position, colors)
// don't trigger a reflow of the entire page.
useEffect(() => {
  const settings = { fontSize, position, backgroundColor, accentColor, transparency };
  localStorage.setItem('textZoomSettings', JSON.stringify(settings));
}, [fontSize, position, backgroundColor, accentColor, transparency]);

// Apply font-size scaling to the whole page — only when user deviates from
// the default (100%). Previously ran on every mount regardless of scale,
// which mutated every text element with inline `font-size ... !important`
// and caused a large CLS hit on page load (0.15+ in Lighthouse).
useEffect(() => {
  const scale = fontSize / 100;
  if (scale === 1) {
    // Default size — clear any previously applied inline font-sizes so the
    // page reverts to its CSS-declared sizes and no layout shift is needed.
    const previouslyMutated = document.querySelectorAll('[data-original-font-size]');
    previouslyMutated.forEach((element) => {
      if (element.closest('.text-zoom-widget')) return;
      if (element.closest('[data-no-text-zoom]')) return;
      element.style.removeProperty('font-size');
    });
    return;
  }

  const textElements = document.querySelectorAll(`
    body, p, div, a, li, td, th, h1, h2, h3, h4, h5, h6,
    strong, b, em, i, u, blockquote, cite, code, pre,
    input, textarea, button, label,
    .club-card-title, .club-card-description, .club-card-stat-label,
    .clubs-search-input, .clubs-filter-select,
    .project-view-section-description, .project-view-section-description *,
    .slate-content, .slate-content *,
    .project-view-description, .project-view-description *
  `);

  textElements.forEach(element => {
    if (element.closest('.text-zoom-widget')) return;
    if (element.closest('[data-no-text-zoom]')) return;

    if (!element.hasAttribute('data-original-font-size')) {
      const computedStyle = window.getComputedStyle(element);
      const originalSize = parseFloat(computedStyle.fontSize);
      element.setAttribute('data-original-font-size', originalSize);
    }

    const originalSize = parseFloat(element.getAttribute('data-original-font-size'));
    element.style.setProperty('font-size', `${originalSize * scale}px`, 'important');
  });
}, [fontSize]);

  const increaseFontSize = () => {
    if (fontSize < 150) setFontSize(prev => prev + 10);
  };

  const decreaseFontSize = () => {
    if (fontSize > 70) setFontSize(prev => prev - 10);
  };

  // Само за размера на текста
const resetTextSize = () => {
  setFontSize(100);

  const textElements = document.querySelectorAll('[data-original-font-size]');
  textElements.forEach(element => {
    if (element.closest('.text-zoom-widget')) return;
    if (element.closest('[data-no-text-zoom]')) return;
    const originalSize = element.getAttribute('data-original-font-size');
    // Използваме setProperty с !important
    element.style.setProperty('font-size', `${originalSize}px`, 'important');
  });
};

  // За настройките на панела
  const resetPanelSettings = () => {
    setPosition('center-left');
    setBackgroundColor('#ffffff');
    setAccentColor('#3182ce');
    setTransparency(100);
  };

  const getPositionStyle = () => {
    const slideTransform = isVisible ? 'translateX(0)' : 'translateX(-100%)';
    switch (position) {
      case 'top-left':
        return { top: '20px', left: '0', transform: slideTransform };
      case 'bottom-left':
        return { bottom: '20px', left: '0', transform: slideTransform };
      default: // center-left
        return { top: '50%', left: '0', transform: `${slideTransform} translateY(-50%)` };
    }
  };

  const widgetStyle = {
    ...getPositionStyle(),
    backgroundColor: backgroundColor,
    opacity: isExpanded ? 1 : transparency / 100,
    '--accent-color': accentColor,
    '--bg-color': backgroundColor
  };

  return (
    <div
      className={`text-zoom-widget ${isExpanded ? 'expanded' : 'collapsed'} ${isVisible ? 'text-zoom-visible' : 'text-zoom-hidden'}`}
      style={widgetStyle}
    >
      {/* Езиче/Tab за издърпване */}
      <div
        className="text-zoom-tab"
        onClick={(e) => { e.stopPropagation(); setIsVisible(!isVisible); }}
        style={{ background: accentColor }}
      >
        <span>Text Zoom</span>
      </div>

      {/* Затворено състояние */}
      {!isExpanded && (
        <div className="text-zoom-collapsed" onClick={() => setIsExpanded(true)}>
          <div className="collapsed-content">
            <div className="collapsed-title">TEXT<br/>ZOOM</div>
            
            <div className="collapsed-controls">
              <button className="collapsed-btn" onClick={(e) => { e.stopPropagation(); increaseFontSize(); }}>
                A+
              </button>
              
              <div className="collapsed-slider">
                <input
                  type="range"
                  min="70"
                  max="150"
                  step="10"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="vertical-slider"
                  orient="vertical"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Размер на текста"
                  aria-valuemin={70}
                  aria-valuemax={150}
                  aria-valuenow={fontSize}
                  style={{
                    accentColor: accentColor
                  }}
                />
              </div>
              
              <button className="collapsed-btn" onClick={(e) => { e.stopPropagation(); decreaseFontSize(); }}>
                A-
              </button>
            </div>
            
            <button className="collapsed-reset" onClick={(e) => { e.stopPropagation(); resetTextSize(); }}>
              <FontAwesomeIcon icon={faUndo} />
              RESET
            </button>
          </div>
        </div>
      )}

      {/* Отворено състояние */}
      {isExpanded && (
        <div className="text-zoom-expanded" style={{ backgroundColor: backgroundColor }}>
          <div className="expanded-header">
            <FontAwesomeIcon icon={faCog} style={{ color: accentColor }} />
            <button className="close-btn" onClick={() => setIsExpanded(false)}>×</button>
          </div>

          <div className="expanded-content">
            {/* Design Section */}
            <div className="settings-section">
              <h4>Design</h4>
              <div className="position-options">
                <label>
                  <input 
                    type="radio" 
                    value="top-left" 
                    checked={position === 'top-left'}
                    onChange={(e) => setPosition(e.target.value)}
                    style={{ accentColor: accentColor }}
                  />
                  Top-Left
                </label>
                <label>
                  <input 
                    type="radio" 
                    value="center-left" 
                    checked={position === 'center-left'}
                    onChange={(e) => setPosition(e.target.value)}
                    style={{ accentColor: accentColor }}
                  />
                  Center-Left
                </label>
                <label>
                  <input 
                    type="radio" 
                    value="bottom-left" 
                    checked={position === 'bottom-left'}
                    onChange={(e) => setPosition(e.target.value)}
                    style={{ accentColor: accentColor }}
                  />
                  Bottom-Left
                </label>
              </div>
            </div>

            {/* Style Section */}
            <div className="settings-section">
              <h4>Style</h4>
              <div className="style-controls">
                <div className="color-control">
                  <label>Background Color</label>
                  <input 
                    type="color" 
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                </div>
                <div className="color-control">
                  <label>Accent Color</label>
                  <input 
                    type="color" 
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                  />
                </div>
                <div className="slider-control">
                  <label>Transparency (when closed)</label>
                  <input 
                    type="range"
                    min="30"
                    max="100"
                    value={transparency}
                    onChange={(e) => setTransparency(parseInt(e.target.value))}
                    style={{ accentColor: accentColor }}
                  />
                  <span className="transparency-value">{transparency}%</span>
                </div>
              </div>
               <button 
                className="reset-btn panel-default" 
                onClick={resetPanelSettings}
                style={{ 
                  '--hover-bg': '#f59e0b' + '10',
                  '--hover-border': '#f59e0b' 
                }}
              >

                DEFAULT
              </button>
            </div>

            {/* Text Zoom Section */}
            <div className="settings-section">
              <h4>TEXT ZOOM</h4>
              <div className="zoom-controls">
                <button 
                  className="zoom-btn" 
                  onClick={increaseFontSize}
                  style={{ 
                    '--hover-color': accentColor,
                    '--hover-border': accentColor 
                  }}
                >
                  A+
                </button>
                <div className="zoom-display">{fontSize}%</div>
                <button 
                  className="zoom-btn" 
                  onClick={decreaseFontSize}
                  style={{ 
                    '--hover-color': accentColor,
                    '--hover-border': accentColor 
                  }}
                >
                  A-
                </button>
              </div>
              <input
                type="range"
                min="70"
                max="150"
                step="10"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="zoom-slider"
                style={{ accentColor: accentColor }}
              />
            </div>

            {/* Два отделни бутона */}
            <div className="action-buttons">
              <button 
                className="reset-btn text-reset" 
                onClick={resetTextSize}
                style={{ 
                  '--hover-bg': accentColor + '10',
                  '--hover-border': accentColor 
                }}
              >
                <FontAwesomeIcon icon={faUndo} />
                RESET TEXT
              </button>

             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};