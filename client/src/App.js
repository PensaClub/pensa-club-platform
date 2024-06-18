import './App.css';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Home } from './components/Home/Home';
import { Routes, Route } from 'react-router-dom';
import { NotFound } from './components/ErrorPages/NotFound/NotFound';
import { ServerError } from './components/ErrorPages/ServerError/ServerError';
import { LoginRegister } from './components/LoginRegister/LoginRegister';
import { UserProvider } from './components/contexts/UserContext';
import { Logout } from './components/Logout/Logout';
import { Profile } from './components/Profile/Profile';
import ErrorBoundary from './tools/errorBoundary';
import ErrorPageBoundary from './components/ErrorPages/ErrorPageBoundary';
import {FiltersMap} from './components/MapPage/FitlersMap/FiltersMap';
import { MapPage } from './components/MapPage/MapPage';
import { PublicGuard } from './components/Guards/PublicGuard.jsx';
import { AuthGuard } from './components/Guards/AuthGuard.jsx';
import { MapProvider } from './components/contexts/MapContext.jsx';

function App() {

  return (
    <>
      <ErrorBoundary>
        <UserProvider>
          <MapProvider>
          <Header />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/server-error" element={<ServerError />} />

            <Route element={<AuthGuard />}>
              <Route path="/logout" element={<Logout />} />
              <Route path="/profile/*" element={<Profile />} />
            </Route>

            <Route element={<PublicGuard />}>
              <Route path="/sign-up" element={<LoginRegister />} />
            </Route>

            <Route path="/filter" element={<FiltersMap />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/errors/*" element={<ErrorPageBoundary />} />
            <Route path="404/*" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>


          <Footer />
          </MapProvider>
        </UserProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
