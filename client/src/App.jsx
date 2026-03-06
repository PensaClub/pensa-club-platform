import './App.css';
import { Footer } from './components/Footer/Footer.jsx';
import { Header } from './components/Header/Header.jsx';
import { Home } from './components/Home/Home.jsx';
import { HelmetProvider } from 'react-helmet-async';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { NotFound } from './components/ErrorPages/NotFound/NotFound.jsx';
import { ServerError } from './components/ErrorPages/ServerError/ServerError.jsx';
import { LoginRegister } from './components/LoginRegister/LoginRegister.jsx';
import { UserProvider } from './components/contexts/UserContext.jsx';
import { Logout } from './components/Logout/Logout.jsx';
import { Profile } from './components/Profile/Profile.jsx';
import ErrorBoundary from './tools/errorBoundary.jsx';
import ErrorPageBoundary from './components/ErrorPages/ErrorPageBoundary.jsx';
import { FiltersMap } from './components/MapPage/FitlersMap/FiltersMap.jsx';
import { MapPage } from './components/MapPage/MapPage.jsx';
import { UserSuggestion } from './components/UserSuggestion/UserSuggestion.jsx';
import { PublicGuard } from './components/Guards/PublicGuard.jsx';
import { AuthGuard } from './components/Guards/AuthGuard.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { MapProvider } from './components/contexts/MapContext.jsx';
import { CommunityPage } from './components/Community/CommunityPage.jsx';
import { CommunityProvider } from './components/contexts/CommunityContext.jsx';
import { AdsCard } from './components/Community/AdsCard/AdsCard.jsx';
import { ToastContainer } from 'react-toastify';
import { AdPage } from './components/Community/AdPage/AdPage.jsx';
import { CreateAd } from './components/Community/AdPage/CreateAd/CreateAd.jsx';
import { ForgetPassword } from './components/ForgetPassword/ForgetPassword.jsx';
import { ReSendEmail } from './components/ForgetPassword/ReSendEmail.jsx';
import { ResetPasswordPage } from './components/ForgetPassword/ResetPasswordPage.jsx';
import { MenuCommunity } from './components/Community/MenuCommunity/MenuCommunity.jsx';
import { HeaderCommunity } from './components/Community/HeaderCommunity/HeaderCommunity.jsx';
import { SuggestUserProvider } from './components/contexts/SuggestUserContext.jsx';
import { AdDetails } from './components/Community/AdPage/AdDetails/AdDetails.jsx';
import { EditAd } from './components/Community/AdPage/EditAd/EditAd.jsx';
import { AdminProvider } from './components/contexts/AdminContext.jsx';
import { CookieConsent } from './components/CookieConsent/CookieConsent.jsx';
import { useCookies } from 'react-cookie';
import { PrivacyPolicy } from './components/PrivacyPolicy/PrivacyPolicy.jsx';
import { setNavigator } from './utils/handle401Error.jsx';
import { useEffect, Suspense, lazy, useState } from 'react'; // ✅ Добави Suspense
import ArticleView from './components/Articles/ArticleView/ArticleView.jsx';
import FooterWithLoading from './FooterWithLoading/FooterWithLoading.jsx';
import { LoadingProvider } from './components/contexts/LoadingContext.jsx';
import { ArticleProvider } from './components/contexts/ArticleContext.jsx';
import { ArticleLimitProvider } from './components/contexts/ArticleLimitContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleAuthProvider } from './components/contexts/GoogleAuthContext.jsx';
import ContactForm from './components/ContactForm/ContactForm.jsx';
import { InitiativeProvider } from './components/contexts/InitiativeProvider.jsx';
import { ThemeProvider } from './components/contexts/ThemeContext.jsx';
import { InitiativeView } from './components/Initiatives/InitiativeView/InitiativeView.jsx';
import { ProjectView } from './components/Initiatives/InitiativeView/ProjectView/ProjectView.jsx';
import { StoryView } from './components/Initiatives/InitiativeView/StoryPubView/StoryView.jsx';
import { PublicationView } from './components/Initiatives/InitiativeView/StoryPubView/PublicationView.jsx';
import { InitiativePreviewPage } from './components/Initiatives/CreateIniciative/InitiativePreviewPage/InitiativePreviewPage.jsx';
import { initGA } from './components/Services/analyticsService.js';
import { AnalyticsProvider } from './components/contexts/AnalyticsContext.jsx';
import EliteMembershipPage from './components/EliteMembershipPage/EliteMembershipPage.jsx';
import { useTranslation } from 'react-i18next';
import GamesPage from './components/GamesPage/GamesPage.jsx';
import { AllClubs } from './components/Clubs/AllClubs/AllClubs.jsx';
import { ClubProvider } from './components/contexts/ClubContext.jsx';
import ClubView from './components/Clubs/ClubView/ClubView.jsx';
import AboutPage from './components/AboutPage/AboutPage.jsx';
import { AcademyProvider } from './components/contexts/AcademyProvider.jsx';
import { DigiBridgeChatButton } from './components/DigiBridge/DigiBridgeChatButton/DigiBridgeChatButton.jsx';
import { DigiBridgeChatWindow } from './components/DigiBridge/DigiBridgeChatWindow/DigiBridgeChatWindow.jsx';
import { MentorGuard } from './components/Guards/MentorGuard.jsx';
import { DigiBridgeMentorDashboard } from './components/DigiBridge/DigiBridgeMentorDashboard/DigiBridgeMentorDashboard.jsx';
import { UserChatsPage } from './components/DigiBridge/UserChatsPage/UserChatsPage.jsx';
import { StudentDetails } from './components/DigiMentorPanel/StudentDetails/StudentDetails.jsx';
import { DigiMentorReviews } from './components/DigiMentorPanel/DigiMentorReviews/DigiMentorReviews.jsx';
import { AcademyCoursesProvider } from './components/contexts/AcademyCoursesProvider.jsx';
import { UsefulLinksProvider } from './components/contexts/UsefulLinksContext.jsx';
import GlobalSnowfall from './components/GlobalSnowfall/GlobalSnowfall.jsx';
import DigiBridgeHeader from './components/DigiBridgeAcademy/DigiBridgeHeader/DigiBridgeHeader.jsx';
import { AdminGuard } from './components/Guards/AdminGuard.jsx';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import { SiteSettingsAdminProvider } from './components/contexts/SiteSettingsAdminContext';
import SiteSettingsAdmin from './components/SiteSettingsAdmin/SiteSettingsAdmin';
import ChristmasGreetingModal from './components/ChristmasGreetingModal/ChristmasGreetingModal';
import { LanguageWrapper } from './components/LanguageWrapper/LanguageWrapper.jsx';
import { stripLangFromPath } from './utils/languageUtils.js';

// ✅ LAZY LOADING КОМПОНЕНТИ
const ArticlesList = lazy(() => import('./components/Articles/ArticlesList/ArticlesList.jsx'));
const InitiativesList = lazy(() => import('./components/Initiatives/InitiativesList/InitiativesList.jsx'));
const ProjectsList = lazy(() => import('./components/Initiatives/ProjectsList/ProjectsList.jsx'));
const PublicationForm = lazy(() => import('./components/Initiatives/CreatePublication/MainForm/MainFormPublication'));
const StoryForm = lazy(() => import('./components/Initiatives/CreateStory/MainForm/MainFormStory'));
const PublicationsList = lazy(() => import('./components/Initiatives/CreatePublication/PublicationStoriesList/PublicationStoriesList.jsx'));
const StoriesList = lazy(() => import('./components/Initiatives/CreateStory/PublicationStoriesList/PublicationStoriesList.jsx'));

// ✅ LAZY LOADING - ACADEMY КОМПОНЕНТИ
const DigiBridgeAcademy = lazy(() => import('./components/DigiBridgeAcademy/DigiBridgeAcademy.jsx'));
const AcademyCourses = lazy(() => import('./components/AcademyCourses/AcademyCourses.jsx'));
const AcademyCourseDetail = lazy(() => import('./components/AcademyCourses/AcademyCourseDetail/AcademyCourseDetail.jsx'));
const AcademyLessonPlayer = lazy(() => import('./components/AcademyCourses/AcademyLessonPlayer/AcademyLessonPlayer.jsx'));
const AcademyTestPlayer = lazy(() => import('./components/AcademyCourses/AcademyTestPlayer/AcademyTestPlayer.jsx'));
const AcademyLectures = lazy(() => import('./components/AcademyLectures/AcademyLectures.jsx'));
const AcademyLectureDetails = lazy(() => import('./components/AcademyLectures/AcademyLectureDetails/AcademyLectureDetails.jsx'));
// const AcademyLectureTest = lazy(() => import('./components/AcademyLectures/AcademyLectureDetails/AcademyLectureTest/AcademyLectureTest.jsx'));
const AcademyLectureWatch = lazy(() => import('./components/AcademyLectures/AcademyLectureWatch/AcademyLectureWatch.jsx'));
const DigiBridgeMentorsPage = lazy(() => import('./components/DigiBridge/DigiBridgeMentorsPage/DigiBridgeMentorsPage.jsx'));
const DigiBridgeBecomeMentor = lazy(() => import('./components/DigiBridge/DigiBridgeBecomeMentor/DigiBridgeBecomeMentor.jsx'));
const StudentDashboard = lazy(() => import('./components/StudentDashboard/StudentDashboard.jsx'));
const AdminAcademyCoursesList = lazy(() => import('./components/AdminAcademyCoursesList/AdminAcademyCoursesList.jsx'));
const CourseAcademyCreateForm = lazy(() => import('./components/CourseAcademyCreateForm/CourseAcademyCreateForm.jsx'));
const EditCourseBasicInfo = lazy(() => import('./components/AdminAcademyCoursesList/EditCourseBasicInfo/EditCourseBasicInfo.jsx'));
const CourseContentManager = lazy(() => import('./components/AdminAcademyCoursesList/CourseContentManager/CourseContentManager.jsx'));
const LectureCreateForm = lazy(() => import('./components/LectureCreateForm/LectureCreateForm.jsx'));
const AdminAcademyLecturesList = lazy(() => import('./components/AdminAcademyLecturesList/AdminAcademyLecturesList.jsx'));
const EditLecture = lazy(() => import('./components/AdminAcademyLecturesList/EditLecture/EditLecture.jsx'));
const TelkRkmeRzi = lazy(() => import('./components/TelkRkmeRzi/TelkRkmeRzi.jsx'));
const ComingSoon = lazy(() => import('./components/DigiBridgeAcademy/ComingSoon/ComingSoon.jsx'));

// ✅ LAZY LOADING - USEFUL LINKS КОМПОНЕНТИ
const UsefulLinks = lazy(() => import('./components/UsefulLinks/UsefulLinks.jsx'));
const AdminUsefulLinksList = lazy(() => import('./components/AdminUsefulLinksList/AdminUsefulLinksList.jsx'));
const UsefulLinksCreateForm = lazy(() => import('./components/UsefulLinksCreateForm/UsefulLinksCreateForm.jsx'));

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
      <Route path="/academy/community" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><ComingSoon pageKey="community" /></Suspense>} />
      <Route path="/academy/about" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><ComingSoon pageKey="about" /></Suspense>} />
      <Route path="/contact" element={<ContactForm />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/server-error" element={<ServerError />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/resend-email" element={<ReSendEmail />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/articles" element={<Suspense fallback={<LazyLoadingFallback type="articles" />}><ArticlesList /></Suspense>} />
      <Route path="/initiatives" element={<Suspense fallback={<LazyLoadingFallback type="initiatives" />}><InitiativesList /></Suspense>} />
      <Route path="/projects" element={<Suspense fallback={<LazyLoadingFallback type="projects" />}><ProjectsList /></Suspense>} />
      <Route path="/publications" element={<Suspense fallback={<LazyLoadingFallback type="publications" />}><PublicationsList /></Suspense>} />
      <Route path="/publications/:slug" element={<PublicationView />} />
      <Route path="/publications/edit/:slug" element={<PublicationForm isEditMode={true} />} />
      <Route path="/initiatives/:slug" element={<InitiativeView />} />
      <Route path="/stories/:slug" element={<StoryView />} />
      <Route path="/projects/:slug" element={<ProjectView />} />
      <Route path="/articles/:slug" element={<ArticleView />} />
      <Route path="/elite-membership" element={<EliteMembershipPage />} />
      <Route path="/stories" element={<Suspense fallback={<LazyLoadingFallback type="stories" />}><StoriesList /></Suspense>} />
      <Route path="/stories/edit/:slug" element={<StoryForm isEditMode={true} />} />

      <Route element={<AuthGuard />}>
        <Route path="/academy/become-mentor" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><DigiBridgeBecomeMentor /></Suspense>} />
        <Route path="/academy/my" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><StudentDashboard /></Suspense>} />
        <Route path="/initiative-preview" element={<InitiativePreviewPage />} />
        <Route path="/academy/courses/:courseSlug/lessons/:lessonSlug" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyLessonPlayer /></Suspense>} />
        <Route path="/academy/courses/:courseSlug/lessons/:lessonSlug/test" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyTestPlayer /></Suspense>} />
        <Route path="/academy/lectures" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyLectures /></Suspense>} />
        <Route path="/academy/lectures/:slug" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyLectureDetails /></Suspense>} />
        <Route path="/academy/lectures/:slug/watch" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyLectureWatch /></Suspense>} />
        <Route path="/academy/lectures/:slug/test" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyTestPlayer /></Suspense>} />
        <Route path="/academy/courses/:courseSlug/test" element={<Suspense fallback={<LazyLoadingFallback type="academy" />}><AcademyTestPlayer /></Suspense>} />
        <Route path="/admin/site-settings" element={<AdminGuard><SiteSettingsAdmin /></AdminGuard>} />
        <Route path="/admin/useful-links" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback />}><AdminUsefulLinksList /></Suspense></AdminGuard>} />
        <Route path="/admin/useful-links/create" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback />}><UsefulLinksCreateForm /></Suspense></AdminGuard>} />
        <Route path="/admin/useful-links/edit/:id" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback />}><UsefulLinksCreateForm /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/courses" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><AdminAcademyCoursesList /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/create-course" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><CourseAcademyCreateForm /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/create-lecture" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><LectureCreateForm /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/lectures" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><AdminAcademyLecturesList /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/edit-course/:slug" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><EditCourseBasicInfo /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/edit-lecture/:slug" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><EditLecture /></Suspense></AdminGuard>} />
        <Route path="/academy/admin/course/:slug/content" element={<AdminGuard><Suspense fallback={<LazyLoadingFallback type="academy" />}><CourseContentManager /></Suspense></AdminGuard>} />
        <Route path="/ad/details/:adId" element={<AdDetails />} />
        <Route path="/ad/edit/:adId" element={<EditAd />} />
        <Route path="/ad" element={<AdPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/ad/create" element={<CreateAd />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/profile/*" element={<Profile />} />
        <Route path="/my-chats" element={<UserChatsPage />} />
      </Route>

      <Route element={<MentorGuard />}>
        <Route path="/academy/mentor-dashboard" element={<DigiBridgeMentorDashboard />} />
      </Route>

      <Route path="/mentor" element={<MentorGuard />}>
        <Route path="students/:studentId/details" element={<StudentDetails />} />
        <Route path="reviews" element={<DigiMentorReviews />} />
      </Route>

      <Route element={<PublicGuard />}>
        <Route path="/sign-up" element={<LoginRegister />} />
      </Route>

      <Route path="/telk-rkme-rzi" element={<Suspense fallback={<LazyLoadingFallback />}><TelkRkmeRzi /></Suspense>} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/useful-links" element={<Suspense fallback={<LazyLoadingFallback />}><UsefulLinks /></Suspense>} />
      <Route path="/clubs" element={<AllClubs />} />
      <Route path="/clubs/:slug" element={<ClubView />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/ads" element={<AdsCard />} />
      <Route path="/filter" element={<FiltersMap />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/suggest-user" element={<UserSuggestion />} />
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
              <GoogleAuthProvider>
                <MapProvider>
                  <CommunityProvider>
                    <SuggestUserProvider>
                      <AdminProvider>
                        <AcademyProvider>
                          <AcademyCoursesProvider>
                            <ArticleProvider>
                              <InitiativeProvider>
                                <AnalyticsProvider>
                                  <LoadingProvider>
                                    <ArticleLimitProvider>
                                      <UsefulLinksProvider>
                                      <ClubProvider>
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
                                        {isChatOpen && <DigiBridgeChatWindow onClose={() => setIsChatOpen(false)} />}
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
                                      </ClubProvider>
                                      </UsefulLinksProvider>
                                    </ArticleLimitProvider>
                                  </LoadingProvider>
                                </AnalyticsProvider>
                              </InitiativeProvider>
                            </ArticleProvider>
                          </AcademyCoursesProvider>
                        </AcademyProvider>
                      </AdminProvider>
                    </SuggestUserProvider>
                  </CommunityProvider>
                </MapProvider>
              </GoogleAuthProvider>
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
