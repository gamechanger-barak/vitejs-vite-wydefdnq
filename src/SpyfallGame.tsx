import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Users,
  MapPin,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  Copy,
  Wifi,
  WifiOff,
  Crown,
} from 'lucide-react';
import { supabase } from './supabaseClient';

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080c14; --surface: #0f1520; --surface2: #161e2e; --border: rgba(255,255,255,0.08);
    --border-bright: rgba(255,255,255,0.15); --accent: #00e5ff; --accent2: #7c3aed;
    --danger: #ef4444; --warning: #f59e0b; --success: #10b981; --text: #f1f5f9;
    --text-muted: #64748b; --text-dim: #334155; --font-display: 'Syne', sans-serif; --font-mono: 'Space Mono', monospace;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-display); }
  .host-layout { display: grid; grid-template-columns: 340px 1fr; min-height: 100vh; }
  .host-sidebar { background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 2rem 1.5rem; gap: 1.5rem; overflow-y: auto; }
  .host-main { padding: 2rem; overflow-y: auto; }
  .card { background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
  .card-accent { border-color: rgba(0, 229, 255, 0.25); box-shadow: 0 0 20px rgba(0, 229, 255, 0.05); }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem 1.25rem; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text); font-family: var(--font-display); font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.15s; text-transform: uppercase; }
  .btn:hover:not(:disabled) { background: rgba(255,255,255,0.05); border-color: var(--border-bright); }
  .btn-primary { background: var(--accent); color: #000; border-color: var(--accent); }
  .btn-danger { border-color: var(--danger); color: var(--danger); }
  .badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.2rem 0.6rem; border-radius: 100px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
  .badge-green { background: rgba(16,185,129,0.15); color: var(--success); }
  .badge-red { background: rgba(239,68,68,0.15); color: var(--danger); }
  .logo { font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: var(--accent); }
  .timer-display { font-family: var(--font-mono); font-size: 3.5rem; font-weight: 700; color: var(--accent); display: flex; align-items: center; gap: 1rem; }
  .player-pill { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 0.5rem; }
  .avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--accent2), var(--accent)); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #fff; }
  .location-tag { display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.75rem; border: 1px solid var(--border); border-radius: 8px; font-size: 0.8rem; color: var(--text-muted); }
  .location-tag.active-location { border-color: var(--accent); color: var(--accent); background: rgba(0,229,255,0.06); }
  .mobile-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; background: var(--bg); }
  .mobile-card { width: 100%; max-width: 420px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 1.5rem; }
  .name-input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 0.875rem 1rem; color: var(--text); margin-bottom: 1rem; outline: none; }
  .hold-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.5rem; border-radius: 12px; border: 1.5px solid var(--border-bright); background: transparent; color: var(--text); width: 100%; justify-content: center; cursor: pointer; user-select: none; }
  .hold-btn.holding { background: rgba(0,229,255,0.08); border-color: var(--accent); color: var(--accent); }
  .reveal-content.hidden { filter: blur(12px); opacity: 0.15; }
`;

// ─── Utils ───────────────────────────────────────────────────────────────────
const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// ─── Sub-Components ───────────────────────────────────────────────────────────
function CountdownTimer({ gamePhase }: { gamePhase: string }) {
  const [seconds, setSeconds] = useState(480);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds((s) => s - 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, seconds]);

  return (
    <div className="card">
      <div
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}
      >
        Timer
      </div>
      <div className={`timer-display ${seconds <= 30 ? 'danger' : ''}`}>
        <Clock size={32} /> {formatTime(seconds)}
      </div>
      <div className="flex mt-3" style={{ display: 'flex', gap: '10px' }}>
        <button
          className="btn btn-primary"
          onClick={() => setRunning(!running)}
          disabled={gamePhase !== 'playing'}
        >
          {running ? <Pause size={14} /> : <Play size={14} />}{' '}
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          className="btn"
          onClick={() => {
            setSeconds(480);
            setRunning(false);
          }}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}

// ─── Main Game Logic ──────────────────────────────────────────────────────────
async function startGame(roomId: string, players: any[], gameData: any) {
  const location = gameData[Math.floor(Math.random() * gameData.length)];
  const shuffledPlayers = shuffle(players);
  const spyIndex = Math.floor(Math.random() * shuffledPlayers.length);
  const shuffledRoles = shuffle(location.roles);

  await supabase
    .from('spyfall_sessions')
    .update({
      phase: 'playing',
      location: location.location,
      spy_id: shuffledPlayers[spyIndex].id,
    })
    .eq('id', roomId);

  for (let i = 0; i < shuffledPlayers.length; i++) {
    const isSpy = i === spyIndex;
    await supabase
      .from('players')
      .update({
        is_spy: isSpy,
        location: isSpy ? null : location.location,
        role: isSpy ? null : shuffledRoles[i] || 'אורח',
      })
      .eq('id', shuffledPlayers[i].id);
  }
}

// ─── Views ────────────────────────────────────────────────────────────────────
function HostView({
  roomId,
  gameData,
  gameState,
  players,
  connected,
  onStartGame,
}: any) {
  const [copied, setCopied] = useState(false);
  const joinUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}&role=player`;
  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="host-layout">
      <aside className="host-sidebar">
        <div className="logo">
          SPY<span>FALL</span>
        </div>
        <div className="card card-accent">
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <QRCodeSVG value={joinUrl} size={160} />
          </div>
          <button
            className="btn w-full"
            onClick={copyToClipboard}
            style={{ borderColor: copied ? 'var(--success)' : '' }}
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <div className="card">
          <div
            style={{
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Users size={16} /> Players
            </span>
            <span className="badge badge-cyan">{players.length}</span>
          </div>
          {players.map((p: any) => (
            <div key={p.id} className="player-pill">
              <div className="avatar">{p.name[0]}</div>
              <span style={{ flex: 1 }}>{p.name}</span>
              {gameState.phase === 'playing' && p.id === gameState.spy_id && (
                <Shield size={14} color="var(--danger)" />
              )}
            </div>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={onStartGame}
          disabled={players.length < 3 || gameState.phase === 'playing'}
        >
          Start Game
        </button>
        <div style={{ marginTop: 'auto' }}>
          <span className={`badge ${connected ? 'badge-green' : 'badge-red'}`}>
            {connected ? <Wifi size={10} /> : <WifiOff size={10} />}{' '}
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </aside>
      <main className="host-main">
        <CountdownTimer gamePhase={gameState.phase} />
        <div className="card mt-4">
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              marginBottom: '1rem',
              textTransform: 'uppercase',
            }}
          >
            Locations
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {gameData.map((loc: any) => (
              <div
                key={loc.location}
                className={`location-tag ${
                  gameState.location === loc.location ? 'active-location' : ''
                }`}
              >
                <MapPin size={12} /> {loc.location}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function PlayerView({ roomId }: any) {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<any>(null);
  const [gamePhase, setGamePhase] = useState('lobby');
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;
    const channel = supabase
      .channel(`player-${playerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'spyfall_sessions',
          filter: `id=eq.${roomId}`,
        },
        (p) => setGamePhase(p.new.phase)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `id=eq.${playerId}`,
        },
        (p) => setPlayerData(p.new)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [playerId, roomId]);

  const join = async () => {
    if (!name.trim()) return;
    const { data, error } = await supabase
      .from('players')
      .insert({ name, room_id: roomId })
      .select()
      .single();
    if (data) {
      setPlayerId(data.id);
      setJoined(true);
    } else if (error) setError('Could not join room.');
  };

  if (!joined)
    return (
      <div className="mobile-wrap">
        <div className="mobile-card">
          <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>
            Join Spyfall
          </h2>
          <input
            className="name-input"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn btn-primary w-full" onClick={join}>
            <Crown size={16} /> Join Game
          </button>
          {error && (
            <div
              style={{
                color: 'var(--danger)',
                marginTop: '10px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      </div>
    );

  return (
    <div className="mobile-wrap">
      <div className="mobile-card" style={{ textAlign: 'center' }}>
        <div className="logo" style={{ marginBottom: '1.5rem' }}>
          SPY<span>FALL</span>
        </div>
        {gamePhase === 'lobby' ? (
          <div>
            <p>Waiting for host to start...</p>
          </div>
        ) : (
          <div>
            <div className={`reveal-content ${holding ? '' : 'hidden'}`}>
              {playerData?.is_spy ? (
                <div style={{ color: 'var(--danger)' }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(239,68,68,0.1)',
                      border: '2px solid var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                    }}
                  >
                    <Eye size={32} />
                  </div>
                  <h2 style={{ fontWeight: 800 }}>YOU ARE THE SPY</h2>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Location
                  </div>
                  <div
                    style={{
                      fontSize: '1.8rem',
                      color: 'var(--accent)',
                      fontWeight: 'bold',
                      marginBottom: '1rem',
                    }}
                  >
                    {playerData?.location}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Your Role
                  </div>
                  <div style={{ fontSize: '1.2rem' }}>{playerData?.role}</div>
                </div>
              )}
            </div>
            <button
              className={`hold-btn mt-4 ${holding ? 'holding' : ''}`}
              onMouseDown={() => setHolding(true)}
              onMouseUp={() => setHolding(false)}
              onTouchStart={() => setHolding(true)}
              onTouchEnd={() => setHolding(false)}
            >
              {holding ? <EyeOff size={16} /> : <Eye size={16} />}{' '}
              {holding ? 'Release to Hide' : 'Hold to Reveal'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SpyfallGame({ roomId, gameData, isHost }: any) {
  const [players, setPlayers] = useState<any[]>([]);
  const [gameState, setGameState] = useState<any>({
    phase: 'lobby',
    location: null,
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = styles;
    document.head.appendChild(tag);
    return () => {
      document.head.removeChild(tag);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          const { data } = await supabase
            .from('players')
            .select('*')
            .eq('room_id', roomId);
          if (data) setPlayers(data);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'spyfall_sessions',
          filter: `id=eq.${roomId}`,
        },
        (p) => setGameState(p.new)
      )
      .subscribe((s) => setConnected(s === 'SUBSCRIBED'));

    (async () => {
      const { data: ps } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId);
      if (ps) setPlayers(ps);
      const { data: gs } = await supabase
        .from('spyfall_sessions')
        .select('*')
        .eq('id', roomId)
        .single();
      if (gs) setGameState(gs);
    })();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return isHost ? (
    <HostView
      roomId={roomId}
      gameData={gameData}
      gameState={gameState}
      players={players}
      connected={connected}
      onStartGame={() => startGame(roomId, players, gameData)}
    />
  ) : (
    <PlayerView roomId={roomId} />
  );
}
