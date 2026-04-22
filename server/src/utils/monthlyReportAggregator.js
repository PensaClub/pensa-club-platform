// server/src/utils/monthlyReportAggregator.js
//
// Collects the data the monthly newsletter report needs for a given
// date range. Pure data layer — no HTML, no email, no cron logic.
//
// Ranges are inclusive on `from`, exclusive on `to`.
// All queries are independent so Promise.all is safe.

const { Op, fn, col } = require('sequelize');
const models = require('../sequelize/models');
const {
  seminar,
  article,
  course,
  initiative,
  project,
  publication,
  Club,
  user_account,
  student_seminar,
  seminar_guest_attendance,
} = models;
const contentViewController = require('../controllers/contentViewController');
const {
  includeForContentImage,
  resolveContentImage,
} = require('./contentImageResolver');

const createdBetween = (from, to) => ({
  createdAt: { [Op.gte]: from, [Op.lt]: to },
});

const countIn = (model, from, to, extraWhere = {}) =>
  model.count({ where: { ...createdBetween(from, to), ...extraWhere } });

const getMonthlyStats = async (from, to) => {
  const [
    newSeminars,
    newArticles,
    newCourses,
    newInitiatives,
    newProjects,
    newPublications,
    newClubs,
    newUsers,
  ] = await Promise.all([
    countIn(seminar, from, to),
    countIn(article, from, to),
    countIn(course, from, to),
    countIn(initiative, from, to),
    countIn(project, from, to),
    countIn(publication, from, to),
    countIn(Club, from, to),
    countIn(user_account, from, to),
  ]);

  return {
    newSeminars,
    newArticles,
    newCourses,
    newInitiatives,
    newProjects,
    newPublications,
    newClubs,
    newUsers,
  };
};

const getTopSeminarsByAttendance = async (from, to, limit = 3) => {
  const studentRows = await student_seminar.findAll({
    attributes: ['seminarId', [fn('COUNT', col('id')), 'cnt']],
    where: {
      attended: true,
      attendedAt: { [Op.gte]: from, [Op.lt]: to },
    },
    group: ['seminar_id'],
    raw: true,
  });

  const guestRows = await seminar_guest_attendance.findAll({
    attributes: ['seminarId', [fn('COUNT', col('id')), 'cnt']],
    where: createdBetween(from, to),
    group: ['seminar_id'],
    raw: true,
  });

  const totals = new Map();
  const addRows = (rows) => {
    rows.forEach((r) => {
      const id = Number(r.seminarId);
      const cnt = Number(r.cnt) || 0;
      totals.set(id, (totals.get(id) || 0) + cnt);
    });
  };
  addRows(studentRows);
  addRows(guestRows);

  const ranked = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (ranked.length === 0) return [];

  const ids = ranked.map(([id]) => id);
  const seminars = await seminar.findAll({
    where: { id: { [Op.in]: ids } },
    attributes: ['id', 'title', 'slug', 'thumbnailUrl', 'scheduledDate'],
    raw: true,
  });
  const seminarById = new Map(seminars.map((s) => [s.id, s]));

  return ranked
    .map(([id, attendanceCount]) => {
      const s = seminarById.get(id);
      if (!s) return null;
      return {
        id: s.id,
        title: s.title,
        slug: s.slug,
        thumbnailUrl: resolveContentImage(s, 'seminar'),
        scheduledDate: s.scheduledDate,
        attendanceCount,
      };
    })
    .filter(Boolean);
};

// Placeholders — will be backed by the content_views tracker (Phase 5.2).
// Current behaviour: return latest items in the range so the report never
// comes back empty. Once the tracker ships, these read real view counts.
//
// `contentType` lets us include the right image association so thumbnails
// resolve cleanly through `resolveContentImage` (which has its own fallback
// chain ending at the Pensa Club logo placeholder).
const latestFallback = async (model, contentType, from, to, limit, mapFn) => {
  const include = includeForContentImage(contentType, models);
  const rows = await model.findAll({
    where: createdBetween(from, to),
    order: [['createdAt', 'DESC']],
    include,
    limit,
  });
  return rows.map((row) => mapFn(row, resolveContentImage(row, contentType)));
};

const getTopFromTracker = async (contentType, from, to, limit) => {
  try {
    const top = await contentViewController.getTopByType({
      contentType,
      from,
      to,
      limit,
    });
    if (!top.length) return [];
    const ids = top.map((r) => r.contentId);
    const resolved = await contentViewController.resolveContentForType(
      contentType,
      ids
    );
    return top
      .map(({ contentId, views }) => {
        const row = resolved.get(contentId);
        if (!row) return null;
        return { ...row, views, isFallback: false };
      })
      .filter(Boolean);
  } catch (error) {
    console.error(`getTopFromTracker(${contentType}) failed:`, error.message);
    return [];
  }
};

const getTopArticlesByViews = async (from, to, limit = 3) => {
  const tracked = await getTopFromTracker('article', from, to, limit);
  if (tracked.length > 0) return tracked;
  return latestFallback(article, 'article', from, to, limit, (r, thumb) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    thumbnailUrl: thumb,
    views: null,
    isFallback: true,
  }));
};

const getTopCoursesByViews = async (from, to, limit = 3) => {
  const tracked = await getTopFromTracker('course', from, to, limit);
  if (tracked.length > 0) return tracked;
  return latestFallback(course, 'course', from, to, limit, (r, thumb) => ({
    id: r.id,
    title: r.name,
    slug: r.slug,
    thumbnailUrl: thumb,
    views: null,
    isFallback: true,
  }));
};

const getUpcomingNextMonth = async (from, to) => {
  const [seminars, initiatives] = await Promise.all([
    seminar.findAll({
      where: {
        scheduledDate: { [Op.gte]: from, [Op.lt]: to },
        isPublished: true,
        status: { [Op.notIn]: ['cancelled'] },
      },
      attributes: ['id', 'title', 'slug', 'thumbnailUrl', 'scheduledDate'],
      order: [['scheduledDate', 'ASC']],
      limit: 10,
      raw: true,
    }),
    initiative.findAll({
      where: createdBetween(from, to),
      attributes: ['id', 'title', 'slug'],
      order: [['createdAt', 'ASC']],
      limit: 10,
      raw: true,
    }),
  ]);

  return { seminars, initiatives };
};

// Convenience: compute default [from, to) for "previous month" in Europe/Sofia.
// Uses the server's local interpretation; the cron already runs in Sofia TZ,
// so `new Date()` there reflects the right wall-clock moment.
const getPreviousMonthRange = (reference = new Date()) => {
  const y = reference.getFullYear();
  const m = reference.getMonth();
  const from = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const to = new Date(y, m, 1, 0, 0, 0, 0);
  return { from, to };
};

const getNextMonthRange = (reference = new Date()) => {
  const y = reference.getFullYear();
  const m = reference.getMonth();
  const from = new Date(y, m + 1, 1, 0, 0, 0, 0);
  const to = new Date(y, m + 2, 1, 0, 0, 0, 0);
  return { from, to };
};

module.exports = {
  getMonthlyStats,
  getTopSeminarsByAttendance,
  getTopArticlesByViews,
  getTopCoursesByViews,
  getUpcomingNextMonth,
  getPreviousMonthRange,
  getNextMonthRange,
};
