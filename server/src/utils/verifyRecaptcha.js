async function verifyRecaptcha(token) {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) throw new Error('Missing reCAPTCHA secret key');

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            secret,
            response: token,
        }),
    });

    if (!response.ok) throw new Error('Failed to verify reCAPTCHA');

    return response.json();
}

module.exports = verifyRecaptcha;
