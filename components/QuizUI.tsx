
import React, { useState, useEffect, useRef } from 'react';
import { Quiz, UserResponse } from '../types';
import { Button } from './Button';

interface QuizUIProps {
  quiz: Quiz;
  onComplete: (responses: UserResponse[]) => void;
  onCancel: () => void;
}

export const QuizUI: React.FC<QuizUIProps> = ({ quiz, onComplete, onCancel }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimitSeconds);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleQuizComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Fill in remaining questions as incorrect/unanswered if needed
    const finalResponses = [...responses];
    onComplete(finalResponses);
  };

  const currentQuestion = quiz.questions[currentIdx];

  const handleNext = () => {
    if (selectedOption === null) return;

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const newResponse: UserResponse = {
      questionId: currentQuestion.id,
      selectedOptionIndex: selectedOption,
      isCorrect: selectedOption === currentQuestion.correctAnswerIndex,
      timeSpent
    };

    const newResponses = [...responses, newResponse];
    setResponses(newResponses);

    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      startTimeRef.current = Date.now();
    } else {
      onComplete(newResponses);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentIdx + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
          <p className="text-sm text-gray-500">Question {currentIdx + 1} of {quiz.questions.length}</p>
        </div>
        <div className={`flex flex-col items-end ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
          <div className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</div>
          <div className="text-xs uppercase tracking-wider font-semibold">Time Remaining</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-10 overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-8 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                selectedOption === idx 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200' 
                : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                selectedOption === idx ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-medium">{option}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onCancel} className="text-red-600 hover:bg-red-50">
          Quit Quiz
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={selectedOption === null}
          className="min-w-[120px]"
        >
          {currentIdx === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </Button>
      </div>
    </div>
  );
};
