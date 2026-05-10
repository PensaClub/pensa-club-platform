// server/src/utils/robotsTxt.js
//
// Tiny robots.txt parser used by the crawler validation flow. Honours
// User-Agent groups (longest matching agent wins, with `*` as fallback),
// Disallow/Allow rules, and Crawl-delay. Path matching is the standard
// "longest prefix" approach with `*` and `$` wildcards as documented in
// Google's robots.txt spec — sufficient for our needs.

const OUR_AGENT = 'PensaClubNewsBot';

const escapeRegex = (s) => s.replace(/[.+^${}()|[\]\\]/g, '\\$&');

// Convert a robots.txt path pattern to a RegExp. Supports `*` (any chars)
// and `$` (end of path).
const patternToRegex = (pattern) => {
    if (!pattern) return /(?:)/;
    let pat = pattern;
    const hasEnd = pat.endsWith('$');
    if (hasEnd) pat = pat.slice(0, -1);
    const parts = pat.split('*').map(escapeRegex);
    const body = parts.join('.*');
    return new RegExp('^' + body + (hasEnd ? '$' : ''));
};

// Parse a raw robots.txt body into a map of agent -> { disallow, allow,
// crawlDelay }. Lines starting with `#` and blank lines are skipped.
const parseRobotsTxt = (body) => {
    const groups = new Map();
    if (!body || typeof body !== 'string') return groups;

    const lines = body.split(/\r?\n/);
    let currentAgents = [];
    let pendingNewGroup = false;

    const ensureAgent = (a) => {
        const key = a.toLowerCase();
        if (!groups.has(key)) {
            groups.set(key, { disallow: [], allow: [], crawlDelay: null });
        }
        return groups.get(key);
    };

    for (const rawLine of lines) {
        const stripped = rawLine.replace(/#.*/, '').trim();
        if (!stripped) continue;
        const colon = stripped.indexOf(':');
        if (colon === -1) continue;
        const field = stripped.slice(0, colon).trim().toLowerCase();
        const value = stripped.slice(colon + 1).trim();

        if (field === 'user-agent') {
            if (pendingNewGroup === false && currentAgents.length > 0) {
                // Hitting a new user-agent right after directives starts a
                // new group; before any directive, keep collecting agents.
                currentAgents = [];
            }
            currentAgents.push(value);
            ensureAgent(value);
            pendingNewGroup = false;
            continue;
        }

        if (currentAgents.length === 0) continue;
        pendingNewGroup = true;

        if (field === 'disallow') {
            for (const a of currentAgents) ensureAgent(a).disallow.push(value);
        } else if (field === 'allow') {
            for (const a of currentAgents) ensureAgent(a).allow.push(value);
        } else if (field === 'crawl-delay') {
            const n = parseFloat(value);
            if (Number.isFinite(n) && n >= 0) {
                for (const a of currentAgents) {
                    const g = ensureAgent(a);
                    if (g.crawlDelay == null || n > g.crawlDelay) g.crawlDelay = n;
                }
            }
        }
    }

    return groups;
};

// Pick the group that matches our agent (case-insensitive substring), falling
// back to `*`. Returns { disallow, allow, crawlDelay } or null.
const pickGroup = (groups, agent = OUR_AGENT) => {
    if (!groups || groups.size === 0) return null;
    const want = agent.toLowerCase();
    let best = null;
    let bestLen = -1;
    for (const [key, value] of groups.entries()) {
        if (key === '*') continue;
        if (want.includes(key) || key.includes(want)) {
            if (key.length > bestLen) {
                best = value;
                bestLen = key.length;
            }
        }
    }
    if (best) return best;
    return groups.get('*') || null;
};

// Decide whether a path is allowed under a parsed group. Uses the
// longest-match-wins rule: the longest matching Allow vs Disallow pattern
// wins. An empty Disallow value means "allow all".
const isPathAllowed = (group, path) => {
    if (!group) return true;
    let bestAllow = -1;
    let bestDisallow = -1;
    for (const p of group.allow) {
        if (!p) continue;
        if (patternToRegex(p).test(path) && p.length > bestAllow) bestAllow = p.length;
    }
    for (const p of group.disallow) {
        if (!p) continue; // Empty disallow = allow all.
        if (patternToRegex(p).test(path) && p.length > bestDisallow) bestDisallow = p.length;
    }
    if (bestDisallow === -1) return true;
    return bestAllow >= bestDisallow;
};

// Top-level helper — parse + pick + check path.
// Returns: { allowed, crawlDelay, matchedAgent: 'PensaClubNewsBot' | '*' | null }
const evaluateRobots = (body, urlString, agent = OUR_AGENT) => {
    const out = { allowed: true, crawlDelay: 0, matchedAgent: null };
    if (!body || typeof body !== 'string') return out;

    let path = '/';
    try {
        const u = new URL(urlString);
        path = u.pathname + (u.search || '');
    } catch (_) {
        return out;
    }

    const groups = parseRobotsTxt(body);
    if (!groups.size) return out;

    const group = pickGroup(groups, agent);
    if (!group) return out;

    out.matchedAgent = groups.has(agent.toLowerCase()) ? agent : '*';
    out.allowed = isPathAllowed(group, path);
    out.crawlDelay = Number.isFinite(group.crawlDelay) ? group.crawlDelay : 0;
    return out;
};

module.exports = {
    OUR_AGENT,
    parseRobotsTxt,
    pickGroup,
    isPathAllowed,
    evaluateRobots,
};
