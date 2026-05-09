// server/src/utils/networkSafety.js
//
// Shared SSRF-protection helpers used by any controller/service that fetches
// URLs supplied by users (article useful-links metadata, news bot crawlers,
// future link previewers, etc.). Centralised so we only have to harden one
// implementation when new private ranges or proxy quirks show up.

const dns = require('dns').promises;

const isPrivateIp = (ip) => {
    if (!ip) return true;
    if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') return true;
    if (ip.startsWith('::ffff:')) return isPrivateIp(ip.slice(7));
    if (/^f[cd][0-9a-f]{2}:/i.test(ip)) return true;
    if (/^fe80:/i.test(ip)) return true;

    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
};

// Validate a URL is safe to fetch from a server context: only http/https,
// hostname must resolve, and no resolved address may be private/loopback.
// Returns { ok: true, parsed } on success, or { ok: false, code, message }.
const safeFetchValidate = async (rawUrl) => {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch (_) {
        return { ok: false, code: 'INVALID_URL', message: 'Invalid URL' };
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { ok: false, code: 'BLOCKED_PROTOCOL', message: 'Only http and https are allowed' };
    }
    try {
        const lookups = await dns.lookup(parsed.hostname, { all: true });
        if (!lookups.length || lookups.some((r) => isPrivateIp(r.address))) {
            return { ok: false, code: 'BLOCKED_PRIVATE', message: 'Private or loopback target rejected' };
        }
    } catch (_) {
        return { ok: false, code: 'DNS_FAILED', message: 'DNS resolution failed' };
    }
    return { ok: true, parsed };
};

module.exports = { isPrivateIp, safeFetchValidate };
