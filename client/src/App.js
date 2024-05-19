import './App.css';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Home } from './components/Home/Home';
import { Routes, Route } from 'react-router-dom';
import { NotFound } from './components/ErrorPages/NotFound/NotFound';
import { ServerError } from './components/ErrorPages/ServerError/ServerError';
import { LoginRegister } from './components/LoginRegister/LoginRegister';

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-up" element={<LoginRegister />}/>
        <Route path="/server-error" element={<ServerError />}/>
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />

    </>
  );
}

export default App;
