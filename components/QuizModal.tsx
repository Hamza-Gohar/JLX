
import React, { useState } from 'react';
import type { Quiz, QuizQuestion } from '../types';
import { CheckIcon, XIcon } from './icons';

interface QuizModalProps {
  quiz: Quiz;
  subjectName: string;
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ quiz, subjectName, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const score = Object.keys(selectedAnswers).reduce((acc, index) => {
    const question = quiz[Number(index)];
    if (question.correctAnswer === selectedAnswers[Number(index)]) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const handleSelectAnswer = (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };
  
  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
  }

  const renderResults = () => (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Quiz Complete!</h2>
      <p className="text-base sm:text-lg text-slate-300 mb-6">You scored</p>
      <div className="text-5xl sm:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-8">
        {score} / {quiz.length}
      </div>
      <div className="flex justify-center gap-4">
          <button
              onClick={handleRestart}
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors text-sm sm:text-base"
          >
              Try Again
          </button>
          <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors text-sm sm:text-base"
          >
              Back to Chat
          </button>
      </div>
    </div>
  );

  const renderQuestion = (question: QuizQuestion) => {
    const getOptionClass = (option: string) => {
      if (!selectedAnswer) {
        return "bg-slate-700/80 hover:bg-slate-600/80";
      }
      if (option === question.correctAnswer) {
        return "bg-green-500/90";
      }
      if (option === selectedAnswer) {
        return "bg-rose-500/90";
      }
      return "bg-slate-700/80 opacity-60";
    };

    return (
      <div>
        <div className="mb-8">
          <p className="text-xs sm:text-sm font-semibold text-blue-400 mb-2">Question {currentQuestionIndex + 1} of {quiz.length}</p>
          <h3 className="text-lg sm:text-2xl font-bold text-white">{question.question}</h3>
        </div>
        <div className="space-y-4">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelectAnswer(option)}
              disabled={!!selectedAnswer}
              className={`w-full text-left p-4 rounded-lg text-white transition-all duration-300 flex justify-between items-center text-sm sm:text-base ${getOptionClass(option)}`}
            >
              <span className="flex-1 pr-4">{option}</span>
              {selectedAnswer && option === question.correctAnswer && <CheckIcon className="w-6 h-6 text-white flex-shrink-0"/>}
              {selectedAnswer && option !== question.correctAnswer && option === selectedAnswer && <XIcon className="w-6 h-6 text-white flex-shrink-0"/>}
            </button>
          ))}
        </div>
        {selectedAnswer && (
          <div className="mt-8 text-center">
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors text-sm sm:text-base"
            >
              {currentQuestionIndex < quiz.length - 1 ? 'Next Question' : 'Show Results'}
            </button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[#172033] border border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <div className="mb-6">
            <h1 className="text-lg sm:text-xl font-bold text-white">
                {subjectName} Quiz
            </h1>
            {!showResults && (
                <div className="w-full bg-slate-700 rounded-full h-2 mt-4">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${((currentQuestionIndex) / quiz.length) * 100}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
            )}
        </div>
        {showResults ? renderResults() : renderQuestion(currentQuestion)}
      </div>
    </div>
  );
};

export default QuizModal;
