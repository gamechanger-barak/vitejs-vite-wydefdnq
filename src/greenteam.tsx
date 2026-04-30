import React, { useState, useMemo } from 'react';
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
    <div
      className="absolute rounded-full transition-all duration-[3000ms] ease-in-out"
      style={{
        width: 700,
        height: 700,
        top: '-20%',
        right: '-15%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'pulse 8s ease-in-out infinite',
      }}
    />
    <div
      className="absolute rounded-full transition-all duration-[2000ms] ease-in-out"
      style={{
        width: 500,
        height: 500,
        bottom: '-10%',
        left: '-10%',
        background: phase === 'REVEAL'
            ? 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
        filter: 'blur(100px)',
        animation: 'pulse 10s ease-in-out infinite reverse',
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

  /* ── חילוץ נתונים בטוח (מניעת מסך לבן) ── */
  const questions = useMemo<GameContent[]>(() => {
    if (!gameData) return []; //[cite: 1]
    if (Array.isArray(gameData)) return gameData; //[cite: 2]
    if (gameData?.content) return gameData.content; //[cite: 2]
    return []; //[cite: 1]
  }, [gameData]);

  const metadata = useMemo<GameMetadata>(() => {
    if (!Array.isArray(gameData) && gameData?.game_metadata) return gameData.game_metadata; //[cite: 2]
    return { company_name: 'TEAM BUILDING', theme: 'Green Team Wins' }; //[cite: 2]
  }, [gameData]);

  /* ── בדיקת תקינות לפני רינדור ── */
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#020205] text-white flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-6">
          <div
            className="w-16 h-16 rounded-full border-2 border-transparent"
            style={{
              background: 'linear-gradient(#020205, #020205) padding-box, linear-gradient(135deg, #10b981, #06b6d4) border-box',
              animation: 'spin 1.2s linear infinite',
            }}
          />
          <p className="text-xs font-black tracking-[0.5em] text-emerald-400 uppercase">טוען מערכת&hellip;</p>
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

  /* ════════════════════════ PHASE: START ════════════════════════ */
  if (phase === 'START') {
    return (
      <div dir="rtl" className="min-h-screen bg-[#020205] text-white flex flex-col items-center justify-center overflow-hidden relative font-sans">
        <AmbientOrbs phase="START" />
        <GrainOverlay />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            backgroundImage: 'linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-5xl mx-auto">
          <div
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-14"
            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-black tracking-[0.45em] text-emerald-400 uppercase">Consensus Protocol v2.0</span>
          </div>

          <h1 className="font-black tracking-tighter leading-[0.88] mb-10 select-none text-[clamp(80px,14vw,160px)]">
            GREEN <span style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 40%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TEAM</span><br />WINS
          </h1>

          <p className="text-xl text-gray-400 font-light leading-relaxed max-w-xl mb-16">
            המשחק שבו האינדיבידואל מנצח דרך <span className="text-white font-semibold">הקבוצה</span>.<br />
            תהיו ברוב – תהיו בירוק.[cite: 2]
          </p>

          <button
            onClick={() => setPhase('QUESTION')}
            className="group relative overflow-hidden px-14 py-5 rounded-2xl font-black text-xl tracking-tight transition-all duration-300 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#020205', boxShadow: '0 0 60px rgba(16,185,129,0.35), 0 20px 40px rgba(0,0,0,0.5)' }}
          >
            <span className="relative z-10 flex items-center gap-3">כניסה למערכת <Zap className="w-5 h-5 fill-current" /></span>
          </button>
          <p className="mt-10 text-[10px] font-mono tracking-[0.35em] text-white/15 uppercase">Room {roomId}</p>
        </div>
      </div>
    );
  }

  /* ════════════════════════ PHASE: SUMMARY ════════════════════════ */
  if (phase === 'SUMMARY') {
    return (
      <div dir="rtl" className="min-h-screen bg-[#020205] text-white flex flex-col items-center justify-center p-10 relative overflow-hidden font-sans">
        <AmbientOrbs phase="SUMMARY" />
        <GrainOverlay />
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
          <PartyPopper className="w-14 h-14 text-amber-400 mb-12" style={{ animation: 'bounce 1s infinite' }} />
          <h2 className="font-black tracking-tighter mb-16 text-[clamp(48px,8vw,80px)]">משימה הושלמה</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16 text-center">
            <div className="rounded-[2rem] p-10 flex flex-col items-center gap-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)' }}>
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-emerald-500/60">מדד סנכרון סופי</p>
              <div className="flex items-center gap-5">
                <Zap className="w-10 h-10 text-emerald-400 fill-emerald-400" />
                <span className="font-mono font-black text-[96px]" style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{consensusCount}</span>
              </div>
            </div>
            <div className="rounded-[2rem] p-10 flex flex-col items-center text-center gap-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)' }}>
              <Crown className="w-10 h-10 text-amber-400" />
              <h3 className="text-xl font-black tracking-tight">הירוקים שביניכם</h3>
              <p className="text-gray-500 text-sm">מי שצבר הכי הרבה נקודות הוא מאסטר הקונצנזוס של <span className="text-white font-semibold">{metadata.company_name}</span>.[cite: 2]</p>
            </div>
          </div>

          <button onClick={() => window.location.reload()} className="group flex items-center gap-3 text-white/20 hover:text-white/60 transition-colors tracking-[0.3em] uppercase text-[10px] font-mono">
            <RotateCcw className="w-4 h-4" /> אתחול מחדש &bull; Room: {roomId}
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════ PHASE: QUESTION / REVEAL ════════════════════════ */
  return (
    <div dir="rtl" className="min-h-screen bg-[#020205] text-white flex flex-col relative overflow-hidden font-sans">
      <AmbientOrbs phase={phase} />
      <GrainOverlay />
      {phase === 'REVEAL' && <div className="fixed top-0 left-0 right-0 h-px z-50" style={{ background: 'linear-gradient(90deg, transparent, #10b981 30%, #06b6d4 70%, transparent)', boxShadow: '0 0 20px rgba(16,185,129,0.8)', animation: 'pulse 2s ease-in-out infinite' }} />}

      <header className="relative z-20 flex justify-between items-start px-8 pt-12 md:px-14">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-black tracking-[0.4em] text-emerald-500 uppercase">{metadata.company_name}</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white/80">{metadata.theme}</h1>
        </div>

        {isHost && (
          <div className="flex items-center gap-6 px-7 py-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)' }}>
            <div className="flex flex-col items-start gap-0.5">
              <p className="text-[9px] font-black tracking-[0.45em] text-white/25 uppercase">מדד סנכרון</p>
              <span className="font-mono font-black text-[40px]" style={{ backgroundImage: 'linear-gradient(135deg, #d1fae5, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{String(consensusCount).padStart(2, '0')}</span>
            </div>
            <button onClick={() => setConsensusCount((p) => p + 1)} className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg active:scale-90 transition-transform"><Plus className="w-5 h-5 text-black" /></button>
          </div>
        )}
      </header>

      <main className="relative z-20 flex-1 flex flex-col justify-center px-6 md:px-14 py-10 max-w-5xl mx-auto w-full">
        <div className="mb-10 space-y-3">
          <div className="flex justify-between items-end text-center">
            <span className="font-mono font-black text-white/10 text-[48px] tracking-tighter select-none leading-none">{String(currentIndex + 1).padStart(2, '0')}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/25">{currentIndex + 1} / {totalQuestions}</span>
          </div>
          <div className="w-full h-px rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}><div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #10b981, #06b6d4)', boxShadow: '0 0 12px rgba(16,185,129,0.7)' }} /></div>
        </div>

        <div
          className="relative rounded-[2.5rem] p-12 md:p-20 min-h-[420px] flex flex-col justify-center items-center text-center overflow-hidden transition-all duration-350"
          style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(32px)', border: phase === 'REVEAL' ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.06)', boxShadow: phase === 'REVEAL' ? '0 0 80px rgba(16,185,129,0.12)' : '0 30px 80px rgba(0,0,0,0.4)' }}
        >
          <div className="absolute top-10 flex items-center gap-3">
            <div className="h-px w-8 bg-emerald-500/40" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">{currentCard.category}</span>
            <div className="h-px w-8 bg-emerald-500/40" />
          </div>

          <h2 className="font-black tracking-tighter leading-[1.05] text-[clamp(32px,5.5vw,68px)]">{currentCard.prompt}</h2>

          {phase === 'REVEAL' && (
            <div className="mt-14 flex items-center gap-5 px-8 py-5 rounded-2xl text-black" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 60px rgba(16,185,129,0.35)', animation: 'zoomIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
              <CheckCircle2 className="w-7 h-7" />
              <div className="text-right">
                <p className="text-xl font-black leading-tight">הקבוצה הירוקה מנצחת!</p>
                <p className="text-xs font-bold opacity-60 uppercase tracking-tighter mt-0.5">מי שברוב מקבל נקודה[cite: 2]</p>
              </div>
            </div>
          )}
        </div>

        {isHost && (
          <div className="mt-12 flex justify-center">
            <button onClick={nextStep} className="group relative flex items-center gap-5 rounded-[1.75rem] px-12 py-5 font-black text-xl tracking-tight transition-all active:scale-95" style={{ background: phase === 'REVEAL' ? 'rgba(255,255,255,0.05)' : '#ffffff', color: phase === 'REVEAL' ? '#ffffff' : '#020205', border: phase === 'REVEAL' ? '1px solid rgba(16,185,129,0.35)' : 'none' }}>
              <span>{phase === 'QUESTION' ? 'חשוף תוצאה' : 'לשאלה הבאה'}</span>
              <ArrowLeft className="w-6 h-6 transition-transform group-hover:translate-x-[-4px]" />
            </button>
          </div>
        )}
      </main>

      <footer className="relative z-20 py-6 text-center opacity-10 text-[9px] font-mono uppercase tracking-[0.4em]">Room: {roomId} &bull; Platform 2.0.4</footer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.85) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
};

export default GreenTeamWins;