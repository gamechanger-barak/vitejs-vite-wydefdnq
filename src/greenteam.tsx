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

/* ─────────────────────────── Shared wrapper style ── */

const wrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100dvh',
  overflow: 'hidden',
  backgroundColor: '#020205',
  color: '#ffffff',
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
};

/* ──────────────────────────────────────── Ambient Orbs ── */

const AmbientOrbs: React.FC<{ phase: GamePhase }> = ({ phase }) => (
  <>
    <div
      style={{
        position: 'absolute',
        width: 700,
        height: 700,
        top: '-20%',
        right: '-15%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'gtw-pulse 8s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
    <div
      style={{
        position: 'absolute',
        width: 500,
        height: 500,
        bottom: '-10%',
        left: '-10%',
        borderRadius: '50%',
        background: phase === 'REVEAL'
          ? 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
        filter: 'blur(100px)',
        transition: 'background 2s ease-in-out',
        animation: 'gtw-pulse 10s ease-in-out infinite reverse',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
    <div
      style={{
        position: 'absolute',
        width: 400,
        height: 400,
        top: '40%',
        left: '30%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        filter: 'blur(120px)',
        animation: 'gtw-pulse 12s ease-in-out infinite 2s',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  </>
);

/* ──────────────────────────────────────────── Keyframes ── */

const Keyframes: React.FC = () => (
  <style>{`
    @keyframes gtw-pulse { 0%,100%{opacity:1} 50%{opacity:0.55} }
    @keyframes gtw-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes gtw-spin { to{transform:rotate(360deg)} }
    @keyframes gtw-zoomIn {
      from{opacity:0;transform:scale(0.85) translateY(12px)}
      to{opacity:1;transform:scale(1) translateY(0)}
    }
  `}</style>
);

/* ──────────────────────────────────────────── Main ── */

const GreenTeamWins: React.FC<GreenTeamWinsProps> = ({ gameData, roomId, isHost }) => {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [consensusCount, setConsensusCount] = useState<number>(0);
  const [cardVisible, setCardVisible] = useState<boolean>(true);
  const prevPhaseRef = useRef<GamePhase>('START');

  const questions = useMemo<GameContent[]>(() => {
    if (Array.isArray(gameData)) return gameData;
    if (gameData?.content) return gameData.content;
    return [];
  }, [gameData]);

  const metadata = useMemo<GameMetadata>(() => {
    if (!Array.isArray(gameData) && gameData?.game_metadata) return gameData.game_metadata;
    return { company_name: 'TEAM BUILDING', theme: 'Green Team Wins' };
  }, [gameData]);

  useEffect(() => {
    prevPhaseRef.current = phase;
  }, [phase]);

  /* ── Empty state ── */
  if (questions.length === 0) {
    return (
      <div dir="rtl" style={{ ...wrapperStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Keyframes />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            border: '2px solid transparent',
            background: 'linear-gradient(#020205,#020205) padding-box, linear-gradient(135deg,#10b981,#06b6d4) border-box',
            animation: 'gtw-spin 1.2s linear infinite',
          }} />
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.45em', color: '#34d399', textTransform: 'uppercase' }}>
            טוען מערכת…
          </p>
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

  /* ════════════════════ PHASE: START ════════════════════ */
  if (phase === 'START') {
    return (
      <div dir="rtl" style={{ ...wrapperStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Keyframes />
        <AmbientOrbs phase="START" />

        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.04) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 32px', maxWidth: 900 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px',
            borderRadius: 999, marginBottom: 56,
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)',
          }}>
            <Target size={14} style={{ color: '#34d399' }} />
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.45em', color: '#34d399', textTransform: 'uppercase' }}>
              Consensus Protocol v2.0
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.88,
            fontSize: 'clamp(72px,12vw,148px)', marginBottom: 40, userSelect: 'none',
          }}>
            GREEN{' '}
            <span style={{
              backgroundImage: 'linear-gradient(135deg,#6ee7b7 0%,#10b981 40%,#059669 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>TEAM</span>
            <br />WINS
          </h1>

          <p style={{ fontSize: 20, color: '#9ca3af', fontWeight: 300, lineHeight: 1.6, maxWidth: 480, marginBottom: 60 }}>
            המשחק שבו האינדיבידואל מנצח דרך <span style={{ color: '#fff', fontWeight: 600 }}>הקבוצה</span>.
            <br />תהיו ברוב – תהיו בירוק.
          </p>

          {/* CTA */}
          <button
            onClick={() => setPhase('QUESTION')}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '20px 56px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#10b981,#059669)',
              color: '#020205', fontWeight: 900, fontSize: 20, letterSpacing: '-0.02em',
              boxShadow: '0 0 60px rgba(16,185,129,0.35), 0 20px 40px rgba(0,0,0,0.5)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          >
            כניסה למערכת
            <Zap size={20} style={{ fill: '#020205' }} />
          </button>

          <p style={{ marginTop: 40, fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.12)', textTransform: 'uppercase' }}>
            Room {roomId}
          </p>
        </div>
      </div>
    );
  }

  /* ════════════════════ PHASE: SUMMARY ════════════════════ */
  if (phase === 'SUMMARY') {
    return (
      <div dir="rtl" style={{ ...wrapperStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, overflowY: 'auto' }}>
        <Keyframes />
        <AmbientOrbs phase="SUMMARY" />

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Trophy */}
          <div style={{
            width: 112, height: 112, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(245,158,11,0.06))',
            border: '1px solid rgba(251,191,36,0.2)', boxShadow: '0 0 60px rgba(251,191,36,0.12)',
            marginBottom: 32,
          }}>
            <PartyPopper size={56} style={{ color: '#fbbf24', animation: 'gtw-bounce 1s infinite' }} />
          </div>

          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.55em', color: '#34d399', textTransform: 'uppercase', marginBottom: 16 }}>
            Session Complete
          </p>
          <h2 style={{ fontWeight: 900, letterSpacing: '-0.04em', fontSize: 'clamp(40px,7vw,72px)', marginBottom: 56, textAlign: 'center' }}>
            משימה הושלמה
          </h2>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, width: '100%', marginBottom: 56 }}>
            <div style={{
              borderRadius: 32, padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(24px)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.07)',
            }}>
              <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.45em', color: 'rgba(16,185,129,0.5)', textTransform: 'uppercase' }}>
                מדד סנכרון סופי
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <Zap size={40} style={{ color: '#34d399', fill: '#34d399' } as React.CSSProperties} />
                <span style={{
                  fontSize: 96, fontFamily: 'monospace', fontWeight: 900, lineHeight: 1,
                  backgroundImage: 'linear-gradient(135deg,#6ee7b7,#10b981)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {consensusCount}
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#4b5563', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                נקודות קונצנזוס
              </p>
            </div>

            <div style={{
              borderRadius: 32, padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(24px)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.07)',
            }}>
              <Crown size={40} style={{ color: '#f59e0b' }} />
              <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>הירוקים שביניכם</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, maxWidth: 260 }}>
                מי שצבר הכי הרבה נקודות הוא מאסטר הקונצנזוס של{' '}
                <span style={{ color: '#fff', fontWeight: 600 }}>{metadata.company_name}</span>.
              </p>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: 'monospace',
              letterSpacing: '0.3em', textTransform: 'uppercase', transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
          >
            <RotateCcw size={14} />
            אתחול מחדש • Room: {roomId}
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════ PHASE: QUESTION / REVEAL ════════════════════ */
  return (
    <div dir="rtl" style={{ ...wrapperStyle, display: 'flex', flexDirection: 'column' }}>
      <Keyframes />
      <AmbientOrbs phase={phase} />

      {/* Reveal top border */}
      {phase === 'REVEAL' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 50,
          background: 'linear-gradient(90deg,transparent,#10b981 30%,#06b6d4 70%,transparent)',
          boxShadow: '0 0 20px rgba(16,185,129,0.8)',
          animation: 'gtw-pulse 2s ease-in-out infinite',
        }} />
      )}

      {/* ── HEADER ── */}
      <header style={{
        position: 'relative', zIndex: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '32px 56px 0',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <LayoutDashboard size={14} style={{ color: '#10b981' }} />
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.4em', color: '#10b981', textTransform: 'uppercase' }}>
              {metadata.company_name}
            </span>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.8)' }}>
            {metadata.theme}
          </h1>
        </div>

        {isHost && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 24, padding: '16px 28px', borderRadius: 20,
            background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>
                מדד סנכרון
              </p>
              <span style={{
                fontSize: 40, fontFamily: 'monospace', fontWeight: 900, lineHeight: 1,
                backgroundImage: 'linear-gradient(135deg,#d1fae5,#10b981)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {String(consensusCount).padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={() => setConsensusCount((p) => p + 1)}
              style={{
                width: 44, height: 44, borderRadius: 14, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg,#10b981,#059669)',
                boxShadow: '0 0 20px rgba(16,185,129,0.4)',
                transition: 'transform 0.15s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Plus size={20} style={{ color: '#020205' }} />
            </button>
          </div>
        )}
      </header>

      {/* ── MAIN ── */}
      <main style={{
        position: 'relative', zIndex: 20, flex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '24px 56px', maxWidth: 960, margin: '0 auto', width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
            <span style={{ fontSize: 48, fontFamily: 'monospace', fontWeight: 900, color: 'rgba(255,255,255,0.08)', letterSpacing: '-0.04em', userSelect: 'none' }}>
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div style={{ width: '100%', height: 1, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              width: `${progress}%`,
              background: 'linear-gradient(90deg,#10b981,#06b6d4)',
              boxShadow: '0 0 12px rgba(16,185,129,0.7)',
              transition: 'width 1s ease-out',
            }} />
          </div>
        </div>

        {/* Card */}
        <div style={{
          position: 'relative', borderRadius: 40, padding: '64px 80px', minHeight: 320,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          textAlign: 'center', overflow: 'hidden',
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(32px)',
          border: phase === 'REVEAL' ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.06)',
          boxShadow: phase === 'REVEAL'
            ? 'inset 0 1px 1px rgba(255,255,255,0.1), 0 0 80px rgba(16,185,129,0.12), 0 30px 80px rgba(0,0,0,0.5)'
            : 'inset 0 1px 1px rgba(255,255,255,0.07), 0 30px 80px rgba(0,0,0,0.4)',
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
          transition: 'opacity 0.35s ease, transform 0.35s ease, border 0.6s ease, box-shadow 0.6s ease',
        }}>
          {/* Category */}
          <div style={{ position: 'absolute', top: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ height: 1, width: 32, background: 'rgba(16,185,129,0.4)' }} />
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.5em', color: '#34d399', textTransform: 'uppercase' }}>
              {currentCard.category}
            </span>
            <div style={{ height: 1, width: 32, background: 'rgba(16,185,129,0.4)' }} />
          </div>

          {/* Prompt */}
          <h2 style={{
            fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05,
            fontSize: 'clamp(28px,4.5vw,60px)', maxWidth: 700,
          }}>
            {currentCard.prompt}
          </h2>

          {/* Reveal banner */}
          {phase === 'REVEAL' && (
            <div style={{
              marginTop: 40, display: 'flex', alignItems: 'center', gap: 20,
              padding: '18px 28px', borderRadius: 18,
              background: 'linear-gradient(135deg,#10b981,#059669)',
              color: '#020205', boxShadow: '0 0 60px rgba(16,185,129,0.35)',
              animation: 'gtw-zoomIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
            }}>
              <CheckCircle2 size={26} style={{ flexShrink: 0 }} />
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.2 }}>הקבוצה הירוקה מנצחת!</p>
                <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
                  מי שברוב מקבל נקודה
                </p>
              </div>
            </div>
          )}

          {/* Corner marks */}
          <div style={{ position: 'absolute', top: 20, right: 28, width: 16, height: 16, borderTop: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', top: 20, left: 28, width: 16, height: 16, borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: 20, right: 28, width: 16, height: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 28, width: 16, height: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }} />
        </div>

        {/* Nav button */}
        {isHost && (
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={nextStep}
              style={{
                display: 'flex', alignItems: 'center', gap: 20,
                padding: '18px 44px', borderRadius: 26, border: 'none', cursor: 'pointer',
                fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em',
                background: phase === 'REVEAL' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                color: phase === 'REVEAL' ? '#ffffff' : '#020205',
                outline: phase === 'REVEAL' ? '1px solid rgba(16,185,129,0.35)' : 'none',
                boxShadow: phase === 'REVEAL'
                  ? '0 0 40px rgba(16,185,129,0.15), 0 20px 40px rgba(0,0,0,0.4)'
                  : '0 20px 40px rgba(0,0,0,0.5)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            >
              {phase === 'QUESTION' ? 'חשוף תוצאה' : 'לשאלה הבאה'}
              <ChevronLeft size={22} />
            </button>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ position: 'relative', zIndex: 20, padding: '12px 0', textAlign: 'center', flexShrink: 0 }}>
        <p style={{ fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.08)', textTransform: 'uppercase' }}>
          Room: {roomId} • Platform 2.0.4
        </p>
      </footer>
    </div>
  );
};

export default GreenTeamWins;