import { ChordDiagramConfig, DetectedChord } from '../types/chord';
import { DIAGRAM_THEMES } from './svgGenerator';

export function serializeFretsAttr(config: ChordDiagramConfig): string {
  return config.strings
    .map((s) => (s.muted || s.fret === null ? 'x' : String(s.fret)))
    .join(',');
}

export function serializeFingersAttr(config: ChordDiagramConfig): string {
  return config.strings.map((s) => s.finger || '').join(',');
}

/**
 * Generates a zero-dependency Vanilla JS web widget snippet that web developers
 * can drop into any HTML page, blog, or music education LMS to render the exact diagram.
 */
export function generateVanillaJsEmbedSnippet(
  config: ChordDiagramConfig,
  detected: DetectedChord
): string {
  const title = config.syncTitleWithDetected
    ? detected.shortName === '—'
      ? config.title
      : detected.shortName
    : config.title;
  const fretsAttr = serializeFretsAttr(config);
  const fingersAttr = serializeFingersAttr(config);
  const barresAttr = config.barres
    .map((b) => `${b.fret}:${b.fromString}-${b.toString}`)
    .join(',');
  const palette = DIAGRAM_THEMES[config.theme];

  return `<!-- Chord Draft Diagram Make by Ray Foo — Vanilla JS Chord Widget -->
<div
  class="fretdraft-chord"
  data-title="${title.replace(/"/g, '&quot;')}"
  data-frets="${fretsAttr}"
  data-fingers="${fingersAttr}"
  data-base-fret="${config.baseFret}"
  data-fret-count="${config.fretCount}"
  data-barres="${barresAttr}"
  data-handedness="${config.handedness}"
  data-accent="${config.accentColor}"
  data-bg="${palette.bg}"
  data-ink="${palette.ink}"
></div>

<script>
(function () {
  function renderChordEl(el) {
    if (el.dataset.rendered) return;
    el.dataset.rendered = "1";
    var title = el.getAttribute("data-title") || "";
    var frets = (el.getAttribute("data-frets") || "x,x,x,x,x,x").split(",");
    var fingers = (el.getAttribute("data-fingers") || ",,,,,").split(",");
    var baseFret = parseInt(el.getAttribute("data-base-fret") || "1", 10);
    var fretCount = parseInt(el.getAttribute("data-fret-count") || "5", 10);
    var handed = el.getAttribute("data-handedness") || "right";
    var accent = el.getAttribute("data-accent") || "#0284C7";
    var bg = el.getAttribute("data-bg") || "#FFFFFF";
    var ink = el.getAttribute("data-ink") || "#0F172A";
    var barresRaw = el.getAttribute("data-barres") || "";

    var order = handed === "left" ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];
    var w = 240, gridX = 46, gridY = 64, ss = 30, fs = 32;
    var gridW = ss * 5, gridH = fs * fretCount, h = gridY + gridH + 22;

    var svg = [];
    svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">');
    svg.push('<rect width="' + w + '" height="' + h + '" rx="10" fill="' + bg + '"/>');
    if (title) {
      svg.push('<text x="' + (w / 2) + '" y="28" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="700" fill="' + ink + '">' + title + '</text>');
    }
    if (baseFret === 1) {
      svg.push('<rect x="' + (gridX - 1) + '" y="' + (gridY - 4) + '" width="' + (gridW + 2) + '" height="5" rx="1.5" fill="' + ink + '"/>');
    } else {
      svg.push('<text x="' + (gridX - 10) + '" y="' + (gridY + fs * 0.5 + 4) + '" text-anchor="end" font-family="monospace" font-size="11" font-weight="600" fill="' + ink + '" opacity="0.7">' + baseFret + 'fr</text>');
      svg.push('<line x1="' + gridX + '" y1="' + gridY + '" x2="' + (gridX + gridW) + '" y2="' + gridY + '" stroke="' + ink + '" stroke-opacity="0.25" stroke-width="1.4"/>');
    }
    for (var f = 1; f <= fretCount; f++) {
      var fy = gridY + f * fs;
      svg.push('<line x1="' + gridX + '" y1="' + fy + '" x2="' + (gridX + gridW) + '" y2="' + fy + '" stroke="' + ink + '" stroke-opacity="0.22" stroke-width="1.2"/>');
    }
    for (var c = 0; c < 6; c++) {
      var sx = gridX + c * ss;
      svg.push('<line x1="' + sx + '" y1="' + gridY + '" x2="' + sx + '" y2="' + (gridY + gridH) + '" stroke="' + ink + '" stroke-opacity="0.7" stroke-width="1.4"/>');
    }
    if (barresRaw) {
      barresRaw.split(",").forEach(function (b) {
        var p = b.split(":");
        if (p.length !== 2) return;
        var bf = parseInt(p[0], 10) - baseFret + 1;
        var ab = p[1].split("-").map(Number);
        if (bf >= 1 && bf <= fretCount) {
          var c1 = order.indexOf(ab[0]), c2 = order.indexOf(ab[1]);
          var x1 = gridX + Math.min(c1, c2) * ss - 9;
          var x2 = gridX + Math.max(c1, c2) * ss + 9;
          var cy = gridY + (bf - 0.5) * fs;
          svg.push('<rect x="' + x1 + '" y="' + (cy - 9) + '" width="' + (x2 - x1) + '" height="18" rx="9" fill="' + accent + '"/>');
        }
      });
    }
    order.forEach(function (idx, col) {
      var val = frets[idx];
      var cx = gridX + col * ss;
      var my = gridY - 12;
      if (val === "x" || val === "X" || val === "") {
        svg.push('<path d="M' + (cx - 4) + ' ' + (my - 4) + 'L' + (cx + 4) + ' ' + (my + 4) + 'M' + (cx + 4) + ' ' + (my - 4) + 'L' + (cx - 4) + ' ' + (my + 4) + '" stroke="' + ink + '" stroke-opacity="0.55" stroke-width="1.6" stroke-linecap="round"/>');
      } else if (val === "0") {
        svg.push('<circle cx="' + cx + '" cy="' + my + '" r="4.5" fill="none" stroke="' + ink + '" stroke-width="1.6"/>');
      } else {
        var rel = parseInt(val, 10) - baseFret + 1;
        if (rel >= 1 && rel <= fretCount) {
          var cy = gridY + (rel - 0.5) * fs;
          svg.push('<circle cx="' + cx + '" cy="' + cy + '" r="9.5" fill="' + accent + '"/>');
          if (fingers[idx]) {
            svg.push('<text x="' + cx + '" y="' + (cy + 3.5) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="700" fill="#fff">' + fingers[idx] + '</text>');
          }
        }
      }
    });
    svg.push("</svg>");
    el.innerHTML = svg.join("");
  }
  document.querySelectorAll(".fretdraft-chord").forEach(renderChordEl);
})();
</script>`;
}

export function generateJsonSpec(
  config: ChordDiagramConfig,
  detected: DetectedChord
): string {
  const payload = {
    title: config.syncTitleWithDetected ? detected.shortName : config.title,
    detectedChord: detected.name,
    formula: detected.formula,
    baseFret: config.baseFret,
    fretCount: config.fretCount,
    tuningMidi: config.customTuningMidi,
    strings: config.strings.map((s, idx) => ({
      string: 6 - idx,
      fret: s.muted ? 'x' : s.fret,
      finger: s.finger || null,
      note: detected.stringNotes[idx]?.noteWithOctave || null,
    })),
    barres: config.barres.map((b) => ({
      fret: b.fret,
      fromString: b.fromString,
      toString: b.toString,
      finger: b.finger || null,
    })),
  };
  return JSON.stringify(payload, null, 2);
}
