/**
 * Vector scenery. The brand sheet's motifs — open highway, expansive sky,
 * compass/navigation — drawn as SVG so every page ships premium imagery with
 * no photo licensing, no external request and no layout shift.
 */

export function HorizonScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 720" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#08121c" />
          <stop offset="55%" stopColor="#0d1b2a" />
          <stop offset="100%" stopColor="#0a0b0d" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#e6c47a" stopOpacity="0.95" />
          <stop offset="42%" stopColor="#d4af37" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tarmac" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="ridge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c0c0c0" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <rect width="1440" height="720" fill="url(#sky)" />
      <circle cx="960" cy="430" r="380" fill="url(#sunGlow)" />

      {/* horizon light bands, held to the right of the headline column */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={800 - i * 18}
          y={392 - i * 15}
          width={320 + i * 44}
          height={i === 0 ? 2.5 : 1.4}
          fill="#e6c47a"
          opacity={0.6 - i * 0.08}
        />
      ))}

      {/* distant ridgeline */}
      <path
        d="M0 432 L180 380 L268 414 L392 344 L520 424 L640 396 L760 424 L900 356 L1010 418 L1140 372 L1260 424 L1440 386 L1440 432 Z"
        fill="url(#ridge)"
      />

      {/* highway receding to the vanishing point */}
      <path d="M960 432 L1320 720 L640 720 Z" fill="url(#tarmac)" />
      <path d="M960 432 L1320 720" stroke="#e6c47a" strokeOpacity="0.5" strokeWidth="2" />
      <path d="M960 432 L640 720" stroke="#e6c47a" strokeOpacity="0.5" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const t = i / 7;
        const y = 432 + (720 - 432) * Math.pow(t + 0.12, 2.1);
        const h = 6 + i * 7;
        const w = 2 + i * 2.6;
        return <rect key={i} x={960 - w / 2} y={y} width={w} height={h} fill="#e6c47a" opacity={0.32 + i * 0.09} />;
      })}
    </svg>
  );
}

export function CompassRose({ className = "", size = 200 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id="compassGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e6c47a" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#a8842a" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="none" stroke="url(#compassGold)" strokeOpacity="0.35" />
      <circle cx="100" cy="100" r="72" fill="none" stroke="url(#compassGold)" strokeOpacity="0.2" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 24;
        const inner = i % 6 === 0 ? 62 : 78;
        return (
          <line
            key={i}
            x1={100 + Math.cos(a) * inner}
            y1={100 + Math.sin(a) * inner}
            x2={100 + Math.cos(a) * 88}
            y2={100 + Math.sin(a) * 88}
            stroke="#d4af37"
            strokeOpacity={i % 6 === 0 ? 0.65 : 0.25}
            strokeWidth={i % 6 === 0 ? 1.6 : 0.8}
          />
        );
      })}
      <path d="M100 16 L114 100 L100 184 L86 100 Z" fill="url(#compassGold)" opacity="0.9" />
      <path d="M16 100 L100 86 L184 100 L100 114 Z" fill="url(#compassGold)" opacity="0.55" />
      <path d="M100 16 L100 184" stroke="#0a0b0d" strokeOpacity="0.35" />
      <circle cx="100" cy="100" r="7" fill="#0a0b0d" stroke="url(#compassGold)" strokeWidth="1.5" />
    </svg>
  );
}

export function ShipSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 240" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="hull" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e6c47a" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <path d="M40 168 L600 168 L556 208 L96 208 Z" fill="url(#hull)" />
      <path d="M96 168 L96 128 L520 128 L520 168 Z" fill="url(#hull)" opacity="0.75" />
      <path d="M150 128 L150 96 L470 96 L470 128 Z" fill="url(#hull)" opacity="0.6" />
      <path d="M210 96 L210 68 L420 68 L420 96 Z" fill="url(#hull)" opacity="0.45" />
      <rect x="300" y="34" width="16" height="34" fill="#e6c47a" opacity="0.5" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={120 + i * 52} y={140} width="26" height="8" fill="#0a0b0d" opacity="0.5" />
      ))}
      <path d="M0 214 Q 160 200 320 214 T 640 214" stroke="#c0c0c0" strokeOpacity="0.2" fill="none" />
      <path d="M0 226 Q 200 212 400 226 T 640 226" stroke="#c0c0c0" strokeOpacity="0.12" fill="none" />
    </svg>
  );
}

export function GridLines({ className = "" }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <defs>
        <pattern id="hbGrid" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M64 0 L0 0 0 64" fill="none" stroke="#d4af37" strokeOpacity="0.07" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hbGrid)" />
    </svg>
  );
}

/** Small numbered marker used on the journey timeline. */
export function StepMarker({ n }: { n: number }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-onyx text-sm text-champagne">
      {String(n).padStart(2, "0")}
    </span>
  );
}
