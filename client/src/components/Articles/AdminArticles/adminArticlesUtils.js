// Helpers shared by AdminArticleCard / AdminArticleListRow (Phase 2).

/**
 * Format an ISO timestamp as a relative duration ("преди 3 дни"). Falls back
 * to the absolute locale date if the value is too far in the past or in the
 * future (we never want to show "in 5 days").
 *
 * Uses i18n keys from the `adminArticles.relativeTime` namespace.
 *
 * @param {string|number|Date} when
 * @param {(key: string, opts?: object) => string} t — already-bound t() instance
 * @param {string} lang — current i18n language code (for date fallback)
 * @returns {string}
 */
export function formatRelative(when, t, lang = 'bg') {
  if (!when || !t) return '';
  const dt = when instanceof Date ? when : new Date(when);
  if (Number.isNaN(dt.getTime())) return '';

  const now = Date.now();
  const diffMs = now - dt.getTime();

  // Future timestamps — fall back to absolute date (avoid "in X days" UX).
  if (diffMs < 0) {
    try {
      return dt.toLocaleDateString(lang || 'bg', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return dt.toISOString();
    }
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return t('relativeTime.justNow');
  if (diffMs < hour) {
    const count = Math.floor(diffMs / minute);
    return t('relativeTime.minutesAgo', { count });
  }
  if (diffMs < day) {
    const count = Math.floor(diffMs / hour);
    return t('relativeTime.hoursAgo', { count });
  }
  if (diffMs < 30 * day) {
    const count = Math.floor(diffMs / day);
    return t('relativeTime.daysAgo', { count });
  }
  if (diffMs < 365 * day) {
    const count = Math.floor(diffMs / (30 * day));
    return t('relativeTime.monthsAgo', { count });
  }
  const count = Math.floor(diffMs / (365 * day));
  return t('relativeTime.yearsAgo', { count });
}

/**
 * Strip HTML and clamp a string to the given character count.
 */
export function truncatePlain(text, max = 120) {
  if (!text) return '';
  const plain = String(text).replace(/<[^>]*>?/gm, '');
  if (plain.length <= max) return plain;
  return plain.substr(0, max) + '...';
}

/**
 * Build the URLSearchParams snapshot for the current admin filter state.
 * Centralized so both the page query effect and the URL hash logic share the
 * same key set / serialization.
 */
export function serializeAdminParams(state) {
  return {
    page: state.page,
    limit: state.limit,
    sort: state.sort,
    order: state.order,
    status: state.status,
    search: state.search?.trim() || undefined,
    author: state.author || undefined,
    tag: state.tag || undefined,
    dateFrom: state.dateFrom || undefined,
    dateTo: state.dateTo || undefined,
    publicOnly: false,
  };
}
