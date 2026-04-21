// server/src/utils/botUserAgent.js
//
// Lightweight UA-based bot check used by the content-view tracker.
// Kept separate from middlewares/botDetector.js (which handles social
// scrapers and meta generation) to avoid circular imports.

const BOT_PATTERNS = [
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'whatsapp',
  'telegrambot',
  'googlebot',
  'bingbot',
  'yandex',
  'baiduspider',
  'duckduckbot',
  'ahrefsbot',
  'semrushbot',
  'mj12bot',
  'dotbot',
  'petalbot',
  'applebot',
  'crawler',
  'spider',
  'bot/',
  'headlesschrome',
  'phantomjs',
  'puppeteer',
  'playwright',
  'curl/',
  'wget/',
  'python-requests',
  'go-http-client',
];

const isBotUserAgent = (userAgent) => {
  if (!userAgent) return true; // missing UA is suspicious → treat as bot
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some((p) => ua.includes(p));
};

module.exports = { isBotUserAgent };
