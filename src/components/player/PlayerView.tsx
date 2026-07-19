import { useEffect, useState } from 'react';
import { PartyPopper, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { GeneratedGame } from '@/types';

interface PlayerViewProps {
  gameId: string;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; game: GeneratedGame };

export default function PlayerView({ gameId }: PlayerViewProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    async function loadGame() {
      const { data, error } = await supabase
        .from('generated_games')
        .select('id, user_id, game_data')
        .eq('id', gameId)
        .single();

      if (!active) return;

      if (error || !data) {
        setState({
          status: 'error',
          message: "We couldn't find that game — check the link and try again.",
        });
        return;
      }

      setState({ status: 'ready', game: data as GeneratedGame });
    }

    loadGame();
    return () => {
      active = false;
    };
  }, [gameId]);

  if (state.status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-xl">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="font-medium text-slate-900">Loading your game...</span>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-3xl bg-white p-10 text-center shadow-xl">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-rose-500" />
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Game not found
          </h1>
          <p className="mt-2 text-slate-500">{state.message}</p>
        </div>
      </div>
    );
  }

  const gameData = state.game.game_data as {
    game_title?: string;
    rules?: string;
    rounds?: { title: string; instructions: string; cards: string[] }[];
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 rounded-3xl bg-indigo-600 p-8 text-center shadow-xl">
          <PartyPopper className="mx-auto mb-3 h-10 w-10 text-white" />
          <h1 className="font-display text-3xl font-extrabold text-white">
            {gameData.game_title ?? 'Untitled Game'}
          </h1>
        </div>

        {gameData.rules && (
          <div className="mb-6 rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 font-display text-lg font-bold text-slate-900">
              How to play
            </h2>
            <p className="whitespace-pre-line text-slate-600">{gameData.rules}</p>
          </div>
        )}

        {gameData.rounds?.map((round, i) => (
          <div
            key={i}
            className="mb-6 rounded-3xl bg-white p-6 shadow-xl transition-transform hover:scale-[1.01]"
          >
            <h3 className="mb-1 font-display text-lg font-bold text-rose-500">
              {round.title}
            </h3>
            <p className="mb-3 text-slate-600">{round.instructions}</p>
            <ul className="space-y-2">
              {round.cards?.map((card, j) => (
                <li
                  key={j}
                  className="rounded-2xl bg-amber-50/60 px-4 py-3 text-slate-900"
                >
                  {card}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
