import { useCallback, useRef } from "react";
import type { ScaleOption } from "./scale-data";

export function ScaleSelector({
  label,
  scale,
  value,
  onChange,
}: {
  label: string;
  scale: ScaleOption[];
  value: number;
  onChange: (v: number) => void;
}) {
  const selected = scale.find((s) => s.value === value) ?? scale[5];
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const min = scale[0].value;
  const max = scale[scale.length - 1].value;
  const pct = ((value - min) / (max - min)) * 100;

  const gradient = scale
    .map((s) => {
      const p = ((s.value - min) / (max - min)) * 100;
      return `${s.color} ${p}%`;
    })
    .join(", ");

  const resolveValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const ratio = x / rect.width;
      const raw = min + ratio * (max - min);
      const snapped = Math.round(raw);
      const clamped = Math.max(min, Math.min(max, snapped));
      if (clamped !== value) onChange(clamped);
    },
    [min, max, value, onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      resolveValue(e.clientX);
    },
    [resolveValue],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      resolveValue(e.clientX);
    },
    [resolveValue],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/40">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ color: selected.color, backgroundColor: selected.bg }}
        >
          {selected.emoji} {selected.label}
        </span>
      </div>

      {/* Slider — outer adds horizontal padding so thumb doesn't clip edges */}
      <div className="px-[22px]">
        {/* Track (this div = 0%-100% range for all absolute children) */}
        <div
          ref={trackRef}
          className="relative h-14 cursor-pointer select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Background track — full gradient, muted */}
          <div
            className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full"
            style={{
              background: `linear-gradient(to right, ${gradient})`,
              opacity: 0.2,
            }}
          />

          {/* Filled track — vivid gradient, clipped to current value */}
          <div
            className="absolute inset-y-0 left-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full transition-[width] duration-150 ease-out"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(to right, ${gradient})`,
            }}
          />

          {/* Dot markers for each step */}
          {scale.map((s) => {
            const dotPct = ((s.value - min) / (max - min)) * 100;
            const isActive = s.value === value;
            return (
              <div
                key={s.value}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${dotPct}%`,
                  width: isActive ? 0 : 4,
                  height: isActive ? 0 : 4,
                  backgroundColor: s.color,
                  opacity: isActive ? 0 : 0.3,
                  transition: "all 150ms ease-out",
                }}
              />
            );
          })}

          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-150 ease-out"
            style={{ left: `${pct}%` }}
          >
            <div
              className="flex items-center justify-center rounded-full ring-[3px] ring-white dark:ring-neutral-900"
              style={{
                width: 44,
                height: 44,
                backgroundColor: selected.bg,
                boxShadow: `0 2px 12px ${selected.color}30, 0 1px 3px rgba(0,0,0,0.1)`,
              }}
            >
              <span className="text-[26px] leading-none">{selected.emoji}</span>
            </div>
          </div>
        </div>
      </div>

      {/* End labels */}
      <div className="mt-0.5 flex justify-between px-1">
        <span className="text-[10px] font-medium text-muted-foreground/50">
          {scale[0].emoji} {scale[0].label}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground/50">
          {scale[scale.length - 1].label} {scale[scale.length - 1].emoji}
        </span>
      </div>
    </div>
  );
}
