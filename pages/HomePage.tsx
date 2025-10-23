
import React from 'react';
import SubjectGrid from '../components/SubjectGrid';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-12 md:py-20 text-center">
      <div className="inline-flex items-center bg-white/5 text-blue-300 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
        <span className="mr-2">✨</span>
        AI-Powered Learning
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6">
        Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">JLX</span> AI
      </h1>
      <p className="text-base sm:text-lg md:text-xl font-semibold text-white max-w-2xl mx-auto mb-6">
        Your JLHS Learning Assistant
      </p>
       <p className="text-sm sm:text-base text-slate-400 max-w-3xl mx-auto mb-12">
        Select a subject to get started. JLX is built by the students of Jauhar Lyceum to help you master every topic with AI-powered guidance.
      </p>

      <div className="max-w-7xl mx-auto">
        <SubjectGrid />
      </div>
    </div>
  );
};

export default HomePage;
