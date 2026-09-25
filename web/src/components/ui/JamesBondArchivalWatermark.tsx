"use client";

import React, { useId, useMemo } from "react";

interface JamesBondArchivalWatermarkProps {
  className?: string;
}

export const JamesBondArchivalWatermark: React.FC<JamesBondArchivalWatermarkProps> = ({
  className = "",
}) => {
  const sealId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // Generate the 24 curved spiral rifling grooves for the James Bond gun barrel
  const gunBarrelGrooves = useMemo(() => {
    const cx = 130;
    const cy = 440;
    const r1 = 38;
    const r2 = 280;
    const numGrooves = 24;
    const paths: string[] = [];

    for (let i = 0; i < numGrooves; i++) {
      const theta = (i * 2 * Math.PI) / numGrooves;
      const x1 = cx + r1 * Math.cos(theta);
      const y1 = cy + r1 * Math.sin(theta);
      const phi = theta + 1.18; // ~67 degrees of spiral twist
      const x2 = cx + r2 * Math.cos(phi);
      const y2 = cy + r2 * Math.sin(phi);

      const cp1x = cx + (r1 + 65) * Math.cos(theta + 0.38);
      const cp1y = cy + (r1 + 65) * Math.sin(theta + 0.38);

      const cp2x = cx + (r2 - 55) * Math.cos(phi - 0.24);
      const cp2y = cy + (r2 - 55) * Math.sin(phi - 0.24);

      paths.push(
        `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`
      );
    }
    return paths;
  }, []);

  // Generate the 36 degree calibration ticks for the gun barrel with fixed 2-decimal precision
  const barrelTicks = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => {
      const angle = (i * 10 * Math.PI) / 180;
      const rIn = i % 3 === 0 ? 270 : 275;
      const x1 = Number((130 + rIn * Math.cos(angle)).toFixed(2));
      const y1 = Number((440 + rIn * Math.sin(angle)).toFixed(2));
      const x2 = Number((130 + 280 * Math.cos(angle)).toFixed(2));
      const y2 = Number((440 + 280 * Math.sin(angle)).toFixed(2));
      return { x1, y1, x2, y2 };
    });
  }, []);

  return (
    <div
      className={`pointer-events-none select-none absolute inset-0 z-0 overflow-hidden opacity-[0.045] dark:opacity-[0.075] transition-opacity duration-300 ${className}`}
      style={{ mixBlendMode: "var(--dither-blend)" as any }}
      aria-hidden="true"
    >
      {/* 1. Tactical Border Classification Brackets & Dossier Telemetry */}
      <div className="absolute top-4 left-6 sm:left-10 font-mono text-[9px] tracking-widest text-text-secondary uppercase hidden sm:flex flex-col gap-0.5">
        <span className="font-bold flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 border-t border-l border-current"></span>
          [FILE: 007-VAUXHALL-RECON]
        </span>
        <span className="text-[8px] pl-3 opacity-75">SECTION 007 // DOUBLE-O STATUS: CONFIRMED</span>
      </div>

      <div className="absolute top-4 right-6 sm:right-10 font-mono text-[9px] tracking-widest text-text-secondary uppercase text-right hidden sm:flex flex-col gap-0.5">
        <span className="font-bold flex items-center justify-end gap-1.5">
          AZM: 342.8° // FREQ: 8.420 MHz
          <span className="inline-block w-1.5 h-1.5 border-t border-r border-current"></span>
        </span>
        <span className="text-[8px] pr-3 opacity-75">CIPHER: SIS/Q-DIRECTIVE // SEC-OPS</span>
      </div>

      <div className="absolute bottom-4 left-6 sm:left-10 font-mono text-[9px] tracking-widest text-text-secondary uppercase hidden sm:flex flex-col gap-0.5">
        <span className="font-bold flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 border-b border-l border-current"></span>
          DIRECTIVE: SUBTERRANEAN DOSSIER
        </span>
        <span className="text-[8px] pl-3 opacity-75">GOV-AUTH: D-NOTICE APPLIED // NO-INDEX</span>
      </div>

      <div className="absolute bottom-4 right-6 sm:right-10 font-mono text-[9px] tracking-widest text-text-secondary uppercase text-right hidden sm:flex flex-col gap-0.5">
        <span className="font-bold flex items-center justify-end gap-1.5">
          COORD: 51°29'14"N 0°07'28"W // CLEARANCE: TOP SECRET
          <span className="inline-block w-1.5 h-1.5 border-b border-r border-current"></span>
        </span>
        <span className="text-[8px] pr-3 opacity-75">VAUXHALL CROSS // LONDON HEADQUARTERS</span>
      </div>

      {/* 2. Full-Bleed Vector Intelligence Blueprint Canvas */}
      <svg
        viewBox="0 0 1440 920"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full text-text-secondary stroke-current fill-none"
        suppressHydrationWarning={true}
      >
        <defs>
          {/* Circular path for SIS Circular Stamp text */}
          <path
            id={`seal-circle-${sealId}`}
            d="M 1200, 680 m -95, 0 a 95,95 0 1,1 190,0 a 95,95 0 1,1 -190,0"
          />
          <path
            id={`seal-inner-${sealId}`}
            d="M 1200, 680 m -68, 0 a 68,68 0 1,1 136,0 a 68,68 0 1,1 -136,0"
          />
        </defs>

        {/* ── Background Graticule Grid & Coordinate Crosshairs ── */}
        <g strokeWidth="0.5" strokeDasharray="3 9" opacity="0.6">
          <line x1="240" y1="0" x2="240" y2="920" />
          <line x1="480" y1="0" x2="480" y2="920" />
          <line x1="720" y1="0" x2="720" y2="920" />
          <line x1="960" y1="0" x2="960" y2="920" />
          <line x1="1200" y1="0" x2="1200" y2="920" />

          <line x1="0" y1="180" x2="1440" y2="180" />
          <line x1="0" y1="360" x2="1440" y2="360" />
          <line x1="0" y1="540" x2="1440" y2="540" />
          <line x1="0" y1="720" x2="1440" y2="720" />
        </g>

        {/* Tactical Crosshair Anchors at Grid Intersections */}
        {[
          [240, 180], [480, 180], [720, 180], [960, 180], [1200, 180],
          [240, 360], [480, 360], [720, 360], [960, 360], [1200, 360],
          [240, 540], [480, 540], [720, 540], [960, 540], [1200, 540],
          [240, 720], [480, 720], [720, 720], [960, 720], [1200, 720],
        ].map(([x, y], idx) => (
          <g key={idx} strokeWidth="0.75" opacity="0.7">
            <line x1={x - 6} y1={y} x2={x + 6} y2={y} />
            <line x1={x} y1={y - 6} x2={x} y2={y + 6} />
            <circle cx={x} cy={y} r="1.5" stroke="none" fill="currentColor" opacity="0.5" />
          </g>
        ))}

        {/* ── MOTIF 1: THE JAMES BOND 007 GUN BARREL SPIRAL ── */}
        <g id="gun-barrel-spiral" opacity="0.85" suppressHydrationWarning={true}>
          {/* Outer Barrel Aperture Rings */}
          <circle cx="130" cy="440" r="280" strokeWidth="1" />
          <circle cx="130" cy="440" r="240" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="130" cy="440" r="160" strokeWidth="0.5" />
          <circle cx="130" cy="440" r="100" strokeWidth="0.75" strokeDasharray="2 3" />
          <circle cx="130" cy="440" r="38" strokeWidth="1.25" />

          {/* Central Bullet Aperture Target Reticle */}
          <circle cx="130" cy="440" r="14" strokeWidth="0.75" />
          <circle cx="130" cy="440" r="3" fill="currentColor" stroke="none" />
          <line x1="80" y1="440" x2="180" y2="440" strokeWidth="0.5" />
          <line x1="130" y1="390" x2="130" y2="490" strokeWidth="0.5" />

          {/* 24 Spiral Rifling Grooves */}
          {gunBarrelGrooves.map((pathD, idx) => (
            <path
              key={idx}
              d={pathD}
              strokeWidth={idx % 2 === 0 ? "0.85" : "0.5"}
              opacity={idx % 3 === 0 ? "0.9" : "0.6"}
              suppressHydrationWarning={true}
            />
          ))}

          {/* Barrel Degree Calibration Ticks */}
          {barrelTicks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              strokeWidth="0.5"
              suppressHydrationWarning={true}
            />
          ))}

          {/* Gun Barrel Annotation Labels */}
          <text
            x="40"
            y="735"
            fill="currentColor"
            stroke="none"
            className="font-mono text-[7px] tracking-[0.25em]"
          >
            007 CALIBRE 9×19MM PARABELLUM // WALTHER PPK BORE SPEC
          </text>
        </g>

        {/* ── MOTIF 2: MI6 / SIS ARCHIVAL INTELLIGENCE SEAL ── */}
        <g id="sis-archival-seal" opacity="0.8">
          {/* Concentric Stamp Seal Rings */}
          <circle cx="1200" cy="680" r="115" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="1200" cy="680" r="108" strokeWidth="0.5" />
          <circle cx="1200" cy="680" r="82" strokeWidth="0.75" />
          <circle cx="1200" cy="680" r="54" strokeWidth="0.5" strokeDasharray="2 2" />

          {/* Circular Text: SECRET INTELLIGENCE SERVICE • SECTION 007 • */}
          <text
            fill="currentColor"
            stroke="none"
            className="font-mono text-[7px] font-bold tracking-[0.22em] uppercase"
          >
            <textPath href={`#seal-circle-${sealId}`} startOffset="50%" textAnchor="middle">
              SECRET INTELLIGENCE SERVICE • SECTION 007 • EYES ONLY •
            </textPath>
          </text>

          {/* Inner Circular Text: WHITEHALL • VAUXHALL CROSS • */}
          <text
            fill="currentColor"
            stroke="none"
            className="font-mono text-[5.5px] tracking-[0.25em] uppercase"
          >
            <textPath href={`#seal-inner-${sealId}`} startOffset="50%" textAnchor="middle">
              WHITEHALL • CLASSIFIED DOSSIER • LONDON •
            </textPath>
          </text>

          {/* Center Insignia: Stylized MI6 Double-O Shield & Star */}
          <g transform="translate(1200, 680)">
            {/* Center Crown / Cold War Star */}
            <circle cx="0" cy="0" r="16" strokeWidth="0.75" strokeDasharray="1 2" />
            <polygon
              points="0,-12 3.5,-4 11,-4 5,2 7,10 0,5 -7,10 -5,2 -11,-4 -3.5,-4"
              strokeWidth="0.6"
            />
            <text
              x="0"
              y="22"
              fill="currentColor"
              stroke="none"
              textAnchor="middle"
              className="font-mono text-[6.5px] font-bold tracking-[0.2em]"
            >
              MI6 // 1962
            </text>
          </g>
        </g>

        {/* ── MOTIF 3: VAUXHALL CROSS RADAR AZIMUTH & TELEMETRY BEARING ── */}
        <g id="vauxhall-telemetry" opacity="0.75">
          {/* Subtle Azimuth Bearing Wheel in Upper Center */}
          <g transform="translate(720, 100)">
            <circle cx="0" cy="0" r="64" strokeWidth="0.5" strokeDasharray="2 4" />
            <circle cx="0" cy="0" r="32" strokeWidth="0.5" />
            <line x1="-70" y1="0" x2="70" y2="0" strokeWidth="0.5" />
            <line x1="0" y1="-70" x2="0" y2="70" strokeWidth="0.5" />
            <text
              x="0"
              y="-74"
              fill="currentColor"
              stroke="none"
              textAnchor="middle"
              className="font-mono text-[6px] tracking-[0.2em]"
            >
              000° N
            </text>
            <text
              x="76"
              y="2"
              fill="currentColor"
              stroke="none"
              textAnchor="start"
              className="font-mono text-[6px] tracking-[0.2em]"
            >
              090° E
            </text>
            <text
              x="0"
              y="80"
              fill="currentColor"
              stroke="none"
              textAnchor="middle"
              className="font-mono text-[6px] tracking-[0.2em]"
            >
              180° S
            </text>
            <text
              x="-76"
              y="2"
              fill="currentColor"
              stroke="none"
              textAnchor="end"
              className="font-mono text-[6px] tracking-[0.2em]"
            >
              270° W
            </text>
          </g>

          {/* Cryptographic Radar Sweep & Cold War Cipher Strip (Top Right) */}
          <g transform="translate(1260, 110)">
            <circle cx="0" cy="0" r="75" strokeWidth="0.75" />
            <circle cx="0" cy="0" r="50" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="25" strokeWidth="0.5" />
            <line x1="-75" y1="0" x2="75" y2="0" strokeWidth="0.5" />
            <line x1="0" y1="-75" x2="0" y2="75" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="55" y2="-55" strokeWidth="1" />
            <text
              x="-80"
              y="-66"
              fill="currentColor"
              stroke="none"
              textAnchor="end"
              className="font-mono text-[7px] tracking-[0.2em]"
            >
              LAT 51°29'14"N LON 00°07'28"W
            </text>
            <text
              x="-80"
              y="-54"
              fill="currentColor"
              stroke="none"
              textAnchor="end"
              className="font-mono text-[7px] tracking-[0.2em]"
            >
              CIPHER // 8F-7B-2A // Q-KERNEL
            </text>
            <text
              x="-80"
              y="-42"
              fill="currentColor"
              stroke="none"
              textAnchor="end"
              className="font-mono text-[7px] tracking-[0.2em]"
            >
              CLEARANCE: MI6 EYES ONLY
            </text>
          </g>

          {/* Reconnaissance Micro-Barcodes & Calibration Scales along Margins */}
          <g transform="translate(40, 200)">
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="0"
                y1={i * 12}
                x2={i % 4 === 0 ? "14" : "6"}
                y2={i * 12}
                strokeWidth={i % 4 === 0 ? "1" : "0.5"}
              />
            ))}
            <text
              x="0"
              y="302"
              fill="currentColor"
              stroke="none"
              className="font-mono text-[6px] tracking-[0.2em]"
            >
              SCALE: 1:25,000
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
