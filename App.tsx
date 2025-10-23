
import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import { HomeIcon } from './constants';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="bg-[#0B1220] text-slate-100 h-full flex flex-col">
        <header className="p-6 md:p-8 border-b border-white/10 flex justify-between items-start flex-shrink-0">
          <div>
            <h1 className="text-white font-bold text-base sm:text-lg">Jauhar Lyceum High School</h1>
            <p className="text-slate-400 text-xs sm:text-sm">JLX Learning Assistant</p>
          </div>
          <Link to="/" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <HomeIcon className="w-6 h-6 text-slate-300" />
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/subject/:subjectId" element={<SubjectPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;