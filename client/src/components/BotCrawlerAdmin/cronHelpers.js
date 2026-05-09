// Helpers for converting between human-friendly schedule choices and
// cron expressions. Supports a constrained set of common patterns the
// admin UI exposes; falls back to "custom" raw cron for anything outside.

export const SCHEDULE_MODES = {
    MINUTES: 'minutes',
    HOURS: 'hours',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    CUSTOM: 'custom',
};

const pad2 = (n) => String(n).padStart(2, '0');

// Build cron string from a structured schedule object.
export const buildCron = (s) => {
    if (!s || s.mode === SCHEDULE_MODES.CUSTOM) {
        return (s && s.cron) || '0 * * * *';
    }
    const minute = Number.isFinite(s.minute) ? s.minute : 0;
    const hour = Number.isFinite(s.hour) ? s.hour : 9;
    switch (s.mode) {
        case SCHEDULE_MODES.MINUTES: {
            const every = Math.max(1, Math.min(59, s.every || 30));
            return `*/${every} * * * *`;
        }
        case SCHEDULE_MODES.HOURS: {
            const every = Math.max(1, Math.min(23, s.every || 1));
            return `0 */${every} * * *`;
        }
        case SCHEDULE_MODES.DAILY: {
            return `${minute} ${hour} * * *`;
        }
        case SCHEDULE_MODES.WEEKLY: {
            const days = Array.isArray(s.days) && s.days.length > 0
                ? [...s.days].sort((a, b) => a - b).join(',')
                : '1-5';
            return `${minute} ${hour} * * ${days}`;
        }
        default:
            return '0 * * * *';
    }
};

// Parse a cron string back into a structured schedule object so the UI
// can pre-select the right mode when editing an existing bot.
export const parseCron = (cron) => {
    const fallback = { mode: SCHEDULE_MODES.CUSTOM, cron: cron || '0 * * * *', every: 1, hour: 9, minute: 0, days: [1, 2, 3, 4, 5] };
    if (!cron || typeof cron !== 'string') return fallback;
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) return fallback;
    const [m, h, dom, mon, dow] = parts;

    const minNum = Number(m);
    const hourNum = Number(h);

    // */N * * * * → every N minutes
    if (/^\*\/(\d+)$/.test(m) && h === '*' && dom === '*' && mon === '*' && dow === '*') {
        return { mode: SCHEDULE_MODES.MINUTES, every: parseInt(m.slice(2), 10), hour: 9, minute: 0, days: [1, 2, 3, 4, 5], cron };
    }
    // 0 */N * * * → every N hours
    if (m === '0' && /^\*\/(\d+)$/.test(h) && dom === '*' && mon === '*' && dow === '*') {
        return { mode: SCHEDULE_MODES.HOURS, every: parseInt(h.slice(2), 10), hour: 9, minute: 0, days: [1, 2, 3, 4, 5], cron };
    }
    // M H * * * → daily at H:M
    if (Number.isInteger(minNum) && minNum >= 0 && minNum < 60 &&
        Number.isInteger(hourNum) && hourNum >= 0 && hourNum < 24 &&
        dom === '*' && mon === '*' && dow === '*') {
        return { mode: SCHEDULE_MODES.DAILY, every: 1, hour: hourNum, minute: minNum, days: [1, 2, 3, 4, 5], cron };
    }
    // M H * * D,D,D → weekly
    if (Number.isInteger(minNum) && minNum >= 0 && minNum < 60 &&
        Number.isInteger(hourNum) && hourNum >= 0 && hourNum < 24 &&
        dom === '*' && mon === '*' && /^[\d,\-]+$/.test(dow)) {
        const days = expandDays(dow);
        if (days.length > 0) {
            return { mode: SCHEDULE_MODES.WEEKLY, every: 1, hour: hourNum, minute: minNum, days, cron };
        }
    }
    return fallback;
};

const expandDays = (spec) => {
    const out = new Set();
    spec.split(',').forEach((p) => {
        if (p.includes('-')) {
            const [a, b] = p.split('-').map(Number);
            if (Number.isInteger(a) && Number.isInteger(b) && a <= b) {
                for (let i = a; i <= b; i++) out.add(i);
            }
        } else {
            const n = Number(p);
            if (Number.isInteger(n) && n >= 0 && n <= 6) out.add(n);
        }
    });
    return Array.from(out).sort();
};

// Human-readable summary of a structured schedule. Used as a "you've chosen" line.
// Returns translated strings via the t function passed in.
export const summarize = (s, t) => {
    if (!s) return '';
    const mm = (n) => pad2(n);
    switch (s.mode) {
        case SCHEDULE_MODES.MINUTES:
            return t('bot.scheduleSummary.minutes', { count: s.every });
        case SCHEDULE_MODES.HOURS:
            return t('bot.scheduleSummary.hours', { count: s.every });
        case SCHEDULE_MODES.DAILY:
            return t('bot.scheduleSummary.daily', { time: `${pad2(s.hour)}:${mm(s.minute)}` });
        case SCHEDULE_MODES.WEEKLY: {
            const dayLabels = (s.days || []).map((d) => t(`bot.weekday.${d}`));
            return t('bot.scheduleSummary.weekly', { days: dayLabels.join(', '), time: `${pad2(s.hour)}:${mm(s.minute)}` });
        }
        case SCHEDULE_MODES.CUSTOM:
            return t('bot.scheduleSummary.custom', { cron: s.cron });
        default:
            return '';
    }
};
