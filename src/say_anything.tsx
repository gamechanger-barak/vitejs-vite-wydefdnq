/*
npm install lucide-react framer-motion canvas-confetti
npm install -D @types/canvas-confetti
*/

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Play, 
  ChevronRight, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  RotateCcw,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---

interface GamePrompt {
  prompt: string;
  category?: string;
}

interface GameData {
  content?: GamePrompt[];
  [key: string]: any; 
}

interface SayAnythingProps {
  gameData: GameData | GamePrompt[];
  roomId: string;
  isHost: boolean;
}

type GamePhase = 'START' | 'QUESTION' | 'JUDGING' | 'REVEAL' | 'SUMMARY';

// --- Sub-Components: Visual Effects ---

const AmbientOrbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div 
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
        x: [0, 50, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px]"
    />
    <motion.div 
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.2, 0.4, 0.2],
        x: [0, -40, 0],
        y: [0, -20, 0],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[150px]"
    />
  </div>
);

const GrainOverlay = () => (
  <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

// --- Main Component ---

export default function SayAnything({ gameData, roomId, isHost }: SayAnythingProps) {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [currentIdx, setCurrentIdx] = useState(0);

  // Bulletproof Data Extraction
  const questions = useMemo(() => {
    if (Array.isArray(gameData)) return gameData;
    if (gameData?.content && Array.isArray(gameData.content)) return gameData.content;
    return [];
  }, [gameData]);

  const currentQuestion = questions[currentIdx];

  const nextPhase = () => {
    if (phase === 'START') setPhase('QUESTION');
    else if (phase === 'QUESTION') setPhase('JUDGING');
    else if (phase === 'JUDGING') {
      setPhase('REVEAL');
      triggerConfetti();
    }
    else if (phase === 'REVEAL') {
      if (currentIdx < questions.length - 1) {
        setPhase('QUESTION');
        setCurrentIdx(prev => prev + 1);
      } else {
        setPhase('SUMMARY');
      }
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#d946ef']
    });
  };

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#020205] flex items-center justify-center text-white">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full" 
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#020205] text-white font-sans overflow-hidden flex flex-col dir-rtl" style={{ direction: 'rtl' }}>
      <AmbientOrbs />
      <GrainOverlay />

      {/* Header Info */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10 opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-sm font-medium tracking-widest uppercase">Room: {roomId}</span>
        </div>
        <div className="text-sm font-medium">
          שאלה {currentIdx + 1} מתוך {questions.length}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-12 z-10">
        <AnimatePresence mode="wait">
          
          {phase === 'START' && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-4xl"
            >
              <h1 className="text-[clamp(60px,12vw,150px)] font-black tracking-tighter leading-none mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent italic">
                SAY ANYTHING
              </h1>
              <p className="text-2xl text-indigo-200/60 mb-12 max-w-2xl mx-auto leading-relaxed">
                משחק של דעות חלוקות, תשובות גרועות ובחירות מפוקפקות.
                בחרו את השופט/ת הראשון לסיבוב הזה.
              </p>
              {isHost && (
                <button 
                  onClick={nextPhase}
                  className="group relative px-12 py-5 bg-white text-black font-bold text-xl rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Play fill="black" size={20} /> התחלנו
                  </span>
                </button>
              )}
            </motion.div>
          )}

          {phase === 'QUESTION' && (
            <motion.div 
              key="question"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
              className="text-center w-full"
            >
              <span className="inline-block px-4 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-bold mb-6">
                {currentQuestion.category || 'כללי'}
              </span>
              <h2 className="text-[clamp(40px,7vw,90px)] font-black tracking-tighter leading-[1.1] mb-12 max-w-6xl mx-auto">
                {currentQuestion.prompt}
              </h2>
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 text-white/40 bg-white/5 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/10">
                  <MessageSquare size={24} />
                  <span className="text-xl">כולם כותבים תשובות עכשיו!</span>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'JUDGING' && (
            <motion.div 
              key="judging"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="mb-12 inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                <Users size={48} />
              </div>
              <h2 className="text-5xl font-black mb-6">זמן הכרעה</h2>
              <p className="text-2xl text-white/60 max-w-xl mx-auto leading-relaxed">
                השופט/ת בוחר/ת בסתר את התשובה המועדפת.
                <br />
                כל השאר - נסו לנחש מה הם יבחרו!
              </p>
            </motion.div>
          )}

          {phase === 'REVEAL' && (
            <motion.div 
              key="reveal"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center"
            >
              <Trophy size={80} className="mx-auto mb-8 text-yellow-400" />
              <h2 className="text-4xl font-bold text-white/50 mb-4 uppercase tracking-[0.2em]">הנבחרת היא...</h2>
              <div className="bg-white/[0.03] backdrop-blur-[40px] border border-white/10 p-12 rounded-[40px] mb-12 shadow-2xl shadow-indigo-500/10">
                <p className="text-6xl font-black tracking-tight italic">"חשפו את התשובה!"</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-right max-w-md mx-auto">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/40">הכותב/ת מקבל</p>
                  <p className="text-2xl font-bold text-indigo-400">2 נקודות</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/40">מנחשים נכונה</p>
                  <p className="text-2xl font-bold text-emerald-400">1 נקודה</p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'SUMMARY' && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-7xl font-black mb-4 tracking-tighter italic">זהו זה.</h2>
              <p className="text-2xl text-white/40 mb-12">הסיבובים נגמרו, הזמן לסכם נקודות.</p>
              <button 
                onClick={() => { setCurrentIdx(0); setPhase('START'); }}
                className="flex items-center gap-2 mx-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <RotateCcw size={20} /> שחק שוב
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Control Bar (Host Only) */}
      {isHost && (
        <div className="absolute bottom-12 left-0 right-0 flex justify-center z-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextPhase}
            className="flex items-center gap-4 bg-white/10 backdrop-blur-3xl border border-white/20 px-10 py-5 rounded-full hover:bg-white/15 transition-all group shadow-2xl"
          >
            <span className="text-xl font-bold">
              {phase === 'REVEAL' ? 'לשאלה הבאה' : 'המשך לשלב הבא'}
            </span>
            <ChevronRight className="group-hover:translate-x-[-4px] transition-transform" />
          </motion.button>
        </div>
      )}

      {/* Instructions Modal (Small overlay) */}
      <div className="absolute bottom-8 right-8 z-10 flex items-center gap-2 text-white/20">
        <Info size={16} />
        <span className="text-xs font-medium uppercase tracking-widest">
          {phase === 'QUESTION' ? 'הקריאו את השאלה בקול' : 'פעלו לפי ההנחיות'}
        </span>
      </div>
    </div>
  );
}