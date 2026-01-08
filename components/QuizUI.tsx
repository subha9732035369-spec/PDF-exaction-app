
import React, { useState, useEffect, useRef } from 'react';
import { Quiz, UserResponse, QuestionStatus } from '../types';
import { Button } from './Button';

interface QuizUIProps {
  quiz: Quiz;
  onComplete: (responses: UserResponse[]) => void;
  onCancel: () => void;
}

export const QuizUI: React.FC<QuizUIProps> = ({ quiz, onComplete, onCancel }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimitSeconds);
  const [userResponses, setUserResponses] = useState<Record<string, UserResponse>>(
    quiz.questions.reduce((acc, q) => ({
      ...acc,
      [q.id]: { questionId: q.id, selectedOptionIndex: null, isCorrect: false, timeSpent: 0, status: 'not-visited' }
    }), {})
  );

  const timerRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Current question becomes "not-answered" (orange) if it was "not-visited"
    if (userResponses[quiz.questions[currentIdx].id].status === 'not-visited') {
      updateStatus(quiz.questions[currentIdx].id, 'not-answered');
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
      
      const now = Date.now();
      const delta = Math.floor((now - lastTimeRef.current) / 1000);
      if (delta >= 1) {
        setUserResponses(prev => ({
          ...prev,
          [quiz.questions[currentIdx].id]: {
            ...prev[quiz.questions[currentIdx].id],
            timeSpent: prev[quiz.questions[currentIdx].id].timeSpent + delta
          }
        }));
        lastTimeRef.current = now;
      }
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIdx]);

  const updateStatus = (id: string, status: QuestionStatus) => {
    setUserResponses(prev => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        // Only downgrade if currently not-visited, or if changing to marked/answered
        status: status === 'not-answered' && prev[id].status !== 'not-visited' ? prev[id].status : status 
      }
    }));
  };

  const currentQuestion = quiz.questions[currentIdx];
  const currentResp = userResponses[currentQuestion.id];

  const handleOptionSelect = (idx: number) => {
    setUserResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOptionIndex: idx,
        isCorrect: idx === currentQuestion.correctAnswerIndex
      }
    }));
  };

  const handleSaveNext = () => {
    if (currentResp.selectedOptionIndex !== null) {
      updateStatus(currentQuestion.id, 'answered');
    } else {
      updateStatus(currentQuestion.id, 'not-answered');
    }
    goToNext();
  };

  const handleMarkReview = () => {
    updateStatus(currentQuestion.id, 'marked');
    goToNext();
  };

  const handleClear = () => {
    setUserResponses(prev => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], selectedOptionIndex: null, isCorrect: false }
    }));
  };

  const goToNext = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onComplete(Object.values(userResponses));
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;

  const stats = {
    answered: Object.values(userResponses).filter(r => r.status === 'answered').length,
    notAnswered: Object.values(userResponses).filter(r => r.status === 'not-answered').length,
    marked: Object.values(userResponses).filter(r => r.status === 'marked').length,
    notVisited: Object.values(userResponses).filter(r => r.status === 'not-visited').length,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden">
      {/* Test Header */}
      <div className="bg-sky-600 text-white px-6 py-2 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg tracking-tight uppercase">{quiz.title}</div>
          <div className="h-6 w-px bg-white/20"></div>
          <div className="flex gap-2">
            {quiz.sections.map(sec => (
              <button 
                key={sec}
                className={`px-4 py-1 rounded text-xs font-bold transition-all ${
                  currentQuestion.section === sec ? 'bg-white text-sky-700' : 'bg-sky-700/50 hover:bg-sky-500'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold opacity-70">Time Left</div>
            <div className="text-xl font-mono font-bold leading-none">{formatTime(timeLeft)}</div>
          </div>
          <button onClick={handleComplete} className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded font-bold text-sm transition-colors shadow-lg shadow-red-900/20">
            Submit Test
          </button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Left/Main Column */}
        <div className="flex-grow flex flex-col border-r border-gray-300 overflow-hidden">
          <div className="bg-slate-50 border-b border-gray-200 px-6 py-2 flex justify-between items-center text-xs font-bold text-slate-600">
            <span>Question No. {currentIdx + 1}</span>
          </div>

          <div className="flex flex-grow overflow-hidden">
            {/* Directions Area (Split) */}
            {currentQuestion.context && (
              <div className="w-[45%] p-6 overflow-y-auto border-r border-gray-200 bg-white leading-relaxed">
                <div className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
                  <i className="fas fa-file-alt text-sky-500"></i> Directions / Instructions
                </div>
                <div className="text-sm text-slate-800 whitespace-pre-wrap font-medium leading-relaxed">
                  {currentQuestion.context}
                </div>
              </div>
            )}

            {/* Question & Options Area */}
            <div className={`${currentQuestion.context ? 'w-[55%]' : 'w-full'} p-8 overflow-y-auto bg-white`}>
              <div className="mb-10 text-lg font-bold text-slate-900 leading-snug whitespace-pre-wrap">
                {currentQuestion.question}
              </div>

              <div className="space-y-4">
                {currentQuestion.options.map((opt, idx) => (
                  <label key={idx} className={`group flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    currentResp.selectedOptionIndex === idx ? 'border-sky-500 bg-sky-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="mt-1 relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="q-option" 
                        className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                        checked={currentResp.selectedOptionIndex === idx}
                        onChange={() => handleOptionSelect(idx)}
                      />
                    </div>
                    <div className="flex-grow text-sm font-semibold text-slate-700 leading-relaxed">
                      <span className="text-sky-600 font-black mr-2">{String.fromCharCode(65 + idx)})</span>
                      {opt}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-slate-100 border-t border-gray-300 p-4 flex justify-between items-center no-print shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={handleMarkReview} className="text-xs font-bold border-slate-300">
                Mark for Review & Next
              </Button>
              <Button variant="secondary" size="sm" onClick={handleClear} className="text-xs font-bold border-slate-300">
                Clear Response
              </Button>
            </div>
            <Button onClick={handleSaveNext} className="bg-sky-600 hover:bg-sky-700 px-12 py-3 shadow-lg shadow-sky-900/10">
              Save & Next
            </Button>
          </div>
        </div>

        {/* Right Palette Column */}
        <div className="w-80 bg-slate-50 flex flex-col border-l border-gray-200">
          {/* User Info Placeholder */}
          <div className="p-4 flex items-center gap-4 bg-white border-b border-gray-200">
            <div className="w-14 h-14 bg-slate-200 rounded flex items-center justify-center text-slate-400">
              <i className="fas fa-user text-2xl"></i>
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-black text-slate-900 uppercase truncate">Candidate Name</div>
              <div className="text-[10px] font-bold text-sky-600 truncate">IBPS PO / Clerk Prep</div>
            </div>
          </div>

          {/* Legend Grid */}
          <div className="p-4 grid grid-cols-2 gap-2 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-green-500 text-white text-[10px] font-black flex items-center justify-center rounded-sm shadow-sm">{stats.answered}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-orange-500 text-white text-[10px] font-black flex items-center justify-center rounded-sm shadow-sm">{stats.notAnswered}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Not Ans.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-purple-600 text-white text-[10px] font-black flex items-center justify-center rounded-sm shadow-sm">{stats.marked}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Marked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-200 text-slate-500 text-[10px] font-black flex items-center justify-center rounded-sm shadow-sm">{stats.notVisited}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Not Visited</span>
            </div>
          </div>

          <div className="bg-sky-600 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest">Question Palette</div>
          
          <div className="flex-grow p-4 overflow-y-auto">
            <div className="grid grid-cols-4 gap-3">
              {quiz.questions.map((q, idx) => {
                const status = userResponses[q.id].status;
                let bg = 'bg-slate-200 text-slate-500';
                if (status === 'answered') bg = 'bg-green-500 text-white';
                else if (status === 'not-answered') bg = 'bg-orange-500 text-white';
                else if (status === 'marked') bg = 'bg-purple-600 text-white';
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-10 h-10 rounded text-xs font-black transition-all flex items-center justify-center shadow-sm ${bg} ${
                      currentIdx === idx ? 'ring-2 ring-sky-500 ring-offset-2 scale-110 z-10' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-2 no-print">
            <Button variant="secondary" size="sm" onClick={onCancel} className="w-full text-[10px] font-black py-2">Profile</Button>
            <Button variant="secondary" size="sm" className="w-full text-[10px] font-black py-2">Question Paper</Button>
            <Button variant="secondary" size="sm" className="w-full text-[10px] font-black py-2">Instructions</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
