import { useState, useEffect} from "react";

// ── רכיב עזר ל-QR Code ─────────────────────────────────────────────────────
function QRCode({ value, size = 160 }) {
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

// ── שלבי המשחק ──────────────────────────────────────────────────────────────
const PHASE = {
  GUESS: "guess",
  COUNTER: "counter",
  REVEAL: "reveal",
};

export default function WavelengthGame({ gameData, roomId }) {
  // מצבי המשחק
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [target, setTarget] = useState(0);
  const [guess, setGuess] = useState(0);
  const [phase, setPhase] = useState(PHASE.GUESS);
  const [counterGuess, setCounterGuess] = useState<string>("");// "higher", "lower", "equal"
  const [scores, setScores] = useState({ a: 0, b: 0 });
  const [roundResult, setRoundResult] = useState({ aPoints: 0, bPoints: 0 });

  // בדיקה האם אנחנו בתצוגת "פסיכולוג" (זה שסרק את ה-QR)
  const params = new URLSearchParams(window.location.search);
  const psychicTarget = params.get("target");
  const psychicCat = params.get("cat");
  const isPsychicView = !!(psychicTarget && psychicCat);

  // 1. אתחול המשחק ברגע שהנתונים מגיעים
  useEffect(() => {
    if (gameData && gameData.cards && !isPsychicView) {
      startRound(0);
    }
  }, [gameData]);

  const startRound = (index) => {
    const newTarget = Math.floor(Math.random() * 10) + 1;
    setTarget(newTarget);
    setCurrentCardIndex(index);
    setGuess(0);
    setPhase(PHASE.GUESS);
    setCounterGuess("");
  };

  const handleConfirmGuess = () => {
    if (guess > 0) setPhase(PHASE.COUNTER);
  };

  const handleCounterGuess = (choice) => {
    setCounterGuess(choice);
    calculateScores(choice);
    setPhase(PHASE.REVEAL);
  };

  const calculateScores = (bChoice) => {
    let aPoints = 0;
    let bPoints = 0;

    // ניקוד לקבוצה א' (המנחשת)
    const diff = Math.abs(guess - target);
    if (diff === 0) aPoints = 2;
    else if (diff === 1) aPoints = 1;

    // ניקוד לקבוצה ב' (הניחוש הנגדי)
    if (bChoice === "higher" && target > guess) bPoints = 1;
    if (bChoice === "lower" && target < guess) bPoints = 1;
    if (bChoice === "equal" && target === guess) bPoints = 1;

    setRoundResult({ aPoints, bPoints });
    setScores((prev) => ({ a: prev.a + aPoints, b: prev.b + bPoints }));
  };

  const nextRound = () => {
    const nextIndex = (currentCardIndex + 1) % gameData.cards.length;
    startRound(nextIndex);
  };

  // תצוגת פסיכולוג (למי שסרק את ה-QR)
  if (isPsychicView) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col items-center justify-center p-6 text-center rtl">
        <div className="text-amber-400 text-lg mb-2">הנושא שלך:</div>
        <h1 className="text-4xl font-bold mb-8">{decodeURIComponent(psychicCat)}</h1>
        <div className="bg-amber-400 text-[#0d0d1a] w-32 h-32 rounded-full flex items-center justify-center text-6xl font-black shadow-[0_0_30px_rgba(251,191,36,0.5)]">
          {psychicTarget}
        </div>
        <p className="mt-8 text-white/60 text-sm">תן רמז שמתאים למספר הזה על הסקאלה</p>
      </div>
    );
  }

  // מצב טעינה או שגיאה
  if (!gameData || !gameData.cards) {
    return <div className="text-white text-center p-10">טוען נתוני משחק...</div>;
  }

  const currentCard = gameData.cards[currentCardIndex];
  const psychicUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}&target=${target}&cat=${encodeURIComponent(currentCard.subject_category)}`;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white font-sans rtl p-4 flex flex-col items-center">
      {/* כותרת וניקוד */}
      <div className="w-full max-w-md flex justify-between items-center mb-8 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div>
          <div className="text-xs text-white/40">קבוצה א׳</div>
          <div className="text-2xl font-bold text-cyan-400">{scores.a}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40 uppercase tracking-widest">{gameData.game_metadata?.company_name || "Wavelength"}</div>
          <div className="text-sm font-medium text-amber-400">סיבוב {currentCardIndex + 1}</div>
        </div>
        <div className="text-left">
          <div className="text-xs text-white/40">קבוצה ב׳</div>
          <div className="text-2xl font-bold text-rose-400">{scores.b}</div>
        </div>
      </div>

      {/* הקלף הנוכחי */}
      <div className="w-full max-w-md text-center mb-10">
        <h2 className="text-3xl font-bold mb-6 text-white tracking-tight">{currentCard.subject_category}</h2>
        
        <div className="flex justify-between items-center px-2 mb-4">
          <span className="text-sm font-bold text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20 max-w-[140px]">
            {currentCard.right_pole} (10)
          </span>
          <span className="text-sm font-bold text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full border border-rose-400/20 max-w-[140px]">
            {currentCard.left_pole} (1)
          </span>
        </div>

        {/* הסקאלה */}
        <div className="flex justify-between gap-1 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => phase === PHASE.GUESS && setGuess(num)}
              disabled={phase !== PHASE.GUESS}
              className={`flex-1 h-12 rounded-lg font-bold transition-all duration-200 ${
                guess === num 
                  ? "bg-amber-400 text-black scale-110 shadow-[0_0_15px_rgba(251,191,36,0.6)]" 
                  : "bg-white/10 text-white/40 hover:bg-white/20"
              } ${phase === PHASE.REVEAL && num === target ? "ring-4 ring-emerald-400 ring-offset-4 ring-offset-[#0d0d1a]" : ""}`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* אזור הפעולות */}
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {phase === PHASE.GUESS && (
          <>
            <button
              onClick={handleConfirmGuess}
              disabled={guess === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                guess > 0 ? "bg-amber-400 text-black" : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              זו הבחירה שלי
            </button>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center">
              <QRCode value={psychicUrl} />
              <p className="mt-4 text-amber-400/80 text-sm font-medium">סריקה לפסיכולוג 📱</p>
            </div>
          </>
        )}

        {phase === PHASE.COUNTER && (
          <div className="w-full text-center animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-bold mb-4 text-rose-400">קבוצה ב׳: איפה הטעות?</h3>
            <div className="grid grid-cols-3 gap-3 w-full">
              <button onClick={() => handleCounterGuess("lower")} className="bg-rose-500/20 border border-rose-500/40 p-4 rounded-xl font-bold hover:bg-rose-500/30">נמוך יותר ↓</button>
              <button onClick={() => handleCounterGuess("equal")} className="bg-white/10 border border-white/20 p-4 rounded-xl font-bold hover:bg-white/20">בדיוק! =</button>
              <button onClick={() => handleCounterGuess("higher")} className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-xl font-bold hover:bg-emerald-500/30">גבוה יותר ↑</button>
            </div>
          </div>
        )}

{phase === PHASE.REVEAL && (
  <div className="w-full text-center animate-in slide-in-from-bottom duration-500">
    <div className="text-5xl font-black text-amber-400 mb-2">התוצאה: {target}</div>
    
    {/* כאן אנחנו משתמשים ב-counterGuess כדי להציג מה קבוצה ב' בחרה */}
    <div className="text-sm text-white/60 mb-4">
      קבוצה ב׳ ניחשה שהמטרה: 
      <span className="text-amber-400 font-bold mx-1">
        {counterGuess === "higher" ? "גבוהה יותר ↑" : 
         counterGuess === "lower" ? "נמוכה יותר ↓" : "בדיוק במקום! ="}
      </span>
    </div>

    <div className="flex gap-4 mb-8">
      <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="text-xs text-white/40 mb-1">קבוצה א׳</div>
        <div className="text-xl font-bold text-cyan-400">+{roundResult.aPoints}</div>
      </div>
      <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="text-xs text-white/40 mb-1">קבוצה ב׳</div>
        <div className="text-xl font-bold text-rose-400">+{roundResult.bPoints}</div>
      </div>
    </div>
    
    <button 
      onClick={nextRound} 
      className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-amber-400 transition-colors"
    >
      המשך לסיבוב הבא
    </button>
  </div>
)}
      </div>
    </div>
  );
}