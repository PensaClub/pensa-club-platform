

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
    const url = `https://mail.zoho.eu/api/accounts/${process.env.ZOHO_ACCOUNT_ID}/messages`;
    const data = {
        fromAddress: 'info@pensa.club',
        toAddress: email,
        subject: subject,
        content: body,
    };

    if (!process.env.ZOHO_ACCESS_TOKEN) {
        process.env.ZOHO_ACCESS_TOKEN = await getZohoAccessToken();
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.data.errorCode === 'INVALID_OAUTHTOKEN') {
            process.env.ZOHO_ACCESS_TOKEN = '';
            return sendResetEmail(email, resetToken);
        }
        throw new Error(`Failed to send email: ${errorData}`);
    }
}

async function getZohoAccessToken() {
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing required environment variables for Zoho access token.');
    }

    // const url = `https://accounts.zoho.eu/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;

    const url = `https://accounts.zoho.eu/oauth/v2/token`;
    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'refresh_token');

    try {
        // const response = await fetch(url, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded',
        //     }
        // });

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

module.exports = sendResetEmail;
