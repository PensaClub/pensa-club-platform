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
    <div className="studentsStatsTabs">
      {/* MOBILE/TABLET - Select Style */}
      <div className="studentsStatsTabs-selectWrapper" ref={dropdownRef}>
        <button 
          className="studentsStatsTabs-trigger"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="studentsStatsTabs-triggerContent">
            <span className="studentsStatsTabs-triggerIcon">{activeTabData?.icon}</span>
            <span className="studentsStatsTabs-triggerLabel">{activeTabData?.label}</span>
          </span>
          <svg 
            className={`studentsStatsTabs-arrow ${isOpen ? 'studentsStatsTabs-arrow--open' : ''}`}
            width="12" 
            height="8" 
            viewBox="0 0 12 8"
          >
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </button>

        {isOpen && (
          <div className="studentsStatsTabs-dropdown">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`studentsStatsTabs-option ${activeTab === tab.id ? 'studentsStatsTabs-option--active' : ''}`}
                onClick={() => handleSelect(tab.id)}
                type="button"
              >
                <span className="studentsStatsTabs-optionIcon">{tab.icon}</span>
                <span className="studentsStatsTabs-optionLabel">{tab.label}</span>
                {activeTab === tab.id && (
                  <svg className="studentsStatsTabs-checkIcon" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP - Chips Style */}
      <div className="studentsStatsTabs-chips">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`studentsStatsTabs-chip ${activeTab === tab.id ? 'studentsStatsTabs-chip--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <span className="studentsStatsTabs-chipIcon">{tab.icon}</span>
            <span className="studentsStatsTabs-chipLabel">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};