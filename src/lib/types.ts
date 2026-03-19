export interface UserData {
  userId: string; // Cognito sub (UUID)
  username: string;
  passwordHash: string;
  scores: { [wordId: string]: number };
  scores2?: { [wordId: string]: number }; // Scores for learning from dutch to the language
  stats: {
    wordsPracticed: number;
    totalTimeSpent: number; // in seconds
  };
}

export interface UserSession {
  username: string;
}
