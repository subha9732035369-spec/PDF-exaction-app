
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
  const [loadingMsg, setLoadingMsg] = useState('Initializing...');
  
  const progressInterval = useRef<number | null>(null);

  const updateLoadingState = (progress: number) => {
    setLoadingProgress(progress);
    if (progress < 30) setLoadingMsg("Reading document structure...");
    else if (progress < 60) setLoadingMsg("Identifying key concepts and facts...");
    else if (progress < 90) setLoadingMsg("Formulating multiple-choice questions...");
    else setLoadingMsg("Finalizing your quiz...");
  };

  const startProgress = () => {
    setLoadingProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
    
    progressInterval.current = window.setInterval(() => {
      setLoadingProgress(prev => {
        if (prev < 30) return prev + 2;
        if (prev < 60) return prev + 1;
        if (prev < 85) return prev + 0.5;
        if (prev < 95) return prev + 0.1;
        return prev;
      });
    }, 100);
  };

  useEffect(() => {
    updateLoadingState(loadingProgress);
  }, [loadingProgress]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError("Please upload a valid PDF file.");
      return;
    }

    try {
      setState('LOADING');
      setError(null);
      startProgress();
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = (event.target?.result as string).split(',')[1];
          const generatedQuiz = await generateQuizFromPDF(base64, file.name);
          
          // Complete the bar before transitioning
          setLoadingProgress(100);
          setTimeout(() => {
            setQuiz(generatedQuiz);
            setState('QUIZ');
            if (progressInterval.current) clearInterval(progressInterval.current);
          }, 500);
        } catch (err: any) {
          setError(err.message || "An error occurred while processing the PDF.");
          setState('IDLE');
          if (progressInterval.current) clearInterval(progressInterval.current);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to read file.");
      setState('IDLE');
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
  };

  const onQuizComplete = (finalResponses: UserResponse[]) => {
    setResponses(finalResponses);
    setState('RESULT');
  };

  const restart = () => {
    setState('IDLE');
    setQuiz(null);
    setResponses([]);
    setError(null);
    setLoadingProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={restart}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <i className="fas fa-graduation-cap text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">QUIZ<span className="text-indigo-600">GENIUS</span></h1>
          </div>
          <div className="hidden md:flex gap-6">
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase tracking-wider">
              <i className="fas fa-check-circle mr-1"></i> Free Access
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {state === 'IDLE' && (
          <div className="max-w-4xl mx-auto py-16 md:py-24 px-6 text-center">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100">
              Free AI Study Tool
            </span>
            <h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Turn Any PDF into an <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Interactive Quiz</span>
            </h2>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload your lecture notes or textbooks. Our Gemini-powered AI extracts core concepts and creates timed multiple choice questions for free.
            </p>

            <div className="max-w-lg mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
              <div className="mb-8 p-10 border-2 border-dashed border-gray-200 rounded-2xl hover:border-indigo-400 transition-colors group relative cursor-pointer bg-slate-50/50">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 shadow-sm transition-colors border border-gray-100">
                    <i className="fas fa-cloud-upload-alt text-gray-400 text-2xl group-hover:text-indigo-500"></i>
                  </div>
                  <p className="text-gray-700 font-bold mb-1">Click to upload PDF</p>
                  <p className="text-xs text-gray-400">PDF documents only • Up to 20MB</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-3 animate-head-shake">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              <div className="flex items-center justify-center gap-6 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                <span className="flex items-center gap-1.5"><i className="fas fa-magic text-indigo-400"></i> AI Powered</span>
                <span className="flex items-center gap-1.5"><i className="fas fa-clock text-violet-400"></i> Timed</span>
                <span className="flex items-center gap-1.5"><i className="fas fa-wallet text-emerald-400"></i> 100% Free</span>
              </div>
            </div>
          </div>
        )}

        {state === 'LOADING' && (
          <div className="flex flex-col items-center justify-center py-32 px-6 max-w-xl mx-auto text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 relative">
                <i className="fas fa-brain text-indigo-600 text-3xl animate-pulse"></i>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Extracting Knowledge</h3>
            
            <div className="w-full bg-gray-100 rounded-full h-4 mb-4 p-1 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-300 relative shadow-sm"
                style={{ width: `${loadingProgress}%` }}
              >
                 <div className="absolute top-0 right-0 h-full w-4 bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex justify-between w-full text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
                <span>{loadingMsg}</span>
                <span className="text-indigo-600">{Math.round(loadingProgress)}%</span>
            </div>

            <p className="text-sm text-gray-500 max-w-sm italic">
                "Study as if you were to live forever; live as if you were to die tomorrow." — Mahatma Gandhi
            </p>
          </div>
        )}

        {state === 'QUIZ' && quiz && (
          <QuizUI 
            quiz={quiz} 
            onComplete={onQuizComplete} 
            onCancel={restart}
          />
        )}

        {state === 'RESULT' && quiz && (
          <ResultView 
            quiz={quiz} 
            responses={responses} 
            onRestart={restart}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-graduation-cap text-white text-sm"></i>
              </div>
              <h1 className="text-lg font-black text-gray-900">QUIZGENIUS</h1>
            </div>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Empowering students through advanced AI generation tools. Built for learners, accessible to everyone.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-indigo-600">Open Source</a></li>
              <li><a href="#" className="hover:text-indigo-600">Free Resources</a></li>
              <li><a href="#" className="hover:text-indigo-600">Study Groups</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-indigo-600">FAQ</a></li>
              <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600">Terms of Use</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>&copy; 2024 QuizGenius AI. All rights reserved.</p>
          <p>Powered by Gemini 3 Pro • Free Forever</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
