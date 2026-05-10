import './App.css';
import { Footer } from './components/Footer/Footer.jsx';
import { Header } from './components/Header/Header.jsx';
import { Home } from './components/Home/Home.jsx';
import { HelmetProvider } from 'react-helmet-async';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { NotFound } from './components/ErrorPages/NotFound/NotFound.jsx';
import { ServerError } from './components/ErrorPages/ServerError/ServerError.jsx';
import { UserProvider } from './components/contexts/UserContext.jsx';
import { Logout } from './components/Logout/Logout.jsx';
import ErrorBoundary from './tools/errorBoundary.jsx';
import ErrorPageBoundary from './components/ErrorPages/ErrorPageBoundary.jsx';
import { PublicGuard } from './components/Guards/PublicGuard.jsx';
import { AuthGuard } from './components/Guards/AuthGuard.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { MapProvider } from './components/contexts/MapContext.jsx';
import { CommunityProvider } from './components/contexts/CommunityContext.jsx';
import { ToastContainer } from 'react-toastify';
import { MenuCommunity } from './components/Community/MenuCommunity/MenuCommunity.jsx';
import { HeaderCommunity } from './components/Community/HeaderCommunity/HeaderCommunity.jsx';
import { SuggestUserProvider } from './components/contexts/SuggestUserContext.jsx';
import { AdminProvider } from './components/contexts/AdminContext.jsx';
import { CookieConsent } from './components/CookieConsent/CookieConsent.jsx';
import { useCookies } from 'react-cookie';
import { setNavigator } from './utils/handle401Error.jsx';
import { useEffect, Suspense, useState } from 'react';
import lazyWithRetry from './utils/lazyWithRetry.js';
import FooterWithLoading from './FooterWithLoading/FooterWithLoading.jsx';
import { LoadingProvider } from './components/contexts/LoadingContext.jsx';
import { ArticleProvider } from './components/contexts/ArticleContext.jsx';
import { CrawlerProvider } from './components/contexts/CrawlerContext.jsx';
import { ArticleLimitProvider } from './components/contexts/ArticleLimitContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleAuthProvider } from './components/contexts/GoogleAuthContext.jsx';
import { InitiativeProvider } from './components/contexts/InitiativeProvider.jsx';
import { ThemeProvider } from './components/contexts/ThemeContext.jsx';
import { initGA } from './components/Services/analyticsService.js';
import { AnalyticsProvider } from './components/contexts/AnalyticsContext.jsx';
import { useTranslation } from 'react-i18next';
import { ClubProvider } from './components/contexts/ClubContext.jsx';
import { AcademyProvider } from './components/contexts/AcademyProvider.jsx';
import { FactCheckProvider } from './components/contexts/FactCheckProvider.jsx';
import { ReActionProvider } from './components/contexts/ReActionProvider.jsx';
import { StorageProvider } from './components/contexts/StorageProvider.jsx';
import { DriveProvider } from './components/contexts/DriveProvider.jsx';
import { ForumProvider } from './components/contexts/ForumProvider.jsx';
import { SocketProvider } from './components/contexts/SocketProvider.jsx';
import { DigiBridgeChatButton } from './components/DigiBridge/DigiBridgeChatButton/DigiBridgeChatButton.jsx';
import { MentorGuard } from './components/Guards/MentorGuard.jsx';
import { AcademyStaffGuard } from './components/Guards/AcademyStaffGuard.jsx';
import { DigiBridgeMentorDashboard } from './components/DigiBridge/DigiBridgeMentorDashboard/DigiBridgeMentorDashboard.jsx';
import { UserChatsPage } from './components/DigiBridge/UserChatsPage/UserChatsPage.jsx';
import { StudentDetails } from './components/DigiMentorPanel/StudentDetails/StudentDetails.jsx';
import { DigiMentorReviews } from './components/DigiMentorPanel/DigiMentorReviews/DigiMentorReviews.jsx';
import { AcademyCoursesProvider } from './components/contexts/AcademyCoursesProvider.jsx';
import { UsefulLinksProvider } from './components/contexts/UsefulLinksContext.jsx';
import GlobalSnowfall from './components/GlobalSnowfall/GlobalSnowfall.jsx';
import DigiBridgeHeader from './components/DigiBridgeAcademy/DigiBridgeHeader/DigiBridgeHeader.jsx';
import { AdminGuard } from './components/Guards/AdminGuard.jsx';
import { ManagementGuard } from './components/Guards/ManagementGuard.jsx';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import { SiteSettingsAdminProvider } from './components/contexts/SiteSettingsAdminContext';
import SiteSettingsAdmin from './components/SiteSettingsAdmin/SiteSettingsAdmin';
import ChristmasGreetingModal from './components/ChristmasGreetingModal/ChristmasGreetingModal';
import { LanguageWrapper } from './components/LanguageWrapper/LanguageWrapper.jsx';
import { stripLangFromPath } from './utils/languageUtils.js';

// ✅ LAZY LOADING КОМПОНЕНТИ
const ArticlesList = lazyWithRetry(() => import('./components/Articles/ArticlesList/ArticlesList.jsx'));
const InitiativesList = lazyWithRetry(() => import('./components/Initiatives/InitiativesList/InitiativesList.jsx'));
const ProjectsList = lazyWithRetry(() => import('./components/Initiatives/ProjectsList/ProjectsList.jsx'));
const PublicationForm = lazyWithRetry(() => import('./components/Initiatives/CreatePublication/MainForm/MainFormPublication'));
const StoryForm = lazyWithRetry(() => import('./components/Initiatives/CreateStory/MainForm/MainFormStory'));
const PublicationsList = lazyWithRetry(() => import('./components/Initiatives/CreatePublication/PublicationStoriesList/PublicationStoriesList.jsx'));
const StoriesList = lazyWithRetry(() => import('./components/Initiatives/CreateStory/PublicationStoriesList/PublicationStoriesList.jsx'));

// ✅ LAZY LOADING - ACADEMY КОМПОНЕНТИ
const DigiBridgeAcademy = lazyWithRetry(() => import('./components/DigiBridgeAcademy/DigiBridgeAcademy.jsx'));
const AcademyCourses = lazyWithRetry(() => import('./components/AcademyCourses/AcademyCourses.jsx'));
const AcademyCourseDetail = lazyWithRetry(() => import('./components/AcademyCourses/AcademyCourseDetail/AcademyCourseDetail.jsx'));
const AcademyLessonPlayer = lazyWithRetry(() => import('./components/AcademyCourses/AcademyLessonPlayer/AcademyLessonPlayer.jsx'));
const AcademyTestPlayer = lazyWithRetry(() => import('./components/AcademyCourses/AcademyTestPlayer/AcademyTestPlayer.jsx'));
const AcademyLectures = lazyWithRetry(() => import('./components/AcademyLectures/AcademyLectures.jsx'));
const AcademyLectureDetails = lazyWithRetry(() => import('./components/AcademyLectures/AcademyLectureDetails/AcademyLectureDetails.jsx'));
// const AcademyLectureTest = lazyWithRetry(() => import('./components/AcademyLectures/AcademyLectureDetails/AcademyLectureTest/AcademyLectureTest.jsx'));
const AcademyLectureWatch = lazyWithRetry(() => import('./components/AcademyLectures/AcademyLectureWatch/AcademyLectureWatch.jsx'));
const DigiBridgeMentorsPage = lazyWithRetry(() => import('./components/DigiBridge/DigiBridgeMentorsPage/DigiBridgeMentorsPage.jsx'));
const DigiBridgeBecomeMentor = lazyWithRetry(() => import('./components/DigiBridge/DigiBridgeBecomeMentor/DigiBridgeBecomeMentor.jsx'));
const StudentDashboard = lazyWithRetry(() => import('./components/StudentDashboard/StudentDashboard.jsx'));
const AdminAcademyCoursesList = lazyWithRetry(() => import('./components/AdminAcademyCoursesList/AdminAcademyCoursesList.jsx'));
const CourseAcademyCreateForm = lazyWithRetry(() => import('./components/CourseAcademyCreateForm/CourseAcademyCreateForm.jsx'));
const EditCourseBasicInfo = lazyWithRetry(() => import('./components/AdminAcademyCoursesList/EditCourseBasicInfo/EditCourseBasicInfo.jsx'));
const CourseContentManager = lazyWithRetry(() => import('./components/AdminAcademyCoursesList/CourseContentManager/CourseContentManager.jsx'));
const LectureCreateForm = lazyWithRetry(() => import('./components/LectureCreateForm/LectureCreateForm.jsx'));
const AdminAcademyLecturesList = lazyWithRetry(() => import('./components/AdminAcademyLecturesList/AdminAcademyLecturesList.jsx'));
const EditLecture = lazyWithRetry(() => import('./components/AdminAcademyLecturesList/EditLecture/EditLecture.jsx'));
const SeminarCreateForm = lazyWithRetry(() => import('./components/SeminarCreateForm/SeminarCreateForm.jsx'));
const AdminAcademySeminarsList = lazyWithRetry(() => import('./components/AdminAcademySeminarsList/AdminAcademySeminarsList.jsx'));
const AcademySeminars = lazyWithRetry(() => import('./components/AcademySeminars/AcademySeminars.jsx'));
const AcademySeminarDetail = lazyWithRetry(() => import('./components/AcademySeminars/AcademySeminarDetail/AcademySeminarDetail.jsx'));
const SeminarAttendancePage = lazyWithRetry(() => import('./components/AdminAcademySeminarsList/SeminarAttendancePage/SeminarAttendancePage.jsx'));
const EditSeminar = lazyWithRetry(() => import('./components/AdminAcademySeminarsList/EditSeminar/EditSeminar.jsx'));
const SeminarReviewsAdmin = lazyWithRetry(() => import('./components/AdminAcademySeminarsList/SeminarReviewsAdmin/SeminarReviewsAdmin'));
const SeminarCheckin = lazyWithRetry(() => import('./components/AcademySeminars/SeminarCheckin/SeminarCheckin'));
const ForumCommunity = lazyWithRetry(() => import('./components/ForumCommunity/ForumCommunity.jsx'));
const AdminForumDashboard = lazyWithRetry(() => import('./components/AdminForumDashboard/AdminForumDashboard.jsx'));
const ForumPostDetailPage = lazyWithRetry(() => import('./components/ForumCommunity/ForumPostDetail/ForumPostDetail.jsx'));
const ForumMyPanel = lazyWithRetry(() => import('./components/ForumCommunity/ForumMyPanel/ForumMyPanel.jsx'));
const TelkRkmeRzi = lazyWithRetry(() => import('./components/TelkRkmeRzi/TelkRkmeRzi.jsx'));
const ComingSoon = lazyWithRetry(() => import('./components/DigiBridgeAcademy/ComingSoon/ComingSoon.jsx'));
const SharedDownload = lazyWithRetry(() => import('./components/SharedDownload/SharedDownload.jsx'));
const ProjectCreateForm = lazyWithRetry(() => import('./components/Initiatives/CreateProject/ProjectCreateForm'));
const ProjectPreview = lazyWithRetry(() => import('./components/Initiatives/CreateProject/ProjectPreview/ProjectPreview'));

// ✅ LAZY LOADING - FACT CHECK КОМПОНЕНТИ
const FactCheck = lazyWithRetry(() => import('./components/FactCheck/FactCheck.jsx'));
const FactCheckDetail = lazyWithRetry(() => import('./components/FactCheck/FactCheckDetail/FactCheckDetail.jsx'));
const AdminFactCheck = lazyWithRetry(() => import('./components/AdminFactCheck/AdminFactCheck.jsx').then(m => ({ default: m.AdminFactCheck })));

// ✅ LAZY LOADING - REACTION КОМПОНЕНТИ
const ReActionLanding = lazyWithRetry(() => import('./components/ReActionLanding/ReActionLanding.jsx'));
const ReActionProgram = lazyWithRetry(() => import('./components/ReActionProgram/ReActionProgram.jsx'));
const ReActionTrack = lazyWithRetry(() => import('./components/ReActionTrack/ReActionTrack.jsx'));
const AdminReAction = lazyWithRetry(() => import('./components/AdminReAction/AdminReAction.jsx'));
const MentorReAction = lazyWithRetry(() => import('./components/MentorReAction/MentorReAction.jsx'));
const ReActionMy = lazyWithRetry(() => import('./components/ReActionMy/ReActionMy.jsx'));
import { IpManagementProvider } from './components/contexts/IpManagementContext';

// ✅ LAZY LOADING - ADMIN NEWSLETTERS
const AdminNewsletters = lazyWithRetry(() => import('./components/AdminNewsletters/AdminNewsletters.jsx'));

// ✅ LAZY LOADING - BOT CRAWLER (Phase 1 — admin-only RSS news monitor)
const BotCrawlerPage = lazyWithRetry(() => import('./components/BotCrawlerAdmin/BotCrawlerPage.jsx'));
const BotDetailPage = lazyWithRetry(() => import('./components/BotCrawlerAdmin/BotDetailPage.jsx'));

// ✅ LAZY LOADING - PUBLIC SUBSCRIBE PAGES (token-protected)
const SubscribePreferences = lazyWithRetry(() => import('./components/Subscribe/SubscribePreferences/SubscribePreferences.jsx').then(m => ({ default: m.SubscribePreferences })));
const Unsubscribe = lazyWithRetry(() => import('./components/Subscribe/Unsubscribe/Unsubscribe.jsx').then(m => ({ default: m.Unsubscribe })));

// ✅ LAZY LOADING - USEFUL LINKS КОМПОНЕНТИ
const UsefulLinks = lazyWithRetry(() => import('./components/UsefulLinks/UsefulLinks.jsx'));
const AdminUsefulLinksList = lazyWithRetry(() => import('./components/AdminUsefulLinksList/AdminUsefulLinksList.jsx'));
const UsefulLinksCreateForm = lazyWithRetry(() => import('./components/UsefulLinksCreateForm/UsefulLinksCreateForm.jsx'));

// ✅ LAZY LOADING - PHASE 1 (off-home heavy pages)
// Profile (+ subroutes), Map/FiltersMap (leaflet), DigiBridgeChatWindow (on-demand popup)
const Profile = lazyWithRetry(() => import('./components/Profile/Profile.jsx').then(m => ({ default: m.Profile })));
const FiltersMap = lazyWithRetry(() => import('./components/MapPage/FitlersMap/FiltersMap.jsx').then(m => ({ default: m.FiltersMap })));
const MapPage = lazyWithRetry(() => import('./components/MapPage/MapPage.jsx').then(m => ({ default: m.MapPage })));
const DigiBridgeChatWindow = lazyWithRetry(() => import('./components/DigiBridge/DigiBridgeChatWindow/DigiBridgeChatWindow.jsx').then(m => ({ default: m.DigiBridgeChatWindow })));

// ✅ LAZY LOADING - PHASE 2 GROUP A (content views + clubs — frees leaflet + rich text editor)
const ArticleView = lazyWithRetry(() => import('./components/Articles/ArticleView/ArticleView.jsx'));
const InitiativeView = lazyWithRetry(() => import('./components/Initiatives/InitiativeView/InitiativeView.jsx').then(m => ({ default: m.InitiativeView })));
const ProjectView = lazyWithRetry(() => import('./components/Initiatives/InitiativeView/ProjectView/ProjectView.jsx').then(m => ({ default: m.ProjectView })));
const StoryView = lazyWithRetry(() => import('./components/Initiatives/InitiativeView/StoryPubView/StoryView.jsx').then(m => ({ default: m.StoryView })));
const PublicationView = lazyWithRetry(() => import('./components/Initiatives/InitiativeView/StoryPubView/PublicationView.jsx').then(m => ({ default: m.PublicationView })));
const InitiativePreviewPage = lazyWithRetry(() => import('./components/Initiatives/CreateIniciative/InitiativePreviewPage/InitiativePreviewPage.jsx').then(m => ({ default: m.InitiativePreviewPage })));
const AllClubs = lazyWithRetry(() => import('./components/Clubs/AllClubs/AllClubs.jsx').then(m => ({ default: m.AllClubs })));
const ClubView = lazyWithRetry(() => import('./components/Clubs/ClubView/ClubView.jsx'));

// ✅ LAZY LOADING - PHASE 2 GROUP B (community + ads)
const CommunityPage = lazyWithRetry(() => import('./components/Community/CommunityPage.jsx').then(m => ({ default: m.CommunityPage })));
const AdsCard = lazyWithRetry(() => import('./components/Community/AdsCard/AdsCard.jsx').then(m => ({ default: m.AdsCard })));
const AdPage = lazyWithRetry(() => import('./components/Community/AdPage/AdPage.jsx').then(m => ({ default: m.AdPage })));
const CreateAd = lazyWithRetry(() => import('./components/Community/AdPage/CreateAd/CreateAd.jsx').then(m => ({ default: m.CreateAd })));
const AdDetails = lazyWithRetry(() => import('./components/Community/AdPage/AdDetails/AdDetails.jsx').then(m => ({ default: m.AdDetails })));
const EditAd = lazyWithRetry(() => import('./components/Community/AdPage/EditAd/EditAd.jsx').then(m => ({ default: m.EditAd })));

// ✅ LAZY LOADING - PHASE 2 GROUP C (auth + misc single-page routes)
const LoginRegister = lazyWithRetry(() => import('./components/LoginRegister/LoginRegister.jsx').then(m => ({ default: m.LoginRegister })));
const ForgetPassword = lazyWithRetry(() => import('./components/ForgetPassword/ForgetPassword.jsx').then(m => ({ default: m.ForgetPassword })));
const ReSendEmail = lazyWithRetry(() => import('./components/ForgetPassword/ReSendEmail.jsx').then(m => ({ default: m.ReSendEmail })));
const ResetPasswordPage = lazyWithRetry(() => import('./components/ForgetPassword/ResetPasswordPage.jsx').then(m => ({ default: m.ResetPasswordPage })));
const AcceptInvitation = lazyWithRetry(() => import('./components/AcceptInvitation/AcceptInvitation.jsx'));
const UserSuggestion = lazyWithRetry(() => import('./components/UserSuggestion/UserSuggestion.jsx').then(m => ({ default: m.UserSuggestion })));
const ContactForm = lazyWithRetry(() => import('./components/ContactForm/ContactForm.jsx'));
const PrivacyPolicy = lazyWithRetry(() => import('./components/PrivacyPolicy/PrivacyPolicy.jsx').then(m => ({ default: m.PrivacyPolicy })));
const AboutPage = lazyWithRetry(() => import('./components/AboutPage/AboutPage.jsx'));
const EliteMembershipPage = lazyWithRetry(() => import('./components/EliteMembershipPage/EliteMembershipPage.jsx'));
const GamesPage = lazyWithRetry(() => import('./components/GamesPage/GamesPage.jsx'));

// ✅ LOADING FALLBACK КОМПОНЕНТ
const LazyLoadingFallback = ({ type = 'page' }) => {
  const { t } = useTranslation();

  return (
    <div className="lazy-loading-container">
      <div className="lazy-loading-content">
        <div className="lazy-spinner">
          <div className="lazy-spinner-circle"></div>
          <div className="lazy-spinner-circle"></div>
          <div className="lazy-spinner-circle"></div>
        </div>
        <p className="lazy-loading-text">
          {t(`loading.${type}`)}
        </p>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/academy" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><DigiBridgeAcademy /></Suspense>} />
      <Route path="/academy/courses" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyCourses /></Suspense>} />
      <Route path="/academy/courses/:slug" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyCourseDetail /></Suspense>} />
      <Route path="/academy/mentors" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><DigiBridgeMentorsPage /></Suspense>} />
      {/* TODO: Тези страници са временно Coming Soon — достъпът ще се определи по-късно */}
      <Route path="/academy/events" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><ComingSoon pageKey="events" /></Suspense>} />
      <Route path="/academy/library" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><ComingSoon pageKey="library" /></Suspense>} />
      <Route path="/academy/community" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><ForumProvider><ForumCommunity /></ForumProvider></Suspense>} />
      <Route path="/academy/community/post/:slug" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><ForumProvider><ForumPostDetailPage /></ForumProvider></Suspense>} />
      <Route path="/academy/community/my" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><ForumProvider><ForumMyPanel /></ForumProvider></Suspense>} />
      <Route path="/academy/about" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><ComingSoon pageKey="about" /></Suspense>} />
      <Route path="/contact" element={<Suspense fallback={<LazyLoadingFallback />}><ContactForm /></Suspense>} />
      <Route path="/about" element={<Suspense fallback={<LazyLoadingFallback />}><AboutPage /></Suspense>} />
      <Route path="/server-error" element={<ServerError />} />
      <Route path="/forget-password" element={<Suspense fallback={<LazyLoadingFallback />}><ForgetPassword /></Suspense>} />
      <Route path="/subscribe/preferences/:token" element={<Suspense fallback={<LazyLoadingFallback />}><SubscribePreferences /></Suspense>} />
      <Route path="/subscribe/unsubscribe/:token" element={<Suspense fallback={<LazyLoadingFallback />}><Unsubscribe /></Suspense>} />
      <Route path="/resend-email" element={<Suspense fallback={<LazyLoadingFallback />}><ReSendEmail /></Suspense>} />
      <Route path="/reset-password" element={<Suspense fallback={<LazyLoadingFallback />}><ResetPasswordPage /></Suspense>} />
      <Route path="/accept-invitation" element={<Suspense fallback={<LazyLoadingFallback />}><AcceptInvitation /></Suspense>} />

      <Route path="/fact-check" element={<Suspense fallback={<LazyLoadingFallback />}><FactCheck /></Suspense>} />
      <Route path="/fact-check/:slug" element={<Suspense fallback={<LazyLoadingFallback />}><FactCheckDetail /></Suspense>} />

      <Route path="/reaction" element={<Suspense fallback={<LazyLoadingFallback />}><ReActionLanding /></Suspense>} />
      <Route path="/reaction/book" element={<Suspense fallback={<LazyLoadingFallback />}><ReActionProgram /></Suspense>} />
      <Route path="/reaction/track/:code?" element={<Suspense fallback={<LazyLoadingFallback />}><ReActionTrack /></Suspense>} />

      <Route path="/articles" element={<Suspense fallback={<LazyLoadingFallback type="articles" />}><ArticlesList /></Suspense>} />
      <Route path="/initiatives" element={<Suspense fallback={<LazyLoadingFallback type="initiatives" />}><InitiativesList /></Suspense>} />
      <Route path="/projects" element={<Suspense fallback={<LazyLoadingFallback type="projects" />}><ProjectsList /></Suspense>} />
      <Route path="/publications" element={<Suspense fallback={<LazyLoadingFallback type="publications" />}><PublicationsList /></Suspense>} />
      <Route path="/publications/:slug" element={<Suspense fallback={<LazyLoadingFallback type="publications" />}><PublicationView /></Suspense>} />
      <Route path="/publications/edit/:slug" element={<PublicationForm isEditMode={true} />} />
      <Route path="/initiatives/:slug" element={<Suspense fallback={<LazyLoadingFallback type="initiatives" />}><InitiativeView /></Suspense>} />
      <Route path="/stories/:slug" element={<Suspense fallback={<LazyLoadingFallback type="stories" />}><StoryView /></Suspense>} />
      <Route path="/projects/:slug" element={<Suspense fallback={<LazyLoadingFallback type="projects" />}><ProjectView /></Suspense>} />
      <Route path="/articles/:slug" element={<Suspense fallback={<LazyLoadingFallback type="articles" />}><ArticleView /></Suspense>} />
      <Route path="/elite-membership" element={<Suspense fallback={<LazyLoadingFallback />}><EliteMembershipPage /></Suspense>} />
      <Route path="/stories" element={<Suspense fallback={<LazyLoadingFallback type="stories" />}><StoriesList /></Suspense>} />
      <Route path="/stories/edit/:slug" element={<StoryForm isEditMode={true} />} />

      {/* Public shared file download — no auth required */}
      <Route path="/shared/:token" element={<Suspense fallback={<LazyLoadingFallback />}><SharedDownload /></Suspense>} />

      {/* Public seminar routes — accessible without login */}
      <Route path="/academy/seminars" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademySeminars /></Suspense>} />
      <Route path="/academy/seminars/:slug" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademySeminarDetail /></Suspense>} />

      <Route element={<AuthGuard />}>
        <Route path="/academy/become-mentor" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><DigiBridgeBecomeMentor /></Suspense>} />
        <Route path="/academy/my" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><StudentDashboard /></Suspense>} />
        <Route path="/initiative-preview" element={<Suspense fallback={<LazyLoadingFallback />}><InitiativePreviewPage /></Suspense>} />
        <Route path="/projects-create" element={<ManagementGuard><Suspense fallback={<LazyLoadingFallback />}><ProjectCreateForm /></Suspense></ManagementGuard>} />
        <Route path="/project-preview" element={<ManagementGuard><Suspense fallback={<LazyLoadingFallback />}><ProjectPreview /></Suspense></ManagementGuard>} />
        <Route path="/academy/courses/:courseSlug/lessons/:lessonSlug" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyLessonPlayer /></Suspense>} />
        <Route path="/academy/courses/:courseSlug/lessons/:lessonSlug/test" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyTestPlayer /></Suspense>} />
        <Route path="/academy/lectures" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyLectures /></Suspense>} />
        <Route path="/academy/lectures/:slug" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyLectureDetails /></Suspense>} />
        <Route path="/academy/lectures/:slug/watch" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyLectureWatch /></Suspense>} />
        <Route path="/academy/lectures/:slug/test" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyTestPlayer /></Suspense>} />
        <Route path="/academy/courses/:courseSlug/test" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyTestPlayer /></Suspense>} />
        <Route path="/admin/site-settings" element={<AdminGuard><SiteSettingsAdmin /></AdminGuard>} />
        <Route path="/admin/newsletters" element={<ManagementGuard><Suspense fallback={<LazyLoadingFallback />}><AdminNewsletters /></Suspense></ManagementGuard>} />
        <Route path="/admin/bot-crawler" element={<ManagementGuard><Suspense fallback={<LazyLoadingFallback />}><BotCrawlerPage /></Suspense></ManagementGuard>} />
        <Route path="/admin/bot-crawler/:id" element={<ManagementGuard><Suspense fallback={<LazyLoadingFallback />}><BotDetailPage /></Suspense></ManagementGuard>} />
        <Route path="/admin/fact-check" element={<ManagementGuard><IpManagementProvider><Suspense fallback={<LazyLoadingFallback />}><AdminFactCheck /></Suspense></IpManagementProvider></ManagementGuard>} />
        <Route path="/reaction/my" element={<Suspense fallback={<LazyLoadingFallback />}><ReActionMy /></Suspense>} />
        <Route path="/admin/reaction" element={<ManagementGuard><Suspense fallback={<LazyLoadingFallback />}><AdminReAction /></Suspense></ManagementGuard>} />
        <Route path="/admin/useful-links" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback />}><AdminUsefulLinksList /></Suspense></AdminGuard>} />
        <Route path="/admin/useful-links/create" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback />}><UsefulLinksCreateForm /></Suspense></AdminGuard>} />
        <Route path="/admin/useful-links/edit/:id" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback />}><UsefulLinksCreateForm /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/courses" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><AdminAcademyCoursesList /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/create-course" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><CourseAcademyCreateForm /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/create-lecture" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><LectureCreateForm /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/lectures" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><AdminAcademyLecturesList /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/edit-course/:slug" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><EditCourseBasicInfo /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/edit-lecture/:slug" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><EditLecture /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/seminars" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><AdminAcademySeminarsList /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/create-seminar" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><SeminarCreateForm /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/seminar-attendance" element={<AcademyStaffGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><SeminarAttendancePage /></Suspense></AcademyStaffGuard>} />
        <Route path="/academy/admin/seminar-reviews" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><SeminarReviewsAdmin /></Suspense></AdminGuard>} />
        <Route path="/academy/seminars/:seminarId/checkin" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><SeminarCheckin /></Suspense>} />
        <Route path="/academy/seminars/:slug/test" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyTestPlayer /></Suspense>} />
        <Route path="/academy/admin/edit-seminar/:slug" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><EditSeminar /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/course/:slug/content" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><CourseContentManager /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/forum" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><AdminForumDashboard /></Suspense></AdminGuard>} />
        <Route path="/ad/details/:adId" element={<Suspense fallback={<LazyLoadingFallback />}><AdDetails /></Suspense>} />
        <Route path="/ad/edit/:adId" element={<Suspense fallback={<LazyLoadingFallback />}><EditAd /></Suspense>} />
        <Route path="/ad" element={<Suspense fallback={<LazyLoadingFallback />}><AdPage /></Suspense>} />
        <Route path="/games" element={<Suspense fallback={<LazyLoadingFallback />}><GamesPage /></Suspense>} />
        <Route path="/ad/create" element={<Suspense fallback={<LazyLoadingFallback />}><CreateAd /></Suspense>} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/profile/*" element={<Suspense fallback={<LazyLoadingFallback />}><Profile /></Suspense>} />
        <Route path="/my-chats" element={<UserChatsPage />} />
      </Route>

      <Route element={<MentorGuard />}>
        <Route path="/academy/mentor-dashboard" element={<DigiBridgeMentorDashboard />} />
      </Route>

      <Route path="/mentor" element={<MentorGuard />}>
        <Route path="students/:studentId/details" element={<StudentDetails />} />
        <Route path="reviews" element={<DigiMentorReviews />} />
        <Route path="reaction" element={<Suspense fallback={<LazyLoadingFallback />}><MentorReAction /></Suspense>} />
      </Route>

      <Route element={<PublicGuard />}>
        <Route path="/sign-up" element={<Suspense fallback={<LazyLoadingFallback />}><LoginRegister /></Suspense>} />
      </Route>

      <Route path="/telk-rkme-rzi" element={<Suspense fallback={<LazyLoadingFallback />}><TelkRkmeRzi /></Suspense>} />
      <Route path="/community" element={<Suspense fallback={<LazyLoadingFallback />}><CommunityPage /></Suspense>} />
      <Route path="/useful-links" element={<Suspense fallback={<LazyLoadingFallback />}><UsefulLinks /></Suspense>} />
      <Route path="/clubs" element={<Suspense fallback={<LazyLoadingFallback />}><AllClubs /></Suspense>} />
      <Route path="/clubs/:slug" element={<Suspense fallback={<LazyLoadingFallback />}><ClubView /></Suspense>} />
      <Route path="/privacy-policy" element={<Suspense fallback={<LazyLoadingFallback />}><PrivacyPolicy /></Suspense>} />
      <Route path="/ads" element={<Suspense fallback={<LazyLoadingFallback />}><AdsCard /></Suspense>} />
      <Route path="/filter" element={<Suspense fallback={<LazyLoadingFallback />}><FiltersMap /></Suspense>} />
      <Route path="/map" element={<Suspense fallback={<LazyLoadingFallback />}><MapPage /></Suspense>} />
      <Route path="/suggest-user" element={<Suspense fallback={<LazyLoadingFallback />}><UserSuggestion /></Suspense>} />
      <Route path="/errors/*" element={<ErrorPageBoundary />} />
      <Route path="404/*" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const location = useLocation();
  const cleanPathname = stripLangFromPath(location.pathname);
  const isCommunityPage =
    cleanPathname === '/community' || cleanPathname.startsWith('/ad');
  const [cookies] = useCookies(["cookieConsent"]);
  const navigate = useNavigate();
  const isAcademyPage = cleanPathname.startsWith('/academy');
  const [isChatOpen, setIsChatOpen] = useState(false);
  useEffect(() => {
    const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-GE8XZREVM6';
    initGA(GA_TRACKING_ID);
  }, []);

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  const isProfilePage = cleanPathname.startsWith('/profile');

  return (
    <>
      <HelmetProvider>
        <ThemeProvider>
          <SiteSettingsAdminProvider>
            <ThemeToggle />
            <ErrorBoundary>
              <GlobalSnowfall count={50} />
              <ChristmasGreetingModal />
              <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <UserProvider>
                  <SocketProvider>
                  <GoogleAuthProvider>
                    <MapProvider>
                      <CommunityProvider>
                        <SuggestUserProvider>
                          <AdminProvider>
                            <AcademyProvider>
                              <AcademyCoursesProvider>
                                <ArticleProvider>
                                  <CrawlerProvider>
                                  <InitiativeProvider>
                                    <AnalyticsProvider>
                                      <LoadingProvider>
                                        <ArticleLimitProvider>
                                          <UsefulLinksProvider>
                                            <ClubProvider>
                                              <FactCheckProvider>
                                                <ReActionProvider>
                                                <StorageProvider>
                                                <DriveProvider>
                                                  {!isProfilePage && !isAcademyPage && <Header
                                                    additionalClasses={isProfilePage ? 'hide-header' : ''}
                                                  />}

                                                  {!cookies.cookieConsent && <CookieConsent />}
                                                  <HeaderCommunity />
                                                  {isAcademyPage && <DigiBridgeHeader />}
                                                  <ToastContainer
                                                    role="alert"
                                                    className={'notification'}
                                                    limit={3}
                                                    position="bottom-right"
                                                  />
                                                  <DigiBridgeChatButton onClick={() => setIsChatOpen(true)} />
                                                  {/* ✅ Chat Window */}
                                                  {isChatOpen && <Suspense fallback={null}><DigiBridgeChatWindow onClose={() => setIsChatOpen(false)} /></Suspense>}
                                                  {/* {isChatOpen && <DigiBridgeChatWindow onClose={() => setIsChatOpen(false)} />} */}
                                                  <Routes>
                                                    <Route path="/en/*" element={<LanguageWrapper lang="en"><AppRoutes /></LanguageWrapper>} />
                                                    <Route path="/de/*" element={<LanguageWrapper lang="de"><AppRoutes /></LanguageWrapper>} />
                                                    <Route path="/*" element={<LanguageWrapper lang="bg"><AppRoutes /></LanguageWrapper>} />
                                                  </Routes>

                                                  {!isProfilePage && (
                                                    <FooterWithLoading
                                                      additionalClasses={
                                                        isCommunityPage ? 'hide-on-mobile position-fix' : ''
                                                      }
                                                    />
                                                  )}
                                                  {!isProfilePage && <MenuCommunity />}
                                                </DriveProvider>
                                                </StorageProvider>
                                                </ReActionProvider>
                                              </FactCheckProvider>
                                            </ClubProvider>
                                          </UsefulLinksProvider>
                                        </ArticleLimitProvider>
                                      </LoadingProvider>
                                    </AnalyticsProvider>
                                  </InitiativeProvider>
                                  </CrawlerProvider>
                                </ArticleProvider>
                              </AcademyCoursesProvider>
                            </AcademyProvider>
                          </AdminProvider>
                        </SuggestUserProvider>
                      </CommunityProvider>
                    </MapProvider>
                  </GoogleAuthProvider>
                  </SocketProvider>
                </UserProvider>
              </GoogleOAuthProvider>
            </ErrorBoundary>
          </SiteSettingsAdminProvider>
        </ThemeProvider>
      </HelmetProvider>
    </>
  );
}

export default App;
