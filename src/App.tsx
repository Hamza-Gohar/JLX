// Fix: Manually define `import.meta.env` to fix TypeScript errors without a vite-env.d.ts file.
interface ImportMetaEnv {
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import { HomeIcon } from './components/icons';

const App: React.FC = () => {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  return (
    <HashRouter>
      <div className="bg-[#0B1220] text-slate-100 min-h-screen">
        <header className="p-6 md:p-8 border-b border-white/10 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-white font-bold text-lg">Jauhar Lyceum High School</h1>
              <p className="text-slate-400 text-sm">JLX Learning Assistant</p>
            </div>
            {isDemoMode && (
              <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2 py-1 rounded-full">
                DEMO MODE
              </span>
            )}
          </div>
          <Link to="/" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <HomeIcon className="w-6 h-6 text-slate-300" />
          </Link>
        </header>
        <main>
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