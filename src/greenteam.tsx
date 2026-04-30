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
/* שימוש ב-fixed כדי להבטיח שהאורות יכסו את כל שטח התצוגה */
const AmbientOrbs: React.FC<{ phase: GamePhase }> = ({ phase }) => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
    <div
      className="absolute rounded-full transition-all duration-[3000ms] ease-in-out"
      style={{
        width: 'max(700px, 60vw)',
        height: 'max(700px, 60vw)',
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
        width: 'max(500px, 40vw)',
        height: 'max(500px, 40vw)',
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
    className="pointer-events-none fixed inset-0 opacity-[0.025] z-[1]"
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

  /* ── חילוץ נתונים בטוח[cite: 1, 2] ── */
  const questions = useMemo<GameContent[]>(() => {
    if (!gameData) return [];[cite: 1]
    if (Array.isArray(gameData)) return gameData;
    if (gameData?.content) return gameData.content;[cite: 2]
    return [];[cite: 1]
  }, [gameData]);

  const metadata = useMemo<GameMetadata>(() => {
    if (!Array.isArray(gameData) && gameData?.game_metadata) return gameData.game_metadata;[cite: 2]
    return { company_name: 'TEAM BUILDING', theme: 'Green Team Wins' };[cite: 2]
  }, [gameData]);

  /* ── הגנה המונעת קריסה ומסך לבן אם הנתונים טרם נטענו[cite: 1, 2] ── */
  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#020205] text-white flex items-center justify-center z-[9999]" dir="rtl">
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

  /* ════════════════════════ PHASE RENDERERS ════════════════════════ */

  return (
    /* שימוש ב-fixed inset-0 z-50 מבטיח שהמשחק יופיע מעל הכל ולא יידחף למטה[cite: 2] */
    <div 
      dir="rtl" 
      className="fixed inset-0 z-50 bg-[#020205] text-white overflow-y-auto overflow-x-hidden font-sans select-none"
      style={{ scrollBehavior: 'smooth' }}
    >
      <AmbientOrbs phase={phase} />
      <GrainOverlay />
      
      {/* Grid lines decoration[cite: 2] */}
      <div
        className="pointer-events-none fixed inset-0 z-[2]"
        aria-hidden
        style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 min-h-full flex flex-col items-center">
        
        {/* PHASE: START[cite: 2] */}
        {phase === 'START' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center max-w-5xl">
            <div
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-14"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-black tracking-[0.45em] text-emerald-400 uppercase">Consensus Protocol v2.0</span>
            </div>

            <h1 className="font-black tracking-tighter leading-[0.88] mb-10 text-[clamp(80px,14vw,160px)]">
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
            <p className="mt-10 text-[10px] font-mono tracking-[0.35em] text-white/15 uppercase tracking-widest">Room {roomId}</p>
          </div>
        )}

        {/* PHASE: SUMMARY[cite: 2] */}
        {phase === 'SUMMARY' && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 w-full max-w-4xl text-center">
            <PartyPopper className="w-14 h-14 text-amber-400 mb-12 animate-bounce" />
            <h2 className="font-black tracking-tighter mb-16 text-[clamp(48px,8vw,80px)]">משימה הושלמה[cite: 2]</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16">
              <div className="rounded-[2rem] p-10 flex flex-col items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.45em] text-emerald-500/60">מדד סנכרון סופי</p>
                <div className="flex items-center gap-5">
                  <Zap className="w-10 h-10 text-emerald-400 fill-emerald-400" />
                  <span className="font-mono font-black text-7xl md:text-8xl text-emerald-400">{consensusCount}</span>
                </div>
              </div>
              <div className="rounded-[2rem] p-10 flex flex-col items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-2xl">
                <Crown className="w-10 h-10 text-amber-400" />
                <h3 className="text-xl font-black tracking-tight">הירוקים שביניכם</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">מי שצבר הכי הרבה נקודות הוא מאסטר הקונצנזוס של <span className="text-white font-semibold">{metadata.company_name}</span>.[cite: 2]</p>
              </div>
            </div>

            <button onClick={() => window.location.reload()} className="group flex items-center gap-3 text-white/20 hover:text-white/60 transition-colors uppercase text-[10px] font-mono tracking-widest">
              <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" /> אתחול מחדש &bull; Room: {roomId}
            </button>
          </div>
        )}

        {/* PHASE: QUESTION / REVEAL[cite: 2] */}
        {(phase === 'QUESTION' || phase === 'REVEAL') && (
          <div className="w-full flex-1 flex flex-col">
            {phase === 'REVEAL' && (
              <div className="fixed top-0 left-0 right-0 h-px z-50 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse" />
            )}

            <header className="flex justify-between items-start px-8 pt-12 md:px-14 w-full">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-black tracking-[0.4em] text-emerald-500 uppercase">{metadata.company_name}</span>
                </div>
                <h1 className="text-lg font-bold tracking-tight text-white/80">{metadata.theme}</h1>
              </div>

              {isHost && (
                <div className="flex items-center gap-6 px-7 py-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-2xl shadow-xl">
                  <div className="flex flex-col items-start">
                    <p className="text-[9px] font-black tracking-[0.45em] text-white/25 uppercase">מדד סנכרון</p>
                    <span className="font-mono font-black text-3xl text-emerald-400">{String(consensusCount).padStart(2, '0')}</span>
                  </div>
                  <button onClick={() => setConsensusCount((p) => p + 1)} className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 active:scale-90 transition-transform"><Plus className="w-5 h-5 text-black" /></button>
                </div>
              )}
            </header>

            <main className="flex-1 flex flex-col justify-center px-6 md:px-14 py-10 max-w-5xl mx-auto w-full">
              <div className="mb-10 space-y-3">
                <div className="flex justify-between items-end">
                  <span className="font-mono font-black text-white/10 text-5xl md:text-6xl tracking-tighter select-none leading-none">{String(currentIndex + 1).padStart(2, '0')}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/25">{currentIndex + 1} / {totalQuestions}</span>
                </div>
                <div className="w-full h-px bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.7)]" style={{ width: `${progress}%` }} /></div>
              </div>

              <div
                className="relative rounded-[2.5rem] p-12 md:p-20 min-h-[420px] flex flex-col justify-center items-center text-center bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl transition-all duration-350"
                style={{
                  borderColor: phase === 'REVEAL' ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.06)',
                  boxShadow: phase === 'REVEAL' ? '0 0 80px rgba(16,185,129,0.12)' : '0 30px 80px rgba(0,0,0,0.4)',
                }}
              >
                <div className="absolute top-10 flex items-center gap-3">
                  <div className="h-px w-8 bg-emerald-500/40" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">{currentCard.category}</span>
                  <div className="h-px w-8 bg-emerald-500/40" />
                </div>

                <h2 className="font-black tracking-tighter leading-[1.05] text-[clamp(32px,5.5vw,68px)]">{currentCard.prompt}</h2>

                {phase === 'REVEAL' && (
                  <div className="mt-14 flex items-center gap-5 px-8 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-lg animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-7 h-7" />
                    <div className="text-right">
                      <p className="text-xl font-black leading-tight">הקבוצה הירוקה מנצחת!</p>
                      <p className="text-xs font-bold opacity-60 uppercase tracking-tighter">מי שברוב מקבל נקודה[cite: 2]</p>
                    </div>
                  </div>
                )}
              </div>

              {isHost && (
                <div className="mt-12 flex justify-center">
                  <button onClick={nextStep} className="group relative flex items-center gap-5 rounded-[1.75rem] px-12 py-5 font-black text-xl bg-white text-[#020205] transition-all active:scale-95 hover:bg-emerald-400 transition-colors">
                    <span>{phase === 'QUESTION' ? 'חשוף תוצאה' : 'לשאלה הבאה'}</span>
                    <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-2" />
                  </button>
                </div>
              )}
            </main>

            <footer className="py-6 text-center opacity-10 text-[9px] font-mono uppercase tracking-[0.4em]">Room: {roomId} &bull; Platform 2.1.0</footer>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default GreenTeamWins;