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

  // HTML съдържание
  container.innerHTML = `
    <div style="font-family: Arial, sans-serif; color: #1f2937;">
      <!-- HEADER -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #6366f1;">
        <div style="flex: 1;">
          <h1 style="margin: 0 0 10px 0; font-size: 28px; color: #1f2937; font-weight: 800;">
            ${language === 'bg' ? 'ОТЧЕТ ЗА МЕНТОРСКА ПРОГРАМА' : 'MENTORSHIP PROGRAM REPORT'}
          </h1>
          <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">
            ${periodLabels[period]} • ${currentDate}
          </p>
        </div>
        <img src="/images/logo.png" alt="PENSA Logo" style="height: 60px; width: auto;" />
      </div>

      <!-- OVERVIEW STATISTICS -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
          ${language === 'bg' ? 'Обща статистика' : 'Overview Statistics'}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
          ${createStatCard(language === 'bg' ? 'Общо ментори' : 'Total Mentors', stats.totalMentors, '#6366f1')}
          ${createStatCard(language === 'bg' ? 'Активни ментори' : 'Active Mentors', stats.activeMentors, '#10b981')}
          ${createStatCard(language === 'bg' ? 'Студенти' : 'Students', stats.totalStudents, '#f59e0b')}
          ${createStatCard(language === 'bg' ? 'Средна оценка' : 'Avg Rating', stats.averageRating.toFixed(1), '#ec4899')}
        </div>
      </div>

      <!-- KEY METRICS -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
          ${language === 'bg' ? 'Ключови метрики' : 'Key Metrics'}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          ${createMetricRow(language === 'bg' ? 'Завършени курсове' : 'Completed Courses', stats.totalCoursesCompleted)}
          ${createMetricRow(language === 'bg' ? 'Сесии този месец' : 'Sessions This Month', stats.totalSessionsThisMonth)}
          ${createMetricRow(language === 'bg' ? 'Онлайн часове' : 'Online Hours', stats.totalOnlineHours)}
          ${createMetricRow(language === 'bg' ? 'Процент завършване' : 'Completion Rate', `${stats.averageCompletionRate}%`)}
        </div>
      </div>

      <!-- TOP MENTORS -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
          ${language === 'bg' ? 'Топ 5 ментори' : 'Top 5 Mentors'}
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase;">${language === 'bg' ? 'Име' : 'Name'}</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase;">${language === 'bg' ? 'Студенти' : 'Students'}</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase;">${language === 'bg' ? 'Курсове' : 'Courses'}</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase;">${language === 'bg' ? 'Оценка' : 'Rating'}</th>
            </tr>
          </thead>
          <tbody>
            ${mentors.slice(0, 5).map((mentor, index) => `
              <tr style="border-bottom: 1px solid #f3f4f6; ${index % 2 === 0 ? 'background: #f9fafb;' : ''}">
                <td style="padding: 10px; font-weight: 600; color: #1f2937;">${mentor.name}</td>
                <td style="padding: 10px; text-align: center; font-weight: 700; color: #6366f1;">${mentor.studentsCount}</td>
                <td style="padding: 10px; text-align: center; font-weight: 700; color: #10b981;">${mentor.courses.completed}</td>
                <td style="padding: 10px; text-align: center; font-weight: 700; color: #f59e0b;">⭐ ${mentor.rating}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- FOOTER -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <p style="margin: 0 0 5px 0; font-weight: 600;">
          ${language === 'bg' ? 'Фондация ПЕНСА - DigiBridge Academy' : 'PENSA Foundation - DigiBridge Academy'}
        </p>
        <p style="margin: 0;">
          ${language === 'bg' ? 'Генериран на' : 'Generated on'}: ${currentDate}
        </p>
      </div>
    </div>
  `;

  // Генериране на PDF
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  // Име на файла
  const fileName = `PENSA_Mentor_Report_${period}_${currentDate.replace(/\s/g, '_')}.pdf`;
  pdf.save(fileName);

  // Премахване на container
  document.body.removeChild(container);
};

// Helper functions
const createStatCard = (label, value, color) => `
  <div style="background: #f9fafb; border: 2px solid #f3f4f6; border-radius: 10px; padding: 15px; text-align: center;">
    <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">${label}</p>
    <p style="margin: 0; font-size: 26px; font-weight: 800; color: ${color};">${value}</p>
  </div>
`;

const createMetricRow = (label, value) => `
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6;">
    <span style="font-size: 14px; font-weight: 600; color: #6b7280;">${label}</span>
    <span style="font-size: 16px; font-weight: 800; color: #1f2937;">${value}</span>
  </div>
`;