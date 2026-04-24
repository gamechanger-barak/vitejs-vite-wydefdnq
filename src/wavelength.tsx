import { useState, useEffect } from "react";

// ── Interfaces ──────────────────────────────────────────────────────────────
interface WavelengthCard {
  id: string;
  subject_category: string;
  left_pole: string;
  right_pole: string;
}

interface WavelengthProps {
  gameData: any; 
  roomId: string;
}

// ── Helper Component: QR Code ──────────────────────────────────────────────
function QRCode({ value, size = 160 }: { value: string; size?: number }) {
  const encoded = encodeURIComponent(value);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=0d0d1a&color=e2c97e&qzone=2`;
  return (
    <div className="p-2 bg-white rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
      <img src={src} alt="QR Code" width={size} height={size} className="rounded-lg" />
    </div>
  );
}

const PHASE = {
  GUESS: "guess",
  COUNTER: "counter",
  REVEAL: "reveal",
};

export default function WavelengthGame({ gameData, roomId }: WavelengthProps) {
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
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl" style={{ background: "radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)" }}>
        <div className="text-amber-400 text-sm font-black uppercase tracking-[0.3em] mb-4 opacity-70">המספר הסודי שלך</div>
        <h1 className="text-3xl font-bold mb-10 text-white/90">{decodeURIComponent(psychicCat || "")}</h1>
        <div className="bg-amber-400 text-[#020617] w-44 h-44 rounded-full flex items-center justify-center text-8xl font-black shadow-2xl border-8 border-white/10">
          {psychicTarget}
        </div>
        <p className="mt-12 text-white/40 text-sm italic">תן רמז שיוביל את הקבוצה למיקום הזה</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center animate-pulse">INITIALIZING...</div>;
  }

  const currentCard = cards[currentCardIndex];
  const psychicUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}&target=${target}&cat=${encodeURIComponent(currentCard.subject_category)}`;

  return (
    <div className="min-h-screen text-white font-sans selection:bg-amber-500/30 overflow-x-hidden pb-10" dir="rtl" style={{ background: "radial-gradient(ellipse at 50% -20%, #1e1b4b 0%, #020617 80%)" }}>
      
      {/* Header */}
      <header className="max-w-4xl mx-auto flex items-center justify-between px-6 py-8">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 text-right">
          <div className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">TEAM A</div>
          <div className="text-3xl font-black">{scores.a}</div>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black italic tracking-tighter">WAVELENGTH</h1>
          <div className="text-[9px] font-bold text-amber-400 uppercase mt-1">ROUND {currentCardIndex + 1}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 text-left">
          <div className="text-[10px] text-rose-400 font-black uppercase tracking-widest">TEAM B</div>
          <div className="text-3xl font-black">{scores.b}</div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 space-y-10">
        {/* Card */}
        <section className="bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center shadow-2xl relative">
          <h2 className="text-5xl font-black text-white mb-10 leading-tight">{currentCard.subject_category}</h2>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 p-4 rounded-3xl bg-cyan-500/5 border border-cyan-500/10 uppercase">
              <div className="text-[8px] text-cyan-400 mb-1">ימין (10)</div>
              <div className="text-lg font-bold">{currentCard.right_pole}</div>
            </div>
            <div className="flex-1 p-4 rounded-3xl bg-rose-500/5 border border-rose-500/10 uppercase">
              <div className="text-[8px] text-rose-400 mb-1">שמאל (1)</div>
              <div className="text-lg font-bold">{currentCard.left_pole}</div>
            </div>
          </div>
        </section>

        {/* Scale */}
        <section className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 shadow-2xl">
          <div className="flex gap-2 h-16">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
              const isSelected = guess === n;
              const isTarget = phase === PHASE.REVEAL && target === n;
              return (
                <button
                  key={n}
                  disabled={phase !== PHASE.GUESS}
                  onClick={() => setGuess(n)}
                  className={`flex-1 rounded-xl font-black text-lg transition-all duration-300 border-2 
                    ${isSelected ? 'bg-cyan-500 border-cyan-300 text-black scale-110 shadow-[0_0_20px_rgba(6,182,212,0.5)] z-10' : 'bg-white/5 border-transparent text-white/20'}
                    ${isTarget ? 'bg-amber-400 border-amber-200 !text-black !scale-110 z-20 shadow-[0_0_30px_rgba(251,191,36,0.7)]' : ''}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </section>

        {/* Action Area */}
        <section className="flex flex-col items-center gap-10">
          {phase === PHASE.GUESS && (
            <div className="w-full flex flex-col items-center gap-10">
              <button onClick={handleConfirmGuess} disabled={guess === 0} className="w-full max-w-sm py-5 bg-white text-[#020617] rounded-3xl font-black text-xl shadow-2xl disabled:opacity-10 transition-all">
                אישור ניחוש ✓
              </button>
              <div className="flex items-center gap-8 bg-white/5 border border-white/10 p-8 rounded-[3rem]">
                <div className="text-right max-w-[140px]">
                  <div className="text-amber-400 font-black text-xs mb-1 uppercase">סריקה סודית</div>
                  <div className="text-white/40 text-[10px]">רק נותן הרמז סורק</div>
                </div>
                <QRCode value={psychicUrl} size={100} />
              </div>
            </div>
          )}

          {phase === PHASE.COUNTER && (
            <div className="w-full text-center grid grid-cols-3 gap-4">
              <button onClick={() => handleCounterGuess("lower")} className="bg-white/5 border border-white/10 py-8 rounded-[2rem] font-black hover:bg-rose-500/20 transition-all">↓ נמוך</button>
              <button onClick={() => handleCounterGuess("equal")} className="bg-white/5 border border-white/10 py-8 rounded-[2rem] font-black hover:bg-white/10 transition-all">= בול</button>
              <button onClick={() => handleCounterGuess("higher")} className="bg-white/5 border border-white/10 py-8 rounded-[2rem] font-black hover:bg-emerald-500/20 transition-all">↑ גבוה</button>
            </div>
          )}

          {phase === PHASE.REVEAL && (
            <div className="w-full text-center animate-in slide-in-from-bottom duration-700">
              <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mb-4">THE REALITY</div>
              <div className="text-9xl font-black text-amber-400 mb-10 drop-shadow-[0_0_40px_rgba(251,191,36,0.4)]">{target}</div>
              
              {/* כאן אנחנו משתמשים ב-counterGuess כדי למנוע את שגיאת הקימפול */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
                <div className="text-xs text-white/40 mb-1 italic">קבוצה ב׳ ניחשה:</div>
                <div className="text-xl font-black text-amber-400">
                  {counterGuess === "higher" ? "גבוה יותר ↑" : counterGuess === "lower" ? "נמוך יותר ↓" : "בדיוק במקום! ="}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <div className="text-[10px] text-cyan-400 font-bold uppercase mb-2 tracking-widest">TEAM A</div>
                  <div className="text-3xl font-black text-white">+{roundResult.aPoints}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <div className="text-[10px] text-rose-400 font-bold uppercase mb-2 tracking-widest">TEAM B</div>
                  <div className="text-3xl font-black text-white">+{roundResult.bPoints}</div>
                </div>
              </div>

              <button onClick={nextRound} className="w-full py-6 bg-cyan-500 text-[#020617] rounded-[2rem] font-black text-xl hover:bg-white transition-all shadow-xl">
                לסיבוב הבא →
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}