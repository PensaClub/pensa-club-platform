/**
 * Split monolithic translation.json files into namespace-based files.
 *
 * Usage: node scripts/split-translations.js
 *
 * This script reads client/public/locales/{bg,en,de}/translation.json
 * and splits each into 13 namespace JSON files.
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'client', 'public', 'locales');
const LANGUAGES = ['bg', 'en', 'de'];

// Namespace-to-keys mapping (187 keys total across 13 namespaces)
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

// Verify all keys are accounted for
function verifyMapping(translationData, lang) {
  const allMappedKeys = new Set();
  for (const [ns, keys] of Object.entries(NAMESPACE_MAP)) {
    for (const key of keys) {
      if (allMappedKeys.has(key)) {
        console.error(`ERROR: Key "${key}" is mapped to multiple namespaces!`);
        process.exit(1);
      }
      allMappedKeys.add(key);
    }
  }

  const translationKeys = new Set(Object.keys(translationData));

  // Keys in translation but not mapped
  const unmapped = [...translationKeys].filter(k => !allMappedKeys.has(k));
  if (unmapped.length > 0) {
    console.error(`ERROR [${lang}]: Unmapped keys found:`, unmapped);
    process.exit(1);
  }

  // Keys mapped but not in translation (warning only - some languages may be incomplete)
  const missing = [...allMappedKeys].filter(k => !translationKeys.has(k));
  if (missing.length > 0) {
    console.warn(`WARNING [${lang}]: Keys in mapping but not in translation:`, missing);
  }
}

function splitTranslation(lang) {
  const inputPath = path.join(LOCALES_DIR, lang, 'translation.json');
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  console.log(`\n=== Processing ${lang} (${Object.keys(data).length} keys) ===`);

  verifyMapping(data, lang);

  let totalOutputSize = 0;

  for (const [namespace, keys] of Object.entries(NAMESPACE_MAP)) {
    const nsData = {};
    for (const key of keys) {
      if (data[key] !== undefined) {
        nsData[key] = data[key];
      }
    }

    const outputPath = path.join(LOCALES_DIR, lang, `${namespace}.json`);
    const content = JSON.stringify(nsData, null, 2);
    fs.writeFileSync(outputPath, content, 'utf8');

    const sizeKB = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1);
    totalOutputSize += Buffer.byteLength(content, 'utf8');
    console.log(`  ${namespace}.json: ${sizeKB} KB (${Object.keys(nsData).length} keys)`);
  }

  const inputSize = fs.statSync(inputPath).size;
  console.log(`\n  Original translation.json: ${(inputSize / 1024).toFixed(1)} KB`);
  console.log(`  Total split files: ${(totalOutputSize / 1024).toFixed(1)} KB`);
}

// Run
console.log('Splitting translation files into namespaces...');
console.log(`Namespaces: ${Object.keys(NAMESPACE_MAP).length}`);
console.log(`Total keys mapped: ${Object.values(NAMESPACE_MAP).flat().length}`);

for (const lang of LANGUAGES) {
  splitTranslation(lang);
}

console.log('\nDone! Namespace files created successfully.');
console.log('Original translation.json files have NOT been modified.');
