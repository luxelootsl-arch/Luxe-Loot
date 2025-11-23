import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Consultant from './pages/Consultant';
import Creative from './pages/Creative';
import LiveSupport from './pages/LiveSupport';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/consultant" element={<Consultant />} />
            <Route path="/creative" element={<Creative />} />
            <Route path="/live" element={<LiveSupport />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;