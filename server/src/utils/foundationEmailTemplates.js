/**
 * Pensa Foundation — branded email templates for storage notifications
 */

const PENSA_LOGO = 'https://pensa.club/images/homePage/logo.png';

const wrapFoundationTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="bg">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:24px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#1a1e2e;padding:24px 32px;text-align:center;">
            <img src="${PENSA_LOGO}" alt="Pensa" height="36" style="display:inline-block;height:36px;width:auto;margin-bottom:10px;" />
            <div style="color:rgba(255,255,255,0.6);font-size:10px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Фондация ПЕНСА</div>
            <div style="color:#d4a853;font-size:18px;font-weight:600;line-height:1.3;">${title}</div>
          </td>
        </tr>
        <tr><td style="padding:24px 32px 20px;">${bodyHtml}</td></tr>
        <tr>
          <td style="padding:0 32px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8e6e0;padding-top:14px;">
              <tr>
                <td style="color:#999;font-size:11px;line-height:1.5;">
                  Фондация ПЕНСА · <a href="https://pensa.club" style="color:#d4a853;text-decoration:none;">pensa.club</a> · <a href="mailto:pensa.club@gmail.com" style="color:#d4a853;text-decoration:none;">pensa.club@gmail.com</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

const foundationEmailTemplates = {
  fileUploaded: ({ uploaderName, fileName, folderPath, context }) => {
    const body = `
      <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 14px;">
        <strong>${uploaderName}</strong> качи нов файл в хранилището на фондацията.
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e8e6e0;border-radius:6px;overflow:hidden;margin-bottom:16px;">
        <tr style="background:#f9f8f5;">
          <td style="padding:8px 14px;color:#888;font-size:12px;width:90px;">Файл</td>
          <td style="padding:8px 14px;color:#333;font-size:13px;font-weight:500;">${fileName}</td>
        </tr>
        <tr>
          <td style="padding:8px 14px;color:#888;font-size:12px;border-top:1px solid #e8e6e0;">Тип</td>
          <td style="padding:8px 14px;color:#333;font-size:13px;border-top:1px solid #e8e6e0;">${context}</td>
        </tr>
        <tr style="background:#f9f8f5;">
          <td style="padding:8px 14px;color:#888;font-size:12px;border-top:1px solid #e8e6e0;">Папка</td>
          <td style="padding:8px 14px;color:#333;font-size:13px;border-top:1px solid #e8e6e0;">${folderPath}</td>
        </tr>
      </table>
    `;
    return {
      subject: `Нов ${context} в хранилището`,
      html: wrapFoundationTemplate('Нов файл качен', body),
    };
  },

  projectCreated: ({ creatorName, projectName, projectPath }) => {
    const body = `
      <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 14px;">
        <strong>${creatorName}</strong> създаде нов проект в хранилището на фондацията.
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e8e6e0;border-radius:6px;overflow:hidden;margin-bottom:16px;">
        <tr style="background:#f9f8f5;">
          <td style="padding:8px 14px;color:#888;font-size:12px;width:90px;">Проект</td>
          <td style="padding:8px 14px;color:#333;font-size:13px;font-weight:500;">${projectName}</td>
        </tr>
        <tr>
          <td style="padding:8px 14px;color:#888;font-size:12px;border-top:1px solid #e8e6e0;">Път</td>
          <td style="padding:8px 14px;color:#333;font-size:13px;border-top:1px solid #e8e6e0;">${projectPath}</td>
        </tr>
        <tr style="background:#f9f8f5;">
          <td style="padding:8px 14px;color:#888;font-size:12px;border-top:1px solid #e8e6e0;">Подпапки</td>
          <td style="padding:8px 14px;color:#333;font-size:13px;border-top:1px solid #e8e6e0;">documents/, reports/, media/</td>
        </tr>
      </table>
    `;
    return {
      subject: `Нов проект: ${projectName}`,
      html: wrapFoundationTemplate('Нов проект създаден', body),
    };
  },

  fileDeleted: ({ deleterName, fileName, filePath }) => {
    const body = `
      <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 14px;">
        <strong>${deleterName}</strong> изтри файл от хранилището на фондацията.
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e8e6e0;border-radius:6px;overflow:hidden;margin-bottom:16px;">
        <tr style="background:#fef2f2;">
          <td style="padding:8px 14px;color:#888;font-size:12px;width:90px;">Файл</td>
          <td style="padding:8px 14px;color:#dc2626;font-size:13px;font-weight:500;">${fileName}</td>
        </tr>
        <tr>
          <td style="padding:8px 14px;color:#888;font-size:12px;border-top:1px solid #e8e6e0;">Път</td>
          <td style="padding:8px 14px;color:#333;font-size:13px;border-top:1px solid #e8e6e0;">${filePath}</td>
        </tr>
      </table>
    `;
    return {
      subject: `Изтрит файл: ${fileName}`,
      html: wrapFoundationTemplate('Файл изтрит', body),
    };
  },
};

module.exports = foundationEmailTemplates;
