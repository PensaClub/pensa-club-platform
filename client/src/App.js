import './App.css';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { NotFound } from './components/NotFound/NotFound';
import { Home } from './components/Home/Home';
import { Routes, Route } from 'react-router-dom';
import { ServerError } from './components/ServerError/ServerError';

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/server-error" element={<ServerError />}/>
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* <Footer /> */}

    </>
  );
}

export default App;
