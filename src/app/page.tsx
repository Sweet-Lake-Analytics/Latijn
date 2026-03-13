'use client';

import { useState, useEffect } from 'react';
import { Word, UserScore, fetchWords, MIN_SCORE, MAX_SCORE, INITIAL_SCORE } from '@/lib/utils';
import Flashcards from '@/components/Flashcards';
import Quiz from '@/components/Quiz';
import AuthModal from '@/components/AuthModal';
import ProgressView from '@/components/ProgressView';

export default function Home() {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [scores, setScores] = useState<UserScore>({});
  const [stats, setStats] = useState({ wordsPracticed: 0, totalTimeSpent: 0 });
  const [startChapter, setStartChapter] = useState<string>('1');
  const [endChapter, setEndChapter] = useState<string>('13');
  const [quizSize, setQuizSize] = useState(10);
  const [mode, setMode] = useState<'menu' | 'cards' | 'quiz' | 'progress'>('menu');
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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

  useEffect(() => {
    async function loadData() {
      const words = await fetchWords();
      setAllWords(words);
      
      const uniqueChapters = Array.from(new Set(words.map(w => w.chapter))).sort((a, b) => {
        const isAEtra = a.toLowerCase() === 'extra';
        const isBEtra = b.toLowerCase() === 'extra';
        if (isAEtra) return 1;
        if (isBEtra) return -1;
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      });
      
      if (uniqueChapters.length > 0) {
        setStartChapter(uniqueChapters[0]);
        setEndChapter(uniqueChapters[uniqueChapters.length - 1]);
      }

      const savedUser = localStorage.getItem('latin_user');
      const savedUserId = localStorage.getItem('latin_userId');
      if (savedUser && savedUserId) {
        setUsername(savedUser);
        setUserId(savedUserId);
        const savedScores = localStorage.getItem(`latin_scores_${savedUserId}`);
        if (savedScores) setScores(JSON.parse(savedScores));
        const savedStats = localStorage.getItem(`latin_stats_${savedUserId}`);
        if (savedStats) setStats(JSON.parse(savedStats));
      }
    }
    loadData();
  }, []);

  const handleLogin = (id: string, u: string, s: any, st: any) => {
    setUserId(id);
    setUsername(u);
    setScores(s || {});
    setStats(st || { wordsPracticed: 0, totalTimeSpent: 0 });
    localStorage.setItem('latin_userId', id);
    localStorage.setItem('latin_user', u);
    localStorage.setItem(`latin_scores_${id}`, JSON.stringify(s || {}));
    localStorage.setItem(`latin_stats_${id}`, JSON.stringify(st || { wordsPracticed: 0, totalTimeSpent: 0 }));
  };

  const handleLogout = () => {
    setUserId(null);
    setUsername(null);
    setScores({});
    setStats({ wordsPracticed: 0, totalTimeSpent: 0 });
    localStorage.removeItem('latin_userId');
    localStorage.removeItem('latin_user');
    setMode('menu'); // Ensure we go back to menu on logout
  };

  const updateScore = (wordId: string, delta: number) => {
    setScores(prev => {
      const currentScore = prev[wordId] ?? INITIAL_SCORE;
      const newScore = Math.max(MIN_SCORE, Math.min(MAX_SCORE, currentScore + delta));
      const next = { ...prev, [wordId]: newScore };
      
      if (userId) {
        localStorage.setItem(`latin_scores_${userId}`, JSON.stringify(next));
        // Sync with backend
        fetch('/api/user/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, wordId, score: newScore })
        });
        
        // Update local stats too
        const nextStats = { ...stats, wordsPracticed: stats.wordsPracticed + 1 };
        setStats(nextStats);
        localStorage.setItem(`latin_stats_${userId}`, JSON.stringify(nextStats));
      }
      
      return next;
    });
  };

  const filteredWords = allWords.filter(w => {
    const startIndex = chapters.indexOf(startChapter);
    const endIndex = chapters.indexOf(endChapter);
    const wordChapterIndex = chapters.indexOf(w.chapter);
    
    if (startIndex === -1 || endIndex === -1) return false;
    
    // We can simplify this now that we enforce startIndex <= endIndex
    return wordChapterIndex >= startIndex && wordChapterIndex <= endIndex;
  });

  if (mode === 'cards') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Flashcards 
          words={filteredWords} 
          onBack={() => setMode('menu')} 
          updateScore={updateScore}
          scores={scores}
          userId={userId}
        />
      </div>
    );
  }

  if (mode === 'quiz') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Quiz 
          words={filteredWords} 
          allWords={allWords}
          onBack={() => setMode('menu')} 
          updateScore={updateScore}
          scores={scores}
          quizSize={quizSize}
          userId={userId}
        />
      </div>
    );
  }

  if (mode === 'progress') {
    return (
      <div className="flex-1 flex flex-col p-4">
        <ProgressView 
          allWords={allWords}
          scores={scores}
          onBack={() => setMode('menu')}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      {!username && <AuthModal onLogin={handleLogin} />}
      
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-xl max-w-md w-full border dark:border-gray-700 min-h-[500px] flex flex-col justify-center">
        <div className="flex justify-between items-start mb-4">
          <div className="text-left">
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">User: {username}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">Words: {stats.wordsPracticed} | Time: {Math.floor(stats.totalTimeSpent / 60)}m</p>
          </div>
          <button onClick={handleLogout} className="text-[10px] sm:text-xs text-red-500 hover:underline font-bold">Logout</button>
        </div>
        
        <h1 className="text-2xl sm:text-4xl font-extrabold text-indigo-900 dark:text-indigo-400 mb-6 sm:mb-8 text-center italic">Magister Latinitatis</h1>
        
        <div className="space-y-4 sm:space-y-6">
          <section>
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Settings</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:flex-1">
                  <label className="block text-[10px] text-gray-700 dark:text-gray-300 uppercase font-extrabold mb-1">From Chapter</label>
                  <select 
                    value={startChapter}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setStartChapter(newStart);
                      const startIndex = chapters.indexOf(newStart);
                      const endIndex = chapters.indexOf(endChapter);
                      if (startIndex > endIndex) {
                        setEndChapter(newStart);
                      }
                    }}
                    className="w-full p-2 border-2 border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                  >
                    {chapters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="w-full sm:flex-1">
                  <label className="block text-[10px] text-gray-700 dark:text-gray-300 uppercase font-extrabold mb-1">To Chapter</label>
                  <select 
                    value={endChapter}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      setEndChapter(newEnd);
                      const endIndex = chapters.indexOf(newEnd);
                      const startIndex = chapters.indexOf(startChapter);
                      if (endIndex < startIndex) {
                        setStartChapter(newEnd);
                      }
                    }}
                    className="w-full p-2 border-2 border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                  >
                    {chapters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-700 dark:text-gray-300 uppercase font-extrabold mb-1">Quiz Size</label>
                <input 
                  type="number"
                  min="1"
                  max={filteredWords.length || 100}
                  value={quizSize}
                  onChange={(e) => setQuizSize(parseInt(e.target.value) || 0)}
                  className="w-full p-2 border-2 border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-2 sm:pt-4">
            <button
              onClick={() => setMode('cards')}
              disabled={filteredWords.length === 0}
              className="w-full py-3 sm:py-4 bg-indigo-600 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              Start Flashcards
            </button>
            <button
              onClick={() => setMode('quiz')}
              disabled={filteredWords.length === 0}
              className="w-full py-3 sm:py-4 bg-white dark:bg-transparent border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-base sm:text-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:border-gray-300 disabled:text-gray-300 dark:disabled:border-gray-700 dark:disabled:text-gray-600 transition-all"
            >
              Start Quiz
            </button>
            <button
              onClick={() => setMode('progress')}
              className="w-full py-3 sm:py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              View Progress
            </button>
          </section>

          {filteredWords.length === 0 && (
            <p className="text-red-500 text-[10px] sm:text-sm text-center font-bold">No words found in this chapter range.</p>
          )}
          
          <p className="text-gray-500 dark:text-gray-400 text-[10px] text-center pt-2 sm:pt-4">
            Total words available in selected range: {filteredWords.length}
          </p>
        </div>
      </div>
    </div>
  );
}
