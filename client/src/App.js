import './App.css';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Home } from './components/Home/Home';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import { PublicGuard } from './components/Guards/PublicGuard.jsx';
import { AuthGuard } from './components/Guards/AuthGuard.jsx';


import { MapProvider } from './components/contexts/mapContext.jsx';
import { CommunityPage } from './components/Community/CommunityPage.jsx';
import { CommunityProvider } from './components/contexts/CommunityContext.jsx';
import { AdsCard } from './components/Community/AdsCard/AdsCard.jsx';


import { ToastContainer } from 'react-toastify';


function App() {

  const location = useLocation()
  const isCommunityPage = location.pathname === '/craigslist'


  return (
    <>
      <ErrorBoundary>
        <UserProvider>
          <MapProvider>
            <CommunityProvider>
            <Header additionalClasses={isCommunityPage ? 'hide-on-mobile ' : ''} />

          <ToastContainer role="alert" className={"notification"} limit={3}/>
             <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/server-error" element={<ServerError />} />
              <Route path="/" element={<Home />} />
              <Route path="/server-error" element={<ServerError />} />

              <Route element={<AuthGuard />}>
                <Route path="/logout" element={<Logout />} />
                <Route path="/profile/*" element={<Profile />} />
              </Route>

              <Route element={<PublicGuard />}>
                <Route path="/sign-up" element={<LoginRegister />} />
              </Route>
              <Route path="/craigslist" element={<CommunityPage />} />
              <Route path="/ads" element={<AdsCard />} />
              <Route path="/filter" element={<FiltersMap />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/errors/*" element={<ErrorPageBoundary />} />
              <Route path="404/*" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Footer additionalClasses={isCommunityPage ? 'hide-on-mobile position-fix' : ''} />
            </CommunityProvider>
          </MapProvider>
        </UserProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
