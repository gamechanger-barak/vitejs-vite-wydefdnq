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

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Background Orbs ─────────────────────────────────────────────────────────

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
      <motion.div
        animate={{ opacity: [0.15, 0.32, 0.15], scale: [1, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-0 right-[15%] w-[30%] h-[40%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.22) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
};

// ─── Film Grain ───────────────────────────────────────────────────────────────

const Grain = () => (
  <div className="fixed inset-0 z-[200] pointer-events-none" aria-hidden
    style={{ opacity: 0.04, mixBlendMode: 'screen' }}>
    <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 600 600">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" seed="9" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </div>
);

// ─── Vignette ─────────────────────────────────────────────────────────────────

const Vignette = () => (
  <div className="fixed inset-0 z-[199] pointer-events-none" aria-hidden
    style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.75) 100%)' }} />
);

// ─── Flash overlay for REVEAL ─────────────────────────────────────────────────

const RevealFlash = ({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div key="flash" className="fixed inset-0 z-[198] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 0.75, times: [0, 0.15, 1] }}
        style={{ background: 'radial-gradient(ellipse at center, rgba(167,139,250,0.7) 0%, rgba(99,102,241,0.35) 50%, transparent 75%)' }}
      />
    )}
  </AnimatePresence>
);

// ─── Progress dots ────────────────────────────────────────────────────────────

const ProgressDots = ({ current, total }: { current: number; total: number }) => (
  <div className="flex gap-2 items-center">
    {Array.from({ length: total }).map((_, i) => (
      <motion.div key={i}
        animate={{
          width: i === current ? 24 : 6,
          backgroundColor: i < current
            ? 'rgba(99,102,241,0.9)'
            : i === current
            ? '#a5b4fc'
            : 'rgba(255,255,255,0.2)',
        }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        className="h-[5px] rounded-full"
      />
    ))}
  </div>
);

// ─── Accent badge ─────────────────────────────────────────────────────────────

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase"
    style={{
      background: 'rgba(99,102,241,0.18)',
      border: '1px solid rgba(165,180,252,0.35)',
      color: '#c7d2fe',
      letterSpacing: '0.14em',
    }}
  >
    {children}
  </span>
);

// ─── Divider ──────────────────────────────────────────────────────────────────

const Divider = () => (
  <div className="w-full h-px my-6"
    style={{ background: 'linear-gradient(90deg, transparent, rgba(165,180,252,0.25) 50%, transparent)' }} />
);

// ─── Primary button (white, for START) ───────────────────────────────────────

const PrimaryButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.97 }}
    className="relative inline-flex items-center gap-3 px-12 py-5 rounded-full overflow-hidden font-black text-xl text-black"
    style={{
      background: 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 60%, #c7d2fe 100%)',
      boxShadow: '0 0 50px rgba(99,102,241,0.5), 0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.9)',
    }}
  >
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{ x: ['-160%', '200%'] }}
      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)', width: '50%' }}
    />
    <span className="relative">{children}</span>
  </motion.button>
);

// ─── Ghost button ─────────────────────────────────────────────────────────────

const GhostButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.97 }}
    className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base"
    style={{
      background: 'rgba(99,102,241,0.10)',
      border: '1px solid rgba(165,180,252,0.30)',
      color: '#e0e7ff',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
    }}
  >
    {children}
  </motion.button>
);

// ─── Score chip ───────────────────────────────────────────────────────────────

const ScoreChip = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div
    className="flex flex-col items-center justify-center p-6 rounded-3xl"
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
    }}
  >
    <span className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
      {label}
    </span>
    <span className="text-5xl font-black" style={{ color }}>{value}</span>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

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
    confetti({ particleCount: 90, spread: 110, origin: { y: 0.55, x: 0.3 }, colors: ['#6366f1', '#8b5cf6', '#e0e7ff', '#ffffff'], scalar: 1.1 });
    setTimeout(() => confetti({ particleCount: 60, spread: 70, origin: { y: 0.5, x: 0.7 }, colors: ['#a78bfa', '#c4b5fd', '#f0abfc'], scalar: 0.9 }), 200);
    setTimeout(() => confetti({ particleCount: 35, spread: 140, shapes: ['star'], colors: ['#fbbf24', '#fcd34d'], scalar: 1.3, origin: { y: 0.4 } }), 400);
  };

  const nextPhase = () => {
    if (phase === 'START') {
      setPhase('QUESTION');
    } else if (phase === 'QUESTION') {
      setPhase('JUDGING');
    } else if (phase === 'JUDGING') {
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
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#06060f' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full"
          style={{ border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#818cf8' }}
        />
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
      className="fixed inset-0 z-50 overflow-hidden flex flex-col"
      style={{
        background: '#06060f',
        color: '#ffffff',
        direction: 'rtl',
        fontFamily: "'Helvetica Neue', Arial, 'Noto Sans Hebrew', sans-serif",
      }}
    >
      <AmbientOrbs />
      <Grain />
      <Vignette />
      <RevealFlash show={flash} />

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 flex justify-between items-center px-8 pt-7 shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="w-2 h-2 rounded-full"
            style={{ background: '#34d399', boxShadow: '0 0 8px #34d399' }}
          />
          <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {roomId}
          </span>
        </div>

        <ProgressDots current={currentIdx} total={questions.length} />

        <span className="text-xs font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>{currentIdx + 1}</span>
          {' '}/ {questions.length}
        </span>
      </motion.header>

      {/* ── Phase content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-8 py-6 z-10 relative overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ══ START ══════════════════════════════════════════════════════════ */}
          {phase === 'START' && (
            <motion.div key="start"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(16px)', scale: 1.03 }}
              transition={{ duration: 0.55 }}
              className="text-center w-full max-w-5xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.55 }}
                className="flex items-center justify-center gap-4 mb-7"
              >
                <div className="h-px w-16" style={{ background: 'linear-gradient(to left, rgba(165,180,252,0.5), transparent)' }} />
                <Badge>משחק מסיבה</Badge>
                <div className="h-px w-16" style={{ background: 'linear-gradient(to right, rgba(165,180,252,0.5), transparent)' }} />
              </motion.div>

              <div style={{ overflow: 'hidden', marginBottom: 4 }}>
                <motion.div
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.18, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className="font-black italic tracking-tighter leading-none select-none"
                  style={{
                    fontSize: 'clamp(72px, 15vw, 180px)',
                    background: 'linear-gradient(160deg, #ffffff 20%, rgba(255,255,255,0.92) 60%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  SAY
                </motion.div>
              </div>
              <div style={{ overflow: 'hidden', marginBottom: 40 }}>
                <motion.div
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.30, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className="font-black italic tracking-tighter leading-none select-none"
                  style={{
                    fontSize: 'clamp(72px, 15vw, 180px)',
                    background: 'linear-gradient(160deg, #a5b4fc 0%, #818cf8 40%, #c084fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ANYTHING
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52, duration: 0.6 }}
                className="text-xl mb-12 leading-relaxed mx-auto max-w-lg"
                style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}
              >
                דעות חלוקות, תשובות גרועות ובחירות מפוקפקות.
                <br />
                בחרו שופט/ת לסיבוב הראשון.
              </motion.p>

              {isHost && (
                <motion.div
                  initial={{ opacity: 0, y: 22, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.68, duration: 0.6, type: 'spring', stiffness: 180, damping: 18 }}
                >
                  <PrimaryButton onClick={nextPhase}>
                    <Play fill="black" size={20} />
                    התחלנו
                  </PrimaryButton>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ══ QUESTION ═══════════════════════════════════════════════════════ */}
          {phase === 'QUESTION' && (
            <motion.div key={`q-${currentIdx}`}
              initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-6xl text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12, duration: 0.45, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-8"
              >
                <Badge>{currentQuestion.category || 'כללי'}</Badge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, scale: 0.9, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.8, type: 'spring', stiffness: 70, damping: 13 }}
                className="font-black tracking-tighter text-right mb-10 leading-[1.06]"
                style={{
                  fontSize: 'clamp(40px, 7vw, 100px)',
                  color: '#ffffff',
                  textShadow: '0 0 80px rgba(99,102,241,0.4)',
                }}
              >
                {currentQuestion.prompt}
              </motion.h2>

              <Divider />

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.5 }}
                className="flex justify-center"
              >
                <div
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl"
                  style={{
                    background: 'rgba(99,102,241,0.10)',
                    border: '1px solid rgba(165,180,252,0.22)',
                  }}
                >
                  <MessageSquare size={18} style={{ color: '#a5b4fc' }} />
                  <span className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    כולם כותבים תשובות עכשיו!
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ══ JUDGING ════════════════════════════════════════════════════════ */}
          {phase === 'JUDGING' && (
            <motion.div key="judging"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center max-w-2xl w-full"
            >
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 160, damping: 11, delay: 0.05 }}
                className="flex justify-center mb-10"
              >
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute rounded-full"
                    style={{
                      inset: -16,
                      background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)',
                      filter: 'blur(12px)',
                    }}
                  />
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center relative"
                    style={{
                      background: 'rgba(99,102,241,0.15)',
                      border: '1.5px solid rgba(165,180,252,0.4)',
                      boxShadow: '0 0 40px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    <Users size={42} style={{ color: '#a5b4fc' }} />
                  </div>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.6 }}
                className="font-black tracking-tighter mb-6"
                style={{ fontSize: 'clamp(48px, 8vw, 86px)', color: '#ffffff' }}
              >
                זמן הכרעה
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.55 }}
              >
                <div
                  className="rounded-3xl px-10 py-8"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  <p className="text-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.80)' }}>
                    השופט/ת בוחר/ת בסתר את התשובה המועדפת.
                  </p>
                  <div className="my-5 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <p className="text-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.80)' }}>
                    כל השאר — נסו לנחש מה יבחרו!
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ══ REVEAL ═════════════════════════════════════════════════════════ */}
          {phase === 'REVEAL' && (
            <motion.div key="reveal"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="text-center w-full max-w-3xl"
            >
              <motion.div
                initial={{ scale: 0.2, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.08 }}
                className="flex justify-center mb-5"
              >
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    className="absolute rounded-full"
                    style={{
                      inset: -20,
                      background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 68%)',
                      filter: 'blur(16px)',
                    }}
                  />
                  <Trophy
                    size={76}
                    style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 24px rgba(251,191,36,0.7))', position: 'relative' }}
                  />
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
                className="mb-5 font-bold uppercase text-sm tracking-[0.22em]"
                style={{ color: 'rgba(255,255,255,0.50)' }}
              >
                הנבחרת היא...
              </motion.p>

              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 36 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.32, type: 'spring', stiffness: 95, damping: 13 }}
                className="mb-8 relative overflow-hidden rounded-[32px] p-12"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 50%, rgba(99,102,241,0.08) 100%)',
                  border: '1.5px solid rgba(165,180,252,0.30)',
                  boxShadow: '0 0 80px rgba(99,102,241,0.25), 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)',
                }}
              >
                <div
                  className="absolute top-0 left-[15%] right-[15%] h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(165,180,252,0.7), transparent)' }}
                />
                <motion.p
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.55 }}
                  className="font-black tracking-tighter italic"
                  style={{ fontSize: 'clamp(34px, 6vw, 66px)', color: '#ffffff' }}
                >
                  "חשפו את התשובה!"
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.68 }}
                className="grid grid-cols-2 gap-4 max-w-xs mx-auto"
              >
                <ScoreChip label="הכותב/ת מקבל" value="+2" color="#a5b4fc" />
                <ScoreChip label="ניחוש נכון" value="+1" color="#6ee7b7" />
              </motion.div>
            </motion.div>
          )}

          {/* ══ SUMMARY ════════════════════════════════════════════════════════ */}
          {phase === 'SUMMARY' && (
            <motion.div key="summary"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-center max-w-2xl w-full"
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 13, delay: 0.05 }}
                className="flex justify-center mb-8"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(99,102,241,0.12)',
                    border: '1.5px solid rgba(165,180,252,0.35)',
                    boxShadow: '0 0 40px rgba(99,102,241,0.3)',
                  }}
                >
                  <Zap size={36} style={{ color: '#a5b4fc' }} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p
                  className="font-bold tracking-[0.2em] uppercase text-xs mb-4"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  המשחק הסתיים
                </p>
                <h2
                  className="font-black tracking-tighter italic mb-4 leading-none"
                  style={{ fontSize: 'clamp(64px, 11vw, 130px)', color: '#ffffff' }}
                >
                  זהו זה.
                </h2>
                <p className="text-xl mb-12" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  הסיבובים נגמרו — הגיע הזמן לספור נקודות.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
              >
                <GhostButton onClick={() => { setCurrentIdx(0); setPhase('START'); }}>
                  <RotateCcw size={16} />
                  שחק שוב
                </GhostButton>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Host CTA ──────────────────────────────────────────────────────────── */}
      {isHost && phase !== 'SUMMARY' && (
        <div className="relative z-10 flex justify-center pb-10 shrink-0">
          <motion.button
            key={phase}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={nextPhase}
            className="group flex items-center gap-3.5 px-10 py-5 rounded-full font-bold text-lg"
            style={{
              background: 'rgba(99,102,241,0.14)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1.5px solid rgba(165,180,252,0.32)',
              color: '#e0e7ff',
              boxShadow: '0 8px 40px rgba(0,0,0,0.45), 0 0 30px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.10)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.26)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.14)'; }}
          >
            <span>{nextLabel}</span>
            <motion.div
              animate={{ x: [0, -5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronRight size={20} style={{ color: '#a5b4fc' }} />
            </motion.div>
          </motion.button>
        </div>
      )}
    </div>
  );
}