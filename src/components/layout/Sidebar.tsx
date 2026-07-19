import { useEffect, useState } from 'react';
import { PartyPopper, Sparkles, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { GeneratedGame } from '@/types';

interface HistoryItem {
  id: string;
  title: string;
}

function extractTitle(game: GeneratedGame): string {
  const data = game.game_data as { game_title?: string; title?: string };
  return data.game_title ?? data.title ?? 'Untitled game';
}

export default function Sidebar() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) {
          setHistory([]);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('generated_games')
        .select('id, game_data')
        .eq('user_id', user.id)
        .order('id', { ascending: false });

      if (!active) return;

      if (error) {
        console.error('Failed to load game history:', error.message);
        setHistory([]);
      } else {
        setHistory(
          (data as GeneratedGame[]).map((g) => ({
            id: g.id,
            title: extractTitle(g),
          }))
        );
      }
      setLoading(false);
    }

    loadHistory();
    return () => {
      active = false;
    };
  }, []);

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white/70 px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <PartyPopper className="h-7 w-7 text-indigo-600" strokeWidth={2.5} />
        <span className="font-display text-xl font-extrabold text-slate-900">
          GameChanger
        </span>
      </div>

      <button
        type="button"
        className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-display font-semibold text-white shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus className="h-5 w-5" />
        New game
      </button>

      <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Your games
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {loading && (
          <div className="flex items-center gap-2 px-2 py-3 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading history...
          </div>
        )}

        {!loading && history.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-400">
            No games yet — create your first one!
          </div>
        )}

        {!loading &&
          history.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-900 transition-transform hover:scale-[1.02] hover:bg-rose-50"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-rose-500" />
              <span className="truncate">{item.title}</span>
            </button>
          ))}
      </div>
    </aside>
  );
}
