export interface Word {
  id: string;
  method: string;
  chapter: string;
  language: string;
  dutch: string;
  comment?: string;
}

export interface UserScore {
  [wordId: string]: number;
}

export type LearningDirection = 'lang-to-nl' | 'nl-to-lang';

export const INITIAL_SCORE = 10;
export const MIN_SCORE = 1;
export const MAX_SCORE = 20;

export async function fetchWords(): Promise<Word[]> {
  try {
    const response = await fetch('/words.json');
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.id.toString().trim(),
      method: item.method.toString().trim(),
      chapter: item.chapter.toString().trim(),
      language: item.language.trim(),
      dutch: item.dutch.trim(),
      comment: item.comment?.trim(),
    }));
  } catch (error) {
    console.error('Error fetching words:', error);
    return [];
  }
}

export function getWeightedWord(words: Word[], scores: UserScore): Word {
  const weightedList: Word[] = [];
  
  words.forEach((word) => {
    const score = scores[word.id] ?? INITIAL_SCORE;
    for (let i = 0; i < score; i++) {
      weightedList.push(word);
    }
  });

  const randomIndex = Math.floor(Math.random() * weightedList.length);
  return weightedList[randomIndex];
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
