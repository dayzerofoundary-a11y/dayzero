import React, { useMemo, useId } from "react";

function generateGuillochePaths(tileW: number, tileH: number, spacing: number): string[] {
  const paths: string[] = [];
  const rows = Math.ceil(tileH / spacing) + 2;
  for (let r = -1; r < rows; r++) {
    const baseY = r * spacing;
    const phase = r * 1.3;
    let d = `M 0 ${baseY}`;
    for (let x = 4; x <= tileW; x += 4) {
      const y =
        baseY +
        2.8 * Math.sin(x * 0.06 + phase) +
        1.4 * Math.sin(x * 0.115 + phase * 1.5) +
        0.6 * Math.sin(x * 0.22 + phase * 0.7);
      d += ` L ${x} ${y}`;
    }
    paths.push(d);
  }
  return paths;
}

interface Props {
  color?: string;
  opacity?: number;
  className?: string;
}

export const GuillocheBackground = React.memo(function GuillocheBackground({ color = "#131929", opacity = 0.055, className = "" }: Props) {
  const uid = useId().replace(/:/g, "");
  const patternId = `guilloche-${uid}`;

  const tileW = 180;
  const tileH = 90;
  const spacing = 7;

  const paths = useMemo(() => generateGuillochePaths(tileW, tileH, spacing), []);

  return (
    <svg
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width={tileW}
          height={tileH}
          patternUnits="userSpaceOnUse"
        >
          {paths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={color} strokeWidth="0.45" opacity={opacity} />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
});
