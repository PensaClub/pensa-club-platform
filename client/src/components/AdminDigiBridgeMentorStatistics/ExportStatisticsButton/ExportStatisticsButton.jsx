// src/components/AdminDigiBridgeMentorStatistics/ExportStatisticsButton/ExportStatisticsButton.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePDFReport } from './generatePDFReport';
import './exportStatisticsButton.css';

export const ExportStatisticsButton = ({ mentors, stats }) => {
  const { t, i18n } = useTranslation('digibridge');
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const periods = [
    { value: '1month', label: t('ExportStatistics.oneMonth') },
    { value: '3months', label: t('ExportStatistics.threeMonths') },
    { value: '1year', label: t('ExportStatistics.oneYear') }
  ];

  const handleExport = async (period) => {
    setIsGenerating(true);
    setIsOpen(false);

    try {
      await generatePDFReport({
        mentors,
        stats,
        period,
        language: i18n.language,
        t
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(t('ExportStatistics.error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="export-statistics-button">
      <button
        className="export-statistics-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <div className="export-statistics-spinner"></div>
            <span>{t('ExportStatistics.generating')}</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{t('ExportStatistics.exportPDF')}</span>
            <svg className="export-statistics-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div className="export-statistics-backdrop" onClick={() => setIsOpen(false)} />
          <div className="export-statistics-dropdown">
            <div className="export-statistics-dropdown-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              <span>{t('ExportStatistics.selectPeriod')}</span>
            </div>
            <div className="export-statistics-dropdown-options">
              {periods.map((period) => (
                <button
                  key={period.value}
                  className="export-statistics-option"
                  onClick={() => handleExport(period.value)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{period.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};