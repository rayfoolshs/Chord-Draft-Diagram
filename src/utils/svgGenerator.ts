import {
  ChordDiagramConfig,
  DetectedChord,
  DiagramThemeId,
} from '../types/chord';

export interface DiagramThemePalette {
  id: DiagramThemeId;
  name: string;
  bg: string;
  ink: string;
  mutedInk: string;
  gridLine: string;
  nut: string;
  dotText: string;
  openStroke: string;
}

export const DIAGRAM_THEMES: Record<DiagramThemeId, DiagramThemePalette> = {
  classic: {
    id: 'classic',
    name: 'Classic Print',
    bg: '#FFFFFF',
    ink: '#0F172A',
    mutedInk: '#64748B',
    gridLine: '#CBD5E1',
    nut: '#0F172A',
    dotText: '#FFFFFF',
    openStroke: '#0F172A',
  },
  parchment: {
    id: 'parchment',
    name: 'Sheet Parchment',
    bg: '#FAF8F5',
    ink: '#1C1917',
    mutedInk: '#78716C',
    gridLine: '#D6D3D1',
    nut: '#1C1917',
    dotText: '#FFFFFF',
    openStroke: '#1C1917',
  },
  slate: {
    id: 'slate',
    name: 'Studio Dark',
    bg: '#0F172A',
    ink: '#F8FAFC',
    mutedInk: '#94A3B8',
    gridLine: '#334155',
    nut: '#F8FAFC',
    dotText: '#FFFFFF',
    openStroke: '#F8FAFC',
  },
  cobalt: {
    id: 'cobalt',
    name: 'Blueprint',
    bg: '#F0F7FF',
    ink: '#0C2340',
    mutedInk: '#475569',
    gridLine: '#BFDBFE',
    nut: '#0C2340',
    dotText: '#FFFFFF',
    openStroke: '#0C2340',
  },
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function getDiagramDotText(
  config: ChordDiagramConfig,
  detected: DetectedChord,
  stringIndex: number
): string {
  if (config.dotLabelMode === 'none') return '';
  if (config.dotLabelMode === 'finger') return config.strings[stringIndex].finger;
  if (config.dotLabelMode === 'note') return detected.stringNotes[stringIndex]?.noteName || '';
  if (config.dotLabelMode === 'interval') return detected.stringNotes[stringIndex]?.interval || '';
  return '';
}

export function generateChordSvgString(
  config: ChordDiagramConfig,
  detected: DetectedChord,
  options?: { transparentBg?: boolean; width?: number }
): string {
  const palette = DIAGRAM_THEMES[config.theme];
  const transparentBg = options?.transparentBg ?? false;
  const accent = config.accentColor || '#0284C7';
  const isHoriz = config.orientation === 'horizontal';
  const fretCount = config.fretCount;

  // String display order: right-handed [0..5] left-to-right (vertical) or top-to-bottom [5..0] (horizontal)
  const verticalOrder =
    config.handedness === 'right' ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0];
  // Horizontal standard tab view: high E (5) at top, low E (0) at bottom
  const horizontalOrder =
    config.handedness === 'right' ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];

  const titleText = config.syncTitleWithDetected
    ? detected.shortName === '—'
      ? config.title || 'Chord'
      : detected.shortName
    : config.title || detected.shortName;

  if (!isHoriz) {
    const viewW = 280;
    const headerH = config.showChordTitle ? (config.subtitle ? 64 : 48) : 16;
    const openMarkerSpace = 28;
    const fretSpacing = 36;
    const gridH = fretCount * fretSpacing;
    const tuningSpace = config.showTuningLabels ? 24 : 8;
    const footerSpace = config.showIntervalsFooter ? 26 : 8;
    const viewH = Math.round(headerH + openMarkerSpace + gridH + tuningSpace + footerSpace);

    const gridX = 52;
    const stringSpacing = 35;
    const gridW = stringSpacing * 5;
    const gridY = headerH + openMarkerSpace;

    const parts: string[] = [];
    const targetW = options?.width || viewW;
    const targetH = Math.round((targetW / viewW) * viewH);

    parts.push(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${targetW}" height="${targetH}" viewBox="0 0 ${viewW} ${viewH}" role="img" aria-label="${escapeXml(titleText)} guitar chord diagram">`
    );

    if (!transparentBg) {
      parts.push(`<rect width="${viewW}" height="${viewH}" rx="12" fill="${palette.bg}" />`);
    }

    if (config.showChordTitle) {
      parts.push(
        `<text x="${viewW / 2}" y="30" text-anchor="middle" font-family="'Outfit', 'DM Sans', system-ui, sans-serif" font-size="24" font-weight="700" fill="${palette.ink}">${escapeXml(titleText)}</text>`
      );
      if (config.subtitle) {
        parts.push(
          `<text x="${viewW / 2}" y="49" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="500" fill="${palette.mutedInk}">${escapeXml(config.subtitle)}</text>`
        );
      }
    }

    // Nut or baseFret indicator
    if (config.baseFret === 1) {
      parts.push(
        `<rect x="${gridX - 1}" y="${gridY - 4}" width="${gridW + 2}" height="5" rx="1.5" fill="${palette.nut}" />`
      );
    } else {
      parts.push(
        `<text x="${gridX - 14}" y="${gridY + fretSpacing * 0.5 + 4}" text-anchor="end" font-family="'IBM Plex Mono', monospace" font-size="12" font-weight="600" fill="${palette.mutedInk}">${config.baseFret}fr</text>`
      );
      parts.push(
        `<line x1="${gridX}" y1="${gridY}" x2="${gridX + gridW}" y2="${gridY}" stroke="${palette.gridLine}" stroke-width="1.5" />`
      );
    }

    // Horizontal fret lines
    for (let f = 1; f <= fretCount; f++) {
      const y = gridY + f * fretSpacing;
      parts.push(
        `<line x1="${gridX}" y1="${y}" x2="${gridX + gridW}" y2="${y}" stroke="${palette.gridLine}" stroke-width="1.4" />`
      );
    }

    // Vertical string lines (slightly thicker on bass strings)
    verticalOrder.forEach((strIdx, colIdx) => {
      const x = gridX + colIdx * stringSpacing;
      const strokeW = 1.1 + (5 - strIdx) * 0.16;
      parts.push(
        `<line x1="${x}" y1="${gridY}" x2="${x}" y2="${gridY + gridH}" stroke="${palette.ink}" stroke-opacity="0.72" stroke-width="${strokeW.toFixed(2)}" />`
      );
    });

    // Barres
    config.barres.forEach((barre) => {
      const relFret = barre.fret - config.baseFret + 1;
      if (relFret < 1 || relFret > fretCount) return;
      const colA = verticalOrder.indexOf(barre.fromString);
      const colB = verticalOrder.indexOf(barre.toString);
      const minCol = Math.min(colA, colB);
      const maxCol = Math.max(colA, colB);
      const x1 = gridX + minCol * stringSpacing - 10;
      const x2 = gridX + maxCol * stringSpacing + 10;
      const cy = gridY + (relFret - 0.5) * fretSpacing;
      parts.push(
        `<rect x="${x1}" y="${cy - 10}" width="${x2 - x1}" height="20" rx="10" fill="${accent}" />`
      );
      if (config.dotLabelMode === 'finger' && barre.finger) {
        parts.push(
          `<text x="${(x1 + x2) / 2}" y="${cy + 4}" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="${palette.dotText}">${escapeXml(barre.finger)}</text>`
        );
      }
    });

    // Open/Muted markers & finger dots
    verticalOrder.forEach((strIdx, colIdx) => {
      const st = config.strings[strIdx];
      const cx = gridX + colIdx * stringSpacing;
      const markerY = gridY - 14;

      if (st.muted || st.fret === null) {
        const r = 4.5;
        parts.push(
          `<g stroke="${palette.mutedInk}" stroke-width="1.8" stroke-linecap="round"><line x1="${cx - r}" y1="${markerY - r}" x2="${cx + r}" y2="${markerY + r}" /><line x1="${cx + r}" y1="${markerY - r}" x2="${cx - r}" y2="${markerY + r}" /></g>`
        );
      } else if (st.fret === 0) {
        parts.push(
          `<circle cx="${cx}" cy="${markerY}" r="5" fill="none" stroke="${palette.openStroke}" stroke-width="1.8" />`
        );
      } else {
        const relFret = st.fret - config.baseFret + 1;
        if (relFret >= 1 && relFret <= fretCount) {
          const isInsideBarre = config.barres.some((b) => {
            const lo = Math.min(b.fromString, b.toString);
            const hi = Math.max(b.fromString, b.toString);
            return b.fret === st.fret && strIdx >= lo && strIdx <= hi;
          });
          const cy = gridY + (relFret - 0.5) * fretSpacing;
          const label = getDiagramDotText(config, detected, strIdx);

          if (!isInsideBarre || config.dotLabelMode === 'note' || config.dotLabelMode === 'interval') {
            parts.push(
              `<circle cx="${cx}" cy="${cy}" r="11" fill="${accent}" />`
            );
            if (label) {
              parts.push(
                `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="${label.length > 1 ? '10' : '11.5'}" font-weight="700" fill="${palette.dotText}">${escapeXml(label)}</text>`
              );
            }
          }
        }
      }

      if (config.showTuningLabels) {
        const openNote = detected.stringNotes[strIdx]?.openNoteName || '';
        parts.push(
          `<text x="${cx}" y="${gridY + gridH + 17}" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="10.5" font-weight="500" fill="${palette.mutedInk}">${escapeXml(openNote)}</text>`
        );
      }
    });

    if (config.showIntervalsFooter && detected.pitchClasses.length > 0) {
      const footerY = gridY + gridH + (config.showTuningLabels ? 36 : 20);
      const summary = detected.stringNotes
        .filter((n) => !n.muted)
        .map((n) => n.noteName)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(' · ');
      parts.push(
        `<text x="${viewW / 2}" y="${footerY}" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="10.5" font-weight="500" fill="${palette.mutedInk}">${escapeXml(summary)}</text>`
      );
    }

    parts.push('</svg>');
    return parts.join('');
  }

  // Horizontal Orientation
  const viewW = 360;
  const headerH = config.showChordTitle ? (config.subtitle ? 58 : 42) : 16;
  const fretSpacing = 44;
  const stringSpacing = 24;
  const gridX = 56;
  const gridY = headerH + 14;
  const gridW = fretCount * fretSpacing;
  const gridH = 5 * stringSpacing;
  const footerSpace = config.showIntervalsFooter ? 34 : 18;
  const viewH = Math.round(gridY + gridH + footerSpace);

  const targetW = options?.width || viewW;
  const targetH = Math.round((targetW / viewW) * viewH);
  const parts: string[] = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${targetW}" height="${targetH}" viewBox="0 0 ${viewW} ${viewH}" role="img" aria-label="${escapeXml(titleText)} horizontal guitar chord diagram">`
  );

  if (!transparentBg) {
    parts.push(`<rect width="${viewW}" height="${viewH}" rx="12" fill="${palette.bg}" />`);
  }

  if (config.showChordTitle) {
    parts.push(
      `<text x="${viewW / 2}" y="28" text-anchor="middle" font-family="'Outfit', 'DM Sans', system-ui, sans-serif" font-size="22" font-weight="700" fill="${palette.ink}">${escapeXml(titleText)}</text>`
    );
    if (config.subtitle) {
      parts.push(
        `<text x="${viewW / 2}" y="45" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11.5" font-weight="500" fill="${palette.mutedInk}">${escapeXml(config.subtitle)}</text>`
      );
    }
  }

  // Nut or base fret
  if (config.baseFret === 1) {
    parts.push(
      `<rect x="${gridX - 4}" y="${gridY - 1}" width="5" height="${gridH + 2}" rx="1.5" fill="${palette.nut}" />`
    );
  } else {
    parts.push(
      `<text x="${gridX + fretSpacing * 0.5}" y="${gridY + gridH + 18}" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="11.5" font-weight="600" fill="${palette.mutedInk}">${config.baseFret}fr</text>`
    );
    parts.push(
      `<line x1="${gridX}" y1="${gridY}" x2="${gridX}" y2="${gridY + gridH}" stroke="${palette.gridLine}" stroke-width="1.5" />`
    );
  }

  // Fret vertical lines
  for (let f = 1; f <= fretCount; f++) {
    const x = gridX + f * fretSpacing;
    parts.push(
      `<line x1="${x}" y1="${gridY}" x2="${x}" y2="${gridY + gridH}" stroke="${palette.gridLine}" stroke-width="1.4" />`
    );
  }

  // Horizontal strings
  horizontalOrder.forEach((strIdx, rowIdx) => {
    const y = gridY + rowIdx * stringSpacing;
    const strokeW = 1.1 + (5 - strIdx) * 0.16;
    parts.push(
      `<line x1="${gridX}" y1="${y}" x2="${gridX + gridW}" y2="${y}" stroke="${palette.ink}" stroke-opacity="0.72" stroke-width="${strokeW.toFixed(2)}" />`
    );
  });

  // Barres
  config.barres.forEach((barre) => {
    const relFret = barre.fret - config.baseFret + 1;
    if (relFret < 1 || relFret > fretCount) return;
    const rowA = horizontalOrder.indexOf(barre.fromString);
    const rowB = horizontalOrder.indexOf(barre.toString);
    const minRow = Math.min(rowA, rowB);
    const maxRow = Math.max(rowA, rowB);
    const y1 = gridY + minRow * stringSpacing - 9;
    const y2 = gridY + maxRow * stringSpacing + 9;
    const cx = gridX + (relFret - 0.5) * fretSpacing;
    parts.push(
      `<rect x="${cx - 9}" y="${y1}" width="18" height="${y2 - y1}" rx="9" fill="${accent}" />`
    );
  });

  // Markers & dots
  horizontalOrder.forEach((strIdx, rowIdx) => {
    const st = config.strings[strIdx];
    const cy = gridY + rowIdx * stringSpacing;
    const markerX = gridX - 16;

    if (config.showTuningLabels) {
      const openNote = detected.stringNotes[strIdx]?.openNoteName || '';
      parts.push(
        `<text x="${gridX - 34}" y="${cy + 3.5}" text-anchor="end" font-family="'IBM Plex Mono', monospace" font-size="10" font-weight="500" fill="${palette.mutedInk}">${escapeXml(openNote)}</text>`
      );
    }

    if (st.muted || st.fret === null) {
      const r = 4;
      parts.push(
        `<g stroke="${palette.mutedInk}" stroke-width="1.7" stroke-linecap="round"><line x1="${markerX - r}" y1="${cy - r}" x2="${markerX + r}" y2="${cy + r}" /><line x1="${markerX + r}" y1="${cy - r}" x2="${markerX - r}" y2="${cy + r}" /></g>`
      );
    } else if (st.fret === 0) {
      parts.push(
        `<circle cx="${markerX}" cy="${cy}" r="4.5" fill="none" stroke="${palette.openStroke}" stroke-width="1.7" />`
      );
    } else {
      const relFret = st.fret - config.baseFret + 1;
      if (relFret >= 1 && relFret <= fretCount) {
        const cx = gridX + (relFret - 0.5) * fretSpacing;
        const label = getDiagramDotText(config, detected, strIdx);
        parts.push(`<circle cx="${cx}" cy="${cy}" r="10" fill="${accent}" />`);
        if (label) {
          parts.push(
            `<text x="${cx}" y="${cy + 3.5}" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="${label.length > 1 ? '9.5' : '11'}" font-weight="700" fill="${palette.dotText}">${escapeXml(label)}</text>`
          );
        }
      }
    }
  });

  parts.push('</svg>');
  return parts.join('');
}

export async function svgToPngBlob(
  svgString: string,
  scale = 3
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgEl = doc.documentElement;
    const w = parseInt(svgEl.getAttribute('width') || '280', 10);
    const h = parseInt(svgEl.getAttribute('height') || '300', 10);

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) resolve(pngBlob);
        else reject(new Error('Failed to encode PNG'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to rasterize SVG'));
    };
    img.src = url;
  });
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
