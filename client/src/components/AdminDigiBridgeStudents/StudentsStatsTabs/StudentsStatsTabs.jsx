// src/components/AdminDigiBridgeStudents/StudentsStatsTabs/StudentsStatsTabs.jsx

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './studentsStatsTabs.css';

export const StudentsStatsTabs = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const tabs = [
    { id: 'overview', label: t('adminDigiBridgeStudents.tabs.overview'), icon: '📊' },
    { id: 'byStatus', label: t('adminDigiBridgeStudents.tabs.byStatus'), icon: '✅' },
    { id: 'byMentor', label: t('adminDigiBridgeStudents.tabs.byMentor'), icon: '🎓' },
    { id: 'credits', label: t('adminDigiBridgeStudents.tabs.credits'), icon: '⭐' },
    { id: 'attendance', label: t('adminDigiBridgeStudents.tabs.attendance'), icon: '📅' },
    { id: 'topPerformers', label: t('adminDigiBridgeStudents.tabs.topPerformers'), icon: '🏆' },
    { id: 'engagement', label: t('adminDigiBridgeStudents.tabs.engagement'), icon: '📈' }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <div className="students-stats-tabs">
      {/* MOBILE/TABLET - Select Style */}
      <div className="tabs-select-wrapper" ref={dropdownRef}>
        <button 
          className="tabs-select-trigger"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="select-content">
            <span className="select-icon">{activeTabData?.icon}</span>
            <span className="select-label">{activeTabData?.label}</span>
          </span>
          <svg 
            className={`select-arrow ${isOpen ? 'open' : ''}`}
            width="12" 
            height="8" 
            viewBox="0 0 12 8"
          >
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </button>

        {isOpen && (
          <div className="tabs-select-dropdown">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`select-option ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleSelect(tab.id)}
                type="button"
              >
                <span className="option-icon">{tab.icon}</span>
                <span className="option-label">{tab.label}</span>
                {activeTab === tab.id && (
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP - Chips Style */}
      <div className="tabs-chips">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-chip ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <span className="chip-icon">{tab.icon}</span>
            <span className="chip-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};