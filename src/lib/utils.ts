export interface Word {
  id: string; // latin-dutch-chapter to be unique
  chapter: string;
  latin: string;
  dutch: string;
}

export interface UserScore {
  [wordId: string]: number;
}

export const INITIAL_SCORE = 10;
export const MIN_SCORE = 1;
export const MAX_SCORE = 20;

export async function fetchWords(): Promise<Word[]> {
  try {
    const response = await fetch('/latin_minerva.json');
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: `${item.latin.trim()}-${item.dutch.trim()}-${item.chapter.toString().trim()}`,
      chapter: item.chapter.toString().trim(),
      latin: item.latin.trim(),
      dutch: item.dutch.trim(),
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
