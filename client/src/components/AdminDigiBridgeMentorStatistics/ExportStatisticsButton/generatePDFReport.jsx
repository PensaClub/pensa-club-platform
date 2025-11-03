// src/components/AdminDigiBridgeMentorStatistics/ExportStatisticsButton/generatePDFReport.js

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDFReport = async ({ mentors, stats, period, language, t }) => {
  // Създаване на hidden container за PDF съдържанието
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // A4 width
  container.style.background = '#ffffff';
  container.style.padding = '20mm';
  document.body.appendChild(container);

  // Период labels
  const periodLabels = {
    '1month': language === 'bg' ? 'Последен месец' : 'Last Month',
    '3months': language === 'bg' ? 'Последни 3 месеца' : 'Last 3 Months',
    '1year': language === 'bg' ? 'Последна година' : 'Last Year'
  };

  // Дата
  const currentDate = new Date().toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Сортирай ментори по брой студенти (за Top 5)
  const topMentors = [...mentors]
    .sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0))
    .slice(0, 5);

  // HTML съдържание
  container.innerHTML = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937;">
      <!-- HEADER -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="flex: 1;">
            <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 900; letter-spacing: -0.5px;">
              ${language === 'bg' ? 'ОТЧЕТ ЗА МЕНТОРСКА ПРОГРАМА' : 'MENTORSHIP PROGRAM REPORT'}
            </h1>
            <p style="margin: 0; font-size: 16px; opacity: 0.95; font-weight: 600;">
              ${periodLabels[period]} • ${currentDate}
            </p>
          </div>
        </div>
      </div>

      <!-- OVERVIEW STATISTICS -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #6366f1;">
          ${language === 'bg' ? '📊 Обща статистика' : '📊 Overview Statistics'}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
          ${createStatCard(language === 'bg' ? 'Общо ментори' : 'Total Mentors', stats?.totalMentors || 0, '#6366f1', '👥')}
          ${createStatCard(language === 'bg' ? 'Активни ментори' : 'Active Mentors', stats?.activeMentors || 0, '#10b981', '✅')}
          ${createStatCard(language === 'bg' ? 'Студенти' : 'Students', stats?.totalStudents || 0, '#f59e0b', '🎓')}
          ${createStatCard(language === 'bg' ? 'Средна оценка' : 'Avg Rating', (stats?.averageRating || 0).toFixed(1), '#ec4899', '⭐')}
        </div>
      </div>

      <!-- KEY METRICS -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #10b981;">
          ${language === 'bg' ? '📈 Ключови метрики' : '📈 Key Metrics'}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px;">
          ${createMetricRow(language === 'bg' ? 'Завършени курсове' : 'Completed Courses', stats?.totalCoursesCompleted || 0, '📚')}
          ${createMetricRow(language === 'bg' ? 'Сесии този месец' : 'Sessions This Month', stats?.totalSessionsThisMonth || 0, '💬')}
          ${createMetricRow(language === 'bg' ? 'Онлайн часове' : 'Online Hours', `${stats?.totalOnlineHours || 0}h`, '⏰')}
          ${createMetricRow(language === 'bg' ? 'Процент завършване' : 'Completion Rate', `${stats?.averageCompletionRate || 0}%`, '✓')}
        </div>
      </div>

      <!-- TOP MENTORS -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 3px solid #f59e0b;">
          ${language === 'bg' ? '🏆 Топ 5 ментори' : '🏆 Top 5 Mentors'}
        </h2>
        <table style="width: 100%; border-collapse: collapse; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
              <th style="padding: 14px; text-align: left; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${language === 'bg' ? 'Име' : 'Name'}</th>
              <th style="padding: 14px; text-align: center; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${language === 'bg' ? 'Студенти' : 'Students'}</th>
              <th style="padding: 14px; text-align: center; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${language === 'bg' ? 'Курсове' : 'Courses'}</th>
              <th style="padding: 14px; text-align: center; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${language === 'bg' ? 'Оценка' : 'Rating'}</th>
            </tr>
          </thead>
          <tbody>
            ${topMentors.map((mentor, index) => `
              <tr style="border-bottom: 1px solid #e5e7eb; background: ${index % 2 === 0 ? '#f9fafb' : '#ffffff'};">
                <td style="padding: 14px; font-weight: 700; color: #111827; font-size: 14px;">
                  <span style="background: ${index === 0 ? '#fbbf24' : index === 1 ? '#d1d5db' : index === 2 ? '#cd7f32' : '#e5e7eb'}; color: ${index < 3 ? '#1f2937' : '#6b7280'}; padding: 4px 10px; border-radius: 6px; margin-right: 10px; font-weight: 900; font-size: 12px;">
                    ${index + 1}
                  </span>
                  ${mentor.name}
                </td>
                <td style="padding: 14px; text-align: center; font-weight: 800; color: #6366f1; font-size: 16px;">${mentor.studentsCount || 0}</td>
                <td style="padding: 14px; text-align: center; font-weight: 800; color: #10b981; font-size: 16px;">${mentor.courses?.length || 0}</td>
                <td style="padding: 14px; text-align: center; font-weight: 800; color: #f59e0b; font-size: 16px;">⭐ ${mentor.rating || '0.0'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- FOOTER -->
      <div style="margin-top: 50px; padding-top: 25px; border-top: 3px solid #e5e7eb; text-align: center;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
          <p style="margin: 0 0 8px 0; font-weight: 800; font-size: 16px;">
            ${language === 'bg' ? 'Фондация ПЕНСА - DigiBridge Academy' : 'PENSA Foundation - DigiBridge Academy'}
          </p>
          <p style="margin: 0; font-size: 13px; opacity: 0.9;">
            ${language === 'bg' ? 'Генериран на' : 'Generated on'}: ${currentDate}
          </p>
        </div>
      </div>
    </div>
  `;

  // Генериране на PDF
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  // Име на файла
  const fileName = `PENSA_Mentor_Report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(fileName);

  // Премахване на container
  document.body.removeChild(container);
};

// Helper functions
const createStatCard = (label, value, color, emoji) => `
  <div style="background: linear-gradient(135deg, ${color}15 0%, ${color}25 100%); border-left: 5px solid ${color}; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="font-size: 32px; margin-bottom: 8px;">${emoji}</div>
    <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${label}</p>
    <p style="margin: 0; font-size: 32px; font-weight: 900; color: ${color};">${value}</p>
  </div>
`;

const createMetricRow = (label, value, emoji) => `
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #f9fafb; border-radius: 10px; border: 2px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 24px;">${emoji}</span>
      <span style="font-size: 15px; font-weight: 700; color: #374151;">${label}</span>
    </div>
    <span style="font-size: 20px; font-weight: 900; color: #111827; background: white; padding: 8px 16px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${value}</span>
  </div>
`;