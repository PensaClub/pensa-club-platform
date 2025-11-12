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
import { DigiBridgeAcademy } from './components/DigiBridgeAcademy/DigiBridgeAcademy.jsx';
import { AcademyProvider } from './components/contexts/AcademyProvider.jsx';
import { DigiBridgeMentorsPage } from './components/DigiBridge/DigiBridgeMentorsPage/DigiBridgeMentorsPage.jsx';
import { DigiBridgeBecomeMentor } from './components/DigiBridge/DigiBridgeBecomeMentor/DigiBridgeBecomeMentor.jsx';
import { DigiBridgeChatButton } from './components/DigiBridge/DigiBridgeChatButton/DigiBridgeChatButton.jsx';
import { DigiBridgeChatWindow } from './components/DigiBridge/DigiBridgeChatWindow/DigiBridgeChatWindow.jsx';
import { MentorGuard } from './components/Guards/MentorGuard.jsx';
import { DigiBridgeMentorDashboard } from './components/DigiBridge/DigiBridgeMentorDashboard/DigiBridgeMentorDashboard.jsx';
import { UserChatsPage } from './components/DigiBridge/UserChatsPage/UserChatsPage.jsx';

// ✅ LAZY LOADING КОМПОНЕНТИ
const ArticlesList = lazy(() => import('./components/Articles/ArticlesList/ArticlesList.jsx'));
const InitiativesList = lazy(() => import('./components/Initiatives/InitiativesList/InitiativesList.jsx'));
const ProjectsList = lazy(() => import('./components/Initiatives/ProjectsList/ProjectsList.jsx'));
const PublicationForm = lazy(() => import('./components/Initiatives/CreatePublication/MainForm/MainFormPublication'));
const StoryForm = lazy(() => import('./components/Initiatives/CreateStory/MainForm/MainFormStory'));
const PublicationsList = lazy(() => import('./components/Initiatives/CreatePublication/PublicationStoriesList/PublicationStoriesList.jsx'));
const StoriesList = lazy(() => import('./components/Initiatives/CreateStory/PublicationStoriesList/PublicationStoriesList.jsx'));

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

function App() {
  const location = useLocation();
  const isCommunityPage =
    location.pathname === '/craigslist' || location.pathname.startsWith('/ad');
  const [cookies] = useCookies(["cookieConsent"]);
  const navigate = useNavigate();
  const isAcademyPage = location.pathname.startsWith('/academy');
  const [isChatOpen, setIsChatOpen] = useState(false);
  useEffect(() => {
    const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-GE8XZREVM6';
    initGA(GA_TRACKING_ID);
  }, []);

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  const isProfilePage = location.pathname.startsWith('/profile');

  return (
    <>
      <HelmetProvider>
        <ErrorBoundary>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <UserProvider>
              <GoogleAuthProvider>
                <MapProvider>
                  <CommunityProvider>
                    <SuggestUserProvider>
                      <AdminProvider>
                        <AcademyProvider>
                          <ArticleProvider>
                            <InitiativeProvider>
                              <AnalyticsProvider>
                                <LoadingProvider>
                                  <ArticleLimitProvider>
                                    <ClubProvider>
                                      {!isProfilePage && !isAcademyPage && <Header
                                        additionalClasses={isProfilePage ? 'hide-header' : ''}
                                      />}

                                      {!cookies.cookieConsent && <CookieConsent />}
                                      <HeaderCommunity />
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
                                        <Route path="/" element={<Home />} />
                                        <Route path="/academy" element={<DigiBridgeAcademy />} />
                                        <Route path="/academy/mentors" element={<DigiBridgeMentorsPage />} />
                                        <Route path="/contact" element={<ContactForm />} />
                                        <Route path="/about" element={<AboutPage />} />
                                        <Route path="/server-error" element={<ServerError />} />
                                        <Route path="/forget-password" element={<ForgetPassword />} />
                                        <Route path="/resend-email" element={<ReSendEmail />} />
                                        <Route path="/reset-password" element={<ResetPasswordPage />} />

                                        {/* ✅ LAZY LOADED ROUTES */}
                                        <Route
                                          path="/articles"
                                          element={
                                            <Suspense fallback={<LazyLoadingFallback type="articles" />}>
                                              <ArticlesList />
                                            </Suspense>
                                          }
                                        />
                                        <Route
                                          path="/initiatives"
                                          element={
                                            <Suspense fallback={<LazyLoadingFallback type="initiatives" />}>
                                              <InitiativesList />
                                            </Suspense>
                                          }
                                        />
                                        <Route
                                          path="/projects"
                                          element={
                                            <Suspense fallback={<LazyLoadingFallback type="projects" />}>
                                              <ProjectsList />
                                            </Suspense>
                                          }
                                        />
                                        <Route
                                          path="/publications"
                                          element={
                                            <Suspense fallback={<LazyLoadingFallback type="publications" />}>
                                              <PublicationsList />
                                            </Suspense>
                                          }
                                        />
                                        <Route path="/publications/:slug" element={<PublicationView />} />
                                        <Route path="/publications/edit/:slug" element={<PublicationForm isEditMode={true} />} />
                                        <Route path="/initiatives/:slug" element={<InitiativeView />} />
                                        <Route path="/stories/:slug" element={<StoryView />} />
                                        <Route path="/projects/:slug" element={<ProjectView />} />
                                        <Route path="/articles/:slug" element={<ArticleView />} />
                                        <Route path="/elite-membership" element={<EliteMembershipPage />} />
                                        <Route
                                          path="/stories"
                                          element={
                                            <Suspense fallback={<LazyLoadingFallback type="stories" />}>
                                              <StoriesList />
                                            </Suspense>
                                          }
                                        />
                                        <Route path="/stories/:slug" element={<StoryView />} />
                                        <Route path="/stories/edit/:slug" element={<StoryForm isEditMode={true} />} />

                                        <Route element={<AuthGuard />}>
                                          <Route path="/academy/become-mentor" element={<DigiBridgeBecomeMentor />} />
                                          <Route path="/initiative-preview" element={<InitiativePreviewPage />} />
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
                                        </Route>
                                        <Route element={<PublicGuard />}>
                                          <Route path="/sign-up" element={<LoginRegister />} />
                                        </Route>

                                        <Route path="/craigslist" element={<CommunityPage />} />
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

                                      {!isProfilePage && !isAcademyPage && (
                                        <FooterWithLoading
                                          additionalClasses={
                                            isCommunityPage ? 'hide-on-mobile position-fix' : ''
                                          }
                                        />
                                      )}
                                      {!isProfilePage && <MenuCommunity />}
                                    </ClubProvider>
                                  </ArticleLimitProvider>
                                </LoadingProvider>
                              </AnalyticsProvider>
                            </InitiativeProvider>
                          </ArticleProvider>
                        </AcademyProvider>
                      </AdminProvider>
                    </SuggestUserProvider>
                  </CommunityProvider>
                </MapProvider>
              </GoogleAuthProvider>
            </UserProvider>
          </GoogleOAuthProvider>
        </ErrorBoundary>
      </HelmetProvider>
    </>
  );
}

export default App;
