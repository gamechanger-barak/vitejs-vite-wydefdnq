import { useState, useEffect } from "react";

// ── Interfaces ──────────────────────────────────────────────────────────────
interface WavelengthCard {
  id: string;
  subject_category: string;
  left_pole: string;
  right_pole: string;
}

interface WavelengthGameProps {
  gameData: any; 
  roomId: string;
}

// ── Helper Component: QR Code ──────────────────────────────────────────────
function QRCode({ value, size = 110 }: { value: string; size?: number }) {
  const encoded = encodeURIComponent(value);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=000000&qzone=2`;
  return (
    <div style={{ padding: '8px', background: 'white', borderRadius: '12px', display: 'inline-block' }}>
      <img src={src} alt="QR Code" width={size} height={size} style={{ borderRadius: '8px' }} />
    </div>
  );
}

const PHASE = { GUESS: "guess", COUNTER: "counter", REVEAL: "reveal" };

export default function WavelengthGame({ gameData, roomId }: WavelengthGameProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [target, setTarget] = useState(0);
  const [guess, setGuess] = useState(0);
  const [phase, setPhase] = useState(PHASE.GUESS);
  const [counterGuess, setCounterGuess] = useState<string>("");
  const [scores, setScores] = useState({ a: 0, b: 0 });
  const [roundResult, setRoundResult] = useState({ aPoints: 0, bPoints: 0 });

  const params = new URLSearchParams(window.location.search);
  const psychicTarget = params.get("target");
  const psychicCat = params.get("cat");
  const isPsychicView = !!(psychicTarget && psychicCat);

  const cards: WavelengthCard[] = Array.isArray(gameData) 
    ? gameData 
    : (gameData?.cards || gameData?.content || []);

  const startRound = (index: number) => {
    if (cards.length === 0) return;
    setTarget(Math.floor(Math.random() * 10) + 1);
    setCurrentCardIndex(index);
    setGuess(0);
    setPhase(PHASE.GUESS);
    setCounterGuess("");
  };

  useEffect(() => {
    if (cards.length > 0 && !isPsychicView) {
      startRound(0);
    }
  }, [gameData]);

  const handleConfirmGuess = () => {
    if (guess > 0) setPhase(PHASE.COUNTER);
  };

  const calculateScores = (bChoice: string) => {
    let aPoints = 0;
    let bPoints = 0;
    const diff = Math.abs(guess - target);
    if (diff === 0) aPoints = 2;
    else if (diff === 1) aPoints = 1;
    if (bChoice === "higher" && target > guess) bPoints = 1;
    if (bChoice === "lower" && target < guess) bPoints = 1;
    if (bChoice === "equal" && target === guess) bPoints = 1;
    setRoundResult({ aPoints, bPoints });
    setScores((prev) => ({ a: prev.a + aPoints, b: prev.b + bPoints }));
  };

  const handleCounterGuess = (choice: string) => {
    setCounterGuess(choice);
    calculateScores(choice);
    setPhase(PHASE.REVEAL);
  };

  const nextRound = () => {
    const nextIndex = (currentCardIndex + 1) % cards.length;
    startRound(nextIndex);
  };

  if (isPsychicView) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #1e1b4b 0%, #020617 100%)', color: 'white', textAlign: 'center' }} dir="rtl">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>{decodeURIComponent(psychicCat || "")}</h1>
        <div style={{ background: '#fbbf24', color: 'black', width: '160px', height: '160px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', fontWeight: 900, boxShadow: '0 0 50px rgba(251,191,36,0.5)' }}>
          {psychicTarget}
        </div>
      </div>
    );
  }

  if (cards.length === 0) return <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>טוען נתונים...</div>;

  const currentCard = cards[currentCardIndex];
  const psychicUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}&target=${target}&cat=${encodeURIComponent(currentCard.subject_category)}`;

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at center, #1e1b4b 0%, #020617 100%)', color: 'white', padding: '20px', fontFamily: 'sans-serif' }} dir="rtl">
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto 40px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '15px', padding: '15px 25px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#22d3ee', fontWeight: 900 }}>TEAM A</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{scores.a}</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', textShadow: '0 0 20px rgba(255,255,255,0.3)', margin: 0 }}>סקלות</h1>
          <div style={{ background: '#fbbf24', color: 'black', fontSize: '0.7rem', fontWeight: 900, padding: '2px 10px', borderRadius: '10px', display: 'inline-block', marginTop: '10px' }}>ROUND {currentCardIndex + 1}</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '15px', padding: '15px 25px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#fb7185', fontWeight: 900 }}>TEAM B</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{scores.b}</div>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '50px', letterSpacing: '-0.02em' }}>{currentCard.subject_category}</h2>

        <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '40px', padding: '40px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div style={{ width: '45%' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#fb7185', display: 'block', marginBottom: '10px' }}>שמאל (1)</span>
              <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', padding: '20px', borderRadius: '20px', fontSize: '1.5rem', fontWeight: 900 }}>
                {currentCard.left_pole}
              </div>
            </div>
            <div style={{ width: '45%' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#22d3ee', display: 'block', marginBottom: '10px' }}>ימין (10)</span>
              <div style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', padding: '20px', borderRadius: '20px', fontSize: '1.5rem', fontWeight: 900 }}>
                {currentCard.right_pole}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', height: '80px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
              const isSelected = guess === n;
              const isTarget = phase === PHASE.REVEAL && target === n;
              return (
                <button
                  key={n}
                  disabled={phase !== PHASE.GUESS}
                  onClick={() => setGuess(n)}
                  style={{
                    flex: 1, borderRadius: '15px', border: '2px solid transparent', fontSize: '1.5rem', fontWeight: 900, transition: '0.3s', cursor: phase === PHASE.GUESS ? 'pointer' : 'default',
                    backgroundColor: isTarget ? '#fbbf24' : isSelected ? '#22d3ee' : 'rgba(255,255,255,0.05)',
                    color: (isSelected || isTarget) ? 'black' : 'rgba(255,255,255,0.2)',
                    borderColor: (isSelected || isTarget) ? 'white' : 'transparent',
                    transform: (isSelected || isTarget) ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: isTarget ? '0 0 30px #fbbf24' : isSelected ? '0 0 20px #22d3ee' : 'none'
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </section>

        {phase === PHASE.GUESS && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
            <button onClick={handleConfirmGuess} disabled={guess === 0} style={{ padding: '20px 60px', fontSize: '1.5rem', fontWeight: 900, borderRadius: '20px', border: 'none', background: guess === 0 ? 'rgba(255,255,255,0.1)' : 'white', color: 'black', cursor: 'pointer' }}>
              אישור ניחוש ✓
            </button>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '0.8rem' }}>סריקה סודית</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.5, maxWidth: '120px' }}>רק אחד המשתתפים סורק כדי לראות את המספר</div>
              </div>
              <QRCode value={psychicUrl} />
            </div>
          </div>
        )}

        {phase === PHASE.COUNTER && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fb7185', marginBottom: '30px', textShadow: '0 0 15px rgba(244,63,94,0.3)' }}>
              קבוצה ב' - מה דעתכם? היכן התשובה הנכונה?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
              <button onClick={() => handleCounterGuess("lower")} style={{ padding: '30px', borderRadius: '25px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 900, cursor: 'pointer' }}>↓ נמוך יותר</button>
              <button onClick={() => handleCounterGuess("equal")} style={{ padding: '30px', borderRadius: '25px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 900, cursor: 'pointer' }}>= בול!</button>
              <button onClick={() => handleCounterGuess("higher")} style={{ padding: '30px', borderRadius: '25px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 900, cursor: 'pointer' }}>↑ גבוה יותר</button>
            </div>
          </div>
        )}

        {phase === PHASE.REVEAL && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1, marginBottom: '40px', textShadow: '0 0 50px rgba(251,191,36,0.5)' }}>{target}</div>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px 40px', borderRadius: '20px', border: '1px solid rgba(34,211,238,0.3)' }}>
                <div style={{ fontSize: '0.7rem', color: '#22d3ee' }}>TEAM A ניקוד</div>
                <div style={{ fontSize: '2rem', fontWeight: 900 }}>+{roundResult.aPoints}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px 40px', borderRadius: '20px', border: '1px solid rgba(251,113,133,0.3)' }}>
                <div style={{ fontSize: '0.7rem', color: '#fb7185' }}>TEAM B {counterGuess === "higher" ? "גבוה יותר ↑" : counterGuess === "lower" ? "נמוך יותר ↓" : "בדיוק! ="}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900 }}>+{roundResult.bPoints}</div>
              </div>
            </div>
            <button onClick={nextRound} style={{ padding: '20px 80px', fontSize: '1.5rem', fontWeight: 900, borderRadius: '20px', border: 'none', background: '#22d3ee', color: 'black', cursor: 'pointer' }}>סיבוב הבא →</button>
          </div>
        )}
      </main>
    </div>
  );
}