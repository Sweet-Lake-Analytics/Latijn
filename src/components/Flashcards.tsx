'use client';

import { Word, UserScore, INITIAL_SCORE, MAX_SCORE, MIN_SCORE, getWeightedWord, LearningDirection } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface FlashcardsProps {
  words: Word[];
  onBack: () => void;
  updateScore: (wordId: string, delta: number) => void;
  scores: UserScore;
  userId: string | null;
  direction: LearningDirection;
}

export default function Flashcards({ words, onBack, updateScore, scores, userId, direction }: FlashcardsProps) {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  // Minimum swipe distance for a horizontal swipe
  const minSwipeDistance = 50;

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
    setSwipeOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    setSwipeOffset(currentTouch - touchStart);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    handleSwipe(distance);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setIsMouseDown(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !touchStart) return;
    const currentMouse = e.clientX;
    setTouchEnd(currentMouse);
    setSwipeOffset(currentMouse - touchStart);
  };

  const onMouseUp = () => {
    if (!isMouseDown) return;
    setIsMouseDown(false);
    if (!touchStart || !touchEnd) {
      setTouchStart(null);
      setTouchEnd(null);
      setSwipeOffset(0);
      return;
    }
    const distance = touchStart - touchEnd;
    handleSwipe(distance);
  };

  const handleSwipe = (distance: number) => {
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentWord) {
      // Left swipe: increase score (don't know well -> more frequent)
      updateScore(currentWord.id, 1);
      nextWord();
    } else if (isRightSwipe && currentWord) {
      // Right swipe: decrease score (know well -> less frequent)
      updateScore(currentWord.id, -1);
      nextWord();
    } else {
      // Reset position if swipe not far enough
      setSwipeOffset(0);
      setTouchStart(null);
      setTouchEnd(null);
    }
  };

  if (!currentWord) return <div className="dark:text-white">No words available for selected chapters.</div>;

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl max-w-md mx-auto border dark:border-gray-700 w-full min-h-[500px]">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100 text-center w-full">Flashcards</h2>
      
      <div className="w-full text-center mb-4 flex justify-between px-2">
        <span className="text-[10px] text-red-500 dark:text-red-400 font-bold uppercase animate-pulse">← More Frequent (Unknown)</span>
        <span className="text-[10px] text-green-500 dark:text-green-400 font-bold uppercase animate-pulse">Less Frequent (Known) →</span>
      </div>

      <div 
        onClick={() => {
          if (Math.abs(swipeOffset) < 5) setShowTranslation(!showTranslation);
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ 
          transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.05}deg)`,
          transition: (touchEnd || isMouseDown) ? 'none' : 'transform 0.3s ease-out',
          cursor: isMouseDown ? 'grabbing' : 'pointer'
        }}
        className="w-full min-h-[200px] sm:min-h-[250px] flex flex-col items-center justify-center border-2 border-indigo-500 dark:border-indigo-600 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all p-4 sm:p-8 text-center shadow-inner touch-none relative overflow-hidden select-none"
      >
        {/* Swipe indicators inside the card */}
        {swipeOffset < -20 && (
          <div className="absolute inset-y-0 right-0 w-1 bg-green-500 opacity-50"></div>
        )}
        {swipeOffset > 20 && (
          <div className="absolute inset-y-0 left-0 w-1 bg-red-500 opacity-50"></div>
        )}

        <div className="text-2xl sm:text-4xl font-serif text-indigo-900 dark:text-indigo-300 font-bold">
          {direction === 'nl-to-lang' ? currentWord.dutch : currentWord.language}
        </div>
        {showTranslation && (
          <div className="mt-4 sm:mt-8 text-xl sm:text-2xl text-gray-700 dark:text-gray-300 animate-in fade-in slide-in-from-top-2 duration-300">
            {direction === 'nl-to-lang' ? currentWord.language : currentWord.dutch}
            {currentWord.comment && <span className="block text-sm sm:text-lg mt-2 text-gray-500 dark:text-gray-400">({currentWord.comment})</span>}
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
