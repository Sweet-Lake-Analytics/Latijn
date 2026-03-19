'use client';

import { Word, UserScore, getWeightedWord, shuffleArray, LearningDirection } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface QuizProps {
  words: Word[];
  onBack: () => void;
  updateScore: (wordId: string, delta: number) => void;
  scores: UserScore;
  quizSize: number;
  userId: string | null;
  direction: LearningDirection;
}

export default function Quiz({ words, onBack, updateScore, scores, quizSize, userId, direction }: QuizProps) {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [answered, setAnswered] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [quizFinished, setQuizFinished] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(quizSize);
  const [totalQuestions, setTotalQuestions] = useState(quizSize);
  const [usedWordIds, setUsedWordIds] = useState<Set<string>>(new Set());
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

  const nextQuestion = (currentQuestionsLeft: number, currentUsedIds: Set<string>) => {
    if (currentQuestionsLeft <= 0) {
      setQuizFinished(true);
      return;
    }

    // Filter out words already used in this quiz session
    const availableWords = words.filter(w => !currentUsedIds.has(w.id));
    
    // If no more words available (quiz size > words available), finish early or reset
    if (availableWords.length === 0) {
      if (currentQuestionsLeft === quizSize) {
        // If it's the very first question, we might need to adjust totalQuestions
        setTotalQuestions(0);
      } else {
        // Otherwise, adjust total to what we actually could show
        setTotalQuestions(results.total);
      }
      setQuizFinished(true);
      return;
    }

    // If available words is less than requested size, adjust totalQuestions
    if (currentQuestionsLeft === quizSize && availableWords.length < quizSize) {
      setTotalQuestions(availableWords.length);
      setQuestionsLeft(availableWords.length);
    }

    const word = getWeightedWord(availableWords, scores);
    setCurrentWord(word);
    setUsedWordIds(prev => new Set(prev).add(word.id));
    
    const isNlToLang = direction === 'nl-to-lang';
    const correctAnswer = isNlToLang ? word.language : word.dutch;

    // Pick 3 random distractors from the current set of words (excluding the correct one)
    // We use the 'words' prop which already contains words from the selected method and chapters
    const otherWords = words.filter(w => (isNlToLang ? w.language : w.dutch) !== correctAnswer);
    const distractors = shuffleArray(otherWords).slice(0, 3).map(w => isNlToLang ? w.language : w.dutch);
    
    setOptions(shuffleArray([correctAnswer, ...distractors]));
    setAnswered(null);
    setIsCorrect(null);
  };

  useEffect(() => {
    nextQuestion(quizSize, new Set());
  }, [quizSize]);

  const handleAnswer = (option: string) => {
    if (answered || !currentWord) return;

    setAnswered(option);
    const isNlToLang = direction === 'nl-to-lang';
    const correctAnswer = isNlToLang ? currentWord.language : currentWord.dutch;
    const correct = option === correctAnswer;
    setIsCorrect(correct);
    
    setResults(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    // Update score logic: -1 for correct, +1 for wrong
    updateScore(currentWord.id, correct ? -1 : 1);

    setTimeout(() => {
      const nextCount = questionsLeft - 1;
      setQuestionsLeft(nextCount);
      nextQuestion(nextCount, new Set([...Array.from(usedWordIds), currentWord.id]));
    }, 1500);
  };

  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl max-w-md mx-auto border dark:border-gray-700 w-full min-h-[500px]">
        <h2 className="text-3xl font-bold mb-4 text-indigo-900 dark:text-indigo-400">Quiz Results</h2>
        <div className="text-6xl font-black mb-4 text-indigo-600 dark:text-indigo-500">
          {results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0}%
        </div>
        <p className="text-xl mb-8 dark:text-gray-200">
          You got {results.correct} out of {results.total} correct!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={() => {
              setQuizFinished(false);
              setResults({ correct: 0, total: 0 });
              setQuestionsLeft(quizSize);
              setTotalQuestions(quizSize);
              setUsedWordIds(new Set());
              nextQuestion(quizSize, new Set());
            }}
            className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Main Menu
          </button>
        </div>
      </div>
    );
  }

  if (!currentWord) return <div className="dark:text-white">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl max-w-md mx-auto border dark:border-gray-700 w-full min-h-[500px]">
      <div className="w-full flex justify-between items-center mb-6">
        <span className="text-gray-500 dark:text-gray-400 font-medium text-xs sm:text-sm uppercase">Question {totalQuestions - questionsLeft + 1}/{totalQuestions}</span>
        <button onClick={onBack} className="text-xs sm:text-sm text-gray-400 hover:text-indigo-500 underline transition-colors">Exit Quiz</button>
      </div>
      
      <div className="text-2xl sm:text-4xl font-serif text-indigo-900 dark:text-indigo-300 mb-6 sm:mb-10 p-4 sm:p-6 border-b-2 border-indigo-100 dark:border-indigo-900/50 w-full text-center">
        {direction === 'nl-to-lang' ? currentWord.dutch : currentWord.language}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full">
        {options.map((option, idx) => {
          let buttonClass = "w-full py-4 px-6 text-left rounded-xl border-2 transition-all duration-200 font-medium ";
          
          const isNlToLang = direction === 'nl-to-lang';
          const correctAnswer = isNlToLang ? currentWord.language : currentWord.dutch;

          if (!answered) {
            buttonClass += "border-gray-100 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200";
          } else {
            if (option === correctAnswer) {
              buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold";
            } else if (option === answered) {
              buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold";
            } else {
              buttonClass += "border-gray-50 dark:border-gray-800 text-gray-300 dark:text-gray-600";
            }
          }

          return (
            <button
              key={idx}
              disabled={!!answered}
              onClick={() => handleAnswer(option)}
              className={buttonClass}
            >
              {option}
            </button>
          );
        })}
      </div>

      {isCorrect !== null && (
        <div className={`mt-6 font-bold text-lg animate-bounce ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isCorrect ? '✓ Correct!' : '✗ Wrong!'}
        </div>
      )}
    </div>
  );
}
