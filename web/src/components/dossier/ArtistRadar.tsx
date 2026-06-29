import { DNA_AXES, type ArtistDna } from "@/lib/db";

// Geometry: a six-spoke radar centred in the viewBox, with generous horizontal
// room so the long right/left axis labels ("Crowd Interaction") never clip.
const CX = 220;
const CY = 150;
const R = 96;
const RINGS = [0.25, 0.5, 0.75, 1]; // concentric grid hexagons
const LABEL_GAP = 22; // how far labels sit beyond the outer ring

/** Axis i sits at the top (-90deg) and steps 60deg clockwise. */
function angleFor(i: number): number {
  return (-90 + i * 60) * (Math.PI / 180);
}

function point(i: number, fraction: number): [number, number] {
  const a = angleFor(i);
  const r = R * fraction;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function polygon(fraction: number): string {
  return DNA_AXES.map((_, i) => point(i, fraction).join(",")).join(" ");
}

/**
 * "Artist DNA" radar — a pure-SVG stat chart over the six fixed axes. Server
 * rendered (no client JS). Missing axes read as 0 so the shape is always closed;
 * the Overview decides whether to show the card at all.
 */
export function ArtistRadar({ dna }: { dna: ArtistDna }) {
  const values = DNA_AXES.map((axis) => {
    const raw = dna[axis.key];
    const v = typeof raw === "number" ? Math.max(0, Math.min(100, raw)) : 0;
    return { ...axis, value: v };
  });

  const dataPoints = values
    .map((axis, i) => point(i, axis.value / 100).join(","))
    .join(" ");

  return (
    <svg
      viewBox="0 0 440 300"
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label="Artist DNA radar chart"
    >
      {/* Grid rings */}
      {RINGS.map((f) => (
        <polygon
          key={f}
          points={polygon(f)}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}

      {/* Spokes */}
      {values.map((_, i) => {
        const [x, y] = point(i, 1);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={x}
            y2={y}
            stroke="var(--border)"
            strokeWidth={1}
          />
        );
      })}

      {/* Data shape */}
      <polygon
        points={dataPoints}
        fill="color-mix(in srgb, var(--red) 22%, transparent)"
        stroke="var(--red)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {values.map((axis, i) => {
        const [x, y] = point(i, axis.value / 100);
        return <circle key={axis.key} cx={x} cy={y} r={3} fill="var(--red)" />;
      })}

      {/* Axis labels */}
      {values.map((axis, i) => {
        const a = angleFor(i);
        const lx = CX + (R + LABEL_GAP) * Math.cos(a);
        const ly = CY + (R + LABEL_GAP) * Math.sin(a);
        const cos = Math.cos(a);
        const anchor =
          Math.abs(cos) < 0.3 ? "middle" : cos > 0 ? "start" : "end";
        return (
          <text
            key={axis.key}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill="var(--muted)"
            fontSize={11}
            className="uppercase"
            style={{ letterSpacing: "0.04em" }}
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}
