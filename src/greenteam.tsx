import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, RotateCcw, CheckCircle2, 
  PartyPopper, Zap, LayoutDashboard, Target, Crown 
} from 'lucide-react';

// --- Interfaces ---
interface GameContent { prompt: string; category: string; }
interface GameMetadata { company_name: string; theme: string; }
interface GameData { game_metadata?: GameMetadata; content?: GameContent[]; }
interface Props { gameData: GameData | GameContent[]; roomId: string; isHost: boolean; }

type GamePhase = 'START' | 'QUESTION' | 'REVEAL' | 'SUMMARY';

const GreenTeamWins: React.FC<Props> = ({ gameData, roomId, isHost }) => {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [consensusCount, setConsensusCount] = useState(0);

  // חילוץ נתונים בטוח כדי למנוע קריסה
  const questions = useMemo(() => {
    if (!gameData) return [];
    if (Array.isArray(gameData)) return gameData;
    if (typeof gameData === 'object' && gameData.content) return gameData.content;
    return [];
  }, [gameData]);

  const metadata = useMemo(() => {
    const fallback = { company_name: "TEAM BUILDING", theme: "Green Team Wins" };
    if (!gameData || Array.isArray(gameData)) return fallback;
    return {
      company_name: gameData.game_metadata?.company_name || fallback.company_name,
      theme: gameData.game_metadata?.theme || fallback.theme
    };
  }, [gameData]);

  // מניעת מסך לבן במידה והנתונים טרם הגיעו
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#020205] text-white flex items-center justify-center font-sans" dir="rtl">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentCard = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleNext = () => {
    if (phase === 'QUESTION') {
      setPhase('REVEAL');
      if (isHost) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#34d399', '#ffffff'] });
    } else {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
        setPhase('QUESTION');
      } else {
        setPhase('SUMMARY');
      }
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#020205] text-white p-6 md:p-12 font-sans relative overflow-hidden flex flex-col">
      {/* Background Cinematic Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-emerald-600/20 rounded-full blur-[150px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[150px]" />
      </div>

      <header className="relative z-10 flex justify-between items-start mb-12">
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <div className="flex items-center gap-2 mb-1 text-emerald-500">
            <LayoutDashboard size={16} />
            <span className="text-xs font-black tracking-widest uppercase">{metadata.company_name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{metadata.theme}</h1>
        </motion.div>

        {isHost && phase !== 'START' && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl backdrop-blur-xl flex items-center gap-6 shadow-2xl">
            <div className="text-center border-l border-white/10 pl-6">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 text-right">מדד סנכרון</p>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-mono font-bold text-emerald-400">{consensusCount}</span>
                <button onClick={() => setConsensusCount(c => c + 1)} className="w-10 h-10 bg-emerald-500 text-black rounded-xl flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Zap size={20} fill="currentColor" />
                </button>
              </div>
            </div>
            <div className="hidden lg:block text-[10px] text-gray-400 max-w-[80px] leading-tight text-right">
              המנחה מעלה נקודה כשיש הסכמה רחבה
            </div>
          </motion.div>
        )}
      </header>

      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'START' ? (
            <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center space-y-12">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="inline-block p-6 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                <Target size={64} className="text-emerald-400" />
              </motion.div>
              <div className="space-y-4">
                <h2 className="text-8xl md:text-9xl font-black tracking-tighter leading-none italic">
                  GREEN <span className="text-emerald-500">TEAM</span><br/>WINS
                </h2>
                <p className="text-2xl text-gray-400 max-w-xl mx-auto font-light leading-relaxed">
                  האם אתם מסוגלים לחשוב כמו הרוב? <br/>
                  <span className="text-white font-bold underline decoration-emerald-500">הירוקים תמיד מנצחים.</span>
                </p>
              </div>
              <button onClick={() => setPhase('QUESTION')} className="px-16 py-6 bg-emerald-600 text-black rounded-2xl font-black text-2xl hover:bg-emerald-400 transition-all shadow-[0_0_40px_rgba(16,185,129,0.4)] active:scale-95">
                כניסה למערכת
              </button>
            </motion.div>
          ) : phase === 'SUMMARY' ? (
            <motion.div key="summary" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10">
              <PartyPopper size={80} className="text-amber-400 mx-auto" />
              <h2 className="text-6xl font-black">הסנכרון הושלם</h2>
              <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] inline-block shadow-2xl backdrop-blur-2xl">
                 <p className="text-gray-400 uppercase tracking-[0.3em] font-bold mb-4">רמת סנכרון צוותית</p>
                 <div className="flex items-center justify-center gap-6">
                    <Crown size={48} className="text-amber-500" />
                    <span className="text-9xl font-mono font-black">{consensusCount}</span>
                 </div>
              </div>
              <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all mx-auto text-xl">
                <RotateCcw size={20} /> אתחול משחק חדש
              </button>
            </motion.div>
          ) : (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }} className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" />
              </div>

              <motion.div layout className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-[40px] rounded-[4rem] p-16 md:p-24 min-h-[500px] flex flex-col justify-center items-center text-center relative shadow-2xl group transition-all hover:border-emerald-500/20">
                <div className="absolute top-12 flex items-center gap-4 text-emerald-500/50">
                  <div className="h-px w-8 bg-current" />
                  <span className="text-xs font-black uppercase tracking-[0.4em]">{currentCard.category}</span>
                  <div className="h-px w-8 bg-current" />
                </div>

                <AnimatePresence mode="wait">
                  <motion.h2 key={currentIndex} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="text-5xl md:text-7xl font-black leading-tight max-w-4xl">
                    {currentCard.prompt}
                  </motion.h2>
                </AnimatePresence>

                {phase === 'REVEAL' && (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-16 bg-emerald-500 text-black px-10 py-5 rounded-2xl flex items-center gap-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 size={32} />
                    <div className="text-right">
                      <p className="text-2xl font-black leading-none">הרוב קובע!</p>
                      <p className="text-sm font-bold opacity-70 italic tracking-tighter">מי שבקבוצה הירוקה מקבל נקודה</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {isHost && (
                <div className="flex justify-center mt-8">
                  <button onClick={handleNext} className="flex items-center gap-4 px-16 py-6 bg-white text-black rounded-[2rem] font-black text-2xl hover:bg-emerald-400 transition-all shadow-2xl active:scale-95">
                    <span>{phase === 'QUESTION' ? 'חשוף תוצאה' : 'לשאלה הבאה'}</span>
                    <ChevronLeft size={28} className="mt-1" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-8 text-center opacity-10 font-mono text-[10px] tracking-widest">
        ROOM: {roomId} // ENGINE: GTW_PREMIUM_V3
      </footer>
    </div>
  );
};

export default GreenTeamWins;