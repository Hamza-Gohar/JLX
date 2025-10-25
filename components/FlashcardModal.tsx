
import React, { useState, useCallback } from 'react';
import type { Flashcards } from '../types';
import { ArrowLeftIcon, ArrowRightIcon } from './icons';

interface FlashcardModalProps {
  flashcards: Flashcards;
  subjectName: string;
  onClose: () => void;
}

const FlashcardModal: React.FC<FlashcardModalProps> = ({ flashcards, subjectName, onClose }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentCardIndex];

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const goToNext = useCallback(() => {
    if (currentCardIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150);
    } else {
        onClose(); // Finish on the last card
    }
  }, [currentCardIndex, flashcards.length, onClose]);

  const goToPrev = useCallback(() => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev - 1), 150);
    }
  }, [currentCardIndex]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[#172033] border border-white/10 rounded-2xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col" 
        onClick={(e) => e.stopPropagation()}
        style={{ height: '75vh', minHeight: '500px' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
                {subjectName} Flashcards
            </h1>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center" style={{ perspective: '1200px' }}>
             <div 
                className={`w-full h-full max-w-2xl relative transition-transform duration-700 cursor-pointer shadow-2xl rounded-2xl`}
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}}
                onClick={handleFlip}
            >
                {/* Front of Card */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-2xl flex flex-col justify-center items-center p-8 text-center" style={{ backfaceVisibility: 'hidden' }}>
                    <p className="text-sm text-blue-400 font-semibold mb-6">QUESTION</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{currentCard.question}</p>
                </div>
                {/* Back of Card */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-2xl flex flex-col justify-center items-center p-8 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <p className="text-sm text-green-400 font-semibold mb-6">ANSWER</p>
                    <p className="text-lg sm:text-xl text-slate-200 overflow-y-auto max-h-full">{currentCard.answer}</p>
                </div>
            </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
            <button 
                onClick={goToPrev} 
                disabled={currentCardIndex === 0}
                className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white disabled:text-slate-600 disabled:bg-transparent transition-colors"
                aria-label="Previous Card"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>

            <span className="text-base font-medium text-slate-400">{currentCardIndex + 1} / {flashcards.length}</span>

             <button 
                onClick={goToNext}
                className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                aria-label="Next Card"
            >
                <ArrowRightIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardModal;