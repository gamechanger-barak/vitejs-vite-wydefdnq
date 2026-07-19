import { useEffect, useState } from 'react';
import { PartyPopper, ChevronRight, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import type { EventType } from '@/types';

export default function CreatorApp() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadEventTypes() {
      setLoading(true);
      const { data, error } = await supabase.from('event_types').select('*');

      if (!active) return;

      if (error) {
        setError(error.message);
      } else {
        setEventTypes((data ?? []) as EventType[]);
      }
      setLoading(false);
    }

    loadEventTypes();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8 rounded-3xl bg-white p-8 text-center shadow-xl">
        <PartyPopper className="mx-auto mb-4 h-12 w-12 text-indigo-600" />
        <h1 className="font-display text-3xl font-extrabold text-slate-900">
          What are we celebrating?
        </h1>
        <p className="mt-2 text-slate-500">
          Pick an event type and we'll build a custom game around it.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading event types...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          {eventTypes.map((eventType) => (
            <button
              key={eventType.id}
              type="button"
              className="flex items-center justify-between rounded-2xl bg-white p-6 text-left shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="font-display font-semibold text-slate-900">
                {eventType.name}
              </span>
              <ChevronRight className="h-5 w-5 text-indigo-600" />
            </button>
          ))}

          {eventTypes.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-slate-400">
              No event types yet — run the seed data in supabase/schema.sql.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
