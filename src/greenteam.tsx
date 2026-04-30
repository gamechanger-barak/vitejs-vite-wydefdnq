import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  CheckCircle2,
  PartyPopper,
  Zap,
  LayoutDashboard,
  Target,
  Crown,
  Plus,
  ArrowLeft
} from 'lucide-react';

/* ─────────────────────────────────────────── Interfaces ──[cite: 2] */

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

/* ──────────────────────────────────────── Ambient Orbs ──[cite: 2] */

const AmbientOrbs: React.FC<{ phase: GamePhase }> = ({ phase }) => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute rounded-full"
      style={{
        width: 800,
        height: 800,
        top: '-20%',
        right: '-15%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }}
    />
    <motion.div
      animate={{
        scale: phase === 'REVEAL' ? 1.4 : 1,
        opacity: phase === 'REVEAL' ? 0.3 : 0.1,
      }}
      className="absolute rounded-full transition-all duration-1000"
      style={{
        width: 600,
        height: 600,
        bottom: '-10%',
        left: '-10%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)',
        filter: 'blur(100px)',
      }}
    />
  </div>
);

const GrainOverlay: React.FC = () => (
  <div
    className="pointer-events-none fixed inset-0 opacity-[0.03] z-[100]"
    aria-hidden
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundSize: '128px 128px',
    }}
  />
);

/* ──────────────────────────────────────────── Main ── */

const GreenTeamWins: React.FC<GreenTeamWinsProps> = ({ gameData, roomId, isHost }) => {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [consensusCount, setConsensusCount] = useState<number>(0);

  /* ── חילוץ נתונים בטוח ──[cite: 1, 2] */
  const questions = useMemo<GameContent[]>(() => {
    if (!gameData) return [];[cite: 1]
    if (Array.isArray(gameData)) return gameData;[cite: 2]
    if (gameData?.content) return gameData.content;[cite: 2]
    return [];[cite: 1]
  }, [gameData]);

  const metadata = useMemo<GameMetadata>(() => {
    if (!Array.isArray(gameData) && gameData?.game_metadata) return gameData.game_metadata;[cite: 2]
    return { company_name: 'TEAM BUILDING', theme: 'Green Team Wins' };[cite: 2]
  }, [gameData]);

  /* ── הגנה מפני קריסה אם הנתונים טרם נטענו ──[cite: 1, 2] */
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#020205] text-white flex flex-col items-center justify-center font-sans" dir="rtl">
        <GrainOverlay />
        <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 mb-6" 
        />
        <p className="text-xs font-black tracking-[0.5em] text-emerald-400 uppercase animate-pulse">
            Initializing Protocol...
        </p>
      </div>
    );
  }

  const currentCard = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const nextStep = () => {
    if (phase === 'QUESTION') {
      setPhase('REVEAL');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#ffffff']
      });
    } else {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((p) => p + 1);
          setPhase('QUESTION');
        } else {
          setPhase('SUMMARY');
        }
    }
  };

  /* ════════════════════════ PHASE: START ════════════════════════[cite: 2] */
  if (phase === 'START') {
    return (
      <div dir="rtl" className="min-h-screen bg-[#020205] text-white flex flex-col items-center justify-center overflow-hidden relative font-sans">
        <AmbientOrbs phase="START" />
        <GrainOverlay />

        <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="relative z-10 flex flex-col items-center text-center px-8"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-12 bg-emerald-500/10 border border-emerald-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-black tracking-[0.45em] text-emerald-400 uppercase">Consensus Protocol v2.0</span>
          </div>

          <h1 className="font-black tracking-tighter leading-[0.85] mb-10 text-[clamp(80px,14vw,160px)]">
            GREEN <span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600">TEAM</span><br />WINS
          </h1>

          <p className="text-xl text-gray-400 font-light leading-relaxed max-w-xl mb-16">
            המשחק שבו האינדיבידואל מנצח דרך <span className="text-white font-semibold">הקבוצה</span>.<br />
            תהיו ברוב – תהיו בירוק.[cite: 2]
          </p>

          <button
            onClick={() => setPhase('QUESTION')}
            className="px-16 py-6 rounded-2xl bg-emerald-600 text-black font-black text-2xl shadow-[0_0_50px_rgba(16,185,129,0.35)] hover:bg-emerald-400 transition-all active:scale-95 cursor-pointer"
          >
            כניסה למערכת
          </button>
        </motion.div>
      </div>
    );
  }

  /* ════════════════════════ PHASE: SUMMARY ════════════════════════[cite: 2] */
  if (phase === 'SUMMARY') {
    return (
      <div dir="rtl" className="min-h-screen bg-[#020205] text-white flex flex-col items-center justify-center p-10 relative overflow-hidden font-sans">
        <AmbientOrbs phase="SUMMARY" />
        <GrainOverlay />

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-4xl flex flex-col items-center">
          <PartyPopper className="w-20 h-20 text-amber-400 mb-8 animate-bounce" />
          <h2 className="text-7xl font-black tracking-tighter mb-16 text-center">משימה הושלמה[cite: 2]</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-16">
            <div className="rounded-[3rem] p-12 flex flex-col items-center gap-4 bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-emerald-500/60">מדד סנכרון סופי</p>
              <div className="flex items-center gap-5">
                <Zap className="w-12 h-12 text-emerald-400 fill-emerald-400" />
                <span className="text-9xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600">{consensusCount}</span>
              </div>
            </div>

            <div className="rounded-[3rem] p-12 flex flex-col items-center text-center gap-6 bg-white/[0.02] border border-white/10 backdrop-blur-2xl">
              <Crown className="w-12 h-12 text-amber-500" />
              <h3 className="text-2xl font-black">הירוקים שביניכם</h3>
              <p className="text-gray-500 text-lg italic">מאסטר הקונצנזוס של {metadata.company_name}.[cite: 2]</p>
            </div>
          </div>

          <button onClick={() => window.location.reload()} className="flex items-center gap-3 text-white/20 hover:text-white transition-colors cursor-pointer">
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-[0.3em]">אתחול מחדש &bull; Room: {roomId}</span>
          </button>
        </motion.div>
      </div>
    );
  }

  /* ════════════════════════ PHASE: QUESTION / REVEAL ════════════════════════[cite: 2] */
  return (
    <div dir="rtl" className="min-h-screen bg-[#020205] text-white flex flex-col relative overflow-hidden font-sans">
      <AmbientOrbs phase={phase} />
      <GrainOverlay />

      <header className="relative z-20 flex justify-between items-start px-8 pt-12 md:px-16">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black tracking-[0.4em] text-emerald-500 uppercase">{metadata.company_name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white/80 italic tracking-tighter uppercase">{metadata.theme}</h1>
        </div>

        {isHost && (
          <div className="bg-black/60 border border-white/10 px-8 py-4 rounded-[2rem] flex items-center gap-10 backdrop-blur-3xl shadow-2xl">
            <div className="text-center">
              <p className="text-[9px] font-black tracking-[0.45em] text-white/25 uppercase mb-1">מדד סנכרון</p>
              <div className="flex items-center gap-6">
                <span className="text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-100 to-emerald-500">
                    {String(consensusCount).padStart(2, '0')}
                </span>
                <button onClick={() => setConsensusCount(p => p + 1)} className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-90 cursor-pointer">
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-20 flex-1 flex flex-col justify-center px-6 md:px-16 py-10 max-w-6xl mx-auto w-full">
        <div className="mb-14 space-y-4">
          <div className="flex justify-between items-end px-2">
            <span className="font-mono font-black text-white/10 text-6xl tracking-tighter select-none leading-none">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/25">STEP {currentIndex + 1} / {totalQuestions}</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${progress}%` }} 
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative rounded-[4rem] p-16 md:p-28 min-h-[500px] flex flex-col justify-center items-center text-center bg-white/[0.02] backdrop-blur-[40px] border border-white/10 shadow-2xl"
          >
            <div className="absolute top-14 flex items-center gap-4">
              <div className="h-px w-10 bg-emerald-500/30" />
              <span className="text-xs font-black uppercase tracking-[0.5em] text-emerald-400">{currentCard.category}</span>
              <div className="h-px w-10 bg-emerald-500/30" />
            </div>

            <h2 className="font-black tracking-tighter leading-[1.05] text-[clamp(40px,7vw,90px)] text-white">
              {currentCard.prompt}
            </h2>

            {phase === 'REVEAL' && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-16 bg-emerald-500 text-black px-12 py-6 rounded-[2rem] flex items-center gap-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
                <div className="text-right">
                  <p className="text-2xl font-black leading-none uppercase tracking-tighter">Green Team Wins![cite: 2]</p>
                  <p className="text-sm font-bold opacity-60 uppercase tracking-widest mt-1">Point Awarded to Majority</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {isHost && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={nextStep}
              className="px-16 py-6 rounded-[2.5rem] bg-white text-black font-black text-2xl hover:bg-emerald-400 transition-all shadow-2xl active:scale-95 cursor-pointer flex items-center gap-4"
            >
              <span>{phase === 'QUESTION' ? 'חשוף תוצאה' : 'לשאלה הבאה'}</span>
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
        )}
      </main>

      <footer className="relative z-20 py-8 opacity-20 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em]">Room: {roomId} &bull; ENGINE: GTW_ULTIMATE_V3</p>
      </footer>
    </div>
  );
};

export default GreenTeamWins;