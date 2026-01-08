
import React, { useState, useEffect, useRef } from 'react';
import { AppState, Quiz, UserResponse } from './types';
import { generateQuizFromPDF } from './services/geminiService';
import { Button } from './components/Button';
import { QuizUI } from './components/QuizUI';
import { ResultView } from './components/ResultView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Both'>('Both');
  
  const progressInterval = useRef<number | null>(null);

  const startProgress = () => {
    setLoadingProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = window.setInterval(() => {
      setLoadingProgress(prev => {
        if (prev < 90) return prev + (100 - prev) * 0.04;
        return prev < 98 ? prev + 0.1 : prev;
      });
    }, 150);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    try {
      setState('LOADING');
      setError(null);
      startProgress();
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = (event.target?.result as string).split(',')[1];
          const generatedQuiz = await generateQuizFromPDF(base64, file.name);
          setQuiz(generatedQuiz);
          setLoadingProgress(100);
          setTimeout(() => setState('SETUP'), 600);
        } catch (err: any) {
          setError(err.message || "Something went wrong.");
          setState('IDLE');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setState('IDLE');
    }
  };

  const restart = () => {
    setState('IDLE');
    setQuiz(null);
    setResponses([]);
    setError(null);
    setLoadingProgress(0);
  };

  const handleReattempt = () => {
    setResponses([]);
    setState('SETUP');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-inter">
      {/* Universal Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50 no-print flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={restart}>
          <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200">
            <i className="fas fa-graduation-cap text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">QUIZ<span className="text-sky-600">GENIUS</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Exam Prep Portal</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
            <span className="hidden md:inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 rounded-full border border-emerald-100">
                <i className="fas fa-bolt mr-1"></i> Pro AI Enabled
            </span>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        {state === 'IDLE' && (
          <div className="flex-grow flex items-center justify-center py-20 px-6">
            <div className="max-w-3xl w-full text-center">
              <h2 className="text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tighter">
                Turn your PDFs into <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">Professional Exams.</span>
              </h2>
              <p className="text-xl text-slate-500 mb-12 max-w-xl mx-auto font-medium">
                Upload your study material or question bank. Our AI extracts every question and sets up a timed examination portal for free.
              </p>

              <div className="max-w-md mx-auto bg-white p-10 rounded-[3rem] shadow-2xl shadow-sky-900/10 border border-slate-200">
                <div className="relative group cursor-pointer">
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="p-14 border-4 border-dashed border-slate-100 rounded-[2rem] group-hover:border-sky-400 group-hover:bg-sky-50/50 transition-all flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <i className="fas fa-file-pdf text-slate-300 text-3xl group-hover:text-sky-500"></i>
                    </div>
                    <p className="text-slate-900 font-black uppercase tracking-widest text-sm">Upload Study PDF</p>
                    <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-tight">Max Size: 25MB</p>
                  </div>
                </div>
                {error && (
                  <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-head-shake">
                    <i className="fas fa-exclamation-triangle mr-2"></i>{error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {state === 'LOADING' && (
          <div className="flex-grow flex flex-col items-center justify-center py-32 text-center px-6">
            <div className="w-28 h-28 bg-white rounded-[2rem] shadow-2xl shadow-sky-900/20 flex items-center justify-center mb-10">
                <i className="fas fa-microchip text-sky-600 text-4xl animate-pulse"></i>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Analyzing PDF Contents</h3>
            <p className="text-slate-500 font-medium mb-10">Extracting questions, diagrams, and directions...</p>
            
            <div className="w-full max-w-sm bg-slate-200 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(14,165,233,0.5)]" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.3em]">Processing: {Math.round(loadingProgress)}%</p>
          </div>
        )}

        {state === 'SETUP' && quiz && (
          <div className="flex-grow flex items-center justify-center py-20 px-6">
            <div className="max-w-xl w-full bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-900/10 border border-slate-200">
              <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{quiz.title}</h3>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-10">Extraction Complete: {quiz.questions.length} Questions Found</p>
              
              <div className="mb-10">
                <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Select Examination Language</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['English', 'Hindi', 'Both'] as const).map(l => (
                    <button 
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                        language === l 
                        ? 'border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-900/20' 
                        : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl mb-10">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Exam Guidelines</h4>
                <ul className="space-y-4 text-xs font-bold text-slate-700">
                  <li className="flex items-center gap-3"><i className="fas fa-stopwatch text-sky-500"></i> Duration: {Math.floor(quiz.timeLimitSeconds / 60)} Minutes</li>
                  <li className="flex items-center gap-3"><i className="fas fa-layer-group text-sky-500"></i> Sections: {quiz.sections.join(', ')}</li>
                  <li className="flex items-center gap-3"><i className="fas fa-shield-alt text-sky-500"></i> Full extraction performed from {quiz.description.slice(0, 50)}...</li>
                </ul>
              </div>

              <Button onClick={() => setState('QUIZ')} className="w-full py-5 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-sky-900/20">
                Start Examination Portal
              </Button>
            </div>
          </div>
        )}

        {state === 'QUIZ' && quiz && (
          <QuizUI quiz={quiz} onComplete={(r) => { setResponses(r); setState('RESULT'); }} onCancel={restart} />
        )}

        {state === 'RESULT' && quiz && (
          <ResultView 
            quiz={quiz} 
            responses={responses} 
            onRestart={restart} 
            onReattempt={handleReattempt}
          />
        )}
      </main>
    </div>
  );
};

export default App;
