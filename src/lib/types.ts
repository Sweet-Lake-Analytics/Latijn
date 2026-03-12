export interface UserData {
  userId: string; // Cognito sub (UUID)
  username: string;
  passwordHash: string;
  scores: { [wordId: string]: number };
  stats: {
    wordsPracticed: number;
    totalTimeSpent: number; // in seconds
  };
}

export interface UserSession {
  username: string;
}
