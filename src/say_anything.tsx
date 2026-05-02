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
  Info,
  Sparkles
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

const AmbientOrbs = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 20, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 20, damping: 30 });
  const orb1X = useTransform(smoothX, [-500, 500], [-30, 30]);
  const orb1Y = useTransform(smoothY, [-500, 500], [-20, 20]);
  const orb2X = useTransform(smoothX, [-500, 500], [20, -20]);
  const orb2Y = useTransform(smoothY, [-500, 500], [15, -15]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Primary deep indigo orb - top left */}
      <motion.div
        style={{
          x: orb1X,
          y: orb1Y,
          background: 'radial-gradient(ellipse at center, rgba(79,70,229,0.35) 0%, rgba(67,56,202,0.15) 40%, transparent 75%)',
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.15, 0.95, 1],
          opacity: [0.25, 0.40, 0.30, 0.25],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[15%] -left-[5%] w-[65%] h-[65%] rounded-full"
      />
      {/* Secondary violet orb - bottom right */}
      <motion.div
        style={{
          x: orb2X,
          y: orb2Y,
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.30) 0%, rgba(124,58,237,0.12) 45%, transparent 75%)',
          filter: 'blur(90px)',
        }}
        animate={{
          scale: [1.1, 0.9, 1.2, 1.1],
          opacity: [0.20, 0.35, 0.25, 0.20],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[15%] -right-[5%] w-[55%] h-[55%] rounded-full"
      />
      {/* Tertiary faint rose accent - center */}
      <motion.div
        animate={{
          scale: [1, 1.3, 0.8, 1],
          opacity: [0.05, 0.12, 0.08, 0.05],
          x: [0, 60, -30, 0],
          y: [0, -40, 20, 0],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(217,70,239,0.20) 0%, transparent 70%)',
          filter: 'blur(120px)',
        }}
      />
      {/* Deep sapphire top-right accent */}
      <motion.div
        animate={{
          scale: [0.9, 1.1, 1, 0.9],
          opacity: [0.10, 0.22, 0.15, 0.10],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute -top-[5%] right-[10%] w-[35%] h-[45%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.15) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
};

const GrainOverlay = () => (
  <div
    className="fixed inset-0 z-[100] pointer-events-none"
    style={{
      opacity: 0.055,
      mixBlendMode: 'overlay',
    }}
  >
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="filmGrain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.80"
          numOctaves="4"
          seed="15"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#filmGrain)" />
    </svg>
  </div>
);

// Scanline vignette for extra depth
const Vignette = () => (
  <div
    className="fixed inset-0 z-[99] pointer-events-none"
    style={{
      background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)',
    }}
  />
);

// Horizontal light streak — decorative
const LightStreak = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        key="streak"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 0.7, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-1/2 left-0 right-0 z-[98] pointer-events-none"
        style={{
          height: '2px',
          transformOrigin: 'left center',
          background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.8) 30%, rgba(255,255,255,0.9) 50%, rgba(99,102,241,0.8) 70%, transparent 100%)',
          filter: 'blur(1px)',
          boxShadow: '0 0 30px 10px rgba(139,92,246,0.4)',
        }}
      />
    )}
  </AnimatePresence>
);

// Glassy card wrapper
const GlassCard = ({
  children,
  className = '',
  intensity = 'medium',
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}) => {
  const configs = {
    low:    { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)', blur: '20px', shadow: '0 8px 32px rgba(0,0,0,0.4)' },
    medium: { bg: 'rgba(255,255,255,0.035)', border: 'rgba(255,255,255,0.09)', blur: '40px', shadow: '0 16px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' },
    high:   { bg: 'rgba(255,255,255,0.055)', border: 'rgba(255,255,255,0.12)', blur: '60px', shadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2)' },
  };
  const c = configs[intensity];
  return (
    <div
      className={className}
      style={{
        background: c.bg,
        backdropFilter: `blur(${c.blur})`,
        WebkitBackdropFilter: `blur(${c.blur})`,
        border: `1px solid ${c.border}`,
        boxShadow: c.shadow,
        borderRadius: '28px',
      }}
    >
      {children}
    </div>
  );
};

// Progress pill
const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="flex gap-1.5">
    {Array.from({ length: total }).map((_, i) => (
      <motion.div
        key={i}
        className="h-1 rounded-full"
        initial={false}
        animate={{
          width: i === current ? 28 : 8,
          backgroundColor: i < current ? 'rgba(99,102,241,0.7)' : i === current ? '#6366f1' : 'rgba(255,255,255,0.12)',
        }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      />
    ))}
  </div>
);


// --- Main Component ---

export default function SayAnything({ gameData, roomId, isHost }: SayAnythingProps) {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [revealFlash, setRevealFlash] = useState(false);

  const questions = useMemo(() => {
    if (Array.isArray(gameData)) return gameData;
    if (gameData && 'content' in gameData && Array.isArray(gameData.content)) return gameData.content;
    return [];
  }, [gameData]);

  const currentQuestion = questions[currentIdx];

  const triggerConfetti = () => {
    // First burst — wide
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.55, x: 0.35 },
      colors: ['#6366f1', '#8b5cf6', '#d946ef', '#ffffff'],
      gravity: 0.8,
      scalar: 1.1,
    });
    // Second burst — tight
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.55, x: 0.65 },
        colors: ['#a78bfa', '#c4b5fd', '#f0abfc', '#e0e7ff'],
        gravity: 0.9,
        scalar: 0.9,
      });
    }, 180);
    // Stars burst
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 130,
        origin: { y: 0.45 },
        shapes: ['star'],
        colors: ['#fbbf24', '#f59e0b', '#fcd34d'],
        gravity: 0.7,
        scalar: 1.3,
      });
    }, 350);
  };

  const fireStreak = () => {
    setShowStreak(true);
    setTimeout(() => setShowStreak(false), 1000);
  };

  const nextPhase = () => {
    fireStreak();
    if (phase === 'START') {
      setPhase('QUESTION');
    } else if (phase === 'QUESTION') {
      setPhase('JUDGING');
    } else if (phase === 'JUDGING') {
      setRevealFlash(true);
      setTimeout(() => setRevealFlash(false), 800);
      setPhase('REVEAL');
      triggerConfetti();
    } else if (phase === 'REVEAL') {
      if (currentIdx < questions.length - 1) {
        setPhase('QUESTION');
        setCurrentIdx(prev => prev + 1);
      } else {
        setPhase('SUMMARY');
      }
    }
  };

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#020205] flex items-center justify-center text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="w-12 h-12 rounded-full"
          style={{
            border: '3px solid rgba(99,102,241,0.2)',
            borderTopColor: '#6366f1',
          }}
        />
      </div>
    );
  }

  // Phase label mapping
  const phaseLabel: Record<GamePhase, string> = {
    START: 'פתיחה',
    QUESTION: 'שאלה פעילה',
    JUDGING: 'שיפוט',
    REVEAL: 'חשיפה',
    SUMMARY: 'סיכום',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#020205] text-white overflow-hidden flex flex-col"
      style={{ direction: 'rtl', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      <AmbientOrbs />
      <GrainOverlay />
      <Vignette />
      <LightStreak visible={showStreak} />

      {/* Reveal flash overlay */}
      <AnimatePresence>
        {revealFlash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, times: [0, 0.2, 1] }}
            className="fixed inset-0 z-[97] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.6) 0%, rgba(99,102,241,0.3) 40%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="absolute top-0 left-0 right-0 flex justify-between items-center z-10 px-8 py-6"
      >
        {/* Room tag */}
        <GlassCard intensity="low" className="px-4 py-2 flex items-center gap-2.5">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-400"
            style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }}
          />
          <span className="text-xs font-semibold tracking-[0.12em] uppercase text-white/50">
            {roomId}
          </span>
        </GlassCard>

        {/* Phase indicator + progress */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-white/25">
            {phaseLabel[phase]}
          </span>
          <ProgressBar current={currentIdx} total={questions.length} />
        </div>

        {/* Counter */}
        <GlassCard intensity="low" className="px-4 py-2">
          <span className="text-xs font-semibold text-white/50 tabular-nums">
            <span className="text-white/80">{currentIdx + 1}</span>
            <span> / {questions.length}</span>
          </span>
        </GlassCard>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-10 z-10">
        <AnimatePresence mode="wait">

          {/* ── START ── */}
          {phase === 'START' && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.04 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-5xl w-full"
            >
              {/* Overline */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="flex items-center justify-center gap-3 mb-8"
              >
                <div className="h-px w-12 bg-gradient-to-l from-indigo-500/60 to-transparent" />
                <span className="text-xs font-bold tracking-[0.25em] uppercase text-indigo-400/80">
                  משחק מסיבה
                </span>
                <div className="h-px w-12 bg-gradient-to-r from-indigo-500/60 to-transparent" />
              </motion.div>

              {/* Massive title */}
              <div
                className="mb-6 leading-none italic font-black tracking-tighter text-right"
                style={{
                  fontSize: 'clamp(64px, 14vw, 170px)',
                  lineHeight: 0.9,
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      background: 'linear-gradient(170deg, #ffffff 30%, rgba(255,255,255,0.35) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    SAY
                  </motion.div>
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.32, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      background: 'linear-gradient(170deg, rgba(255,255,255,0.9) 20%, rgba(139,92,246,0.6) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    ANYTHING
                  </motion.div>
                </div>
              </div>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="text-lg text-white/35 mb-12 max-w-md mx-auto leading-relaxed text-right"
                style={{ fontWeight: 400 }}
              >
                דעות חלוקות. תשובות גרועות. בחירות מפוקפקות.
                <br />
                בחרו שופט/ת לסיבוב הראשון.
              </motion.p>

              {isHost && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.75, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <motion.button
                    onClick={nextPhase}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="group relative inline-flex items-center gap-3 px-12 py-5 rounded-full overflow-hidden font-black text-lg text-black"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, rgba(224,231,255,0.95) 100%)',
                      boxShadow: '0 0 40px rgba(139,92,246,0.3), 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.8)',
                    }}
                  >
                    {/* Shimmer */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                        width: '60%',
                      }}
                    />
                    <Play fill="black" size={18} />
                    <span className="relative">התחלנו</span>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── QUESTION ── */}
          {phase === 'QUESTION' && (
            <motion.div
              key={`question-${currentIdx}`}
              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-center w-full max-w-6xl"
            >
              {/* Category badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="flex justify-center mb-8"
              >
                <GlassCard intensity="medium" className="px-5 py-2 flex items-center gap-2.5">
                  <Sparkles size={14} className="text-indigo-400" />
                  <span className="text-sm font-bold tracking-[0.12em] uppercase text-indigo-300/90">
                    {currentQuestion.category || 'כללי'}
                  </span>
                </GlassCard>
              </motion.div>

              {/* The Prompt — spring physics */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: 0.25,
                  duration: 0.9,
                  type: 'spring',
                  stiffness: 80,
                  damping: 15,
                }}
                className="mb-10"
              >
                <h2
                  className="font-black tracking-tighter text-right leading-[1.05]"
                  style={{
                    fontSize: 'clamp(38px, 6.5vw, 96px)',
                    background: 'linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.75) 60%, rgba(139,92,246,0.5) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: 'none',
                  }}
                >
                  {currentQuestion.prompt}
                </h2>
              </motion.div>

              {/* Instruction chip */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="flex justify-center"
              >
                <GlassCard intensity="low" className="flex items-center gap-3 px-8 py-4">
                  <MessageSquare size={18} className="text-indigo-400/80" />
                  <span className="text-base text-white/45 font-medium">
                    כולם כותבים תשובות עכשיו!
                  </span>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}

          {/* ── JUDGING ── */}
          {phase === 'JUDGING' && (
            <motion.div
              key="judging"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center max-w-2xl"
            >
              {/* Icon ring */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.7, type: 'spring', stiffness: 120, damping: 10 }}
                className="flex justify-center mb-10"
              >
                <div className="relative">
                  {/* Outer glow ring */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
                      filter: 'blur(16px)',
                      transform: 'scale(1.5)',
                    }}
                  />
                  <GlassCard intensity="high" className="w-24 h-24 flex items-center justify-center relative">
                    <Users size={40} className="text-indigo-300" />
                  </GlassCard>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="font-black tracking-tighter mb-5"
                style={{ fontSize: 'clamp(42px, 7vw, 80px)' }}
              >
                זמן הכרעה
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
              >
                <GlassCard intensity="medium" className="p-8">
                  <p className="text-xl text-white/55 leading-relaxed">
                    השופט/ת בוחר/ת בסתר את התשובה המועדפת.
                  </p>
                  <div className="mt-4 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
                  <p className="mt-4 text-xl text-white/55 leading-relaxed">
                    כל השאר — נסו לנחש מה הם יבחרו!
                  </p>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}

          {/* ── REVEAL ── */}
          {phase === 'REVEAL' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center w-full max-w-4xl"
            >
              {/* Trophy */}
              <motion.div
                initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)',
                      filter: 'blur(20px)',
                      transform: 'scale(2)',
                    }}
                  />
                  <Trophy
                    size={72}
                    className="text-yellow-400 relative"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.6))' }}
                  />
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-sm font-bold tracking-[0.25em] uppercase text-white/30 mb-4"
              >
                הנבחרת היא...
              </motion.p>

              {/* Reveal card — dramatic */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3,
                  type: 'spring',
                  stiffness: 90,
                  damping: 14,
                }}
                className="mb-8"
              >
                <GlassCard
                  intensity="high"
                  className="p-12 relative overflow-hidden"
                >
                  {/* Inner glow */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 60%)',
                    }}
                  />
                  <motion.p
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, type: 'spring', stiffness: 100 }}
                    className="font-black tracking-tighter italic relative"
                    style={{
                      fontSize: 'clamp(36px, 6vw, 68px)',
                      background: 'linear-gradient(160deg, #ffffff 0%, rgba(196,181,253,0.9) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    "חשפו את התשובה!"
                  </motion.p>
                </GlassCard>
              </motion.div>

              {/* Score chips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.5 }}
                className="grid grid-cols-2 gap-4 max-w-sm mx-auto"
              >
                <GlassCard intensity="medium" className="p-5 text-right">
                  <p className="text-xs text-white/35 mb-1 font-medium">הכותב/ת מקבל</p>
                  <p className="text-3xl font-black text-indigo-300">+2</p>
                  <p className="text-xs text-white/30">נקודות</p>
                </GlassCard>
                <GlassCard intensity="medium" className="p-5 text-right">
                  <p className="text-xs text-white/35 mb-1 font-medium">ניחוש נכון</p>
                  <p className="text-3xl font-black text-emerald-400">+1</p>
                  <p className="text-xs text-white/30">נקודה</p>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}

          {/* ── SUMMARY ── */}
          {phase === 'SUMMARY' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-center max-w-xl"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
              >
                <div className="text-xs font-bold tracking-[0.25em] uppercase text-white/25 mb-5">
                  המשחק הסתיים
                </div>
                <h2
                  className="font-black tracking-tighter italic mb-4"
                  style={{
                    fontSize: 'clamp(60px, 10vw, 120px)',
                    background: 'linear-gradient(160deg, #fff 30%, rgba(139,92,246,0.7) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 0.95,
                  }}
                >
                  זהו זה.
                </h2>
                <p className="text-xl text-white/35 mb-12">
                  הסיבובים נגמרו — הגיע הזמן לספור נקודות.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <motion.button
                  onClick={() => { setCurrentIdx(0); setPhase('START'); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white/70 transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                  }}
                >
                  <RotateCcw size={17} />
                  שחק שוב
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Host bottom control */}
      {isHost && phase !== 'SUMMARY' && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={nextPhase}
            className="group flex items-center gap-4 px-10 py-5 rounded-full font-bold text-lg"
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.13)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)',
            }}
          >
            <span className="text-white/80 group-hover:text-white transition-colors">
              {phase === 'REVEAL' && currentIdx < questions.length - 1
                ? 'לשאלה הבאה'
                : phase === 'REVEAL'
                ? 'סיכום'
                : 'המשך לשלב הבא'}
            </span>
            <motion.div
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronRight size={20} className="text-indigo-400" />
            </motion.div>
          </motion.button>
        </div>
      )}

      {/* Bottom-right hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-7 right-7 z-10 flex items-center gap-2 text-white/18"
      >
        <Info size={13} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
          {phase === 'QUESTION'
            ? 'הקריאו את השאלה בקול רם'
            : 'פעלו לפי ההנחיות על המסך'}
        </span>
      </motion.div>
    </div>
  );
}