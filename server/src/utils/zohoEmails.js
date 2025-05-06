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

async function forwardEmailsViaZoho({ name, userEmail, subject, body, toAddresses }) {
    const formattedSubject = `[Contact Form] ${name} <${userEmail}> | Subject - ${subject}`;
    const formattedBody = `
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
                <div style="
                    padding: 12px 0 12px 16px;
                    margin: 20px 0 0 0;
                    text-align: left;
                    color: #222;
                    font-size: 20px;
                    font-weight: bold;
                    background: #fff;
                    position: relative;
                    overflow: hidden;
                ">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #fff; margin-bottom: 20px;">
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
                                font-size: 20px;
                                font-weight: bold;
                            ">
                                ${subject}
                            </td>
                        </tr>
                    </table>
                </div>
                <div style="background: #fff; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); margin-top: 16px;">
                    <p><strong>From:</strong> ${name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
                    <hr style="margin: 20px 0;">
                    <table cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
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
                                Message:
                            </td>
                        </tr>
                    </table>
                    <div style="background: #f7f7f7; padding: 16px; border-radius: 6px; color: #222; font-size: 16px; line-height: 1.6; max-height: 300px; overflow-y: auto; word-break: break-word;">
                        ${body}
                    </div>
                </div>
            </body>
        </html>
    `;
    const data = {
        fromAddress: 'info@pensa.club',
        toAddress: Array.isArray(toAddresses) ? toAddresses.join(',') : toAddresses,
        subject: formattedSubject,
        content: formattedBody,
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

module.exports = {
    sendResetEmail,
    forwardEmailsViaZoho,
};
