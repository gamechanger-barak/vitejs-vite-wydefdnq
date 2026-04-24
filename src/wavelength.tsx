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
    <img
      src={src}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-lg border-2 border-amber-400/40"
    />
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

  // חילוץ קלפים גמיש (מערך ישיר או אובייקט עם שדה cards)
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

  // תצוגת הפסיכולוג (Secret View)
  if (isPsychicView) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <div className="text-amber-400 text-lg mb-2 italic">הנושא שלך:</div>
        <h1 className="text-4xl font-black mb-8">{decodeURIComponent(psychicCat || "")}</h1>
        <div className="bg-amber-400 text-[#0d0d1a] w-36 h-36 rounded-full flex items-center justify-center text-7xl font-black shadow-[0_0_30px_rgba(251,191,36,0.5)]">
          {psychicTarget}
        </div>
        <p className="mt-8 text-white/40 text-sm">תן רמז שמתאים למספר הזה</p>
      </div>
    );
  }

  // טעינה
  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center text-xl font-bold italic animate-pulse">
        מאתחל מערכות...
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const psychicUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}&target=${target}&cat=${encodeURIComponent(currentCard.subject_category)}`;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white font-sans p-4 flex flex-col items-center" dir="rtl">
      
      {/* Board Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-10 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="text-right">
          <div className="text-[10px] text-cyan-400/60 uppercase font-bold tracking-widest">קבוצה א׳</div>
          <div className="text-3xl font-black text-cyan-400">{scores.a}</div>
        </div>
        <div className="px-4 py-1 bg-amber-400/10 rounded-full border border-amber-400/20 text-[10px] font-bold text-amber-400 uppercase">
          סיבוב {currentCardIndex + 1}
        </div>
        <div className="text-left">
          <div className="text-[10px] text-rose-400/60 uppercase font-bold tracking-widest">קבוצה ב׳</div>
          <div className="text-3xl font-black text-rose-400">{scores.b}</div>
        </div>
      </div>

      {/* Main Card Area */}
      <div className="w-full max-w-md text-center mb-8">
        <h2 className="text-4xl font-black mb-12 text-white leading-tight min-h-[100px] flex items-center justify-center italic">
          {currentCard.subject_category}
        </h2>
        
        <div className="flex justify-between items-center px-1 mb-6">
          <div className="flex flex-col items-center gap-2 w-[130px]">
            <div className="text-[8px] text-cyan-400/50 uppercase font-bold">ימינה (10)</div>
            <span className="text-sm font-bold text-cyan-400 bg-cyan-400/10 px-2 py-3 rounded-xl border border-cyan-400/20 w-full truncate">
              {currentCard.right_pole}
            </span>
          </div>
          <div className="h-px bg-white/10 flex-1 mx-2 self-end mb-5"></div>
          <div className="flex flex-col items-center gap-2 w-[130px]">
            <div className="text-[8px] text-rose-400/50 uppercase font-bold">שמאלה (1)</div>
            <span className="text-sm font-bold text-rose-400 bg-rose-400/10 px-2 py-3 rounded-xl border border-rose-400/20 w-full truncate">
              {currentCard.left_pole}
            </span>
          </div>
        </div>

        {/* The 1-10 Scale */}
        <div className="flex justify-between gap-1.5 mb-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => phase === PHASE.GUESS && setGuess(num)}
              disabled={phase !== PHASE.GUESS}
              className={`flex-1 h-14 rounded-xl font-black text-lg transition-all duration-300 ${
                guess === num 
                  ? "bg-amber-400 text-black scale-110 shadow-[0_0_20px_rgba(251,191,36,0.5)]" 
                  : "bg-white/5 text-white/20 border border-white/5"
              } ${phase === PHASE.REVEAL && num === target ? "ring-4 ring-emerald-500 ring-offset-2 ring-offset-[#0d0d1a] !bg-emerald-500 !text-black" : ""}`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Action Zone */}
      <div className="w-full max-w-md">
        {phase === PHASE.GUESS && (
          <div className="flex flex-col items-center gap-8">
            <button
              onClick={handleConfirmGuess}
              disabled={guess === 0}
              className={`w-full py-5 rounded-2xl font-black text-xl transition-all active:scale-95 ${
                guess > 0 ? "bg-amber-400 text-black" : "bg-white/5 text-white/10 cursor-not-allowed"
              }`}
            >
              זו הבחירה שלי
            </button>
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center">
              <QRCode value={psychicUrl} />
              <p className="mt-4 text-amber-400/60 text-[10px] font-bold uppercase tracking-widest">סריקה לפסיכולוג 📱</p>
            </div>
          </div>
        )}

        {phase === PHASE.COUNTER && (
          <div className="w-full text-center animate-in fade-in zoom-in duration-500">
            <h3 className="text-2xl font-black mb-6 text-white">קבוצה ב׳: איפה הטעות?</h3>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleCounterGuess("lower")} className="bg-rose-500/10 border border-rose-500/30 py-8 rounded-2xl font-bold flex flex-col items-center gap-2 hover:bg-rose-500/20 transition-all">
                <span className="text-2xl font-black">↓</span>
                <span className="text-xs italic">נמוך יותר</span>
              </button>
              <button onClick={() => handleCounterGuess("equal")} className="bg-white/5 border border-white/10 py-8 rounded-2xl font-bold flex flex-col items-center gap-2 hover:bg-white/10 transition-all">
                <span className="text-2xl font-black">=</span>
                <span className="text-xs italic">בדיוק!</span>
              </button>
              <button onClick={() => handleCounterGuess("higher")} className="bg-emerald-500/10 border border-emerald-500/30 py-8 rounded-2xl font-bold flex flex-col items-center gap-2 hover:bg-emerald-500/20 transition-all">
                <span className="text-2xl font-black">↑</span>
                <span className="text-xs italic">גבוה יותר</span>
              </button>
            </div>
          </div>
        )}

        {phase === PHASE.REVEAL && (
          <div className="w-full text-center animate-in slide-in-from-bottom duration-700">
            <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-2 font-bold">התוצאה האמיתית</div>
            <div className="text-8xl font-black text-amber-400 mb-8 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">{target}</div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
               <div className="text-xs text-white/40 mb-1 font-medium italic">קבוצה ב׳ ניחשה:</div>
               <div className="text-xl font-black text-amber-400 uppercase tracking-tighter">
                  {counterGuess === "higher" ? "גבוה יותר ↑" : 
                   counterGuess === "lower" ? "נמוך יותר ↓" : "בדיוק במקום! ="}
               </div>
            </div>

            <div className="flex gap-4 mb-10 px-2">
              <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-cyan-500/20">
                <div className="text-[9px] text-cyan-400/50 mb-1 font-black uppercase">TEAM A</div>
                <div className="text-3xl font-black text-cyan-400">+{roundResult.aPoints}</div>
              </div>
              <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-rose-500/20">
                <div className="text-[9px] text-rose-400/50 mb-1 font-black uppercase">TEAM B</div>
                <div className="text-3xl font-black text-rose-400">+{roundResult.bPoints}</div>
              </div>
            </div>

            <button 
              onClick={nextRound} 
              className="w-full py-5 bg-white text-[#0d0d1a] rounded-2xl font-black text-xl hover:bg-amber-400 transition-all active:scale-95 shadow-xl"
            >
              סיבוב הבא
            </button>
          </div>
        )}
      </div>
    </div>
  );
}