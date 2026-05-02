
/*
npm install lucide-react framer-motion canvas-confetti
npm install -D @types/canvas-confetti
*/

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Trophy,
  Play,
  ChevronRight,
  Users,
  MessageSquare,
  RotateCcw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

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

const AmbientOrbs = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const sx = useSpring(mouseX, { stiffness: 15, damping: 35 });
  const sy = useSpring(mouseY, { stiffness: 15, damping: 35 });
  const orb1x = useTransform(sx, [-600, 600], [-25, 25]);
  const orb1y = useTransform(sy, [-600, 600], [-18, 18]);
  const orb2x = useTransform(sx, [-600, 600], [18, -18]);
  const orb2y = useTransform(sy, [-600, 600], [12, -12]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      <motion.div
        style={{
          x: orb1x, y: orb1y,
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.55) 0%, rgba(79,70,229,0.25) 45%, transparent 72%)',
          filter: 'blur(70px)',
        }}
        animate={{ scale: [1, 1.12, 0.94, 1], opacity: [0.7, 1, 0.8, 0.7] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[20%] -left-[8%] w-[70%] h-[70%] rounded-full"
      />
      <motion.div
        style={{
          x: orb2x, y: orb2y,
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.50) 0%, rgba(109,40,217,0.20) 50%, transparent 72%)',
          filter: 'blur(85px)',
        }}
        animate={{ scale: [1.08, 0.92, 1.15, 1.08], opacity: [0.6, 0.9, 0.7, 0.6] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-[18%] -right-[8%] w-[60%] h-[60%] rounded-full"
      />
    </div>
  );
};

export default function SayAnything({ gameData, roomId, isHost }: SayAnythingProps) {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flash, setFlash] = useState(false);

  const questions = useMemo(() => {
    if (Array.isArray(gameData)) return gameData;
    if (gameData && 'content' in gameData && Array.isArray(gameData.content)) return gameData.content;
    return [];
  }, [gameData]);

  const currentQuestion = questions[currentIdx];

  const fireConfetti = () => {
    confetti({ particleCount: 90, spread: 110, origin: { y: 0.55 } });
  };

  const nextPhase = () => {
    if (phase === 'START') setPhase('QUESTION');
    else if (phase === 'QUESTION') setPhase('JUDGING');
    else if (phase === 'JUDGING') {
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
      setPhase('REVEAL');
      fireConfetti();
    } else if (phase === 'REVEAL') {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(p => p + 1);
        setPhase('QUESTION');
      } else {
        setPhase('SUMMARY');
      }
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06060f] text-white">
        Loading...
      </div>
    );
  }

  const nextLabel =
    phase === 'REVEAL' && currentIdx < questions.length - 1 ? 'לשאלה הבאה'
    : phase === 'REVEAL' ? 'לסיכום'
    : phase === 'JUDGING' ? 'חשפו את הזוכה'
    : 'המשך';

  return (
    <div
      className="relative min-h-screen flex flex-col bg-[#06060f] text-white"
      style={{ direction: 'rtl', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      <AmbientOrbs />

      <header className="flex justify-between items-center px-8 pt-6">
        <span className="text-sm opacity-70">{roomId}</span>
        <span className="text-sm">{currentIdx + 1} / {questions.length}</span>
      </header>

      <main className="flex items-center justify-center px-8 py-10 flex-grow">
        <AnimatePresence mode="wait">

          {phase === 'START' && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-3xl"
            >
              <h1 className="text-6xl font-black mb-6">SAY ANYTHING</h1>
              <p className="text-xl opacity-70 mb-10">
                דעות חלוקות, תשובות גרועות ובחירות מפוקפקות.
              </p>

              {isHost && (
                <button
                  onClick={nextPhase}
                  className="bg-indigo-500 hover:bg-indigo-600 px-8 py-4 rounded-full font-bold text-lg"
                >
                  התחלנו
                </button>
              )}
            </motion.div>
          )}

          {phase === 'QUESTION' && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-4xl"
            >
              <h2 className="text-5xl font-black mb-8">{currentQuestion.prompt}</h2>

              <div className="bg-indigo-500/10 border border-indigo-300/20 rounded-xl px-6 py-4">
                <MessageSquare size={18} className="inline mr-2" />
                כולם כותבים תשובות עכשיו!
              </div>
            </motion.div>
          )}

          {phase === 'JUDGING' && (
            <motion.div
              key="judging"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Users size={60} className="mx-auto mb-6" />
              <h2 className="text-4xl font-black mb-4">זמן הכרעה</h2>
              <p className="opacity-70">השופט בוחר את התשובה המועדפת</p>
            </motion.div>
          )}

          {phase === 'REVEAL' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Trophy size={70} className="mx-auto mb-6 text-yellow-400" />
              <h2 className="text-4xl font-black mb-6">הזוכה!</h2>
              <p className="text-2xl">חשפו את התשובה!</p>
            </motion.div>
          )}

          {phase === 'SUMMARY' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Zap size={60} className="mx-auto mb-6" />
              <h2 className="text-5xl font-black mb-6">זהו זה.</h2>

              <button
                onClick={() => { setCurrentIdx(0); setPhase('START'); }}
                className="bg-indigo-500 hover:bg-indigo-600 px-8 py-4 rounded-full font-bold"
              >
                <RotateCcw size={18} className="inline mr-2" />
                שחק שוב
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {isHost && phase !== 'SUMMARY' && (
        <div className="flex justify-center pb-10">
          <button
            onClick={nextPhase}
            className="flex items-center gap-3 bg-indigo-500/20 border border-indigo-300/30 px-8 py-4 rounded-full"
          >
            {nextLabel}
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
