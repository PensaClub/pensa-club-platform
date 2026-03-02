import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ApplicationsExport.css';

export const ApplicationsExport = ({ 
  applications, 
  filteredApplications = null,
  onRefresh
}) => {
  const { t, i18n } = useTranslation('content');
  const currentLocale = i18n.language === 'bg' ? bg : enUS;
  
  const [exportSettings, setExportSettings] = useState({
    includeColumns: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      projectId: true,
      appliedAt: true,
      isAnonymous: false
    },
    dateFormat: 'dd.MM.yyyy HH:mm',
    encoding: 'UTF-8',
    separator: ',',
    exportFiltered: filteredApplications && filteredApplications.length > 0
  });

  const [isExporting, setIsExporting] = useState(false);
  const [lastExportInfo, setLastExportInfo] = useState(null);

  const dataToExport = useMemo(() => {
    if (exportSettings.exportFiltered && filteredApplications) {
      return filteredApplications;
    }
    return applications;
  }, [applications, filteredApplications, exportSettings.exportFiltered]);

  const exportStats = useMemo(() => {
    const totalSize = applications.length;
    const exportSize = dataToExport.length;
    const uniqueProjects = [...new Set(dataToExport.map(app => app.projectId))].length;
    
    return {
      totalApplications: totalSize,
      exportApplications: exportSize,
      uniqueProjects,
      percentage: totalSize > 0 ? Math.round((exportSize / totalSize) * 100) : 0
    };
  }, [applications, dataToExport]);

  const handleColumnToggle = (column) => {
    setExportSettings(prev => ({
      ...prev,
      includeColumns: {
        ...prev.includeColumns,
        [column]: !prev.includeColumns[column]
      }
    }));
  };

  const handleSettingChange = (key, value) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getImageAsBase64 = (imagePath) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;
        ctx.drawImage(this, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = reject;
      img.src = imagePath;
    });
  };

const exportToPDF = async () => {
  setIsExporting(true);
  
  try {
    const { includeColumns, dateFormat } = exportSettings;
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // 👇 КОНВЕРТИРАЙ КИРИЛИЦА В ЛАТИНИЦА ЗА PDF
    const cyrillicToLatin = (text) => {
      const cyrillicMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
        'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y',
        'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh',
        'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
        'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
        'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y',
        'Ю': 'Yu', 'Я': 'Ya'
      };
      
      return String(text).replace(/[а-яА-Я]/g, (char) => cyrillicMap[char] || char);
    };

    let logoBase64 = null;
    try {
      logoBase64 = await getImageAsBase64('/images/homePage/logo.png');
    } catch (error) {
      console.warn('Could not load logo, using fallback');
    }

    // Header
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 20, 10, 25, 15);
      doc.setFontSize(24);
      doc.setTextColor(40, 40, 40);
      doc.text('Pensa Club', 50, 20);
    } else {
      doc.setFontSize(24);
      doc.text('🚀 Pensa Club', 20, 20);
    }
    
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text('Social Platform', logoBase64 ? 50 : 45, 25);

    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    // 👇 ПРИЛОЖИ КИРИЛИЦА КОНВЕРТОР
    doc.text(cyrillicToLatin(t('applications.export.title')), 20, 40);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    // 👇 ПРИЛОЖИ КИРИЛИЦА КОНВЕРТОР
    doc.text(cyrillicToLatin(`${t('applications.export.generatedOn')}: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: currentLocale })}`), 20, 47);
    doc.text(cyrillicToLatin(`${t('applications.export.totalRecords')}: ${dataToExport.length}`), 20, 52);

    // Headers
    const headers = [];
    const columnMap = {
      firstName: t('applications.export.columns.firstName'),
      lastName: t('applications.export.columns.lastName'),
      email: t('applications.export.columns.email'),
      phone: t('applications.export.columns.phone'),
      projectId: t('applications.export.columns.project'),
      appliedAt: t('applications.export.columns.appliedAt'),
      isAnonymous: t('applications.export.columns.anonymous')
    };

    Object.keys(includeColumns).forEach(column => {
      if (includeColumns[column]) {
        // 👇 ПРИЛОЖИ КИРИЛИЦА КОНВЕРТОР ЗА HEADERS
        headers.push(cyrillicToLatin(columnMap[column]));
      }
    });

    // Rows
    const rows = dataToExport.map(app => {
      const row = [];
      
      // 👇 ПРИЛОЖИ КИРИЛИЦА КОНВЕРТОР ЗА ВСИЧКИ ДАННИ
      if (includeColumns.firstName) row.push(cyrillicToLatin(app.firstName || ''));
      if (includeColumns.lastName) row.push(cyrillicToLatin(app.lastName || ''));
      if (includeColumns.email) row.push(app.email || ''); // Email не се конвертира
      if (includeColumns.phone) row.push(app.phone || ''); // Телефон не се конвертира
      if (includeColumns.projectId) row.push(cyrillicToLatin(app.projectId || ''));
      if (includeColumns.appliedAt) {
        const formattedDate = format(new Date(app.appliedAt), dateFormat, { locale: currentLocale });
        row.push(formattedDate); // Дата не се конвертира
      }
      if (includeColumns.isAnonymous) {
        // 👇 ПРИЛОЖИ КИРИЛИЦА КОНВЕРТОР ЗА ДА/НЕ
        row.push(cyrillicToLatin(app.isAnonymous ? t('applications.export.yes') : t('applications.export.no')));
      }

      return row;
    });

    // 👇 ИЗПОЛЗВАЙ autoTable ФУНКЦИЯТА ДИРЕКТНО
    autoTable(doc, {
      head: [headers], // Вече са конвертирани
      body: rows, // Вече са конвертирани
      startY: 60,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { top: 60, left: 15, right: 15 },
      theme: 'striped'
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      
      // 👇 ПРИЛОЖИ КИРИЛИЦА КОНВЕРТОР ЗА FOOTER
      doc.text(
        cyrillicToLatin(`${t('applications.export.page')} ${i} ${t('applications.export.of')} ${pageCount}`),
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
      
      doc.text(
        'Pensa Club Initiative Platform', // Английски, не се конвертира
        20,
        doc.internal.pageSize.height - 10
      );
    }

    const filename = `pensa_club_applications_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.pdf`;
    doc.save(filename);

    setLastExportInfo({
      filename,
      timestamp: new Date().toISOString(),
      recordsCount: dataToExport.length,
      columnsCount: Object.values(exportSettings.includeColumns).filter(Boolean).length
    });

    await new Promise(resolve => setTimeout(resolve, 800));
    
  } catch (error) {
    console.error('PDF export error:', error);
    alert(t('applications.export.exportError'));
  } finally {
    setIsExporting(false);
  }
};

  // Останалите функции (CSV, JSON)
  const generateCSV = () => {
    const { includeColumns, dateFormat, separator } = exportSettings;
    
    const headers = [];
    const columnMap = {
      firstName: t('applications.export.columns.firstName'),
      lastName: t('applications.export.columns.lastName'),
      email: t('applications.export.columns.email'),
      phone: t('applications.export.columns.phone'),
      projectId: t('applications.export.columns.project'),
      appliedAt: t('applications.export.columns.appliedAt'),
      isAnonymous: t('applications.export.columns.anonymous')
    };

    Object.keys(includeColumns).forEach(column => {
      if (includeColumns[column]) {
        headers.push(columnMap[column]);
      }
    });

    const rows = dataToExport.map(app => {
      const row = [];
      
      if (includeColumns.firstName) row.push(app.firstName || '');
      if (includeColumns.lastName) row.push(app.lastName || '');
      if (includeColumns.email) row.push(app.email || '');
      if (includeColumns.phone) row.push(app.phone || '');
      if (includeColumns.projectId) row.push(app.projectId || '');
      if (includeColumns.appliedAt) {
        const formattedDate = format(new Date(app.appliedAt), dateFormat, { locale: currentLocale });
        row.push(formattedDate);
      }
      if (includeColumns.isAnonymous) {
        row.push(app.isAnonymous ? t('applications.export.yes') : t('applications.export.no'));
      }

      return row.map(cell => {
        const stringCell = String(cell);
        if (stringCell.includes(separator) || stringCell.includes('"') || stringCell.includes('\n')) {
          return `"${stringCell.replace(/"/g, '""')}"`;
        }
        return stringCell;
      }).join(separator);
    });

    return [headers.join(separator), ...rows].join('\n');
  };

  const downloadCSV = async () => {
    setIsExporting(true);
    
    try {
      const csvContent = generateCSV();
      const filename = `applications_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`;
      
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      setLastExportInfo({
        filename,
        timestamp: new Date().toISOString(),
        recordsCount: dataToExport.length,
        columnsCount: Object.values(exportSettings.includeColumns).filter(Boolean).length
      });

      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.error('Export error:', error);
      alert(t('applications.export.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = async () => {
    setIsExporting(true);
    
    try {
      const { includeColumns } = exportSettings;
      
      const jsonData = dataToExport.map(app => {
        const record = {};
        
        if (includeColumns.firstName) record.firstName = app.firstName;
        if (includeColumns.lastName) record.lastName = app.lastName;
        if (includeColumns.email) record.email = app.email;
        if (includeColumns.phone) record.phone = app.phone;
        if (includeColumns.projectId) record.projectId = app.projectId;
        if (includeColumns.appliedAt) record.appliedAt = app.appliedAt;
        if (includeColumns.isAnonymous) record.isAnonymous = app.isAnonymous;
        
        return record;
      });

      const jsonContent = JSON.stringify(jsonData, null, 2);
      const filename = `applications_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`;
      
      const blob = new Blob([jsonContent], { 
        type: 'application/json;charset=utf-8;' 
      });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      setLastExportInfo({
        filename,
        timestamp: new Date().toISOString(),
        recordsCount: dataToExport.length,
        columnsCount: Object.values(exportSettings.includeColumns).filter(Boolean).length
      });

      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.error('JSON export error:', error);
      alert(t('applications.export.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const selectAllColumns = () => {
    setExportSettings(prev => ({
      ...prev,
      includeColumns: Object.keys(prev.includeColumns).reduce((acc, key) => ({
        ...acc,
        [key]: true
      }), {})
    }));
  };

  const deselectAllColumns = () => {
    setExportSettings(prev => ({
      ...prev,
      includeColumns: Object.keys(prev.includeColumns).reduce((acc, key) => ({
        ...acc,
        [key]: false
      }), {})
    }));
  };

  const hasSelectedColumns = Object.values(exportSettings.includeColumns).some(Boolean);
  const selectedColumnsCount = Object.values(exportSettings.includeColumns).filter(Boolean).length;

  return (
    <div className="applications-export-container">
      {/* Header */}
      <div className="applications-export-header">
        <div className="applications-export-header-main">
          <h3 className="applications-export-title">
            <span className="applications-export-title-icon">📤</span>
            {t('applications.export.title')}
          </h3>
          <p className="applications-export-subtitle">
            {t('applications.export.subtitle')}
          </p>
        </div>
        
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="applications-export-refresh-btn"
          >
            🔄
          </button>
        )}
      </div>

      {/* Export Stats */}
      <div className="applications-export-stats">
        <div className="applications-export-stats-grid">
          <div className="applications-export-stat-card">
            <div className="applications-export-stat-number">{exportStats.exportApplications}</div>
            <div className="applications-export-stat-label">{t('applications.export.recordsToExport')}</div>
          </div>
          
          <div className="applications-export-stat-card">
            <div className="applications-export-stat-number">{selectedColumnsCount}</div>
            <div className="applications-export-stat-label">{t('applications.export.selectedColumns')}</div>
          </div>
          
          <div className="applications-export-stat-card">
            <div className="applications-export-stat-number">{exportStats.uniqueProjects}</div>
            <div className="applications-export-stat-label">{t('applications.export.uniqueProjects')}</div>
          </div>
          
          <div className="applications-export-stat-card">
            <div className="applications-export-stat-number">{exportStats.percentage}%</div>
            <div className="applications-export-stat-label">{t('applications.export.ofTotal')}</div>
          </div>
        </div>
      </div>

      <div className="applications-export-content">
        {/* Data Source Selection */}
        <div className="applications-export-section">
          <h4 className="applications-export-section-title">
            <span className="applications-export-section-icon">🎯</span>
            {t('applications.export.dataSource')}
          </h4>
          
          <div className="applications-export-data-options">
            <label className="applications-export-radio-option">
              <input
                type="radio"
                name="dataSource"
                checked={!exportSettings.exportFiltered}
                onChange={() => handleSettingChange('exportFiltered', false)}
                className="applications-export-radio"
              />
              <div className="applications-export-radio-content">
                <div className="applications-export-radio-label">
                  {t('applications.export.allData')}
                </div>
                <div className="applications-export-radio-description">
                  {t('applications.export.allDataDescription', { count: applications.length })}
                </div>
              </div>
            </label>
            
            {filteredApplications && filteredApplications.length > 0 && (
              <label className="applications-export-radio-option">
                <input
                  type="radio"
                  name="dataSource"
                  checked={exportSettings.exportFiltered}
                  onChange={() => handleSettingChange('exportFiltered', true)}
                  className="applications-export-radio"
                />
                <div className="applications-export-radio-content">
                  <div className="applications-export-radio-label">
                    {t('applications.export.filteredData')}
                  </div>
                  <div className="applications-export-radio-description">
                    {t('applications.export.filteredDataDescription', { count: filteredApplications.length })}
                  </div>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Column Selection */}
        <div className="applications-export-section">
          <div className="applications-export-section-header">
            <h4 className="applications-export-section-title">
              <span className="applications-export-section-icon">📋</span>
              {t('applications.export.columnSelection')}
            </h4>
            
            <div className="applications-export-column-actions">
              <button 
                onClick={selectAllColumns}
                className="applications-export-select-btn"
              >
                {t('applications.export.selectAll')}
              </button>
              <button 
                onClick={deselectAllColumns}
                className="applications-export-select-btn"
              >
                {t('applications.export.deselectAll')}
              </button>
            </div>
          </div>
          
          <div className="applications-export-columns-grid">
            {Object.keys(exportSettings.includeColumns).map(column => (
              <label key={column} className="applications-export-checkbox-option">
                <input
                  type="checkbox"
                  checked={exportSettings.includeColumns[column]}
                  onChange={() => handleColumnToggle(column)}
                  className="applications-export-checkbox"
                />
                <div className="applications-export-checkbox-content">
                  <div className="applications-export-checkbox-label">
                    {t(`applications.export.columns.${column}`)}
                  </div>
                  <div className="applications-export-checkbox-description">
                    {t(`applications.export.columnsDesc.${column}`)}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Format Settings */}
        <div className="applications-export-section">
          <h4 className="applications-export-section-title">
            <span className="applications-export-section-icon">⚙️</span>
            {t('applications.export.formatSettings')}
          </h4>
          
          <div className="applications-export-settings-grid">
            <div className="applications-export-setting">
              <label className="applications-export-setting-label">
                {t('applications.export.dateFormat')}
              </label>
              <select
                value={exportSettings.dateFormat}
                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                className="applications-export-select"
              >
                <option value="dd.MM.yyyy HH:mm">31.12.2024 15:30</option>
                <option value="yyyy-MM-dd HH:mm">2024-12-31 15:30</option>
                <option value="dd/MM/yyyy HH:mm">31/12/2024 15:30</option>
                <option value="dd.MM.yyyy">31.12.2024</option>
                <option value="yyyy-MM-dd">2024-12-31</option>
              </select>
            </div>
            
            <div className="applications-export-setting">
              <label className="applications-export-setting-label">
                {t('applications.export.separator')}
              </label>
              <select
                value={exportSettings.separator}
                onChange={(e) => handleSettingChange('separator', e.target.value)}
                className="applications-export-select"
              >
                <option value=",">{t('applications.export.comma')} (,)</option>
                <option value=";">{t('applications.export.semicolon')} (;)</option>
                <option value="\t">{t('applications.export.tab')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="applications-export-actions">
        <div className="applications-export-actions-info">
          {!hasSelectedColumns && (
            <div className="applications-export-warning">
              <span className="applications-export-warning-icon">⚠️</span>
              {t('applications.export.noColumnsSelected')}
            </div>
          )}
          
          {dataToExport.length === 0 && (
            <div className="applications-export-warning">
              <span className="applications-export-warning-icon">📭</span>
              {t('applications.export.noDataToExport')}
            </div>
          )}
        </div>
        
        <div className="applications-export-buttons">
          <button
            onClick={exportToJSON}
            disabled={!hasSelectedColumns || dataToExport.length === 0 || isExporting}
            className="applications-export-btn secondary"
          >
            <span className="applications-export-btn-icon">📄</span>
            {isExporting ? t('applications.export.exporting') : t('applications.export.exportJSON')}
          </button>

          <button
            onClick={exportToPDF}
            disabled={!hasSelectedColumns || dataToExport.length === 0 || isExporting}
            className="applications-export-btn secondary"
          >
            <span className="applications-export-btn-icon">📑</span>
            {isExporting ? t('applications.export.exporting') : t('applications.export.exportPDF')}
          </button>
          
          <button
            onClick={downloadCSV}
            disabled={!hasSelectedColumns || dataToExport.length === 0 || isExporting}
            className="applications-export-btn primary"
          >
            <span className="applications-export-btn-icon">📊</span>
            {isExporting ? t('applications.export.exporting') : t('applications.export.exportCSV')}
          </button>
        </div>
      </div>

      {/* Last Export Info */}
      {lastExportInfo && (
        <div className="applications-export-last-info">
          <div className="applications-export-last-info-content">
            <span className="applications-export-last-info-icon">✅</span>
            <div className="applications-export-last-info-text">
              <div className="applications-export-last-info-title">
                {t('applications.export.lastExport')}: {lastExportInfo.filename}
              </div>
              <div className="applications-export-last-info-details">
                {t('applications.export.exportedRecords', { 
                  records: lastExportInfo.recordsCount,
                  columns: lastExportInfo.columnsCount,
                  time: format(new Date(lastExportInfo.timestamp), 'dd.MM.yyyy HH:mm', { locale: currentLocale })
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};