import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const MICRO_TEXTS = [
  'AI is shuffling the cards...',
  'Drafting custom rules...',
  'Injecting inside jokes...',
  'Balancing the chaos meter...',
  'Printing the final rulebook...',
];

export default function GenerationLoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MICRO_TEXTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-3xl bg-white px-10 py-12 text-center shadow-xl">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-40" />
          <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600">
            <Sparkles className="h-8 w-8 text-white" />
          </span>
        </div>

        <div className="w-64">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-rose-500" />
          </div>
        </div>

        <p
          key={index}
          className="animate-pop-in font-display text-lg font-semibold text-slate-900"
        >
          {MICRO_TEXTS[index]}
        </p>
        <p className="text-sm text-slate-400">This usually takes 15–30 seconds.</p>
      </div>
    </div>
  );
}
