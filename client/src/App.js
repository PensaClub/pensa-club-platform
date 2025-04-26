import './App.css';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Home } from './components/Home/Home';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { NotFound } from './components/ErrorPages/NotFound/NotFound';
import { ServerError } from './components/ErrorPages/ServerError/ServerError';
import { LoginRegister } from './components/LoginRegister/LoginRegister';
import { UserProvider } from './components/contexts/UserContext';
import { Logout } from './components/Logout/Logout';
import { Profile } from './components/Profile/Profile';
import ErrorBoundary from './tools/errorBoundary';
import ErrorPageBoundary from './components/ErrorPages/ErrorPageBoundary';
import { FiltersMap } from './components/MapPage/FitlersMap/FiltersMap';
import { MapPage } from './components/MapPage/MapPage';
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
import { useEffect } from 'react';
import ArticleView from './components/Articles/ArticleView/ArticleView.jsx';
import ArticlesList from './components/Articles/ArticlesList/ArticlesList.jsx';
import { initGA } from './components/Services/analyticsService.js';
import { AnalyticsProvider } from './components/contexts/AnalyticsContext.jsx';

import FooterWithLoading from './FooterWithLoading/FooterWithLoading.jsx';
import { LoadingProvider } from './components/contexts/LoadingContext.jsx';
import { ArticleProvider } from './components/contexts/ArticleContext.jsx';
import { ArticleLimitProvider } from './components/contexts/ArticleLimitContext.jsx';

function App() {
  const location = useLocation();
  const isCommunityPage =
    location.pathname === '/craigslist' || location.pathname.startsWith('/ad');
  const [cookies] = useCookies(["cookieConsent"]);
  const navigate = useNavigate();

  useEffect(() => {
    // да се махне след тест директното подаване на id оот google - това || 'G-GE8XZREVM6'
    const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || 'G-GE8XZREVM6';
    initGA(GA_TRACKING_ID);
  }, []);

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);
  const isProfilePage = location.pathname.startsWith('/profile');
  
  return (
    <>
      <ErrorBoundary>

        <UserProvider>
          <MapProvider>
            <CommunityProvider>
              <SuggestUserProvider>
                <AdminProvider>
                  <ArticleProvider>
                    <AnalyticsProvider>
                      <LoadingProvider>
                      <ArticleLimitProvider>
                      {!isProfilePage &&<Header
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

                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/server-error" element={<ServerError />} />
                          <Route path="/server-error" element={<ServerError />} />
                          <Route path="/forget-password" element={<ForgetPassword />} />
                          <Route path="/resend-email" element={<ReSendEmail />} />
                          <Route
                            path="/reset-password"
                            element={<ResetPasswordPage />}
                          />
                          <Route path="/articles" element={<ArticlesList />} />
                          <Route path="/articles/:slug" element={<ArticleView />} />
                          <Route element={<AuthGuard />}>
                            <Route path="/ad/details/:adId" element={<AdDetails />} />
                            <Route path="/ad/edit/:adId" element={<EditAd />} />
                            <Route path="/ad" element={<AdPage />} />
                            <Route path="/ad/create" element={<CreateAd />} />
                            <Route path="/logout" element={<Logout />} />
                            {/* <Route path="/profile" element={<Profile />} /> */}

                            <Route path="/profile/*" element={<Profile />} />

                          </Route>

                          <Route element={<PublicGuard />}>
                            <Route path="/sign-up" element={<LoginRegister />} />
                          </Route>
                          <Route path="/craigslist" element={<CommunityPage />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/ads" element={<AdsCard />} />
                          <Route path="/filter" element={<FiltersMap />} />
                          <Route path="/map" element={<MapPage />} />
                          <Route path="/suggest-user" element={<UserSuggestion />} />
                          <Route path="/errors/*" element={<ErrorPageBoundary />} />
                          <Route path="404/*" element={<NotFound />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        {!isProfilePage && (
                          <FooterWithLoading
                            additionalClasses={
                              isCommunityPage ? 'hide-on-mobile position-fix' : ''
                            }
                          />
                        )}
                        {!isProfilePage &&<MenuCommunity />}
                        </ArticleLimitProvider>
                      </LoadingProvider>
                    </AnalyticsProvider>
                  </ArticleProvider>
                </AdminProvider>
              </SuggestUserProvider>
            </CommunityProvider>
          </MapProvider>
        </UserProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
