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
function QRCode({ value, size = 110 }: { value: string; size?: number }) {
  const encoded = encodeURIComponent(value);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=000000&qzone=2`;
  return (
    <div className="p-2 bg-white rounded-xl shadow-2xl">
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

  // תצוגת הפסיכולוג
  if (isPsychicView) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" dir="rtl" style={{ background: "radial-gradient(circle, #1e1b4b 0%, #020617 100%)" }}>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] shadow-2xl">
          <div className="text-amber-400 text-xs font-black uppercase tracking-[0.3em] mb-4">המספר הסודי שלך</div>
          <h1 className="text-4xl font-black mb-8 text-white">{decodeURIComponent(psychicCat || "")}</h1>
          <div className="bg-amber-400 text-black w-40 h-40 rounded-full flex items-center justify-center text-8xl font-black shadow-[0_0_50px_rgba(251,191,36,0.5)] mx-auto">
            {psychicTarget}
          </div>
          <p className="mt-10 text-white/40 text-sm italic">זהירות! אל תראה לאף אחד</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-black animate-pulse">CONNECTING...</div>;
  }

  const currentCard = cards[currentCardIndex];
  const psychicUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}&target=${target}&cat=${encodeURIComponent(currentCard.subject_category)}`;

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden pb-10 px-4" dir="rtl" style={{ background: "radial-gradient(ellipse at center, #1e1b4b 0%, #020617 100%)" }}>
      
      {/* Score Header */}
      <header className="max-w-5xl mx-auto flex items-center justify-between py-6">
        <div className="flex flex-col items-end bg-white/5 backdrop-blur-md border border-cyan-500/20 rounded-2xl px-6 py-4 shadow-xl">
          <span className="text-[10px] text-cyan-400 font-black tracking-widest mb-1 uppercase">TEAM A</span>
          <span className="text-4xl font-black text-white">{scores.a}</span>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent italic">WAVELENGTH</h1>
          <div className="bg-amber-400 text-black text-[9px] font-black px-3 py-0.5 rounded-full mt-2 uppercase">ROUND {currentCardIndex + 1}</div>
        </div>

        <div className="flex flex-col items-start bg-white/5 backdrop-blur-md border border-rose-500/20 rounded-2xl px-6 py-4 shadow-xl">
          <span className="text-[10px] text-rose-400 font-black tracking-widest mb-1 uppercase">TEAM B</span>
          <span className="text-4xl font-black text-white">{scores.b}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto space-y-12 mt-4">
        {/* Category Header */}
        <div className="text-center space-y-2">
          <span className="text-amber-400/50 text-[10px] font-bold tracking-[0.4em] uppercase">Current Category</span>
          <h2 className="text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl">{currentCard.subject_category}</h2>
        </div>

        {/* The Scale Board */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Poles Labels */}
          <div className="flex justify-between items-end mb-6 px-2">
            <div className="flex flex-col items-center gap-2 w-32">
               <span className="text-[10px] font-black text-rose-400/60 uppercase tracking-widest italic">Pole Left (1)</span>
               <div className="bg-rose-500/10 border border-rose-500/30 text-rose-100 py-3 px-4 rounded-2xl font-bold text-center w-full shadow-inner">
                  {currentCard.left_pole}
               </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 w-32">
               <span className="text-[10px] font-black text-cyan-400/60 uppercase tracking-widest italic">Pole Right (10)</span>
               <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-100 py-3 px-4 rounded-2xl font-bold text-center w-full shadow-inner">
                  {currentCard.right_pole}
               </div>
            </div>
          </div>

          {/* 1-10 Dial */}
          <div className="flex gap-2.5 h-20">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
              const isSelected = guess === n;
              const isTarget = phase === PHASE.REVEAL && target === n;
              return (
                <button
                  key={n}
                  disabled={phase !== PHASE.GUESS}
                  onClick={() => setGuess(n)}
                  className={`flex-1 rounded-2xl font-black text-2xl transition-all duration-300 border-2 
                    ${isSelected ? 'bg-cyan-500 border-white text-black scale-110 shadow-[0_0_30px_rgba(6,182,212,0.6)] z-10' : 'bg-white/5 border-transparent text-white/20 hover:bg-white/10'}
                    ${isTarget ? 'bg-amber-400 border-white !text-black !scale-110 z-20 shadow-[0_0_40px_rgba(251,191,36,0.8)]' : ''}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </section>

        {/* Dynamic Controls */}
        <section className="flex flex-col items-center gap-12">
          {phase === PHASE.GUESS && (
            <div className="w-full flex flex-col items-center gap-10 animate-in fade-in slide-in-from-bottom-8">
              <button onClick={handleConfirmGuess} disabled={guess === 0} className="w-full max-w-sm py-6 bg-white text-black rounded-3xl font-black text-2xl shadow-2xl active:scale-95 disabled:opacity-5 transition-all hover:bg-cyan-400">
                אישור בחירה ✓
              </button>
              
              <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-md flex items-center gap-10">
                <div className="text-right">
                  <div className="text-amber-400 font-black text-xs uppercase mb-2">סריקה סודית</div>
                  <div className="text-white/30 text-[10px] leading-relaxed max-w-[140px]">רק ה"רוח" סורקת כדי לראות את המספר האמיתי</div>
                </div>
                <QRCode value={psychicUrl} />
              </div>
            </div>
          )}

          {phase === PHASE.COUNTER && (
            <div className="w-full text-center animate-in zoom-in fade-in">
              <h3 className="text-rose-400 text-xs font-black uppercase tracking-[0.4em] mb-8">קבוצה ב׳: לאן הנטייה?</h3>
              <div className="grid grid-cols-3 gap-5 max-w-xl mx-auto">
                <button onClick={() => handleCounterGuess("lower")} className="bg-white/5 border border-white/10 py-10 rounded-[2.5rem] font-black hover:bg-rose-500/20 transition-all flex flex-col items-center">
                  <span className="text-4xl mb-2">↓</span>
                  <span className="text-[10px] opacity-50 font-bold uppercase italic">Lower</span>
                </button>
                <button onClick={() => handleCounterGuess("equal")} className="bg-white/5 border border-white/10 py-10 rounded-[2.5rem] font-black hover:bg-white/10 transition-all flex flex-col items-center">
                  <span className="text-4xl mb-2">=</span>
                  <span className="text-[10px] opacity-50 font-bold uppercase italic">Exact</span>
                </button>
                <button onClick={() => handleCounterGuess("higher")} className="bg-white/5 border border-white/10 py-10 rounded-[2.5rem] font-black hover:bg-emerald-500/20 transition-all flex flex-col items-center">
                  <span className="text-4xl mb-2">↑</span>
                  <span className="text-[10px] opacity-50 font-bold uppercase italic">Higher</span>
                </button>
              </div>
            </div>
          )}

          {phase === PHASE.REVEAL && (
            <div className="w-full text-center animate-in slide-in-from-bottom-12 duration-700">
              <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.6em] mb-4">The Real Target</div>
              <div className="text-[10rem] font-black text-amber-400 leading-none mb-12 drop-shadow-[0_0_50px_rgba(251,191,36,0.5)]">{target}</div>
              
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-12 max-w-sm mx-auto">
                 <div className="text-[10px] text-white/40 mb-2 font-bold uppercase">TEAM B NAILED IT?</div>
                 <div className="text-2xl font-black text-amber-400 uppercase italic">
                    {counterGuess === "higher" ? "Higher ↑" : counterGuess === "lower" ? "Lower ↓" : "Equal ="}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-white/5 border border-cyan-500/20 rounded-3xl p-8 backdrop-blur-lg">
                  <div className="text-[10px] text-cyan-400 font-black mb-2 uppercase tracking-widest">TEAM A GAIN</div>
                  <div className="text-4xl font-black">+{roundResult.aPoints}</div>
                </div>
                <div className="bg-white/5 border border-rose-500/20 rounded-3xl p-8 backdrop-blur-lg">
                  <div className="text-[10px] text-rose-400 font-black mb-2 uppercase tracking-widest">TEAM B GAIN</div>
                  <div className="text-4xl font-black">+{roundResult.bPoints}</div>
                </div>
              </div>

              <button onClick={nextRound} className="w-full max-w-md py-6 bg-cyan-500 text-black rounded-[2rem] font-black text-2xl hover:bg-white transition-all shadow-[0_20px_60px_rgba(6,182,212,0.4)]">
                סיבוב הבא →
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}