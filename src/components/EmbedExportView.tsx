import React, { useMemo, useState } from 'react';
import { Check, Code2, Copy, Download, FileImage, FileCode } from 'lucide-react';
import { ChordDiagramConfig, DetectedChord } from '../types/chord';
import {
  generateChordSvgString,
  svgToPngBlob,
  triggerDownload,
} from '../utils/svgGenerator';
import {
  generateJsonSpec,
  generateVanillaJsEmbedSnippet,
} from '../utils/embedGenerator';

interface EmbedExportViewProps {
  config: ChordDiagramConfig;
  detected: DetectedChord;
  compact?: boolean;
}

export const EmbedExportView: React.FC<EmbedExportViewProps> = ({
  config,
  detected,
  compact = false,
}) => {
  const [transparentPng, setTransparentPng] = useState(false);
  const [pngScale, setPngScale] = useState<2 | 3 | 4>(3);
  const [exportTab, setExportTab] = useState<'vanilla' | 'svg' | 'json'>(
    'vanilla'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const svgMarkup = useMemo(
    () =>
      generateChordSvgString(config, detected, {
        transparentBg: transparentPng,
      }),
    [config, detected, transparentPng]
  );

  const vanillaSnippet = useMemo(
    () => generateVanillaJsEmbedSnippet(config, detected),
    [config, detected]
  );

  const jsonSpec = useMemo(
    () => generateJsonSpec(config, detected),
    [config, detected]
  );

  const safeSlug = (
    (config.syncTitleWithDetected ? detected.shortName : config.title) ||
    'chord-diagram'
  )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgMarkup], {
      type: 'image/svg+xml;charset=utf-8',
    });
    triggerDownload(blob, `${safeSlug || 'chord'}.svg`);
  };

  const handleDownloadPng = async () => {
    try {
      setIsExporting(true);
      const blob = await svgToPngBlob(svgMarkup, pngScale);
      triggerDownload(blob, `${safeSlug || 'chord'}-${pngScale}x.png`);
    } finally {
      setIsExporting(false);
    }
  };

  const codeToDisplay =
    exportTab === 'vanilla'
      ? vanillaSnippet
      : exportTab === 'svg'
        ? svgMarkup
        : jsonSpec;

  if (compact) {
    return (
      <div className="space-y-5">
        <div className="space-y-2.5">
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            Raster &amp; Vector Downloads
          </span>

          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={transparentPng}
              onChange={(e) => setTransparentPng(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-600 dark:border-slate-600 dark:bg-slate-800"
            />
            Transparent background
          </label>

          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 dark:text-slate-300">
              PNG Resolution
            </span>
            <div className="flex gap-1 rounded-md bg-slate-100 p-0.5 dark:bg-slate-800">
              {([2, 3, 4] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPngScale(s)}
                  className={`rounded px-2 py-1 font-mono text-xs ${
                    pngScale === s
                      ? 'bg-white font-semibold text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 whitespace-nowrap"
            >
              <FileImage className="h-3.5 w-3.5" />
              {isExporting ? 'Rendering...' : 'Download PNG'}
            </button>
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              Download SVG
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-2.5 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Developer Embed &amp; Code
            </span>
            <button
              type="button"
              onClick={() => handleCopy(exportTab, codeToDisplay)}
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300"
            >
              {copiedKey === exportTab ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(
              [
                { id: 'vanilla', label: 'Vanilla JS' },
                { id: 'svg', label: 'Inline SVG' },
                { id: 'json', label: 'JSON' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setExportTab(t.id)}
                className={`rounded-md py-1 text-xs font-medium whitespace-nowrap ${
                  exportTab === t.id
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <pre className="max-h-56 overflow-auto rounded-lg border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-100 dark:border-slate-700 dark:bg-slate-950">
            {codeToDisplay}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
            Web Integration &amp; Print Assets
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Export &amp; Vanilla JS Embed Studio
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Download crisp vector SVGs and high-DPI PNGs for worksheets, or copy the zero-dependency Vanilla JS embed snippet to render diagrams dynamically inside any music education site or LMS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 whitespace-nowrap"
          >
            <FileImage className="h-4 w-4" />
            {isExporting ? 'Rendering PNG...' : `Download ${pngScale}× PNG`}
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            Download SVG
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Live Preview & Download Settings */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-6 space-y-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Output Preview
            </h2>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {detected.shortName}
            </span>
          </div>

          <div
            className={`flex justify-center rounded-lg border border-slate-200 p-6 dark:border-slate-700 ${
              transparentPng
                ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px]'
                : 'bg-slate-50 dark:bg-slate-800/60'
            }`}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />

          <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={transparentPng}
                onChange={(e) => setTransparentPng(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-600 dark:border-slate-600 dark:bg-slate-800"
              />
              Transparent PNG / SVG background
            </label>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                PNG Retina Scale
              </span>
              <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                {([2, 3, 4] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPngScale(s)}
                    className={`rounded-md px-3 py-1 font-mono text-xs font-medium ${
                      pngScale === s
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Code Integration Panel */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setExportTab('vanilla')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium whitespace-nowrap ${
                  exportTab === 'vanilla'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Vanilla JS Widget
              </button>
              <button
                type="button"
                onClick={() => setExportTab('svg')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium whitespace-nowrap ${
                  exportTab === 'svg'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                Inline SVG Markup
              </button>
              <button
                type="button"
                onClick={() => setExportTab('json')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium whitespace-nowrap ${
                  exportTab === 'json'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Chord JSON Spec
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(exportTab, codeToDisplay)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 whitespace-nowrap"
            >
              {copiedKey === exportTab ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Snippet
                </>
              )}
            </button>
          </div>

          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {exportTab === 'vanilla'
              ? 'Paste this self-contained HTML + Vanilla JS block into any webpage, blog post, or LMS lesson. Multiple .fretdraft-chord elements on a single page are rendered automatically with zero dependencies.'
              : exportTab === 'svg'
                ? 'Standalone vector SVG markup with embedded typography and crisp geometry, ready for inline HTML or vector editors.'
                : 'Structured JSON representation including detected chord formula, MIDI pitches, fingerings, and barre coordinates.'}
          </p>

          <pre className="max-h-[480px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100 dark:border-slate-800">
            {codeToDisplay}
          </pre>
        </div>
      </div>
    </div>
  );
};
