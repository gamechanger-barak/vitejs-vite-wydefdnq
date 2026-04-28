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
    <div className="p-2 bg-white rounded-xl shadow-2xl inline-block">
      <img src={src} alt="QR Code" width={size} height={size} className="rounded-lg" />
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

  // חילוץ קלפים גמיש (מערך ישיר או אובייקט)
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" dir="rtl" style={{ background: "radial-gradient(circle, #1e1b4b 0%, #020617 100%)" }}>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] shadow-2xl">
          <div className="text-amber-400 text-xs font-black uppercase tracking-[0.3em] mb-4 opacity-70">המספר הסודי שלך</div>
          <h1 className="text-4xl font-black mb-8 text-white">{decodeURIComponent(psychicCat || "")}</h1>
          <div className="bg-amber-400 text-black w-40 h-40 rounded-full flex items-center justify-center text-8xl font-black shadow-[0_0_50px_rgba(251,191,36,0.5)] mx-auto border-8 border-white/10">
            {psychicTarget}
          </div>
          <p className="mt-10 text-white/40 text-sm italic">זהירות! אל תראה לאף אחד</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-black animate-pulse uppercase tracking-widest">Initialising...</div>;
  }

  const currentCard = cards[currentCardIndex];
  const psychicUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}&target=${target}&cat=${encodeURIComponent(currentCard.subject_category)}`;

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden pb-10 px-4" dir="rtl" style={{ background: "radial-gradient(ellipse at center, #1e1b4b 0%, #020617 100%)" }}>
      
      {/* Scoreboard - Fixed at top corners */}
      <header className="max-w-6xl mx-auto flex items-center justify-between py-8">
        <div className="flex flex-col items-center bg-cyan-900/20 backdrop-blur-lg border border-cyan-500/30 rounded-3xl px-8 py-5 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
          <span className="text-[10px] text-cyan-400 font-black tracking-[0.2em] mb-1 uppercase">TEAM A</span>
          <span className="text-5xl font-black text-white">{scores.a}</span>
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-black italic tracking-tighter text-white drop-shadow-2xl">סקלות</h1>
          <div className="bg-amber-400 text-black text-[10px] font-black px-4 py-1 rounded-full mt-3 uppercase tracking-widest inline-block">ROUND {currentCardIndex + 1}</div>
        </div>

        <div className="flex flex-col items-center bg-rose-900/20 backdrop-blur-lg border border-rose-500/30 rounded-3xl px-8 py-5 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
          <span className="text-[10px] text-rose-400 font-black tracking-[0.2em] mb-1 uppercase">TEAM B</span>
          <span className="text-5xl font-black text-white">{scores.b}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto space-y-10 mt-6">
        {/* Category Display */}
        <div className="text-center space-y-2">
          <h2 className="text-7xl font-black text-white tracking-tight leading-none drop-shadow-2xl italic">{currentCard.subject_category}</h2>
        </div>

        {/* Board Section */}
        <section className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[4rem] p-12 shadow-2xl relative">
          
          {/* Poles - Positioned ABOVE the scale */}
          <div className="flex justify-between items-center mb-10">
            <div className="text-right space-y-2 w-1/3">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mr-2">שמאל (1)</span>
              <div className="bg-rose-500/20 border border-rose-500/40 text-rose-100 py-4 px-6 rounded-2xl font-black text-xl shadow-inner text-center">
                {currentCard.left_pole}
              </div>
            </div>

            <div className="w-px h-12 bg-white/10 mx-4 self-end mb-4 opacity-20"></div>

            <div className="text-left space-y-2 w-1/3">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block ml-2 text-left">ימין (10)</span>
              <div className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-100 py-4 px-6 rounded-2xl font-black text-xl shadow-inner text-center">
                {currentCard.right_pole}
              </div>
            </div>
          </div>

          {/* Scale Dial */}
          <div className="flex gap-2.5 h-24">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
              const isSelected = guess === n;
              const isTarget = phase === PHASE.REVEAL && target === n;
              return (
                <button
                  key={n}
                  disabled={phase !== PHASE.GUESS}
                  onClick={() => setGuess(n)}
                  className={`flex-1 rounded-2xl font-black text-3xl transition-all duration-300 border-2 
                    ${isSelected ? 'bg-cyan-500 border-white text-black scale-110 shadow-[0_0_40px_rgba(6,182,212,0.6)] z-10' : 'bg-white/5 border-transparent text-white/30 hover:bg-white/10'}
                    ${isTarget ? 'bg-amber-400 border-white !text-black !scale-125 z-20 shadow-[0_0_60px_rgba(251,191,36,0.9)]' : ''}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </section>

        {/* Dynamic Controls */}
        <section className="flex flex-col items-center pt-4">
          {phase === PHASE.GUESS && (
            <div className="w-full flex flex-col items-center gap-12 animate-in fade-in slide-in-from-bottom-12">
              <button onClick={handleConfirmGuess} disabled={guess === 0} className="w-full max-w-sm py-7 bg-white text-black rounded-[2.5rem] font-black text-3xl shadow-2xl active:scale-95 disabled:opacity-5 transition-all hover:bg-cyan-400">
                אישור ניחוש ✓
              </button>
              
              <div className="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] backdrop-blur-md flex items-center gap-12 shadow-2xl">
                <div className="text-right">
                  <div className="text-amber-400 font-black text-sm uppercase mb-2 tracking-widest italic underline decoration-2 underline-offset-4">סריקה סודית</div>
                  <div className="text-white/40 text-xs leading-relaxed max-w-[160px] font-medium">המכשיר של ה"רוח" - וודאו שאף אחד לא מציץ</div>
                </div>
                <QRCode value={psychicUrl} />
              </div>
            </div>
          )}

          {phase === PHASE.COUNTER && (
            <div className="w-full text-center animate-in zoom-in fade-in duration-500">
              <h3 className="text-rose-400 text-sm font-black uppercase tracking-[0.5em] mb-10 italic">קבוצה ב׳: לאיזה צד הנטייה?</h3>
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                <button onClick={() => handleCounterGuess("lower")} className="bg-white/5 border border-white/10 py-12 rounded-[3rem] font-black hover:bg-rose-500/20 hover:border-rose-400/40 transition-all group">
                  <span className="text-5xl block mb-3 group-hover:scale-125 transition-transform">↓</span>
                  <span className="text-xs opacity-50 uppercase font-black italic">Lower</span>
                </button>
                <button onClick={() => handleCounterGuess("equal")} className="bg-white/5 border border-white/10 py-12 rounded-[3rem] font-black hover:bg-white/10 transition-all group">
                  <span className="text-5xl block mb-3 group-hover:scale-125 transition-transform">=</span>
                  <span className="text-xs opacity-50 uppercase font-black italic">Equal</span>
                </button>
                <button onClick={() => handleCounterGuess("higher")} className="bg-white/5 border border-white/10 py-12 rounded-[3rem] font-black hover:bg-emerald-500/20 hover:border-emerald-400/40 transition-all group">
                  <span className="text-5xl block mb-3 group-hover:scale-125 transition-transform">↑</span>
                  <span className="text-xs opacity-50 uppercase font-black italic">Higher</span>
                </button>
              </div>
            </div>
          )}

          {phase === PHASE.REVEAL && (
            <div className="w-full text-center animate-in slide-in-from-bottom-24 duration-1000">
              <div className="text-white/20 text-xs font-black uppercase tracking-[0.8em] mb-6">Reality Revealed</div>
              <div className="text-[14rem] font-black text-amber-400 leading-none mb-16 drop-shadow-[0_0_80px_rgba(251,191,36,0.6)] italic">{target}</div>
              
              <div className="grid grid-cols-2 gap-8 mb-16">
                <div className="bg-white/5 border border-cyan-500/30 rounded-[2.5rem] p-10 backdrop-blur-xl">
                  <div className="text-xs text-cyan-400 font-black mb-3 uppercase tracking-widest">TEAM A ניקוד</div>
                  <div className="text-6xl font-black">+{roundResult.aPoints}</div>
                </div>
                <div className="bg-white/5 border border-rose-500/30 rounded-[2.5rem] p-10 backdrop-blur-xl flex flex-col items-center">
                  <div className="text-xs text-rose-400 font-black mb-3 uppercase tracking-widest">TEAM B {counterGuess}</div>
                  <div className="text-6xl font-black">+{roundResult.bPoints}</div>
                </div>
              </div>

              <button onClick={nextRound} className="w-full max-w-xl py-8 bg-cyan-500 text-black rounded-[2.5rem] font-black text-3xl hover:bg-white transition-all shadow-[0_30px_70px_rgba(6,182,212,0.5)] active:scale-95 uppercase italic tracking-tighter">
                Next Round →
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}