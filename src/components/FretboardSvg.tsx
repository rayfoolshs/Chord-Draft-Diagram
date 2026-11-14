import React, { useState } from 'react';
import {
  ChordDiagramConfig,
  DetectedChord,
  FingerTool,
} from '../types/chord';
import { DIAGRAM_THEMES, getDiagramDotText } from '../utils/svgGenerator';

interface FretboardSvgProps {
  config: ChordDiagramConfig;
  detected: DetectedChord;
  fingerTool: FingerTool;
  activeStringIndex: number | null;
  onCellClick: (stringIndex: number, absFret: number) => void;
  onToggleOpenMute: (stringIndex: number) => void;
  onCreateBarre: (fret: number, fromString: number, toString: number) => void;
  onRemoveBarre: (barreId: string) => void;
  onPluckString: (stringIndex: number) => void;
}

const INLAY_FRETS = new Set([3, 5, 7, 9, 12, 15, 17]);

export const FretboardSvg: React.FC<FretboardSvgProps> = ({
  config,
  detected,
  fingerTool,
  activeStringIndex,
  onCellClick,
  onToggleOpenMute,
  onCreateBarre,
  onRemoveBarre,
  onPluckString,
}) => {
  const [hoverCell, setHoverCell] = useState<{
    stringIndex: number;
    absFret: number;
  } | null>(null);

  const [barreDrag, setBarreDrag] = useState<{
    absFret: number;
    startString: number;
    endString: number;
  } | null>(null);

  const palette = DIAGRAM_THEMES[config.theme];
  const accent = config.accentColor || '#0284C7';
  const fretCount = config.fretCount;
  const isHoriz = config.orientation === 'horizontal';

  const verticalOrder =
    config.handedness === 'right' ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0];
  const horizontalOrder =
    config.handedness === 'right' ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];

  const titleText = config.syncTitleWithDetected
    ? detected.shortName === '—'
      ? config.title || 'Untitled Diagram'
      : detected.shortName
    : config.title || detected.shortName;

  const handlePointerDown = (stringIndex: number, absFret: number) => {
    if (fingerTool === 'barre') {
      setBarreDrag({ absFret, startString: stringIndex, endString: stringIndex });
    }
  };

  const handlePointerEnter = (stringIndex: number, absFret: number) => {
    setHoverCell({ stringIndex, absFret });
    if (barreDrag && barreDrag.absFret === absFret) {
      setBarreDrag((prev) =>
        prev ? { ...prev, endString: stringIndex } : null
      );
    }
  };

  const handlePointerUp = (stringIndex: number, absFret: number) => {
    if (barreDrag) {
      if (barreDrag.startString !== barreDrag.endString) {
        onCreateBarre(
          barreDrag.absFret,
          barreDrag.startString,
          barreDrag.endString
        );
      } else {
        onCellClick(stringIndex, absFret);
      }
      setBarreDrag(null);
      return;
    }
    onCellClick(stringIndex, absFret);
  };

  if (!isHoriz) {
    const viewW = 340;
    const headerH = config.showChordTitle ? (config.subtitle ? 74 : 56) : 18;
    const openMarkerSpace = 36;
    const fretSpacing = 48;
    const gridH = fretCount * fretSpacing;
    const tuningSpace = config.showTuningLabels ? 34 : 12;
    const footerSpace = config.showIntervalsFooter ? 28 : 12;
    const viewH = Math.round(
      headerH + openMarkerSpace + gridH + tuningSpace + footerSpace
    );

    const gridX = 64;
    const stringSpacing = 42.4;
    const gridW = stringSpacing * 5;
    const gridY = headerH + openMarkerSpace;

    return (
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full max-w-[380px] select-none touch-none rounded-xl border border-slate-200/80 shadow-sm transition-colors duration-150"
        style={{ backgroundColor: palette.bg }}
        onPointerLeave={() => {
          setHoverCell(null);
          setBarreDrag(null);
        }}
        role="application"
        aria-label="Interactive guitar chord fretboard"
      >
        {/* Title & Subtitle */}
        {config.showChordTitle && (
          <g>
            <text
              x={viewW / 2}
              y={34}
              textAnchor="middle"
              fontFamily="'Outfit', 'DM Sans', system-ui, sans-serif"
              fontSize="28"
              fontWeight="700"
              fill={palette.ink}
            >
              {titleText}
            </text>
            {config.subtitle && (
              <text
                x={viewW / 2}
                y={55}
                textAnchor="middle"
                fontFamily="'DM Sans', system-ui, sans-serif"
                fontSize="13"
                fontWeight="500"
                fill={palette.mutedInk}
              >
                {config.subtitle}
              </text>
            )}
          </g>
        )}

        {/* Fret position inlays */}
        {Array.from({ length: fretCount }).map((_, idx) => {
          const absFret = config.baseFret + idx;
          if (!INLAY_FRETS.has(absFret)) return null;
          const cy = gridY + (idx + 0.5) * fretSpacing;
          if (absFret === 12) {
            return (
              <g key={`inlay-${absFret}`} opacity="0.16">
                <circle
                  cx={gridX + stringSpacing * 1.5}
                  cy={cy}
                  r="4.5"
                  fill={palette.mutedInk}
                />
                <circle
                  cx={gridX + stringSpacing * 3.5}
                  cy={cy}
                  r="4.5"
                  fill={palette.mutedInk}
                />
              </g>
            );
          }
          return (
            <circle
              key={`inlay-${absFret}`}
              cx={gridX + gridW / 2}
              cy={cy}
              r="4.5"
              fill={palette.mutedInk}
              opacity="0.14"
            />
          );
        })}

        {/* Nut or baseFret indicator */}
        {config.baseFret === 1 ? (
          <rect
            x={gridX - 1.5}
            y={gridY - 5}
            width={gridW + 3}
            height="6"
            rx="2"
            fill={palette.nut}
          />
        ) : (
          <g>
            <text
              x={gridX - 16}
              y={gridY + fretSpacing * 0.5 + 5}
              textAnchor="end"
              fontFamily="'IBM Plex Mono', monospace"
              fontSize="13.5"
              fontWeight="600"
              fill={palette.mutedInk}
            >
              {config.baseFret}fr
            </text>
            <line
              x1={gridX}
              y1={gridY}
              x2={gridX + gridW}
              y2={gridY}
              stroke={palette.gridLine}
              strokeWidth="1.8"
            />
          </g>
        )}

        {/* Horizontal fret wires */}
        {Array.from({ length: fretCount }).map((_, idx) => {
          const y = gridY + (idx + 1) * fretSpacing;
          return (
            <line
              key={`fret-${idx}`}
              x1={gridX}
              y1={y}
              x2={gridX + gridW}
              y2={y}
              stroke={palette.gridLine}
              strokeWidth="1.6"
            />
          );
        })}

        {/* Vertical string lines */}
        {verticalOrder.map((strIdx, colIdx) => {
          const x = gridX + colIdx * stringSpacing;
          const isRinging = activeStringIndex === strIdx;
          const strokeW = 1.2 + (5 - strIdx) * 0.2;
          return (
            <g key={`str-${strIdx}`}>
              {isRinging && (
                <line
                  x1={x}
                  y1={gridY - 4}
                  x2={x}
                  y2={gridY + gridH + 4}
                  stroke={accent}
                  strokeWidth="6"
                  strokeOpacity="0.32"
                  strokeLinecap="round"
                />
              )}
              <line
                x1={x}
                y1={gridY}
                x2={x}
                y2={gridY + gridH}
                stroke={isRinging ? accent : palette.ink}
                strokeOpacity={isRinging ? 1 : 0.72}
                strokeWidth={isRinging ? strokeW + 1 : strokeW}
              />
            </g>
          );
        })}

        {/* Barre Drag Preview */}
        {barreDrag &&
          (() => {
            const relFret = barreDrag.absFret - config.baseFret + 1;
            if (relFret < 1 || relFret > fretCount) return null;
            const c1 = verticalOrder.indexOf(barreDrag.startString);
            const c2 = verticalOrder.indexOf(barreDrag.endString);
            const x1 = gridX + Math.min(c1, c2) * stringSpacing - 12;
            const x2 = gridX + Math.max(c1, c2) * stringSpacing + 12;
            const cy = gridY + (relFret - 0.5) * fretSpacing;
            return (
              <rect
                x={x1}
                y={cy - 12}
                width={x2 - x1}
                height="24"
                rx="12"
                fill={accent}
                opacity="0.45"
                pointerEvents="none"
              />
            );
          })()}

        {/* Placed Barres */}
        {config.barres.map((barre) => {
          const relFret = barre.fret - config.baseFret + 1;
          if (relFret < 1 || relFret > fretCount) return null;
          const c1 = verticalOrder.indexOf(barre.fromString);
          const c2 = verticalOrder.indexOf(barre.toString);
          const x1 = gridX + Math.min(c1, c2) * stringSpacing - 12;
          const x2 = gridX + Math.max(c1, c2) * stringSpacing + 12;
          const cy = gridY + (relFret - 0.5) * fretSpacing;
          return (
            <g
              key={barre.id}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (fingerTool === 'erase' || fingerTool === 'barre') {
                  onRemoveBarre(barre.id);
                }
              }}
            >
              <rect
                x={x1}
                y={cy - 12}
                width={x2 - x1}
                height="24"
                rx="12"
                fill={accent}
              />
              {config.dotLabelMode === 'finger' && barre.finger && (
                <text
                  x={(x1 + x2) / 2}
                  y={cy + 4.5}
                  textAnchor="middle"
                  fontFamily="'DM Sans', system-ui, sans-serif"
                  fontSize="12.5"
                  fontWeight="700"
                  fill={palette.dotText}
                  pointerEvents="none"
                >
                  {barre.finger}
                </text>
              )}
            </g>
          );
        })}

        {/* Open / Muted Interactive Nut Buttons & Tuning Pluck Buttons */}
        {verticalOrder.map((strIdx, colIdx) => {
          const st = config.strings[strIdx];
          const cx = gridX + colIdx * stringSpacing;
          const markerY = gridY - 19;
          const openNote = detected.stringNotes[strIdx]?.openNoteName || '';

          return (
            <g key={`markers-${strIdx}`}>
              {/* Clickable Open / Mute Header */}
              <g
                className="cursor-pointer"
                onClick={() => onToggleOpenMute(strIdx)}
                role="button"
                tabIndex={0}
                aria-label={`Toggle string ${6 - strIdx} open or muted`}
              >
                <circle cx={cx} cy={markerY} r="13" fill="transparent" />
                {st.muted || st.fret === null ? (
                  <g
                    stroke={palette.mutedInk}
                    strokeWidth="2.1"
                    strokeLinecap="round"
                  >
                    <line
                      x1={cx - 5}
                      y1={markerY - 5}
                      x2={cx + 5}
                      y2={markerY + 5}
                    />
                    <line
                      x1={cx + 5}
                      y1={markerY - 5}
                      x2={cx - 5}
                      y2={markerY + 5}
                    />
                  </g>
                ) : st.fret === 0 ? (
                  <circle
                    cx={cx}
                    cy={markerY}
                    r="6"
                    fill="none"
                    stroke={palette.openStroke}
                    strokeWidth="2.1"
                  />
                ) : (
                  <circle
                    cx={cx}
                    cy={markerY}
                    r="2.5"
                    fill={palette.gridLine}
                    opacity="0.6"
                  />
                )}
              </g>

              {/* Clickable Tuning Label to Pluck Single String */}
              {config.showTuningLabels && (
                <g
                  className="cursor-pointer"
                  onClick={() => onPluckString(strIdx)}
                  role="button"
                  aria-label={`Pluck string ${6 - strIdx}`}
                >
                  <rect
                    x={cx - 14}
                    y={gridY + gridH + 5}
                    width="28"
                    height="22"
                    rx="4"
                    fill="transparent"
                  />
                  <text
                    x={cx}
                    y={gridY + gridH + 20}
                    textAnchor="middle"
                    fontFamily="'IBM Plex Mono', monospace"
                    fontSize="12"
                    fontWeight="600"
                    fill={activeStringIndex === strIdx ? accent : palette.mutedInk}
                  >
                    {openNote}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Interactive Fret Grid Cells & Finger Dots */}
        {verticalOrder.map((strIdx, colIdx) => {
          const st = config.strings[strIdx];
          const cx = gridX + colIdx * stringSpacing;

          return Array.from({ length: fretCount }).map((_, fIdx) => {
            const absFret = config.baseFret + fIdx;
            const cy = gridY + (fIdx + 0.5) * fretSpacing;
            const isPlaced = !st.muted && st.fret === absFret;
            const isHovered =
              hoverCell?.stringIndex === strIdx && hoverCell?.absFret === absFret;

            const isInsideBarre = config.barres.some((b) => {
              const lo = Math.min(b.fromString, b.toString);
              const hi = Math.max(b.fromString, b.toString);
              return b.fret === absFret && strIdx >= lo && strIdx <= hi;
            });

            const dotLabel = isPlaced
              ? getDiagramDotText(config, detected, strIdx)
              : '';

            return (
              <g
                key={`cell-${strIdx}-${absFret}`}
                className="cursor-pointer"
                onPointerDown={() => handlePointerDown(strIdx, absFret)}
                onPointerEnter={() => handlePointerEnter(strIdx, absFret)}
                onPointerUp={() => handlePointerUp(strIdx, absFret)}
              >
                <rect
                  x={cx - stringSpacing / 2}
                  y={cy - fretSpacing / 2}
                  width={stringSpacing}
                  height={fretSpacing}
                  fill="transparent"
                />

                {isHovered && !isPlaced && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill={accent}
                    opacity="0.22"
                    pointerEvents="none"
                  />
                )}

                {isPlaced &&
                  (!isInsideBarre ||
                    config.dotLabelMode === 'note' ||
                    config.dotLabelMode === 'interval') && (
                    <g pointerEvents="none">
                      <circle cx={cx} cy={cy} r="13" fill={accent} />
                      {dotLabel && (
                        <text
                          x={cx}
                          y={cy + 4.5}
                          textAnchor="middle"
                          fontFamily="'DM Sans', system-ui, sans-serif"
                          fontSize={dotLabel.length > 1 ? '11' : '13'}
                          fontWeight="700"
                          fill={palette.dotText}
                        >
                          {dotLabel}
                        </text>
                      )}
                    </g>
                  )}
              </g>
            );
          });
        })}

        {/* Notes / Interval Footer */}
        {config.showIntervalsFooter && detected.pitchClasses.length > 0 && (
          <text
            x={viewW / 2}
            y={gridY + gridH + (config.showTuningLabels ? 44 : 24)}
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="11.5"
            fontWeight="500"
            fill={palette.mutedInk}
          >
            {detected.stringNotes
              .filter((n) => !n.muted)
              .map((n) => n.noteName)
              .filter((v, i, a) => a.indexOf(v) === i)
              .join(' · ')}
          </text>
        )}
      </svg>
    );
  }

  // Horizontal Orientation Interactive Fretboard
  const viewW = 460;
  const headerH = config.showChordTitle ? (config.subtitle ? 68 : 48) : 18;
  const fretSpacing = 56;
  const stringSpacing = 30;
  const gridX = 78;
  const gridY = headerH + 18;
  const gridW = fretCount * fretSpacing;
  const gridH = 5 * stringSpacing;
  const footerSpace = config.showIntervalsFooter ? 42 : 24;
  const viewH = Math.round(gridY + gridH + footerSpace);

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className="w-full max-w-[500px] select-none touch-none rounded-xl border border-slate-200/80 shadow-sm transition-colors duration-150"
      style={{ backgroundColor: palette.bg }}
      onPointerLeave={() => {
        setHoverCell(null);
        setBarreDrag(null);
      }}
      role="application"
      aria-label="Interactive horizontal guitar chord fretboard"
    >
      {config.showChordTitle && (
        <g>
          <text
            x={viewW / 2}
            y={30}
            textAnchor="middle"
            fontFamily="'Outfit', 'DM Sans', system-ui, sans-serif"
            fontSize="24"
            fontWeight="700"
            fill={palette.ink}
          >
            {titleText}
          </text>
          {config.subtitle && (
            <text
              x={viewW / 2}
              y={50}
              textAnchor="middle"
              fontFamily="'DM Sans', system-ui, sans-serif"
              fontSize="12.5"
              fontWeight="500"
              fill={palette.mutedInk}
            >
              {config.subtitle}
            </text>
          )}
        </g>
      )}

      {/* Nut or baseFret */}
      {config.baseFret === 1 ? (
        <rect
          x={gridX - 5}
          y={gridY - 1}
          width="6"
          height={gridH + 2}
          rx="2"
          fill={palette.nut}
        />
      ) : (
        <g>
          <text
            x={gridX + fretSpacing * 0.5}
            y={gridY + gridH + 22}
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="12.5"
            fontWeight="600"
            fill={palette.mutedInk}
          >
            {config.baseFret}fr
          </text>
          <line
            x1={gridX}
            y1={gridY}
            x2={gridX}
            y2={gridY + gridH}
            stroke={palette.gridLine}
            strokeWidth="1.8"
          />
        </g>
      )}

      {/* Fret vertical wires */}
      {Array.from({ length: fretCount }).map((_, idx) => {
        const x = gridX + (idx + 1) * fretSpacing;
        return (
          <line
            key={`hfret-${idx}`}
            x1={x}
            y1={gridY}
            x2={x}
            y2={gridY + gridH}
            stroke={palette.gridLine}
            strokeWidth="1.5"
          />
        );
      })}

      {/* Horizontal strings */}
      {horizontalOrder.map((strIdx, rowIdx) => {
        const y = gridY + rowIdx * stringSpacing;
        const isRinging = activeStringIndex === strIdx;
        const strokeW = 1.2 + (5 - strIdx) * 0.2;
        return (
          <g key={`hstr-${strIdx}`}>
            {isRinging && (
              <line
                x1={gridX - 4}
                y1={y}
                x2={gridX + gridW + 4}
                y2={y}
                stroke={accent}
                strokeWidth="5"
                strokeOpacity="0.32"
                strokeLinecap="round"
              />
            )}
            <line
              x1={gridX}
              y1={y}
              x2={gridX + gridW}
              y2={y}
              stroke={isRinging ? accent : palette.ink}
              strokeOpacity={isRinging ? 1 : 0.72}
              strokeWidth={isRinging ? strokeW + 1 : strokeW}
            />
          </g>
        );
      })}

      {/* Barres */}
      {config.barres.map((barre) => {
        const relFret = barre.fret - config.baseFret + 1;
        if (relFret < 1 || relFret > fretCount) return null;
        const r1 = horizontalOrder.indexOf(barre.fromString);
        const r2 = horizontalOrder.indexOf(barre.toString);
        const y1 = gridY + Math.min(r1, r2) * stringSpacing - 11;
        const y2 = gridY + Math.max(r1, r2) * stringSpacing + 11;
        const cx = gridX + (relFret - 0.5) * fretSpacing;
        return (
          <g
            key={barre.id}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (fingerTool === 'erase' || fingerTool === 'barre') {
                onRemoveBarre(barre.id);
              }
            }}
          >
            <rect
              x={cx - 11}
              y={y1}
              width="22"
              height={y2 - y1}
              rx="11"
              fill={accent}
            />
          </g>
        );
      })}

      {/* Markers & Tuning Labels */}
      {horizontalOrder.map((strIdx, rowIdx) => {
        const st = config.strings[strIdx];
        const cy = gridY + rowIdx * stringSpacing;
        const markerX = gridX - 20;
        const openNote = detected.stringNotes[strIdx]?.openNoteName || '';

        return (
          <g key={`hmark-${strIdx}`}>
            {config.showTuningLabels && (
              <g
                className="cursor-pointer"
                onClick={() => onPluckString(strIdx)}
              >
                <text
                  x={gridX - 42}
                  y={cy + 4}
                  textAnchor="end"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize="11.5"
                  fontWeight="600"
                  fill={activeStringIndex === strIdx ? accent : palette.mutedInk}
                >
                  {openNote}
                </text>
              </g>
            )}
            <g
              className="cursor-pointer"
              onClick={() => onToggleOpenMute(strIdx)}
            >
              <circle cx={markerX} cy={cy} r="12" fill="transparent" />
              {st.muted || st.fret === null ? (
                <g
                  stroke={palette.mutedInk}
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line
                    x1={markerX - 4.5}
                    y1={cy - 4.5}
                    x2={markerX + 4.5}
                    y2={cy + 4.5}
                  />
                  <line
                    x1={markerX + 4.5}
                    y1={cy - 4.5}
                    x2={markerX - 4.5}
                    y2={cy + 4.5}
                  />
                </g>
              ) : st.fret === 0 ? (
                <circle
                  cx={markerX}
                  cy={cy}
                  r="5.5"
                  fill="none"
                  stroke={palette.openStroke}
                  strokeWidth="2"
                />
              ) : (
                <circle
                  cx={markerX}
                  cy={cy}
                  r="2.2"
                  fill={palette.gridLine}
                  opacity="0.6"
                />
              )}
            </g>
          </g>
        );
      })}

      {/* Interactive cells */}
      {horizontalOrder.map((strIdx, rowIdx) => {
        const st = config.strings[strIdx];
        const cy = gridY + rowIdx * stringSpacing;

        return Array.from({ length: fretCount }).map((_, fIdx) => {
          const absFret = config.baseFret + fIdx;
          const cx = gridX + (fIdx + 0.5) * fretSpacing;
          const isPlaced = !st.muted && st.fret === absFret;
          const isHovered =
            hoverCell?.stringIndex === strIdx && hoverCell?.absFret === absFret;
          const dotLabel = isPlaced
            ? getDiagramDotText(config, detected, strIdx)
            : '';

          return (
            <g
              key={`hcell-${strIdx}-${absFret}`}
              className="cursor-pointer"
              onPointerDown={() => handlePointerDown(strIdx, absFret)}
              onPointerEnter={() => handlePointerEnter(strIdx, absFret)}
              onPointerUp={() => handlePointerUp(strIdx, absFret)}
            >
              <rect
                x={cx - fretSpacing / 2}
                y={cy - stringSpacing / 2}
                width={fretSpacing}
                height={stringSpacing}
                fill="transparent"
              />
              {isHovered && !isPlaced && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="11"
                  fill={accent}
                  opacity="0.22"
                  pointerEvents="none"
                />
              )}
              {isPlaced && (
                <g pointerEvents="none">
                  <circle cx={cx} cy={cy} r="11.5" fill={accent} />
                  {dotLabel && (
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fontFamily="'DM Sans', system-ui, sans-serif"
                      fontSize={dotLabel.length > 1 ? '10' : '12'}
                      fontWeight="700"
                      fill={palette.dotText}
                    >
                      {dotLabel}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        });
      })}
    </svg>
  );
};
