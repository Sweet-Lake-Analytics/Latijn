'use client';

import { Word, UserScore, INITIAL_SCORE } from '@/lib/utils';
import { useState } from 'react';

interface ProgressViewProps {
  allWords: Word[];
  scores: UserScore;
  onBack: () => void;
}

export default function ProgressView({ allWords, scores, onBack }: ProgressViewProps) {
  const chapters = Array.from(new Set(allWords.map(w => w.chapter))).sort((a, b) => {
    const isAEtra = a.toLowerCase() === 'extra';
    const isBEtra = b.toLowerCase() === 'extra';
    if (isAEtra) return 1;
    if (isBEtra) return -1;
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const [selectedChapter, setSelectedChapter] = useState(chapters[0] || '1');

  const filteredWords = allWords.filter(w => w.chapter === selectedChapter);

  const getScoreColor = (score: number) => {
    if (score <= 5) return 'bg-green-500';
    if (score <= 14) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col items-center justify-start p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl mx-auto border dark:border-gray-700 h-full w-full">
      <div className="w-full flex justify-between items-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-900 dark:text-indigo-400">Word Progress</h2>
        <button 
          onClick={onBack}
          className="py-1.5 sm:py-2 px-3 sm:px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          Back
        </button>
      </div>

      <div className="w-full mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-xs sm:text-sm font-extrabold text-gray-700 dark:text-gray-300 uppercase">Select Chapter:</label>
        <select 
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          className="p-2 border-2 border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full sm:w-auto"
        >
          {chapters.map(c => <option key={c} value={c}>Chapter {c}</option>)}
        </select>
      </div>

      <div className="w-full flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col gap-6 sm:gap-8 py-4">
          {filteredWords.map((word) => {
            const score = scores[word.id] ?? INITIAL_SCORE;
            
            // Map score to horizontal position: 20 -> 0%, 1 -> 100%
            // Formula: ((20 - score) / (19)) * 100
            const positionPercentage = ((20 - score) / 19) * 100;
            
            const getIndicatorColor = (s: number) => {
              if (s <= 5) return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
              if (s <= 14) return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]';
              return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
            };

            return (
              <div key={word.id} className="w-full flex flex-col gap-2 group">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-serif text-base sm:text-lg font-bold text-indigo-900 dark:text-indigo-300 break-words">
                    {word.latin}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic text-right shrink-0">
                    {word.dutch}
                  </span>
                </div>
                
                <div className="relative h-6 flex items-center px-1">
                  {/* The horizontal dotted line */}
                  <div className="absolute left-1 right-1 h-[1px] border-b border-dashed border-gray-300 dark:border-gray-600"></div>
                  
                  {/* End markers (optional but helpful for context) */}
                  <div className="absolute left-0 -bottom-1 text-[10px] font-bold text-gray-400">20</div>
                  <div className="absolute right-0 -bottom-1 text-[10px] font-bold text-gray-400">1</div>
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 text-[10px] font-bold text-gray-400">10</div>

                  {/* Vertical Indicator */}
                  <div 
                    className={`absolute w-1.5 h-4 rounded-full ${getIndicatorColor(score)} transition-all duration-700 ease-out z-10`}
                    style={{ left: `calc(${positionPercentage}% - 0.75px)` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                      Score: {score}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 w-full grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-center text-[10px] sm:text-xs font-bold pt-6 border-t dark:border-gray-700">
        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div> 1-5 (Mastered)
        </div>
        <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
          <div className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.5)]"></div> 6-14 (Learning)
        </div>
        <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div> 15-20 (Difficult)
        </div>
      </div>
    </div>
  );
}
