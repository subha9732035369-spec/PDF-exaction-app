
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  description: string;
  questions: Question[];
  timeLimitSeconds: number;
}

export type AppState = 'IDLE' | 'LOADING' | 'QUIZ' | 'RESULT';

export interface UserResponse {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeSpent: number;
}
