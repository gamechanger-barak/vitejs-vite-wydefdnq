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

/* ── Base wrapper: fills exactly the viewport, no scroll ── */
const base: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100dvh',
  overflow: 'hidden',
  backgroundColor: '#020205',
  color: '#ffffff',
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  boxSizing: 'border-box',
};

/* ──────────────────────────────────── Keyframes ── */
const Keyframes = () => (
  <style>{`
    @keyframes gtw-pulse  { 0%,100%{opacity:1}       50%{opacity:.55} }
    @keyframes gtw-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes gtw-spin   { to{transform:rotate(360deg)} }
    @keyframes gtw-pop    { from{opacity:0;transform:scale(.88) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  `}</style>
);

/* ──────────────────────────────────── Ambient Orbs ── */
const AmbientOrbs = ({ phase }: { phase: GamePhase }) => (
  <>
    <div style={{ position:'absolute', width:600, height:600, top:'-15%', right:'-10%', borderRadius:'50%',
      background:'radial-gradient(circle,rgba(16,185,129,.2) 0%,transparent 70%)',
      filter:'blur(80px)', animation:'gtw-pulse 8s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
    <div style={{ position:'absolute', width:450, height:450, bottom:'-10%', left:'-8%', borderRadius:'50%',
      background: phase==='REVEAL'
        ? 'radial-gradient(circle,rgba(6,182,212,.25) 0%,transparent 70%)'
        : 'radial-gradient(circle,rgba(6,182,212,.07) 0%,transparent 70%)',
      filter:'blur(90px)', transition:'background 2s ease', animation:'gtw-pulse 10s ease-in-out infinite reverse',
      pointerEvents:'none', zIndex:0 }} />
  </>
);

/* ══════════════════════════════════════════ Component ══ */
const GreenTeamWins: React.FC<GreenTeamWinsProps> = ({ gameData, roomId, isHost }) => {
  const [phase, setPhase]               = useState<GamePhase>('START');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [consensusCount, setConsensusCount] = useState(0);
  const [cardVisible, setCardVisible]   = useState(true);
  const prevPhase = useRef<GamePhase>('START');

  const questions = useMemo<GameContent[]>(() => {
    if (Array.isArray(gameData)) return gameData;
    return gameData?.content ?? [];
  }, [gameData]);

  const metadata = useMemo<GameMetadata>(() => {
    if (!Array.isArray(gameData) && gameData?.game_metadata) return gameData.game_metadata;
    return { company_name: 'TEAM BUILDING', theme: 'Green Team Wins' };
  }, [gameData]);

  useEffect(() => { prevPhase.current = phase; }, [phase]);

  /* ── Loading ── */
  if (questions.length === 0) {
    return (
      <div dir="rtl" style={{ ...base, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Keyframes />
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', border:'2px solid transparent',
            background:'linear-gradient(#020205,#020205) padding-box,linear-gradient(135deg,#10b981,#06b6d4) border-box',
            animation:'gtw-spin 1.2s linear infinite' }} />
          <p style={{ fontSize:11, fontWeight:900, letterSpacing:'.45em', color:'#6ee7b7', textTransform:'uppercase' }}>
            טוען מערכת…
          </p>
        </div>
      </div>
    );
  }

  const currentCard   = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress      = ((currentIndex + 1) / totalQuestions) * 100;

  const nextStep = () => {
    if (phase === 'QUESTION') {
      setPhase('REVEAL');
    } else if (phase === 'REVEAL') {
      setCardVisible(false);
      setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex(p => p + 1);
          setPhase('QUESTION');
        } else {
          setPhase('SUMMARY');
        }
        setCardVisible(true);
      }, 320);
    }
  };

  /* ══════════════ START ══════════════ */
  if (phase === 'START') {
    return (
      <div dir="rtl" style={{ ...base, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <Keyframes />
        <AmbientOrbs phase="START" />

        {/* faint grid */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
          backgroundImage:'linear-gradient(rgba(16,185,129,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.04) 1px,transparent 1px)',
          backgroundSize:'60px 60px' }} />

        <div style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column',
          alignItems:'center', textAlign:'center', padding:'0 32px', maxWidth:860 }}>

          {/* badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'7px 18px',
            borderRadius:999, marginBottom:44,
            background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.25)' }}>
            <Target size={13} style={{ color:'#6ee7b7' }} />
            <span style={{ fontSize:10, fontWeight:900, letterSpacing:'.45em', color:'#6ee7b7', textTransform:'uppercase' }}>
              Consensus Protocol v2.0
            </span>
          </div>

          {/* headline */}
          <h1 style={{ fontWeight:900, letterSpacing:'-.04em', lineHeight:.9,
            fontSize:'clamp(64px,11vw,136px)', marginBottom:32, userSelect:'none', color:'#ffffff' }}>
            GREEN{' '}
            <span style={{ backgroundImage:'linear-gradient(135deg,#6ee7b7,#10b981 50%,#059669)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>TEAM</span>
            <br />WINS
          </h1>

          <p style={{ fontSize:18, color:'#d1d5db', fontWeight:300, lineHeight:1.65, maxWidth:440, marginBottom:52 }}>
            המשחק שבו האינדיבידואל מנצח דרך{' '}
            <span style={{ color:'#ffffff', fontWeight:700 }}>הקבוצה</span>.
            <br />תהיו ברוב – תהיו בירוק.
          </p>

          {/* CTA */}
          <button onClick={() => setPhase('QUESTION')} style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'18px 52px', borderRadius:18, border:'none', cursor:'pointer',
            background:'linear-gradient(135deg,#10b981,#059669)',
            color:'#020205', fontWeight:900, fontSize:18, letterSpacing:'-.02em',
            boxShadow:'0 0 50px rgba(16,185,129,.4),0 16px 32px rgba(0,0,0,.5)',
            transition:'transform .15s',
          }}
            onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.04)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
            onMouseDown={e=>(e.currentTarget.style.transform='scale(.97)')}>
            כניסה למערכת <Zap size={18} style={{ fill:'#020205' }} />
          </button>

          <p style={{ marginTop:36, fontSize:10, fontFamily:'monospace', letterSpacing:'.35em',
            color:'rgba(255,255,255,.18)', textTransform:'uppercase' }}>Room {roomId}</p>
        </div>
      </div>
    );
  }

  /* ══════════════ SUMMARY ══════════════ */
  if (phase === 'SUMMARY') {
    return (
      <div dir="rtl" style={{ ...base, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', padding:'32px 24px', overflowY:'auto' }}>
        <Keyframes />
        <AmbientOrbs phase="SUMMARY" />

        <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:760,
          display:'flex', flexDirection:'column', alignItems:'center' }}>

          {/* icon */}
          <div style={{ width:96, height:96, borderRadius:24, display:'flex', alignItems:'center', justifyContent:'center',
            background:'linear-gradient(135deg,rgba(251,191,36,.14),rgba(245,158,11,.06))',
            border:'1px solid rgba(251,191,36,.25)', boxShadow:'0 0 50px rgba(251,191,36,.14)', marginBottom:24 }}>
            <PartyPopper size={48} style={{ color:'#fbbf24', animation:'gtw-bounce 1s infinite' }} />
          </div>

          <p style={{ fontSize:10, fontWeight:900, letterSpacing:'.55em', color:'#6ee7b7', textTransform:'uppercase', marginBottom:12 }}>
            Session Complete
          </p>
          <h2 style={{ fontWeight:900, letterSpacing:'-.04em', fontSize:'clamp(36px,6vw,64px)',
            marginBottom:40, textAlign:'center', color:'#ffffff' }}>
            משימה הושלמה
          </h2>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',
            gap:20, width:'100%', marginBottom:40 }}>

            {/* Score card */}
            <div style={{ borderRadius:28, padding:'32px 28px', display:'flex', flexDirection:'column',
              alignItems:'center', gap:14,
              background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.1)',
              backdropFilter:'blur(20px)', boxShadow:'inset 0 1px 1px rgba(255,255,255,.08)' }}>
              <p style={{ fontSize:10, fontWeight:900, letterSpacing:'.4em', color:'#6ee7b7', textTransform:'uppercase' }}>
                מדד סנכרון סופי
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <Zap size={36} style={{ color:'#34d399', fill:'#34d399' } as React.CSSProperties} />
                <span style={{ fontSize:80, fontFamily:'monospace', fontWeight:900, lineHeight:1,
                  backgroundImage:'linear-gradient(135deg,#6ee7b7,#10b981)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  {consensusCount}
                </span>
              </div>
              <p style={{ fontSize:11, color:'#9ca3af', fontWeight:600, letterSpacing:'.2em', textTransform:'uppercase' }}>
                נקודות קונצנזוס
              </p>
            </div>

            {/* Champion card */}
            <div style={{ borderRadius:28, padding:'32px 28px', display:'flex', flexDirection:'column',
              alignItems:'center', textAlign:'center', gap:14,
              background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.1)',
              backdropFilter:'blur(20px)', boxShadow:'inset 0 1px 1px rgba(255,255,255,.08)' }}>
              <Crown size={36} style={{ color:'#f59e0b' }} />
              <h3 style={{ fontSize:18, fontWeight:900, letterSpacing:'-.02em', color:'#ffffff' }}>הירוקים שביניכם</h3>
              <p style={{ fontSize:14, color:'#d1d5db', lineHeight:1.65, maxWidth:240 }}>
                מי שצבר הכי הרבה נקודות הוא מאסטר הקונצנזוס של{' '}
                <span style={{ color:'#6ee7b7', fontWeight:700 }}>{metadata.company_name}</span>.
              </p>
            </div>
          </div>

          <button onClick={() => window.location.reload()} style={{
            display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer',
            color:'rgba(255,255,255,.3)', fontSize:11, fontFamily:'monospace',
            letterSpacing:'.3em', textTransform:'uppercase', transition:'color .2s',
          }}
            onMouseEnter={e=>(e.currentTarget.style.color='rgba(255,255,255,.65)')}
            onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,.3)')}>
            <RotateCcw size={13} /> אתחול מחדש • Room: {roomId}
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════ QUESTION / REVEAL ══════════════
     Layout: column flex, header + main(flex:1) + footer
     main uses justify-content:space-between so card and button
     are always visible without overflow.
  ═════════════════════════════════════════════════*/
  return (
    <div dir="rtl" style={{ ...base, display:'flex', flexDirection:'column' }}>
      <Keyframes />
      <AmbientOrbs phase={phase} />

      {/* top neon line on reveal */}
      {phase === 'REVEAL' && (
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, zIndex:50,
          background:'linear-gradient(90deg,transparent,#10b981 30%,#06b6d4 70%,transparent)',
          boxShadow:'0 0 18px rgba(16,185,129,.9)', animation:'gtw-pulse 2s ease-in-out infinite' }} />
      )}

      {/* ── HEADER (fixed height) ── */}
      <header style={{ position:'relative', zIndex:20, flexShrink:0,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'20px 40px' }}>

        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <LayoutDashboard size={13} style={{ color:'#10b981' }} />
            <span style={{ fontSize:10, fontWeight:900, letterSpacing:'.4em', color:'#10b981', textTransform:'uppercase' }}>
              {metadata.company_name}
            </span>
          </div>
          <h1 style={{ fontSize:16, fontWeight:700, letterSpacing:'-.02em', color:'rgba(255,255,255,.85)' }}>
            {metadata.theme}
          </h1>
        </div>

        {isHost && (
          <div style={{ display:'flex', alignItems:'center', gap:20, padding:'12px 22px', borderRadius:18,
            background:'rgba(0,0,0,.55)', border:'1px solid rgba(255,255,255,.1)',
            backdropFilter:'blur(20px)', boxShadow:'inset 0 1px 1px rgba(255,255,255,.07)' }}>
            <div>
              <p style={{ fontSize:9, fontWeight:900, letterSpacing:'.4em', color:'rgba(255,255,255,.4)', textTransform:'uppercase', marginBottom:2 }}>
                מדד סנכרון
              </p>
              <span style={{ fontSize:36, fontFamily:'monospace', fontWeight:900, lineHeight:1,
                backgroundImage:'linear-gradient(135deg,#d1fae5,#10b981)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                {String(consensusCount).padStart(2,'0')}
              </span>
            </div>
            <button onClick={() => setConsensusCount(p => p+1)} style={{
              width:40, height:40, borderRadius:12, border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'linear-gradient(135deg,#10b981,#059669)',
              boxShadow:'0 0 18px rgba(16,185,129,.45)', transition:'transform .15s',
            }}
              onMouseDown={e=>(e.currentTarget.style.transform='scale(.88)')}
              onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
              <Plus size={18} style={{ color:'#020205' }} />
            </button>
          </div>
        )}
      </header>

      {/* ── MAIN: grows to fill, uses space-between to push button down ── */}
      <main style={{ position:'relative', zIndex:20, flex:1, display:'flex', flexDirection:'column',
        justifyContent:'space-between', padding:'8px 40px 16px',
        maxWidth:920, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>

        {/* top area: progress + card */}
        <div style={{ display:'flex', flexDirection:'column', flex:1, justifyContent:'center', gap:16 }}>

          {/* progress */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
              <span style={{ fontSize:40, fontFamily:'monospace', fontWeight:900,
                color:'rgba(255,255,255,.07)', letterSpacing:'-.04em', userSelect:'none' }}>
                {String(currentIndex+1).padStart(2,'0')}
              </span>
              <span style={{ fontSize:10, fontWeight:900, letterSpacing:'.35em',
                color:'rgba(255,255,255,.35)', textTransform:'uppercase' }}>
                {currentIndex+1} / {totalQuestions}
              </span>
            </div>
            <div style={{ width:'100%', height:1, borderRadius:999, background:'rgba(255,255,255,.08)', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:999, width:`${progress}%`,
                background:'linear-gradient(90deg,#10b981,#06b6d4)',
                boxShadow:'0 0 10px rgba(16,185,129,.7)', transition:'width 1s ease-out' }} />
            </div>
          </div>

          {/* card */}
          <div style={{
            position:'relative', borderRadius:32, padding:'48px 64px',
            display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',
            textAlign:'center', overflow:'hidden',
            background:'rgba(255,255,255,.025)',
            backdropFilter:'blur(28px)',
            border: phase==='REVEAL' ? '1px solid rgba(16,185,129,.4)' : '1px solid rgba(255,255,255,.08)',
            boxShadow: phase==='REVEAL'
              ? 'inset 0 1px 1px rgba(255,255,255,.1),0 0 70px rgba(16,185,129,.14),0 24px 60px rgba(0,0,0,.5)'
              : 'inset 0 1px 1px rgba(255,255,255,.07),0 24px 60px rgba(0,0,0,.4)',
            opacity: cardVisible ? 1 : 0,
            transform: cardVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(.98)',
            transition:'opacity .32s ease,transform .32s ease,border .5s ease,box-shadow .5s ease',
          }}>

            {/* category */}
            <div style={{ position:'absolute', top:24, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ height:1, width:28, background:'rgba(16,185,129,.45)' }} />
              <span style={{ fontSize:10, fontWeight:900, letterSpacing:'.5em', color:'#6ee7b7', textTransform:'uppercase' }}>
                {currentCard.category}
              </span>
              <div style={{ height:1, width:28, background:'rgba(16,185,129,.45)' }} />
            </div>

            {/* prompt */}
            <h2 style={{ fontWeight:900, letterSpacing:'-.04em', lineHeight:1.08,
              fontSize:'clamp(24px,4vw,54px)', maxWidth:680, color:'#ffffff' }}>
              {currentCard.prompt}
            </h2>

            {/* reveal banner */}
            {phase === 'REVEAL' && (
              <div style={{ marginTop:36, display:'flex', alignItems:'center', gap:18,
                padding:'16px 28px', borderRadius:16,
                background:'linear-gradient(135deg,#10b981,#059669)',
                color:'#020205', boxShadow:'0 0 50px rgba(16,185,129,.4)',
                animation:'gtw-pop .4s cubic-bezier(.175,.885,.32,1.275)' }}>
                <CheckCircle2 size={24} style={{ flexShrink:0 }} />
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:17, fontWeight:900, lineHeight:1.2, color:'#020205' }}>הקבוצה הירוקה מנצחת!</p>
                  <p style={{ fontSize:11, fontWeight:700, opacity:.65, textTransform:'uppercase', letterSpacing:'.08em', marginTop:2, color:'#020205' }}>
                    מי שברוב מקבל נקודה
                  </p>
                </div>
              </div>
            )}

            {/* corner marks */}
            {[{top:18,right:24},{top:18,left:24},{bottom:18,right:24},{bottom:18,left:24}].map((pos,i) => (
              <div key={i} style={{ position:'absolute', width:14, height:14, ...pos,
                borderTop:   (pos.top    !== undefined) ? '1px solid rgba(255,255,255,.12)' : undefined,
                borderBottom:(pos.bottom !== undefined) ? '1px solid rgba(255,255,255,.12)' : undefined,
                borderRight: (pos.right  !== undefined) ? '1px solid rgba(255,255,255,.12)' : undefined,
                borderLeft:  (pos.left   !== undefined) ? '1px solid rgba(255,255,255,.12)' : undefined,
              }} />
            ))}
          </div>
        </div>

        {/* ── NAV BUTTON (always visible at bottom of main) ── */}
        {isHost && (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:16, flexShrink:0 }}>
            <button onClick={nextStep} style={{
              display:'flex', alignItems:'center', gap:18,
              padding:'16px 44px', borderRadius:24, border:'none', cursor:'pointer',
              fontWeight:900, fontSize:17, letterSpacing:'-.02em',
              background: phase==='REVEAL' ? 'rgba(255,255,255,.06)' : '#ffffff',
              color:       phase==='REVEAL' ? '#ffffff'              : '#020205',
              outline:     phase==='REVEAL' ? '1px solid rgba(16,185,129,.4)' : 'none',
              boxShadow:   phase==='REVEAL'
                ? '0 0 36px rgba(16,185,129,.18),0 16px 36px rgba(0,0,0,.4)'
                : '0 16px 36px rgba(0,0,0,.5)',
              transition:'transform .15s',
            }}
              onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.02)')}
              onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
              onMouseDown={e=>(e.currentTarget.style.transform='scale(.97)')}>
              {phase==='QUESTION' ? 'חשוף תוצאה' : 'לשאלה הבאה'}
              <ChevronLeft size={22} />
            </button>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ position:'relative', zIndex:20, flexShrink:0, padding:'8px 0', textAlign:'center' }}>
        <p style={{ fontSize:9, fontFamily:'monospace', letterSpacing:'.4em',
          color:'rgba(255,255,255,.1)', textTransform:'uppercase' }}>
          Room: {roomId} • Platform 2.0.4
        </p>
      </footer>
    </div>
  );
};

export default GreenTeamWins;