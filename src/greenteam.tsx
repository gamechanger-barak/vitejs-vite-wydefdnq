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
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
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
    className="pointer-events-none fixed inset-0 opacity-[0.025] z-10"
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

  const questions = useMemo<GameContent[]>(() => {
    if (!gameData) return [];
    if (Array.isArray(gameData)) return gameData;
    if (gameData?.content) return gameData.content;
    return [];
  }, [gameData]);

  const metadata = useMemo<GameMetadata>(() => {
    if (!Array.isArray(gameData) && gameData?.game_metadata) return gameData.game_metadata;
    return { company_name: 'TEAM BUILDING', theme: 'Green Team Wins' };
  }, [gameData]);

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#020205] text-white flex items-center justify-center z-[100]" dir="rtl">
        <div className="flex flex-col items-center gap-6">
          <div
            className="w-16 h-16 rounded-full border-2 border-transparent shadow-[0_0_20px_rgba(16,185,129,0.2)]"
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

  return (
    <div 
      dir="rtl" 
      className="fixed inset-0 z-50 bg-[#020205] text-white flex flex-col overflow-hidden font-sans"
      style={{ userSelect: 'none' }}
    >
      <AmbientOrbs phase={phase} />
      <GrainOverlay />

      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* HEADER */}
      <header className="relative z-20 flex justify-between items-start px-8 pt-12 md:px-14">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-black tracking-[0.4em] text-emerald-500 uppercase">
              {metadata.company_name}
            </span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white/80 uppercase italic">{metadata.theme}</h1>
        </div>

        {isHost && (
          <div
            className="flex items-center gap-6 px-7 py-4 rounded-2xl"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex flex-col items-start gap-0.5">
              <p className="text-[9px] font-black tracking-[0.45em] text-white/25 uppercase">מדד סנכרון</p>
              <span
                className="font-mono font-black text-4xl text-emerald-400 leading-none"
              >
                {String(consensusCount).padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={() => setConsensusCount((p) => p + 1)}
              className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg active:scale-90 transition-transform cursor-pointer"
            >
              <Plus className="w-5 h-5 text-black font-bold" />
            </button>
          </div>
        )}
      </header>

      {/* CONTENT */}
      <main className="relative z-20 flex-1 flex flex-col justify-center px-6 md:px-14 py-10 max-w-5xl mx-auto w-full">
        {phase === 'START' && (
          <div className="flex flex-col items-center text-center">
             <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-14 bg-emerald-500/10 border border-emerald-500/20">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-black tracking-[0.45em] text-emerald-400 uppercase tracking-widest">
                  Consensus Protocol v2.0
                </span>
              </div>
              <h1 className="font-black tracking-tighter leading-[0.88] mb-10 text-[clamp(80px,14vw,160px)]">
                GREEN <span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600">TEAM</span><br />WINS
              </h1>
              <p className="text-xl text-gray-400 font-light leading-relaxed max-w-xl mb-16">
                המשחק שבו האינדיבידואל מנצח דרך <span className="text-white font-semibold">הקבוצה</span>.<br />
                תהיו ברוב – תהיו בירוק.
              </p>
              <button onClick={() => setPhase('QUESTION')} className="px-14 py-5 rounded-2xl font-black text-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-[0_0_50px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer">
                כניסה למערכת
              </button>
          </div>
        )}

        {(phase === 'QUESTION' || phase === 'REVEAL') && (
          <div className="w-full h-full flex flex-col justify-center">
            <div className="mb-10 space-y-3">
              <div className="flex justify-between items-end">
                <span className="font-mono font-black text-white/10 text-6xl tracking-tighter leading-none">{String(currentIndex + 1).padStart(2, '0')}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/25">{currentIndex + 1} / {totalQuestions}</span>
              </div>
              <div className="w-full h-px bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_12px_#10b981] transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="relative rounded-[2.5rem] p-12 md:p-20 min-h-[450px] flex flex-col justify-center items-center text-center bg-white/[0.02] border border-white/5 backdrop-blur-[40px] shadow-2xl overflow-hidden" style={{ borderColor: phase === 'REVEAL' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)' }}>
              <div className="absolute top-10 flex items-center gap-3">
                <div className="h-px w-8 bg-emerald-500/30" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">{currentCard.category}</span>
                <div className="h-px w-8 bg-emerald-500/30" />
              </div>
              <h2 className="font-black tracking-tighter leading-[1.05] text-[clamp(32px,5.5vw,72px)]">{currentCard.prompt}</h2>
              {phase === 'REVEAL' && (
                <div className="mt-14 flex items-center gap-5 px-8 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-2xl animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-8 h-8" />
                  <div className="text-right">
                    <p className="text-2xl font-black leading-tight">הקבוצה הירוקה מנצחת!</p>
                    <p className="text-xs font-bold opacity-70 uppercase tracking-tighter">מי שברוב מקבל נקודה</p>
                  </div>
                </div>
              )}
            </div>

            {isHost && (
              <div className="mt-12 flex justify-center">
                <button onClick={nextStep} className="group relative flex items-center gap-5 rounded-[1.75rem] px-14 py-5 font-black text-xl transition-all active:scale-95 shadow-2xl cursor-pointer" style={{ background: phase === 'REVEAL' ? 'rgba(255,255,255,0.05)' : '#ffffff', color: phase === 'REVEAL' ? '#ffffff' : '#020205', border: phase === 'REVEAL' ? '1px solid rgba(16,185,129,0.3)' : 'none' }}>
                   <span>{phase === 'QUESTION' ? 'חשוף תוצאה' : 'לשאלה הבאה'}</span>
                   <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'SUMMARY' && (
          <div className="flex flex-col items-center text-center">
            <PartyPopper className="w-20 h-20 text-amber-400 mb-8 animate-bounce" />
            <h2 className="text-7xl font-black tracking-tighter mb-16">משימה הושלמה</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
               <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3rem] backdrop-blur-2xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.45em] text-emerald-500/60 mb-4">מדד סנכרון סופי</p>
                  <div className="flex items-center justify-center gap-5">
                    <Zap className="w-10 h-10 text-emerald-400 fill-emerald-400" />
                    <span className="text-9xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-100 to-emerald-500">{consensusCount}</span>
                  </div>
               </div>
               <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3rem] backdrop-blur-2xl flex flex-col items-center justify-center">
                  <Crown className="w-12 h-12 text-amber-500 mb-4" />
                  <h3 className="text-2xl font-black mb-2 tracking-tight">הירוקים שביניכם</h3>
                  <p className="text-gray-500 text-sm italic italic leading-relaxed">מי שצבר הכי הרבה נקודות הוא מאסטר הקונצנזוס של <span className="text-white font-semibold">{metadata.company_name}</span>.</p>
               </div>
            </div>
            <button onClick={() => window.location.reload()} className="flex items-center gap-3 text-white/20 hover:text-white transition-colors uppercase text-xs font-mono tracking-widest">
              <RotateCcw className="w-4 h-4" /> אתחול מחדש &bull; Room: {roomId}
            </button>
          </div>
        )}
      </main>

      <footer className="relative z-20 py-8 text-center opacity-10 text-[9px] font-mono uppercase tracking-[0.4em]">Room: {roomId} &bull; ENGINE: GTW_ULTIMATE_V3</footer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default GreenTeamWins;