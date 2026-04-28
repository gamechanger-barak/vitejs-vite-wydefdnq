import React, { useState } from 'react';
import { 
  ChevronLeft, 
  RotateCcw,
  Sparkles,
  Users,
  CheckCircle2,
  PartyPopper
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
  gameData: GameData | GameContent[]; // תמיכה בשני המבנים
  roomId: string;
  isHost: boolean;
}

type GamePhase = 'START' | 'QUESTION' | 'REVEAL' | 'SUMMARY';

const GreenTeamWins: React.FC<GreenTeamWinsProps> = ({ gameData, roomId, isHost }) => {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scores, setScores] = useState({ teamA: 0, teamB: 0 });

  // לוגיקה לחילוץ התוכן - בודק אם זה מערך ישיר או אובייקט עוטף
  const questions = useMemo(() => {
    if (Array.isArray(gameData)) return gameData;
    if (gameData && gameData.content) return gameData.content;
    return [];
  }, [gameData]);

  const metadata = useMemo(() => {
    if (!Array.isArray(gameData) && gameData?.game_metadata) return gameData.game_metadata;
    return { company_name: "המשחק שלי", theme: "גיבוש צוות" };
  }, [gameData]);

  // הגנה מפני נתונים חסרים
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center font-sans" dir="rtl">
        <div className="text-center p-8 border border-white/10 rounded-3xl bg-gray-900/50">
          <p className="text-xl opacity-50">ממתין לנתוני המשחק...</p>
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

  const updateScore = (team: 'teamA' | 'teamB', points: number) => {
    setScores(prev => ({ ...prev, [team]: Math.max(0, prev[team] + points) }));
  };

  // --- Views ---

  if (phase === 'START') {
    return (
      <div dir="rtl" className="min-h-screen bg-[#0d0d1a] text-white p-12 flex flex-col items-center justify-center font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px]" />
        <div className="text-center space-y-8 relative z-10">
          <Users className="w-20 h-20 text-emerald-400 mx-auto" />
          <h1 className="text-6xl font-black italic tracking-tighter">GREEN TEAM <span className="text-emerald-500">WINS</span></h1>
          <p className="text-2xl text-gray-400 max-w-xl mx-auto">בואו נראה כמה אתם באמת מסונכרנים עם שאר הצוות.</p>
          <button onClick={() => setPhase('QUESTION')} className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-2xl transition-all shadow-lg shadow-emerald-900/20">
            מתחילים
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'SUMMARY') {
    const winner = scores.teamA > scores.teamB ? "צוות א'" : scores.teamB > scores.teamA ? "צוות ב'" : "תיקו!";
    return (
      <div dir="rtl" className="min-h-screen bg-[#0d0d1a] text-white p-12 flex flex-col items-center justify-center font-sans">
        <PartyPopper className="w-20 h-20 text-amber-400 mb-6" />
        <h2 className="text-5xl font-bold mb-10 text-white">התוצאות הסופיות</h2>
        <div className="flex gap-8 items-center mb-12">
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center min-w-[160px]">
            <p className="text-gray-500 text-sm mb-2">צוות א'</p>
            <p className="text-6xl font-mono font-bold text-emerald-400">{scores.teamA}</p>
          </div>
          <div className="text-2xl font-black text-gray-700">VS</div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center min-w-[160px]">
            <p className="text-gray-500 text-sm mb-2">צוות ב'</p>
            <p className="text-6xl font-mono font-bold text-rose-400">{scores.teamB}</p>
          </div>
        </div>
        <div className="px-8 py-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl mb-8">
            <h3 className="text-2xl font-bold text-emerald-400">המנצח: {winner}</h3>
        </div>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all"><RotateCcw className="w-5 h-5" /> משחק חדש</button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#0d0d1a] text-white p-6 md:p-12 font-sans relative flex flex-col overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px]" />
      
      <header className="relative z-10 flex justify-between items-center mb-12">
        <div>
          <h4 className="text-emerald-500 font-bold text-sm tracking-widest">{metadata.company_name}</h4>
          <h1 className="text-xl font-medium opacity-60">Green Team Wins</h1>
        </div>

        <div className="bg-gray-900/80 border border-white/10 p-4 rounded-2xl flex items-center gap-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
                {isHost && <button onClick={() => updateScore('teamA', -1)} className="w-6 h-6 rounded-full bg-white/5">-</button>}
                <span className="text-2xl font-mono text-emerald-400">{scores.teamA}</span>
                {isHost && <button onClick={() => updateScore('teamA', 1)} className="w-6 h-6 rounded-full bg-emerald-500/20">+</button>}
            </div>
            <div className="w-px h-6 bg-gray-800" />
            <div className="flex items-center gap-3">
                {isHost && <button onClick={() => updateScore('teamB', -1)} className="w-6 h-6 rounded-full bg-white/5">-</button>}
                <span className="text-2xl font-mono text-rose-400">{scores.teamB}</span>
                {isHost && <button onClick={() => updateScore('teamB', 1)} className="w-6 h-6 rounded-full bg-rose-500/20">+</button>}
            </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
        <div className="w-full h-1 bg-gray-800 rounded-full mb-8">
          <div className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_10px_#10b981]" style={{ width: `${progress}%` }} />
        </div>

        <div className="bg-gray-900/40 border border-white/5 backdrop-blur-xl p-12 md:p-20 rounded-[3rem] shadow-2xl relative min-h-[400px] flex flex-col justify-center">
            <span className="absolute top-8 right-12 text-xs font-bold text-emerald-500 uppercase tracking-widest">{currentCard.category}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-center leading-tight">
                {currentCard.prompt}
            </h2>

            {phase === 'REVEAL' && (
                <div className="mt-12 flex flex-col items-center animate-in zoom-in duration-300">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-2xl flex items-center gap-4">
                        <CheckCircle2 className="text-emerald-500 w-6 h-6" />
                        <span className="text-xl font-bold">הרוב קובע! מי שצדק מקבל נקודה.</span>
                    </div>
                </div>
            )}
        </div>

        {isHost && (
          <div className="mt-8 flex justify-between items-center">
             <span className="text-gray-600 font-mono text-sm">שאלה {currentIndex + 1} מתוך {totalQuestions}</span>
             <button onClick={nextStep} className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-xl">
               {phase === 'QUESTION' ? 'חשוף תוצאה' : 'לשאלה הבאה'}
               <ChevronLeft className="w-5 h-5" />
             </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default GreenTeamWins;