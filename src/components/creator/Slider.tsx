import { useRef, useState, type ChangeEvent } from 'react';

interface SliderProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

export default function Slider({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
}: SliderProps) {
  const trackRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const percent = ((value - min) / (max - min)) * 100;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(Number(e.target.value));
  }

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block font-medium text-slate-900">
        {label}
      </label>

      <div className="relative pt-8">
        {/* Floating value bubble, positioned above the thumb */}
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl bg-indigo-600 px-2.5 py-1 text-sm font-semibold text-white shadow-lg transition-transform"
          style={{ left: `calc(${percent}% + ${(0.5 - percent / 100) * 20}px)` }}
        >
          {value}
          <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-indigo-600" />
        </div>

        <input
          ref={trackRef}
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          className={`h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600 transition-transform ${
            dragging ? 'scale-[1.01]' : ''
          }`}
        />

        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}
