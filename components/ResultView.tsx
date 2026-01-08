
import React from 'react';
import { Quiz, UserResponse } from '../types';
import { Button } from './Button';

interface ResultViewProps {
  quiz: Quiz;
  responses: UserResponse[];
  onRestart: () => void;
  onReattempt: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ quiz, responses, onRestart, onReattempt }) => {
  const score = responses.reduce((acc, curr) => acc + (curr.isCorrect ? 1 : 0), 0);
  const totalQuestions = quiz.questions.length;
  const totalTimeSpent = responses.reduce((acc, curr) => acc + curr.timeSpent, 0);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="no-print text-center mb-12">
        <h2 className="text-5xl font-black text-slate-900 mb-2 uppercase tracking-tight">Test Result Report</h2>
        <div className="text-3xl font-black text-sky-600 mb-4">{score} / {totalQuestions} Marks</div>
        <div className="flex justify-center gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <div>Total Time: <span className="text-slate-900">{Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s</span></div>
            <div>Avg Speed: <span className="text-slate-900">{Math.round(totalTimeSpent / Math.max(1, responses.length))}s/q</span></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-200 overflow-hidden mb-12">
        <div className="bg-slate-900 text-white px-8 py-6 flex justify-between items-center">
            <div>
                <h3 className="text-xl font-black uppercase tracking-wider">Detailed Analytics</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">{quiz.title}</p>
            </div>
            <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => window.print()} 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 no-print backdrop-blur-md px-6"
            >
                <i className="fas fa-download mr-2"></i> Save Report (PDF)
            </Button>
        </div>
        
        <div className="divide-y divide-slate-100">
          {quiz.questions.map((q, idx) => {
            const resp = responses.find(r => r.questionId === q.id);
            return (
              <div key={q.id} className="p-10 page-break-inside-avoid hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-6">
                  <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                    resp?.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h4 className="text-xl font-bold text-slate-900 leading-snug">{q.question}</h4>
                        <div className="flex flex-col items-end">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter mb-1 ${
                                resp?.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {resp?.isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Time Spent: <span className="text-slate-900">{resp?.timeSpent || 0}s</span></span>
                        </div>
                    </div>

                    {q.context && (
                        <div className="mb-6 p-4 bg-slate-100 border-l-4 border-sky-500 rounded-r-xl text-xs font-medium text-slate-600 whitespace-pre-wrap italic">
                            {q.context}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                        {q.options.map((opt, oIdx) => {
                            const isCorrect = oIdx === q.correctAnswerIndex;
                            const isSelected = resp?.selectedOptionIndex === oIdx;
                            let style = 'bg-white border-slate-100 text-slate-400';
                            if (isCorrect) style = 'bg-green-50 border-green-500 text-green-800 font-bold';
                            else if (isSelected) style = 'bg-red-50 border-red-300 text-red-800 font-bold';

                            return (
                                <div key={oIdx} className={`p-4 rounded-xl border-2 text-sm flex justify-between items-center ${style}`}>
                                    <span>{String.fromCharCode(65+oIdx)}) {opt}</span>
                                    {isCorrect && <i className="fas fa-check-circle text-green-500"></i>}
                                    {isSelected && !isCorrect && <i className="fas fa-times-circle text-red-500"></i>}
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-sky-50 p-6 rounded-2xl border border-sky-100">
                        <div className="text-xs font-black text-sky-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <i className="fas fa-lightbulb"></i> Explanatory Answer
                        </div>
                        <div className="text-sm text-sky-900 leading-relaxed font-medium">
                            {q.explanation}
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 no-print pb-24">
        <Button 
          onClick={onReattempt} 
          className="px-16 py-4 text-lg bg-sky-600 hover:bg-sky-700 shadow-xl shadow-sky-900/20"
        >
          Reattempt Test
        </Button>
        <Button 
          onClick={onRestart} 
          variant="secondary"
          className="px-16 py-4 text-lg border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          New PDF Upload
        </Button>
      </div>
    </div>
  );
};
