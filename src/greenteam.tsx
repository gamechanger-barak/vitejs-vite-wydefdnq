import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  PartyPopper,
  Zap,
  LayoutDashboard,
  Target,
  Crown,
  Plus,
} from 'lucide-react';

/* ─────────────────────────────────────────── Interfaces ── */

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

/* ──────────────────────────────────────── Ambient Orbs ── */

const AmbientOrbs: React.FC<{ phase: GamePhase }> = ({ phase }) => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
    {/* Primary emerald orb – always present */}
    <div
      className="absolute rounded-full transition-all duration-[3000ms] ease-in-out"
      style={{
        width: 700,
        height: 700,
        top: '-20%',
        right: '-15%',
        background:
          'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'pulse 8s ease-in-out infinite',
      }}
    />
    {/* Secondary cyan orb – glows brighter on REVEAL */}
    <div
      className="absolute rounded-full transition-all duration-[2000ms] ease-in-out"
      style={{
        width: 500,
        height: 500,
        bottom: '-10%',
        left: '-10%',
        background:
          phase === 'REVEAL'
            ? 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
        filter: 'blur(100px)',
        animation: 'pulse 10s ease-in-out infinite reverse',
      }}
    />
    {/* Deep indigo accent */}
    <div
      className="absolute rounded-full"
      style={{
        width: 400,
        height: 400,
        top: '40%',
        left: '30%',
        background:
          'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        filter: 'blur(120px)',
        animation: 'pulse 12s ease-in-out infinite 2s',
      }}
    />
  </div>
);

/* ─────────────────────────────────── Noise Grain Overlay ── */

const GrainOverlay: React.FC = () => (
  <div
    className="pointer-events-none fixed inset-0 opacity-[0.025]"
    aria-hidden
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '128px 128px',
    }}
  />
);

/* ──────────────────────────────────────────── Main ── */

const GreenTeamWins: React.FC<GreenTeamWinsProps> = ({ gameData, roomId, isHost }) => {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [consensusCount, setConsensusCount] = useState<number>(0);
  const [cardVisible, setCardVisible] = useState<boolean>(true);
  const prevPhaseRef = useRef<GamePhase>('START');

  /* ── Data extraction ── */
  const questions = useMemo<GameContent[]>(() => {
    if (Array.isArray(gameData)) return gameData;
    if (gameData?.content) return gameData.content;
    return [];
  }, [gameData]);

  const metadata = useMemo<GameMetadata>(() => {
    if (!Array.isArray(gameData) && gameData?.game_metadata) return gameData.game_metadata;
    return { company_name: 'TEAM BUILDING', theme: 'Green Team Wins' };
  }, [gameData]);

  /* ── Track phase changes for animation triggers ── */
  useEffect(() => {
    prevPhaseRef.current = phase;
  }, [phase]);

  /* ── Empty state ── */
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#020205] text-white flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-6">
          <div
            className="w-16 h-16 rounded-full border-2 border-transparent"
            style={{
              background:
                'linear-gradient(#020205, #020205) padding-box, linear-gradient(135deg, #10b981, #06b6d4) border-box',
              animation: 'spin 1.2s linear infinite',
            }}
          />
          <p className="text-xs font-black tracking-[0.5em] text-emerald-400 uppercase">
            טוען מערכת&hellip;
          </p>
        </div>
      </div>
    );
  }

  const currentCard = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  /* ── Navigation ── */
  const nextStep = () => {
    if (phase === 'QUESTION') {
      setPhase('REVEAL');
    } else if (phase === 'REVEAL') {
      setCardVisible(false);
      setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((p) => p + 1);
          setPhase('QUESTION');
        } else {
          setPhase('SUMMARY');
        }
        setCardVisible(true);
      }, 350);
    }
  };

  /* ════════════════════════ PHASE: START ════════════════════════ */
  if (phase === 'START') {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#020205] text-white flex flex-col items-center justify-center overflow-hidden relative"
        style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
      >
        <AmbientOrbs phase="START" />
        <GrainOverlay />

        {/* Grid lines decoration */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            backgroundImage:
              'linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-5xl mx-auto">
          {/* Protocol badge */}
          <div
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-14"
            style={{
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.18)',
            }}
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-black tracking-[0.45em] text-emerald-400 uppercase">
              Consensus Protocol v2.0
            </span>
          </div>

          {/* Giant headline */}
          <h1
            className="font-black tracking-tighter leading-[0.88] mb-10 select-none"
            style={{ fontSize: 'clamp(80px, 14vw, 160px)' }}
          >
            GREEN{' '}
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 40%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              TEAM
            </span>
            <br />
            WINS
          </h1>

          <p
            className="text-xl text-gray-400 font-light leading-relaxed max-w-xl mb-16"
            style={{ direction: 'rtl' }}
          >
            המשחק שבו האינדיבידואל מנצח דרך{' '}
            <span className="text-white font-semibold">הקבוצה</span>.
            <br />
            תהיו ברוב – תהיו בירוק.
          </p>

          {/* CTA */}
          <button
            onClick={() => setPhase('QUESTION')}
            className="group relative overflow-hidden px-14 py-5 rounded-2xl font-black text-xl tracking-tight transition-all duration-300 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#020205',
              boxShadow: '0 0 60px rgba(16,185,129,0.35), 0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <span className="relative z-10 flex items-center gap-3">
              כניסה למערכת
              <Zap className="w-5 h-5 fill-current" />
            </span>
            {/* hover shimmer */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
              }}
            />
          </button>

          {/* Room indicator */}
          <p className="mt-10 text-[10px] font-mono tracking-[0.35em] text-white/15 uppercase">
            Room {roomId}
          </p>
        </div>
      </div>
    );
  }

  /* ════════════════════════ PHASE: SUMMARY ════════════════════════ */
  if (phase === 'SUMMARY') {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#020205] text-white flex flex-col items-center justify-center p-10 relative overflow-hidden"
        style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
      >
        <AmbientOrbs phase="SUMMARY" />
        <GrainOverlay />

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
          {/* Trophy area */}
          <div className="relative mb-12">
            <div
              className="w-28 h-28 rounded-3xl flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.06) 100%)',
                border: '1px solid rgba(251,191,36,0.2)',
                boxShadow: '0 0 60px rgba(251,191,36,0.12)',
              }}
            >
              <PartyPopper className="w-14 h-14 text-amber-400" style={{ animation: 'bounce 1s infinite' }} />
            </div>
          </div>

          <p className="text-[10px] font-black tracking-[0.6em] text-emerald-400 uppercase mb-4">
            Session Complete
          </p>
          <h2
            className="font-black tracking-tighter mb-16 text-center"
            style={{ fontSize: 'clamp(48px, 8vw, 80px)' }}
          >
            משימה הושלמה
          </h2>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16">
            {/* Consensus score */}
            <div
              className="rounded-[2rem] p-10 flex flex-col items-center gap-4"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow:
                  'inset 0 1px 1px rgba(255,255,255,0.07), 0 0 40px rgba(16,185,129,0.06)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-emerald-500/60">
                מדד סנכרון סופי
              </p>
              <div className="flex items-center gap-5">
                <Zap className="w-10 h-10 text-emerald-400 fill-emerald-400" />
                <span
                  className="font-mono font-black"
                  style={{
                    fontSize: 96,
                    backgroundImage: 'linear-gradient(135deg, #6ee7b7, #10b981)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                  }}
                >
                  {consensusCount}
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-widest">
                נקודות קונצנזוס
              </p>
            </div>

            {/* Champion */}
            <div
              className="rounded-[2rem] p-10 flex flex-col items-center text-center gap-4"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow:
                  'inset 0 1px 1px rgba(255,255,255,0.07)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <Crown className="w-10 h-10 text-amber-400" />
              <h3 className="text-xl font-black tracking-tight">הירוקים שביניכם</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                מי שצבר הכי הרבה נקודות הוא מאסטר הקונצנזוס של{' '}
                <span className="text-white font-semibold">{metadata.company_name}</span>.
              </p>
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => window.location.reload()}
            className="group flex items-center gap-3 text-white/20 hover:text-white/60 transition-colors duration-300"
          >
            <RotateCcw
              className="w-4 h-4 transition-transform duration-700"
              style={{ animation: 'none' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = 'rotate(360deg)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
            />
            <span className="text-xs font-mono uppercase tracking-[0.3em]">
              אתחול מחדש &bull; Room: {roomId}
            </span>
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════ PHASE: QUESTION / REVEAL ════════════════════════ */
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#020205] text-white flex flex-col relative overflow-hidden"
      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      <AmbientOrbs phase={phase} />
      <GrainOverlay />

      {/* Reveal phase – full-width emerald top border flash */}
      {phase === 'REVEAL' && (
        <div
          className="fixed top-0 left-0 right-0 h-px z-50"
          style={{
            background: 'linear-gradient(90deg, transparent, #10b981 30%, #06b6d4 70%, transparent)',
            boxShadow: '0 0 20px rgba(16,185,129,0.8)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}

      {/* ── HEADER ── */}
      <header className="relative z-20 flex justify-between items-start px-8 pt-8 pb-0 md:px-14 md:pt-12">
        {/* Brand */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-black tracking-[0.4em] text-emerald-500 uppercase">
              {metadata.company_name}
            </span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white/80">{metadata.theme}</h1>
        </div>

        {/* Host command center */}
        {isHost && (
          <div
            className="flex items-center gap-6 px-7 py-4 rounded-2xl"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06), 0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex flex-col items-start gap-0.5">
              <p className="text-[9px] font-black tracking-[0.45em] text-white/25 uppercase">
                מדד סנכרון
              </p>
              <span
                className="font-mono font-black leading-none"
                style={{
                  fontSize: 40,
                  backgroundImage: 'linear-gradient(135deg, #d1fae5, #10b981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {String(consensusCount).padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={() => setConsensusCount((p) => p + 1)}
              className="group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 0 20px rgba(16,185,129,0.4)',
              }}
            >
              <Plus className="w-5 h-5 text-black" />
            </button>
          </div>
        )}
      </header>

      {/* ── MAIN ── */}
      <main className="relative z-20 flex-1 flex flex-col justify-center px-6 md:px-14 py-10 max-w-5xl mx-auto w-full">
        {/* Progress rail */}
        <div className="mb-10 space-y-3">
          <div className="flex justify-between items-end">
            <span
              className="font-mono font-black text-white/10 tracking-tighter select-none"
              style={{ fontSize: 48 }}
            >
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/25">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="w-full h-px rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                boxShadow: '0 0 12px rgba(16,185,129,0.7)',
              }}
            />
          </div>
        </div>

        {/* CARD */}
        <div
          className="relative rounded-[2.5rem] p-12 md:p-20 min-h-[420px] flex flex-col justify-center items-center text-center overflow-hidden transition-all duration-350"
          style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(32px)',
            border:
              phase === 'REVEAL'
                ? '1px solid rgba(16,185,129,0.35)'
                : '1px solid rgba(255,255,255,0.06)',
            boxShadow:
              phase === 'REVEAL'
                ? 'inset 0 1px 1px rgba(255,255,255,0.1), 0 0 80px rgba(16,185,129,0.12), 0 30px 80px rgba(0,0,0,0.5)'
                : 'inset 0 1px 1px rgba(255,255,255,0.07), 0 30px 80px rgba(0,0,0,0.4)',
            opacity: cardVisible ? 1 : 0,
            transform: cardVisible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
          }}
        >
          {/* Category label */}
          <div className="absolute top-10 flex items-center gap-3">
            <div className="h-px w-8" style={{ background: 'rgba(16,185,129,0.4)' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">
              {currentCard.category}
            </span>
            <div className="h-px w-8" style={{ background: 'rgba(16,185,129,0.4)' }} />
          </div>

          {/* Prompt text */}
          <h2
            className="font-black tracking-tighter leading-[1.05] max-w-3xl"
            style={{ fontSize: 'clamp(32px, 5.5vw, 68px)' }}
          >
            {currentCard.prompt}
          </h2>

          {/* REVEAL banner */}
          {phase === 'REVEAL' && (
            <div
              className="mt-14 flex items-center gap-5 px-8 py-5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#020205',
                boxShadow: '0 0 60px rgba(16,185,129,0.35)',
                animation: 'zoomIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
              }}
            >
              <CheckCircle2 className="w-7 h-7 shrink-0" />
              <div className="text-right">
                <p className="text-xl font-black leading-tight">הקבוצה הירוקה מנצחת!</p>
                <p className="text-xs font-bold opacity-60 uppercase tracking-tighter mt-0.5">
                  מי שברוב מקבל נקודה
                </p>
              </div>
            </div>
          )}

          {/* Decorative corner marks */}
          <div className="absolute top-6 right-8 w-4 h-4 border-t border-r border-white/10 rounded-tr-lg" />
          <div className="absolute top-6 left-8 w-4 h-4 border-t border-l border-white/10 rounded-tl-lg" />
          <div className="absolute bottom-6 right-8 w-4 h-4 border-b border-r border-white/10 rounded-br-lg" />
          <div className="absolute bottom-6 left-8 w-4 h-4 border-b border-l border-white/10 rounded-bl-lg" />
        </div>

        {/* HOST NAV BUTTON */}
        {isHost && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={nextStep}
              className="group relative flex items-center gap-5 rounded-[1.75rem] px-12 py-5 font-black text-xl tracking-tight overflow-hidden transition-all duration-200 active:scale-95"
              style={{
                background: phase === 'REVEAL' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                color: phase === 'REVEAL' ? '#ffffff' : '#020205',
                border:
                  phase === 'REVEAL'
                    ? '1px solid rgba(16,185,129,0.35)'
                    : '1px solid transparent',
                boxShadow:
                  phase === 'REVEAL'
                    ? '0 0 40px rgba(16,185,129,0.15), 0 20px 40px rgba(0,0,0,0.4)'
                    : '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              <span className="relative z-10">
                {phase === 'QUESTION' ? 'חשוף תוצאה' : 'לשאלה הבאה'}
              </span>
              <ChevronLeft
                className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:-translate-x-1"
              />
              {/* shimmer */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
                }}
              />
            </button>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-20 py-6 text-center">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/10">
          Room: {roomId} &bull; Platform 2.0.4
        </p>
      </footer>

      {/* Keyframe injection */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default GreenTeamWins;