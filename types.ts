
export type QuestionStatus = 'answered' | 'not-answered' | 'marked' | 'not-visited';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  context?: string; // Shared directions/DI info
  section?: string; // e.g., "Reasoning", "Numerical Ability"
}

export interface Quiz {
  title: string;
  description: string;
  questions: Question[];
  timeLimitSeconds: number;
  sections: string[];
}

export type AppState = 'IDLE' | 'LOADING' | 'SETUP' | 'QUIZ' | 'RESULT';

export interface UserResponse {
  questionId: string;
  selectedOptionIndex: number | null;
  isCorrect: boolean;
  timeSpent: number;
  status: QuestionStatus;
}
