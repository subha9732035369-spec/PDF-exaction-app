
import React from 'react';
import { Quiz, UserResponse } from '../types';
import { Button } from './Button';

interface ResultViewProps {
  quiz: Quiz;
  responses: UserResponse[];
  onRestart: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ quiz, responses, onRestart }) => {
  const score = responses.reduce((acc, curr) => acc + (curr.isCorrect ? 1 : 0), 0);
  const percentage = Math.round((score / quiz.questions.length) * 100);
  const totalTimeSpent = responses.reduce((acc, curr) => acc + curr.timeSpent, 0);

  const getRank = () => {
    if (percentage >= 90) return { label: 'Expert', color: 'text-green-600', bg: 'bg-green-100', icon: 'fa-trophy' };
    if (percentage >= 70) return { label: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100', icon: 'fa-medal' };
    if (percentage >= 50) return { label: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: 'fa-star' };
    return { label: 'Beginner', color: 'text-gray-600', bg: 'bg-gray-100', icon: 'fa-book-open' };
  };

  const rank = getRank();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${rank.bg} ${rank.color} mb-4 text-3xl`}>
          <i className={`fas ${rank.icon}`}></i>
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Quiz Completed!</h2>
        <p className="text-xl text-gray-500">Here's how you performed on "{quiz.title}"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Score</p>
          <p className="text-3xl font-bold text-gray-800">{score} / {quiz.questions.length}</p>
          <div className="mt-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block">
            {percentage}%
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Accuracy</p>
          <p className="text-3xl font-bold text-gray-800">{percentage}%</p>
          <p className="text-sm text-gray-500 mt-2">{rank.label} Level</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Time Taken</p>
          <p className="text-3xl font-bold text-gray-800">{Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s</p>
          <p className="text-sm text-gray-500 mt-2">Avg {Math.round(totalTimeSpent / Math.max(1, responses.length))}s per q</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-700">Detailed Review</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {quiz.questions.map((q, idx) => {
            const resp = responses.find(r => r.questionId === q.id);
            return (
              <div key={q.id} className="p-8">
                <div className="flex items-start gap-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    resp?.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-grow">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">{q.question}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctAnswerIndex;
                        const isSelected = resp?.selectedOptionIndex === optIdx;
                        
                        let badgeClass = 'border-gray-100 text-gray-600';
                        if (isCorrect) badgeClass = 'border-green-500 bg-green-50 text-green-700 font-bold';
                        else if (isSelected && !isCorrect) badgeClass = 'border-red-300 bg-red-50 text-red-600';

                        return (
                          <div key={optIdx} className={`p-3 rounded-lg border-2 flex items-center justify-between ${badgeClass}`}>
                            <span>{opt}</span>
                            {isCorrect && <i className="fas fa-check-circle text-green-600"></i>}
                            {isSelected && !isCorrect && <i className="fas fa-times-circle text-red-600"></i>}
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                      <p className="font-bold mb-1"><i className="fas fa-info-circle mr-2"></i>Explanation</p>
                      {q.explanation}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="secondary" onClick={() => window.print()} className="hidden md:flex">
          <i className="fas fa-print"></i> Print Results
        </Button>
        <Button onClick={onRestart} className="px-12">
          Start New Quiz
        </Button>
      </div>
    </div>
  );
};
