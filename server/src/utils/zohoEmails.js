async function sendResetEmail(email, resetToken) {
    const resetLink = `${process.env.FRONTEND_SERVER}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const body = `
      <html>
        <body>
          <p>Click the following link to reset your password:</p>
          <a href="${resetLink}" style="color: #1a73e8; text-decoration: none;">${resetLink}</a>
        </body>
      </html>
    `;
    const data = {
        fromAddress: 'info@pensa.club',
        toAddress: email,
        subject,
        content: body,
    };
    return sendZohoEmailRaw(data);
}

async function forwardEmailsViaZoho({ userEmail, subject, body, toAddresses, formattedBody }) {
    const { user_account } = require('../sequelize/models');
    const admin = await user_account.findOne({
        where: { email: userEmail },
        include: [
            {
                model: require('../sequelize/models').user_details,
                as: 'details',
                attributes: ['username', 'firstName', 'lastName'],
            },
        ],
    });

    const adminName = admin?.details?.username || admin?.details?.firstName || 'Pensa Club Staff';
    const roleDisplay = admin?.role === 'admin' ? 'Администратор' : admin?.role === 'moderator' ? 'Модератор' : 'Персонал';

    const finalBody =
        formattedBody ||
        `
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
                <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); margin-top: 20px;">
                    <table cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                        <tr>
                            <td width="8" style="
                                background: linear-gradient(to bottom, #f47920, #2986c7);
                                background-color: #f47920;
                                border-radius: 4px;
                            ">
                                &nbsp;
                            </td>
                            <td style="
                                padding: 4px 0 4px 12px;
                                color: #222;
                                font-size: 18px;
                                font-weight: bold;
                            ">
                                Съобщение:
                            </td>
                        </tr>
                    </table>
                    <div style="background: #f7f7f7; padding: 16px; border-radius: 6px; color: #222; font-size: 16px; line-height: 1.6; max-height: 300px; overflow-y: auto; word-break: break-word;">
                        ${body}
                    </div>
                    <hr style="margin: 20px 0;">
                    <p style="color: #333; font-size: 14px; margin: 0; font-weight: 500;">
                        <strong>От:</strong> ${roleDisplay} ${adminName} - Pensa Club
                    </p>
                </div>
            </body>
        </html>
    `;

    const data = {
        fromAddress: 'info@pensa.club',
        toAddress: Array.isArray(toAddresses) ? toAddresses.join(',') : toAddresses,
        subject: subject,
        content: finalBody,
    };
    return sendZohoEmailRaw(data);
}

async function sendZohoEmailRaw(data) {
    const url = `https://mail.zoho.eu/api/accounts/${process.env.ZOHO_ACCOUNT_ID}/messages`;

    if (!process.env.ZOHO_ACCESS_TOKEN) {
        process.env.ZOHO_ACCESS_TOKEN = await getZohoAccessToken();
    }

    let response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.data && errorData.data.errorCode === 'INVALID_OAUTHTOKEN') {
            process.env.ZOHO_ACCESS_TOKEN = await getZohoAccessToken();
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        }
        if (!response.ok) {
            throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
        }
    }

    return response.json();
}

async function getZohoAccessToken() {
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing required environment variables for Zoho access token.');
    }

    const url = `https://accounts.zoho.eu/oauth/v2/token`;
    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'refresh_token');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to fetch access token: ${errorData.error}`);
        }

        const responseData = await response.json();
        return responseData.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error);
        throw error;
    }
}

async function sendProjectEmail({
    to,
    subject,
    message,
    title,
    description,
    category,
    applicationDeadline,
    currentParticipants,
    maxParticipants,
    status,
    location,
    link,
}) {
    const formattedSubject = `${subject}`;
    const formattedBody = `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f7fa; color: #222;">
                <div style="max-width: 800px; margin: 0 auto; background: #ffffff;">
                    <!-- Header Table for Email Compatibility -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(to right, #FF7A3D, #FF965B); border-radius: 32px 32px 0 0; padding-bottom: 16px;">
                        <tr>
                            <td align="center" style="padding: 24px 24px 0 24px;">
                                <div style="
                                    background: #fff;
                                    border-radius: 50%;
                                    width: 120px;
                                    height: 120px;
                                    margin-bottom: 12px;
                                    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                                    text-align: center;
                                    line-height: 120px;
                                ">
                                    <img src="https://firebasestorage.googleapis.com/v0/b/pensaclub-909e0.appspot.com/o/email-logo%2Fpensa_logo_green.jpg?alt=media&token=36390c4b-0a60-4bc6-86e2-1405973b5395"
                                         alt="Logo"
                                         width="80"
                                         height="80"
                                         style="vertical-align: middle;" />
                                </div>
                                <!-- Pensa Club -->
                                <div style="color: #fff; font-size: 28px; font-weight: 700; margin: 8px 0 4px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
                                    Pensa Club
                                </div>
                                <!-- Subtitle -->
                                <div style="color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 400; margin: 0 0 12px 0; text-align: center;">
                                    Социална платформа
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Content -->
                    <div style="padding: 24px 24px 16px 24px;">
                        <div style="
                            background: #f8fafc;
                            border-left: 4px solid #667eea;
                            padding: 14px 18px;
                            border-radius: 8px;
                            margin-bottom: 18px;
                        ">
                            <div style="
                                color: #222;
                                font-size: 18px;
                                font-weight: 600;
                                margin-bottom: 6px;
                            ">
                                ${subject}
                            </div>
                        </div>

                        <div style="
                            color: #222;
                            font-size: 16px;
                            line-height: 1.6;
                            margin-bottom: 18px;
                        ">
                            ${message}
                        </div>

                        <!-- Project Info -->
                        <div style="
                            background: linear-gradient(135deg, #e6fffa 0%, #f0fff4 100%);
                            border: 1px solid #9ae6b4;
                            border-radius: 12px;
                            padding: 14px 18px;
                            margin-bottom: 18px;
                        ">
                            <h3 style="
                                color: #222;
                                font-size: 16px;
                                font-weight: 600;
                                margin: 0 0 8px 0;
                            ">
                                📋 Информация за проекта
                            </h3>
                            <p style="color: #222; font-size: 15px; margin: 0; line-height: 1.5;">
                                <strong>Проект:</strong> ${title || ''}<br>
                                <strong>Описание:</strong> ${description || ''}<br>
                                <strong>Категория:</strong> ${category || '—'}<br>
                                <strong>Краен срок за кандидатстване:</strong> ${
                                    applicationDeadline ? new Date(applicationDeadline).toLocaleDateString('bg-BG') : '—'
                                }<br>
                                <strong>Участници:</strong> ${currentParticipants || 0} / ${maxParticipants || '—'}<br>
                                <strong>Статус:</strong> ${status || '—'}<br>
                                <strong>Локация:</strong> ${location || '—'}
                            </p>
                        </div>

                        <!-- CTA -->
                        <div style="text-align: center; margin: 18px 0;">
                            <a href="${link}" style="
                                background: linear-gradient(to right, #FF7A3D, #FF965B);
                                color: white;
                                padding: 10px 22px;
                                border-radius: 8px;
                                text-decoration: none;
                                font-weight: 600;
                                font-size: 16px;
                                display: inline-block;
                                box-shadow: 0 4px 12px rgb(247, 154, 79, 0.3);
                            ">
                                🌐 Виж страницата на проекта
                            </a>
                        </div>
                    </div>

                    <!-- Footer: always visible, no overflow, black text -->
                    <div style="
                        background: #f7fafc;
                        padding: 14px 24px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                        border-radius: 0 0 12px 12px;
                        color: #222;
                    ">
                        <p style="color: #222; font-size: 14px; margin: 0 0 8px 0;">
                            Това съобщение е изпратено чрез платформата <strong>Pensa Club</strong>.
                        </p>
                        <p style="color: #222; font-size: 12px; margin: 0;">
                            Ако имате въпроси, свържете се с нас на <a href="mailto:info@pensa.club" style="color: #222;">info@pensa.club</a>
                        </p>
                        <p style="color: #222; font-size: 11px; margin: 8px 0 0 0;">
                            Благодарим Ви, че сте част от нашата общност!
                        </p>
                    </div>
                </div>
            </body>
        </html>
    `;

    const emailAddresses = Array.isArray(to) ? to : [to];

    for (const email of emailAddresses) {
        const data = {
            fromAddress: 'info@pensa.club',
            toAddress: email,
            subject: formattedSubject,
            content: formattedBody,
        };
        await sendZohoEmailRaw(data);
    }
}

async function sendGuestInvitationEmail({ email, firstName, lastName, seminarTitle, invitationToken, expiresAt }) {
    const acceptLink = `${process.env.FRONTEND_SERVER}/accept-invitation?token=${invitationToken}`;
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'участник';
    const expiresStr = new Date(expiresAt).toLocaleDateString('bg-BG', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const formattedSubject = 'Добре дошли в Pensa Club — завършете регистрацията си';
    const formattedBody = `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f7fa; color: #222;">
                <div style="max-width: 800px; margin: 0 auto; background: #ffffff;">
                    <!-- Header -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(to right, #FF7A3D, #FF965B); border-radius: 32px 32px 0 0; padding-bottom: 16px;">
                        <tr>
                            <td align="center" style="padding: 24px 24px 0 24px;">
                                <div style="
                                    background: #fff;
                                    border-radius: 50%;
                                    width: 120px;
                                    height: 120px;
                                    margin-bottom: 12px;
                                    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                                    text-align: center;
                                    line-height: 120px;
                                ">
                                    <img src="https://firebasestorage.googleapis.com/v0/b/pensaclub-909e0.appspot.com/o/email-logo%2Fpensa_logo_green.jpg?alt=media&token=36390c4b-0a60-4bc6-86e2-1405973b5395"
                                         alt="Pensa Club Logo"
                                         width="80"
                                         height="80"
                                         style="vertical-align: middle;" />
                                </div>
                                <div style="color: #fff; font-size: 28px; font-weight: 700; margin: 8px 0 4px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
                                    Pensa Club
                                </div>
                                <div style="color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 400; margin: 0 0 12px 0; text-align: center;">
                                    Добре дошли!
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Content -->
                    <div style="padding: 24px 24px 16px 24px;">
                        <div style="
                            background: #f8fafc;
                            border-left: 4px solid #FF7A3D;
                            padding: 14px 18px;
                            border-radius: 8px;
                            margin-bottom: 18px;
                        ">
                            <div style="
                                color: #222;
                                font-size: 20px;
                                font-weight: 600;
                                margin-bottom: 6px;
                            ">
                                Здравейте, ${fullName}!
                            </div>
                        </div>

                        <div style="
                            color: #222;
                            font-size: 16px;
                            line-height: 1.6;
                            margin-bottom: 18px;
                        ">
                            Благодарим Ви за участието в семинар <strong>${seminarTitle || 'на Pensa Club'}</strong>.
                            <br><br>
                            Бяхте поканен да се регистрирате като пълноправен потребител в платформата <strong>Pensa Club</strong>.
                            Чрез регистрацията ще получите достъп до всички курсове, семинари и материали на DigiBridge Academy,
                            както и ще можете да следите своя прогрес и получените кредити.
                        </div>

                        <!-- Info box -->
                        <div style="
                            background: linear-gradient(135deg, #e6fffa 0%, #f0fff4 100%);
                            border: 1px solid #9ae6b4;
                            border-radius: 12px;
                            padding: 14px 18px;
                            margin-bottom: 18px;
                        ">
                            <h3 style="
                                color: #222;
                                font-size: 16px;
                                font-weight: 600;
                                margin: 0 0 8px 0;
                            ">
                                📋 Информация за поканата
                            </h3>
                            <p style="color: #222; font-size: 15px; margin: 0; line-height: 1.5;">
                                <strong>Имейл за вход:</strong> ${email}<br>
                                <strong>⏱ Валидност на линка:</strong> до ${expiresStr}<br>
                                <strong>📚 Семинар:</strong> ${seminarTitle || '—'}
                            </p>
                        </div>

                        <!-- CTA -->
                        <div style="text-align: center; margin: 24px 0;">
                            <a href="${acceptLink}" style="
                                background: linear-gradient(to right, #FF7A3D, #FF965B);
                                color: white;
                                padding: 14px 32px;
                                border-radius: 8px;
                                text-decoration: none;
                                font-weight: 600;
                                font-size: 16px;
                                display: inline-block;
                                box-shadow: 0 4px 12px rgba(247, 154, 79, 0.3);
                            ">
                                ✅ Завършете регистрацията
                            </a>
                        </div>

                        <div style="
                            background: #fff8e1;
                            border: 1px solid #ffe082;
                            border-radius: 8px;
                            padding: 12px 16px;
                            margin-bottom: 16px;
                        ">
                            <p style="color: #6d4c00; font-size: 14px; margin: 0; line-height: 1.5;">
                                ⚠️ <strong>Важно:</strong> Ако не желаете да се регистрирате в платформата,
                                просто игнорирайте това съобщение. Линкът ще изтече автоматично след 7 дни.
                            </p>
                        </div>
                    </div>

                    <!-- Footer with contacts -->
                    <div style="
                        background: #f7fafc;
                        padding: 20px 24px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                        border-radius: 0 0 12px 12px;
                        color: #222;
                    ">
                        <p style="color: #222; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">
                            Имате въпроси? Свържете се с нас:
                        </p>
                        <p style="color: #222; font-size: 14px; margin: 0 0 6px 0;">
                            📞 <a href="tel:+359895794214" style="color: #FF7A3D; text-decoration: none; font-weight: 500;">+359 89 579 4214</a>
                        </p>
                        <p style="color: #222; font-size: 14px; margin: 0 0 12px 0;">
                            📧 <a href="mailto:pensa.club@gmail.com" style="color: #FF7A3D; text-decoration: none; font-weight: 500;">pensa.club@gmail.com</a>
                        </p>
                        <p style="color: #666; font-size: 12px; margin: 12px 0 0 0;">
                            Това съобщение е изпратено чрез платформата <strong>Pensa Club</strong>.<br>
                            Благодарим Ви, че сте част от нашата общност!
                        </p>
                    </div>
                </div>
            </body>
        </html>
    `;

    const data = {
        fromAddress: 'info@pensa.club',
        toAddress: email,
        subject: formattedSubject,
        content: formattedBody,
    };
    return sendZohoEmailRaw(data);
}

async function sendAdminInitiatedResetEmail({ email, firstName, lastName, resetToken, expiresAt, hasSmsCode }) {
    const resetLink = `${process.env.FRONTEND_SERVER}/reset-password?token=${resetToken}${hasSmsCode ? '&hasSms=1' : ''}`;
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'потребител';
    const expiresStr = new Date(expiresAt).toLocaleString('bg-BG', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const formattedSubject = 'Заявка за смяна на парола — Pensa Club';
    const formattedBody = `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f7fa; color: #222;">
                <div style="max-width: 800px; margin: 0 auto; background: #ffffff;">
                    <!-- Header -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(to right, #FF7A3D, #FF965B); border-radius: 32px 32px 0 0; padding-bottom: 16px;">
                        <tr>
                            <td align="center" style="padding: 24px 24px 0 24px;">
                                <div style="
                                    background: #fff;
                                    border-radius: 50%;
                                    width: 120px;
                                    height: 120px;
                                    margin-bottom: 12px;
                                    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                                    text-align: center;
                                    line-height: 120px;
                                ">
                                    <img src="https://firebasestorage.googleapis.com/v0/b/pensaclub-909e0.appspot.com/o/email-logo%2Fpensa_logo_green.jpg?alt=media&token=36390c4b-0a60-4bc6-86e2-1405973b5395"
                                         alt="Pensa Club Logo"
                                         width="80"
                                         height="80"
                                         style="vertical-align: middle;" />
                                </div>
                                <div style="color: #fff; font-size: 28px; font-weight: 700; margin: 8px 0 4px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
                                    Pensa Club
                                </div>
                                <div style="color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 400; margin: 0 0 12px 0; text-align: center;">
                                    Смяна на парола
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Content -->
                    <div style="padding: 24px 24px 16px 24px;">
                        <div style="
                            background: #f8fafc;
                            border-left: 4px solid #FF7A3D;
                            padding: 14px 18px;
                            border-radius: 8px;
                            margin-bottom: 18px;
                        ">
                            <div style="
                                color: #222;
                                font-size: 20px;
                                font-weight: 600;
                                margin-bottom: 6px;
                            ">
                                Здравейте, ${fullName}!
                            </div>
                        </div>

                        <div style="
                            color: #222;
                            font-size: 16px;
                            line-height: 1.6;
                            margin-bottom: 18px;
                        ">
                            Получихме заявка за смяна на паролата Ви в платформата <strong>Pensa Club</strong>.
                            Тази заявка беше инициирана от администратор по Ваше искане.
                            <br><br>
                            За да зададете нова парола, моля кликнете върху бутона по-долу:
                        </div>

                        ${hasSmsCode ? `
                        <div style="
                            background: #fff8e1;
                            border: 1px solid #ffe082;
                            border-radius: 8px;
                            padding: 14px 18px;
                            margin-bottom: 18px;
                        ">
                            <p style="color: #6d4c00; font-size: 15px; margin: 0 0 6px 0; font-weight: 600;">
                                🔒 Допълнителна сигурност чрез SMS
                            </p>
                            <p style="color: #6d4c00; font-size: 14px; margin: 0; line-height: 1.5;">
                                Изпратили сме Ви <strong>6-цифрен код</strong> на телефона Ви.
                                При смяна на паролата ще бъдете помолен да въведете кода.
                                <br>
                                Имате право на <strong>5 опита</strong>. Не споделяйте кода с никого!
                            </p>
                        </div>
                        ` : ''}

                        <!-- Info box -->
                        <div style="
                            background: linear-gradient(135deg, #e6fffa 0%, #f0fff4 100%);
                            border: 1px solid #9ae6b4;
                            border-radius: 12px;
                            padding: 14px 18px;
                            margin-bottom: 18px;
                        ">
                            <h3 style="
                                color: #222;
                                font-size: 16px;
                                font-weight: 600;
                                margin: 0 0 8px 0;
                            ">
                                📋 Информация за заявката
                            </h3>
                            <p style="color: #222; font-size: 15px; margin: 0; line-height: 1.5;">
                                <strong>Имейл:</strong> ${email}<br>
                                <strong>⏱ Валидност на линка:</strong> до ${expiresStr}<br>
                                <strong>🔐 SMS код:</strong> ${hasSmsCode ? 'ДА (изпратен на телефона Ви)' : 'НЕ'}
                            </p>
                        </div>

                        <!-- CTA -->
                        <div style="text-align: center; margin: 24px 0;">
                            <a href="${resetLink}" style="
                                background: linear-gradient(to right, #FF7A3D, #FF965B);
                                color: white;
                                padding: 14px 32px;
                                border-radius: 8px;
                                text-decoration: none;
                                font-weight: 600;
                                font-size: 16px;
                                display: inline-block;
                                box-shadow: 0 4px 12px rgba(247, 154, 79, 0.3);
                            ">
                                🔑 Смени паролата
                            </a>
                        </div>

                        <div style="
                            background: #fee2e2;
                            border: 1px solid #fca5a5;
                            border-radius: 8px;
                            padding: 12px 16px;
                            margin-bottom: 16px;
                        ">
                            <p style="color: #991b1b; font-size: 14px; margin: 0; line-height: 1.5;">
                                ⚠️ <strong>Не сте поискали смяна на парола?</strong>
                                Моля игнорирайте това съобщение и незабавно се свържете с нас.
                                Линкът ще изтече автоматично след 24 часа.
                            </p>
                        </div>
                    </div>

                    <!-- Footer with contacts -->
                    <div style="
                        background: #f7fafc;
                        padding: 20px 24px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                        border-radius: 0 0 12px 12px;
                        color: #222;
                    ">
                        <p style="color: #222; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">
                            Имате въпроси? Свържете се с нас:
                        </p>
                        <p style="color: #222; font-size: 14px; margin: 0 0 6px 0;">
                            📞 <a href="tel:+359895794214" style="color: #FF7A3D; text-decoration: none; font-weight: 500;">+359 89 579 4214</a>
                        </p>
                        <p style="color: #222; font-size: 14px; margin: 0 0 12px 0;">
                            📧 <a href="mailto:pensa.club@gmail.com" style="color: #FF7A3D; text-decoration: none; font-weight: 500;">pensa.club@gmail.com</a>
                        </p>
                        <p style="color: #666; font-size: 12px; margin: 12px 0 0 0;">
                            Това съобщение е изпратено чрез платформата <strong>Pensa Club</strong>.<br>
                            Благодарим Ви, че сте част от нашата общност!
                        </p>
                    </div>
                </div>
            </body>
        </html>
    `;

    const data = {
        fromAddress: 'info@pensa.club',
        toAddress: email,
        subject: formattedSubject,
        content: formattedBody,
    };
    return sendZohoEmailRaw(data);
}

module.exports = {
    sendResetEmail,
    forwardEmailsViaZoho,
    sendProjectEmail,
    sendGuestInvitationEmail,
    sendAdminInitiatedResetEmail,
};
