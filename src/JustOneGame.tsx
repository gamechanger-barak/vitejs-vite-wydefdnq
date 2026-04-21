import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface JustOneProps {
  roomId: string;
  gameData: any; // ה-Payload מהגמיני (רשימת המילים)
  // הסרנו את isHost כי הוא לא בשימוש כרגע
}

export default function JustOneGame({ roomId, gameData }: JustOneProps) {
  const [stage, setStage] = useState('SHOW_WORD');
  const [currentRound, setCurrentRound] = useState(0);
  const [timer, setTimer] = useState(10);

  // רשימת המילים מהגמיני
  const words = gameData?.words || ["דוגמה 1", "דוגמה 2", "דוגמה 3"];

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && (stage === 'SHOW_WORD' || stage === 'WRITING')) {
      goToNextStage();
    }
  }, [timer, stage]);

  function goToNextStage() {
    if (stage === 'SHOW_WORD') {
      setStage('WRITING');
      setTimer(60);
    } else if (stage === 'WRITING') {
      setStage('GUESSING');
      setTimer(0);
    } else if (stage === 'GUESSING') {
      if (currentRound < words.length - 1) {
        setCurrentRound((prev) => prev + 1);
        setStage('SHOW_WORD');
        setTimer(10);
      } else {
        setStage('END');
      }
    }
  }

  const containerStyle: React.CSSProperties = {
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#242424',
    color: 'white',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#646cff' }}>
        Just One: חדר {roomId}
      </div>

      {stage === 'SHOW_WORD' && (
        <div>
          <h2 style={{ color: '#aaa' }}>שלב 1: כולם חוץ מהמנחש מסתכלים! 🤫</h2>
          <p style={{ fontSize: '1.4rem', marginBottom: '40px' }}>
            המילה שצריך לתת לה רמז היא:
          </p>
          <div style={{ fontSize: '80px', fontWeight: 'bold', color: '#646cff', marginBottom: '40px' }}>
            {words[currentRound]}
          </div>
          <div style={{ fontSize: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
            <Timer size={40} /> {timer}
          </div>
        </div>
      )}

      {stage === 'WRITING' && (
        <div>
          <h2 style={{ color: '#aaa' }}>שלב 2: כותבים רמזים! ✍️</h2>
          <p style={{ fontSize: '1.4rem', marginBottom: '40px' }}>
            כתבו רמז בן מילה אחת על דף או בטלפון.
          </p>
          <div style={{ fontSize: '60px', fontWeight: 'bold', marginBottom: '40px' }}>
            {timer}
          </div>
          <button
            onClick={goToNextStage}
            style={{ fontSize: '20px', padding: '15px 40px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
          >
            סיימתי לכתוב!
          </button>
        </div>
      )}

      {stage === 'GUESSING' && (
        <div>
          <h2 style={{ color: '#aaa' }}>שלב 3: זמן לנחש! 🤔</h2>
          <p style={{ fontSize: '1.4rem', marginBottom: '40px' }}>
            המנחש פותח עיניים ומנסה לנחש לפי הרמזים שנותרו.
          </p>
          <button
            onClick={goToNextStage}
            style={{ fontSize: '20px', padding: '15px 40px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
          >
            המילה נוחשה בהצלחה? (למילה הבאה)
          </button>
        </div>
      )}

      {stage === 'END' && (
        <div>
          <h1 style={{ fontSize: '50px', marginBottom: '20px' }}>המשחק נגמר! 🏆</h1>
          <p style={{ fontSize: '1.5rem' }}>סיימתם את כל המילים שנוצרו עבורכם.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '30px', fontSize: '18px', padding: '10px 30px', background: 'none', border: '1px solid #646cff', color: '#646cff', borderRadius: '8px', cursor: 'pointer' }}
          >
            שחק שוב
          </button>
        </div>
      )}
    </div>
  );
}