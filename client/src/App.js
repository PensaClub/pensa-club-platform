import './App.css';
import { Header } from './components/Header/Header';
import { NotFound } from './components/NotFound/NotFound';
import { Home } from './components/Home/Home';

import { Routes, Route } from 'react-router-dom';
import { ServerError } from './components/ServerError/ServerError';

function App() {
  return (
    <main>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/server-error" element={<ServerError />}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

export default App;
