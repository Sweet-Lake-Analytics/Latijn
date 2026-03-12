'use client';

import { Word, UserScore, INITIAL_SCORE, MAX_SCORE, MIN_SCORE, getWeightedWord } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface FlashcardsProps {
  words: Word[];
  onBack: () => void;
  updateScore: (wordId: string, delta: number) => void;
  scores: UserScore;
  userId: string | null;
}

export default function Flashcards({ words, onBack, updateScore, scores, userId }: FlashcardsProps) {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    setStartTime(Date.now());
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (userId && timeSpent > 0) {
        fetch('/api/user/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, timeToAdd: timeSpent })
        });
      }
    };
  }, []);

  useEffect(() => {
    if (!currentWord && words.length > 0) {
      nextWord();
    }
  }, [words]);

  const nextWord = () => {
    if (words.length === 0) return;
    const word = getWeightedWord(words, scores);
    setCurrentWord(word);
    setShowTranslation(false);
  };

  if (!currentWord) return <div className="dark:text-white">No words available for selected chapters.</div>;

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md mx-auto border dark:border-gray-700 w-full h-full sm:h-auto sm:mt-10">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-100">Flashcards</h2>
      <div 
        onClick={() => setShowTranslation(!showTranslation)}
        className="w-full min-h-[200px] sm:min-h-[250px] flex flex-col items-center justify-center border-2 border-indigo-500 dark:border-indigo-600 rounded-2xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all p-4 sm:p-8 text-center shadow-inner"
      >
        <div className="text-2xl sm:text-4xl font-serif text-indigo-900 dark:text-indigo-300 font-bold">{currentWord.latin}</div>
        {showTranslation && (
          <div className="mt-4 sm:mt-8 text-xl sm:text-2xl text-gray-700 dark:text-gray-300 animate-in fade-in slide-in-from-top-2 duration-300">
            {currentWord.dutch}
          </div>
        )}
        {!showTranslation && (
          <div className="mt-4 sm:mt-8 text-xs sm:text-sm text-gray-400 dark:text-gray-500 italic">Click to reveal translation</div>
        )}
      </div>
      
      <div className="mt-6 sm:mt-8 flex gap-4 w-full">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
        >
          Back
        </button>
        <button
          onClick={nextWord}
          className="flex-[2] py-3 px-6 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none text-sm sm:text-base"
        >
          Next Word
        </button>
      </div>
      
      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 flex justify-between w-full border-t dark:border-gray-700 pt-4">
        <span>Chapter: {currentWord.chapter}</span>
        <span>Score: {scores[currentWord.id] ?? INITIAL_SCORE}</span>
      </div>
    </div>
  );
}
