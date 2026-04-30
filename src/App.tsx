import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import SpyfallGame from "./SpyfallGame";
import JustOneGame from "./JustOneGame";
import WavelengthGame from "./wavelength";
import GreenTeamthGame from "./greenteam";
import SayAnithing from "./say_anything";

// ─── Utility: Get Room ID from URL ──────────────────────────────────────────
const getRoomIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("room");
};

// ─── Main App Component ─────────────────────────────────────────────────────
export default function App() {
  const [roomId] = useState(() => getRoomIdFromUrl());
  const [gameType, setGameType] = useState<string | null>(null);
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // אם אין roomId ב-URL, אנחנו לא יכולים להמשיך
    if (!roomId) {
      setLoading(false);
      return;
    }

    async function fetchGameMetadata() {
      setLoading(true);
      try {
        // שליפת נתוני המשחק מהטבלה המקורית 'games' לפי ה-short_id שנוצר בוויקס
        const { data, error: sbError } = await supabase
          .from('games')
          .select('game_type, payload')
          .eq('short_id', roomId)
          .single();

        if (sbError) throw sbError;

        if (data) {
          setGameType(data.game_type); // 'spyfall' או 'just_one'
          setGameData(data.payload);   // ה-JSON שהגמיני יצר (מיקומים או מילים)
        } else {
          setError("החדר נמצא, אך נתוני המשחק חסרים.");
        }
      } catch (err: any) {
        console.error("Error fetching game metadata:", err);
        setError("לא מצאנו את המשחק המבוקש. וודאו שהקוד תקין ושהמשחק נוצר בהצלחה.");
      } finally {
        setLoading(false);
      }
    }

    fetchGameMetadata();
  }, [roomId]);

  // 1. מצב טעינה
  if (loading) {
    return (
      <div style={{ 
        backgroundColor: '#080c14', 
        color: '#00e5ff', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        fontFamily: 'monospace',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px', letterSpacing: '2px' }}>INITIALIZING SYSTEM...</div>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>CONNECTING TO SUPABASE</div>
      </div>
    );
  }

  // 2. מצב שגיאה או חדר חסר
  if (!roomId || error) {
    return (
      <div style={{ 
        backgroundColor: '#080c14', 
        color: 'white', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'system-ui'
      }}>
        <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>⚠️ שגיאה בגישה לחדר</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '500px' }}>
          {error || "לא צוין קוד חדר בכתובת האתר. עליכם להיכנס דרך הקישור שנוצר בשיחה עם הגמיני."}
        </p>
      </div>
    );
  }

  // 3. בחירת המשחק להצגה (ה-Router)
  // הערה: ב-SpyfallGame אנחנו בודקים אם המשתמש הוא Host לפי ה-URL (אם אין פרמטר player=true)
const isPlayer = window.location.href.includes('role=player');
  switch (gameType) {
    case 'spyfall':
      return (
        <SpyfallGame 
          roomId={roomId} 
          gameData={gameData} 
          isHost={!isPlayer} 
        />
      );
      case 'just_one':
        return (
          <JustOneGame 
            roomId={roomId} 
            gameData={gameData} 
          />
        );
        case 'Say_Anything':
          return (
            <SayAnithing 
              roomId={roomId} 
              gameData={gameData} 
            />
          );
        
    case 'green_team_wins':
      return (
        <GreenTeamthGame 
          roomId={roomId} 
          gameData={gameData} 
          isHost={!isPlayer}
        />
      );
      case 'wavelength':

      return (
        <WavelengthGame 
          roomId={roomId} 
          gameData={gameData} // הנתונים שנשלפו מהעמודה 'payload'
        />
      );

    default:
      return (
        <div style={{ color: 'white', textAlign: 'center', padding: '50px', backgroundColor: '#080c14', height: '100vh' }}>
          <h1>סוג משחק לא מוכר: {gameType}</h1>
          <p>הגמיני בחר סוג משחק שהמערכת עדיין לא יודעת להציג.</p>
        </div>
      );
  }
}