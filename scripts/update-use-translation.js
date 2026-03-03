/**
 * Update useTranslation() calls in all component files to specify namespaces.
 *
 * Usage:
 *   node scripts/update-use-translation.js          # Apply changes
 *   node scripts/update-use-translation.js --dry-run # Preview changes only
 *
 * This script:
 * 1. Scans all .jsx and .js files in client/src/
 * 2. Finds t('key.subkey') patterns to determine which namespace(s) each file uses
 * 3. Updates useTranslation() calls to specify the correct namespace(s)
 * 4. Updates <Trans> components with ns prop where needed
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const CLIENT_SRC = path.join(__dirname, '..', 'client', 'src');

// Same mapping as split-translations.js — key prefix -> namespace
const KEY_TO_NAMESPACE = {};
const NAMESPACE_MAP = {
  common: [
    'header', 'footer', 'common', 'loading', 'errors', 'validation',
    'error-page', 'cookieConsent', 'privacyPolicy', 'pending', 'results',
    'location', 'months', 'notify_modal', 'localStorage', 'counts',
    'profile', 'notification', 'christmasGreeting', 'chatWidget',
  ],
  home: [
    'home', 'hero', 'motto', 'about', 'news-subscribe', 'clubsShowcase',
    'partners', 'platformStats',
  ],
  auth: [
    'form', 'forms', 'options', 'avatar', 'eliteCard',
    'eliteMembership', 'contact', 'user-suggestion', 'search-criteria',
    'admin_messages',
  ],
  content: [
    'articles', 'initiatives', 'projects', 'stories', 'publications',
    'publicationStories', 'projectView', 'projectDetails', 'storyPubView',
    'applicationForm', 'applications', 'drafts', 'comments', 'share',
    'bookmarks',
  ],
  community: [
    'community', 'ads', 'map',
  ],
  clubs: [
    'clubs', 'clubForm', 'myClubs', 'draftClubs', 'draftClubsCard',
    'searchDraftClubsBar', 'draftClubsFilterDropdown', 'draftClubsSortDropdown',
    'draftStatsOverview', 'draftClubsEmptyState', 'membershipClubs',
    'membershipClubsCard', 'searchMembershipClubsBar',
    'membershipClubsFilterDropdown', 'membershipClubsSortDropdown',
    'membershipStatsOverview', 'membershipClubsEmptyState', 'clubsAdmin',
    'adminClubCard', 'adminStatsOverview', 'adminClubFilters', 'adminSearchBar',
    'adminClubActions', 'adminClubModal',
  ],
  academy: [
    'academyCourses', 'academyCoursesHero', 'academyCoursesFilters',
    'academyCoursesCategorySection', 'academyProgramTracks', 'academyCoursesList',
    'academyCourseCard', 'academyTrailerModal', 'academyCourseDetail',
    'academyLessonPlayer', 'academyTestPlayer', 'academyCoursesSeo',
    'academyLectures', 'academyLectureWatch', 'academyLectureTest',
    'academyLectureDetails', 'academyLecturesSeo', 'academyMentorPicker',
  ],
  'academy-admin': [
    'courseFormHook', 'courseCreateForm', 'courseStepBasicInfo',
    'courseStepSettings', 'courseStepModules', 'courseStepPreview',
    'adminCourses', 'editCourse', 'contentManager', 'editLesson',
    'testEditor', 'lectureCreateForm', 'adminLectures', 'editLecture',
  ],
  digibridge: [
    'digiBridge', 'AdminDigiBridgeMentors', 'AdminNotificationBell',
    'AdminDigiBridgeMentorApplications', 'ApplicationsStats',
    'ApplicationsFilters', 'AdminDigiBridgeApplicationCard',
    'AdminDigiBridgeApplicationDetailModal',
    'AdminDigiBridgeSendEmailToApplicantModal',
    'AdminDigiBridgeMentorStatistics', 'StatisticsOverviewCards',
    'TopMentorsByCourses', 'TopMentorsByOnlineTime', 'ActivityTrendChart',
    'SessionQualityChart', 'ResponseTimeChart', 'MentorsBySpecialization',
    'DetailedMentorsTable', 'ExportStatistics', 'OverviewCardsSkeleton',
    'ChartSkeleton', 'TableSkeleton', 'reviewsManagement',
    'headerReviewsManagement', 'listReviewsManagement',
    'modalReviewDetails', 'modalReviewAction', 'mentorReviewModal',
  ],
  'digibridge-mentor': [
    'digiMentorPanel', 'digiMentorStats', 'digiMentorQuickActions',
    'digiMentorRecentActivity', 'digiMentorUpcomingSessions',
    'digiMentorStudentsList', 'digiMentorPerformanceChart', 'mentorMeetings',
    'mentorProfileEdit', 'addMeetingModal', 'editMeetingModal',
    'completeMeetingModal', 'studentDetails', 'digiMentorReviews',
    'digiMentorReviewsHeader', 'digiMentorReviewsFilters',
    'digiMentorReviewCard', 'mentorProfile', 'mentorModal',
    'studentApplications', 'pendingApplications', 'rejectedApplications',
    'approvedApplications',
  ],
  'digibridge-students': [
    'adminDigiBridgeStudents', 'adminDgStudentDetailsModal',
    'adminDgDeleteStudentConfirm', 'adminDgEditStudentModal',
    'adminDgChangeMentorModal', 'adminDgSendEmailModal',
    'adminDgStudentsFilters', 'adminStudentApplications', 'charts',
    'applicationsByStatusChart', 'applicationsByMentorChart',
    'adminDgStudentNotes', 'sendEmailModal',
  ],
  'student-dashboard': [
    'studentDashboard', 'studentDashboardHeader', 'studentQuickStats',
    'studentContinueLearning', 'studentUpcomingEvents', 'studentMentorCard',
    'studentCertificates', 'studentCreditsOverview', 'studentRecentActivity',
  ],
  admin: [
    'admin', 'siteSettingsAdmin', 'games',
  ],
};

// Build reverse map: key prefix -> namespace
for (const [ns, keys] of Object.entries(NAMESPACE_MAP)) {
  for (const key of keys) {
    KEY_TO_NAMESPACE[key] = ns;
  }
}

// Stats
let filesScanned = 0;
let filesModified = 0;
let filesSkipped = 0;
const modifiedFiles = [];
const errorFiles = [];

function getAllFiles(dir, extensions = ['.jsx', '.js']) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      // Skip node_modules and test directories
      if (item.name === 'node_modules' || item.name === '__tests__') continue;
      results.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractTranslationKeys(content) {
  const keys = new Set();

  // Match t('key.subkey'), t("key.subkey"), t(`key.subkey`)
  // Also matches t('key.subkey', ...) with additional args
  const tCallRegex = /\bt\(\s*['"`]([a-zA-Z_-][a-zA-Z0-9_-]*)\.([^'"`]*?)['"`]/g;
  let match;
  while ((match = tCallRegex.exec(content)) !== null) {
    keys.add(match[1]);
  }

  // Match t(`key.${...}`) - template literals with dynamic parts
  const tTemplateRegex = /\bt\(\s*`([a-zA-Z_-][a-zA-Z0-9_-]*)\./g;
  while ((match = tTemplateRegex.exec(content)) !== null) {
    keys.add(match[1]);
  }

  // Match <Trans i18nKey="key.subkey" /> or i18nKey='key.subkey'
  const transRegex = /i18nKey\s*=\s*['"`]([a-zA-Z_-][a-zA-Z0-9_-]*)\.([^'"`]*?)['"`]/g;
  while ((match = transRegex.exec(content)) !== null) {
    keys.add(match[1]);
  }

  return keys;
}

function getNamespacesForKeys(keys) {
  const namespaces = new Map(); // namespace -> count of keys

  for (const key of keys) {
    const ns = KEY_TO_NAMESPACE[key];
    if (ns) {
      namespaces.set(ns, (namespaces.get(ns) || 0) + 1);
    }
  }

  return namespaces;
}

function processFile(filePath) {
  filesScanned++;
  const content = fs.readFileSync(filePath, 'utf8');

  // Skip files that don't use translations
  if (!content.includes('useTranslation') && !content.includes('i18nKey')) {
    return;
  }

  const keys = extractTranslationKeys(content);
  if (keys.size === 0) {
    return;
  }

  const namespaceCounts = getNamespacesForKeys(keys);

  // Remove 'common' from the namespace list — it's handled by fallbackNS
  namespaceCounts.delete('common');

  let newContent = content;
  let changed = false;

  // If only common keys, ensure useTranslation has no namespace arg
  if (namespaceCounts.size === 0) {
    if (content.includes('useTranslation')) {
      const useTransRegex = /useTranslation\([^)]*\)/g;
      const currentCall = content.match(useTransRegex);
      if (currentCall && currentCall[0] !== 'useTranslation()') {
        newContent = newContent.replace(useTransRegex, 'useTranslation()');
        changed = true;
      }
    }
    if (!changed) {
      filesSkipped++;
      return;
    }
  }

  // Sort namespaces by usage count (most used first)
  const sortedNamespaces = [...namespaceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([ns]) => ns);

  // Update useTranslation() calls
  if (content.includes('useTranslation')) {
    const nsArg = sortedNamespaces.length === 1
      ? `'${sortedNamespaces[0]}'`
      : `[${sortedNamespaces.map(ns => `'${ns}'`).join(', ')}]`;

    // Match useTranslation with any argument: (), ('ns'), (['ns1', 'ns2'])
    const useTransRegex = /useTranslation\([^)]*\)/g;
    const currentCall = newContent.match(useTransRegex);
    if (currentCall) {
      const newCall = `useTranslation(${nsArg})`;
      if (currentCall[0] !== newCall) {
        newContent = newContent.replace(useTransRegex, newCall);
        changed = true;
      }
    }
  }

  // Update <Trans> components that don't already have ns prop
  // Only if the file uses non-common Trans keys
  const transI18nKeyRegex = /(<Trans\s+)i18nKey\s*=\s*['"]([a-zA-Z_-][a-zA-Z0-9_-]*)\.([^'"]*)['"]/g;
  let transMatch;
  const transReplacements = [];

  // Reset regex state
  const tempContent = newContent;
  while ((transMatch = transI18nKeyRegex.exec(tempContent)) !== null) {
    const fullMatch = transMatch[0];
    const prefix = transMatch[1]; // '<Trans '
    const keyPrefix = transMatch[2];
    const ns = KEY_TO_NAMESPACE[keyPrefix];

    if (ns && ns !== 'common') {
      // Check if this Trans already has ns prop
      // Look ahead in the same JSX tag
      const tagEnd = tempContent.indexOf('/>', transMatch.index);
      const tagClosing = tempContent.indexOf('>', transMatch.index);
      const endPos = Math.min(
        tagEnd !== -1 ? tagEnd : Infinity,
        tagClosing !== -1 ? tagClosing : Infinity
      );
      const tagContent = tempContent.substring(transMatch.index, endPos);

      if (!tagContent.includes(' ns=') && !tagContent.includes(' ns ')) {
        transReplacements.push({
          original: fullMatch,
          replacement: `${prefix}ns="${ns}" i18nKey="${keyPrefix}.${transMatch[3]}"`,
        });
      }
    }
  }

  for (const { original, replacement } of transReplacements) {
    newContent = newContent.replace(original, replacement);
    changed = true;
  }

  if (changed) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
    filesModified++;
    const relPath = path.relative(CLIENT_SRC, filePath).replace(/\\/g, '/');
    const nsLabel = sortedNamespaces.length === 1
      ? sortedNamespaces[0]
      : `[${sortedNamespaces.join(', ')}]`;
    modifiedFiles.push({ path: relPath, namespaces: nsLabel, keys: [...keys].join(', ') });
  }
}

// Main
console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Updating useTranslation() calls...\n`);

const allFiles = getAllFiles(CLIENT_SRC);
console.log(`Found ${allFiles.length} .js/.jsx files to scan.\n`);

for (const file of allFiles) {
  try {
    processFile(file);
  } catch (err) {
    const relPath = path.relative(CLIENT_SRC, file).replace(/\\/g, '/');
    errorFiles.push({ path: relPath, error: err.message });
  }
}

// Report
console.log('=== RESULTS ===');
console.log(`Files scanned:  ${filesScanned}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Files skipped (common-only): ${filesSkipped}`);
console.log(`Errors: ${errorFiles.length}`);

if (modifiedFiles.length > 0) {
  console.log(`\n=== MODIFIED FILES (${modifiedFiles.length}) ===`);
  for (const f of modifiedFiles) {
    console.log(`  ${f.path} -> ${f.namespaces}`);
  }
}

if (errorFiles.length > 0) {
  console.log('\n=== ERRORS ===');
  for (const f of errorFiles) {
    console.log(`  ${f.path}: ${f.error}`);
  }
}

if (DRY_RUN) {
  console.log('\n[DRY RUN] No files were modified. Run without --dry-run to apply changes.');
}
