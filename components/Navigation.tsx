import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => `
    px-3 py-2 rounded-md text-sm font-medium transition-colors
    ${isActive(path) 
      ? 'bg-brand-600 text-white shadow-sm' 
      : 'text-slate-600 hover:bg-brand-50 hover:text-brand-600'}
  `;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">
                Digital Boost Pro
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className={linkClass('/')}>Home</Link>
              <Link to="/consultant" className={linkClass('/consultant')}>AI Consultant</Link>
              <Link to="/creative" className={linkClass('/creative')}>Creative Studio</Link>
              <Link to="/live" className={linkClass('/live')}>Live Support</Link>
            </div>
          </div>
          <div className="md:hidden flex space-x-2">
             {/* Mobile simplified nav */}
             <Link to="/consultant" className="text-xl">🤖</Link>
             <Link to="/creative" className="text-xl">🎨</Link>
             <Link to="/live" className="text-xl">🎙️</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;