import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  RotateCcw,
  CheckCircle2,
  PartyPopper,
  Zap,
  LayoutDashboard,
  Target,
  Crown
} from 'lucide-react';

// --- Interfaces ---

interface GameContent {
  prompt: string;
  category: string;
}

interface GameMetadata {
  company_name: string;
  theme: string;
}

interface GameData {
  game_metadata?: GameMetadata;
  content?: GameContent[];
}

interface GreenTeamWinsProps {
  gameData: GameData | GameContent[]; 
  roomId: string;
  isHost: boolean;
}

type GamePhase = 'START' | 'QUESTION' | 'REVEAL' | 'SUMMARY';

const GreenTeamWins: React.FC<GreenTeamWinsProps> = ({ gameData, roomId, isHost }) => {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [consensusCount, setConsensusCount] = useState<number>(0);

  // חילוץ נתונים
  const questions = useMemo(() => {
    if (Array.isArray(gameData)) return gameData;
    if (gameData && gameData.content) return gameData.content;
    return [];
  }, [gameData]);

  const metadata = useMemo(() => {
    if (!Array.isArray(gameData) && gameData?.game_metadata) return gameData.game_metadata;
    return { company_name: "TEAM BUILDING", theme: "Green Team Wins" };
  }, [gameData]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#05050a] text-white flex items-center justify-center font-sans" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-emerald-500 font-bold tracking-widest uppercase">טוען מערכת...</p>
        </div>
      </div>
    );
  }

  const currentCard = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const nextStep = () => {
    if (phase === 'QUESTION') {
      setPhase('REVEAL');
    } else if (phase === 'REVEAL') {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
        setPhase('QUESTION');
      } else {
        setPhase('SUMMARY');
      }
    }
  };

  // --- Views ---

  if (phase === 'START') {
    return (
      <div dir="rtl" className="min-h-screen bg-[#05050a] text-white p-12 flex flex-col items-center justify-center font-sans overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="text-center relative z-10 space-y-12">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black tracking-[0.3em] text-emerald-400 uppercase">Consensus Protocol v2.0</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-none">
              GREEN <span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600">TEAM</span>
              <br />WINS
            </h1>
            <p className="text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              המשחק שבו האינדיבידואל מנצח דרך <span className="text-white font-semibold">הקבוצה</span>.
              <br />תהיו ברוב – תהיו בירוק.
            </p>
          </div>
          <button 
            onClick={() => setPhase('QUESTION')}
            className="px-12 py-5 bg-emerald-600 text-black rounded-2xl font-bold text-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:scale-105 active:scale-95"
          >
            כניסה למערכת
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'SUMMARY') {
    return (
      <div dir="rtl" className="min-h-screen bg-[#05050a] text-white p-12 flex flex-col items-center justify-center font-sans">
        <div className="relative z-10 text-center space-y-12 w-full max-w-4xl">
          <PartyPopper className="w-24 h-24 text-amber-400 mx-auto animate-bounce" />
          <h2 className="text-6xl font-black">משימה הושלמה</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-[2.5rem] p-10 flex flex-col items-center justify-center space-y-4">
               <span className="text-emerald-500/50 font-black uppercase tracking-widest text-sm">מדד סנכרון סופי</span>
               <div className="flex items-center gap-4">
                 <Zap className="w-12 h-12 text-emerald-400 fill-emerald-400" />
                 <span className="text-9xl font-mono font-bold">{consensusCount}</span>
               </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-[2.5rem] p-10 flex flex-col items-center justify-center space-y-4 text-right">
               <Crown className="w-12 h-12 text-amber-500" />
               <h3 className="text-2xl font-bold">הירוקים שביניכם:</h3>
               <p className="text-gray-400">
                 מי שצבר הכי הרבה נקודות הוא מאסטר הקונצנזוס של {metadata.company_name}.
               </p>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="flex items-center gap-3 text-gray-500 hover:text-white transition-all mx-auto pt-8 group">
            <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-xl font-medium uppercase tracking-tighter">אתחול מחדש (Room: {roomId})</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#05050a] text-white p-8 md:p-16 font-sans relative flex flex-col overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <header className="relative z-20 flex justify-between items-center mb-16">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">{metadata.company_name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{metadata.theme}</h1>
        </div>

        {isHost && (
          <div className="relative bg-black border border-white/10 px-8 py-4 rounded-2xl flex items-center gap-8 shadow-2xl backdrop-blur-md">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">מדד סנכרון</p>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-mono font-bold text-white">{consensusCount}</span>
                <button 
                  onClick={() => setConsensusCount(prev => prev + 1)}
                  className="w-10 h-10 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-all flex items-center justify-center"
                >
                  <Zap className="w-5 h-5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-20 flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
        <div className="mb-12 space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black text-white/20 font-mono tracking-tighter">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
              משימה {currentIndex + 1} מתוך {totalQuestions}
            </span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-cyan-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(16,185,129,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="relative bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-[2.5rem] p-16 md:p-24 min-h-[480px] flex flex-col justify-center items-center text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-12 flex items-center gap-3">
             <div className="h-px w-8 bg-emerald-500/50" />
             <span className="text-sm font-black text-emerald-400 uppercase tracking-[0.4em]">{currentCard.category}</span>
             <div className="h-px w-8 bg-emerald-500/50" />
          </div>

          <h2 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight max-w-4xl">
            {currentCard.prompt}
          </h2>

          {phase === 'REVEAL' && (
            <div className="mt-16 animate-in zoom-in slide-in-from-bottom-8 duration-500">
              <div className="bg-emerald-500 text-black px-10 py-5 rounded-2xl flex items-center gap-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
                <div className="text-right">
                  <p className="text-2xl font-black leading-none">הקבוצה הירוקה מנצחת!</p>
                  <p className="text-sm font-bold opacity-70 italic uppercase tracking-tighter">מי שברוב מקבל נקודה</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {isHost && (
          <div className="mt-16 flex justify-center">
            <button 
              onClick={nextStep}
              className="group relative flex items-center gap-6 px-16 py-6 bg-white text-black rounded-[2rem] font-black text-2xl transition-all hover:pr-12 hover:pl-20 shadow-2xl active:scale-95"
            >
              <span>{phase === 'QUESTION' ? 'חשוף תוצאה' : 'לשאלה הבאה'}</span>
              <ChevronLeft className="w-8 h-8 transition-transform group-hover:-translate-x-2" />
            </button>
          </div>
        )}
      </main>

      <footer className="mt-12 text-center opacity-20">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em]">Room: {roomId} • Platform: 2.0.4</div>
      </footer>
    </div>
  );
};

export default GreenTeamWins;