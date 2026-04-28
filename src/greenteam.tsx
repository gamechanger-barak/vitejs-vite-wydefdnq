import React, { useState } from 'react'; // הסרתי את useMemo
import { 
  ChevronLeft, 
  RotateCcw,
  Sparkles,
  Users,
  CheckCircle2,
  PartyPopper
} from 'lucide-react'; // הסרתי את Trophy ו-ChevronRight
// --- Interfaces ---

interface GameContent {
  prompt: string;
  category: string;
}

interface GameMetadata {
  company_name: string;
  theme: string;
}

interface GameData {
  game_metadata: GameMetadata;
  content: GameContent[];
}

interface GreenTeamWinsProps {
  gameData: GameData;
  roomId: string;
  isHost: boolean;
}

type GamePhase = 'START' | 'QUESTION' | 'REVEAL' | 'SUMMARY';

// --- Component ---

const GreenTeamWins: React.FC<GreenTeamWinsProps> = ({ gameData, roomId, isHost }) => {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scores, setScores] = useState({ teamA: 0, teamB: 0 });

  const currentCard = gameData.content[currentIndex];
  const totalQuestions = gameData.content.length;

  // Progress calculations
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // Handlers
  const nextStep = () => {
    if (phase === 'QUESTION') {
      setPhase('REVEAL');
    } else if (phase === 'REVEAL') {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
        setPhase('QUESTION');
      } else {
        setPhase('SUMMARY');
      }
    }
  };

  const updateScore = (team: 'teamA' | 'teamB', points: number) => {
    setScores(prev => ({ ...prev, [team]: Math.max(0, prev[team] + points) }));
  };

  // --- Sub-Views ---

  const StartScreen = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full" />
        <Users className="w-24 h-24 text-emerald-400 relative z-10" />
      </div>
      <div>
        <h1 className="text-6xl font-black mb-4 text-white tracking-tight">
          GREEN TEAM <span className="text-emerald-500">WINS</span>
        </h1>
        <p className="text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          המשחק שבו לא חשוב מה התשובה הנכונה, אלא מה <span className="text-white font-bold">הרוב</span> חושב. מוכנים ליישור קו?
        </p>
      </div>
      <button 
        onClick={() => setPhase('QUESTION')}
        className="group relative px-12 py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-2xl transition-all hover:scale-105"
      >
        <span className="relative z-10">מתחילים!</span>
        <div className="absolute inset-0 bg-emerald-400/20 blur-xl group-hover:blur-2xl transition-all rounded-2xl" />
      </button>
    </div>
  );

  const SummaryScreen = () => {
    const winner = scores.teamA > scores.teamB ? 'צוות א\'' : scores.teamB > scores.teamA ? 'צוות ב\'' : 'תיקו!';
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <PartyPopper className="w-24 h-24 text-amber-400 animate-bounce" />
        <div>
          <h2 className="text-5xl font-bold text-white mb-2">המשחק נגמר!</h2>
          <p className="text-2xl text-gray-400 italic">"{gameData.game_metadata.theme}"</p>
        </div>
        
        <div className="flex gap-12 items-center">
          <div className={`p-8 rounded-3xl border-2 ${scores.teamA >= scores.teamB ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5'}`}>
            <p className="text-sm font-bold text-gray-500 mb-2">צוות א'</p>
            <p className="text-6xl font-mono font-bold text-white">{scores.teamA}</p>
          </div>
          <div className="text-4xl font-black text-gray-700">VS</div>
          <div className={`p-8 rounded-3xl border-2 ${scores.teamB >= scores.teamA ? 'border-rose-500 bg-rose-500/10' : 'border-white/5'}`}>
            <p className="text-sm font-bold text-gray-500 mb-2">צוות ב'</p>
            <p className="text-6xl font-mono font-bold text-white">{scores.teamB}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 px-10 py-6 rounded-2xl">
          <h3 className="text-2xl font-bold text-emerald-400">המנצחים: {winner}</h3>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          משחק חדש
        </button>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div dir="rtl" className="min-h-screen bg-[#0d0d1a] text-white p-6 md:p-12 font-sans relative overflow-hidden flex flex-col">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />

      {/* Top Header */}
      <header className="relative z-10 flex justify-between items-start mb-8">
        <div>
          <h4 className="text-emerald-500 font-bold tracking-widest text-sm uppercase">{gameData.game_metadata.company_name}</h4>
          <h1 className="text-2xl font-bold">Green Team Wins</h1>
        </div>

        {phase !== 'START' && phase !== 'SUMMARY' && (
          <div className="bg-gray-900/80 border border-white/10 p-4 rounded-2xl flex items-center gap-6 shadow-2xl backdrop-blur-md">
            <div className="text-center group">
              <p className="text-[10px] text-gray-500 font-bold mb-1">TEAM A</p>
              <div className="flex items-center gap-3">
                {isHost && <button onClick={() => updateScore('teamA', -1)} className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 text-xs">-</button>}
                <span className="text-3xl font-mono text-emerald-400">{scores.teamA}</span>
                {isHost && <button onClick={() => updateScore('teamA', 1)} className="w-6 h-6 rounded-full bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 text-xs">+</button>}
              </div>
            </div>
            <div className="w-px h-10 bg-gray-800" />
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-bold mb-1">TEAM B</p>
              <div className="flex items-center gap-3">
                {isHost && <button onClick={() => updateScore('teamB', -1)} className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 text-xs">-</button>}
                <span className="text-3xl font-mono text-rose-400">{scores.teamB}</span>
                {isHost && <button onClick={() => updateScore('teamB', 1)} className="w-6 h-6 rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 text-xs">+</button>}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
        {phase === 'START' ? (
          <StartScreen />
        ) : phase === 'SUMMARY' ? (
          <SummaryScreen />
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-500">
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-800 rounded-full">
              <div 
                className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-gray-900/40 border border-white/5 backdrop-blur-xl p-12 md:p-20 rounded-[3rem] shadow-2xl relative">
              <div className="absolute top-8 right-12 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest">{currentCard.category}</span>
              </div>

              <div className="space-y-12 text-center">
                <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                  {currentCard.prompt}
                </h2>

                {phase === 'REVEAL' && (
                  <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
                    <div className="h-px w-24 bg-emerald-500/30" />
                    <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-2xl">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <span className="text-2xl font-bold text-emerald-100">מי שבקבוצה הירוקה - מקבל נקודה!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Controls */}
            {isHost && (
              <div className="flex justify-between items-center px-4">
                <div className="text-gray-500 font-mono">
                  {currentIndex + 1} / {totalQuestions}
                </div>
                
                <button 
                  onClick={nextStep}
                  className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-emerald-400 transition-colors shadow-lg"
                >
                  {phase === 'QUESTION' ? 'חשוף תוצאה' : 'לשאלה הבאה'}
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 mt-8 flex justify-center">
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-500 tracking-tighter">
          ROOM ID: {roomId} • TEAM BUILDING ENGINE v2.0
        </div>
      </footer>
    </div>
  );
};

export default GreenTeamWins;