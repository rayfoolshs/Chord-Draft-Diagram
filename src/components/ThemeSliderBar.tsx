import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeSliderBarProps {
  themeLevel: number; // 0 (Bright Light) to 100 (Deep Dark)
  onChangeThemeLevel: (level: number) => void;
}

export const ThemeSliderBar: React.FC<ThemeSliderBarProps> = ({
  themeLevel,
  onChangeThemeLevel,
}) => {
  const isDark = themeLevel >= 50;
  const modeLabel =
    themeLevel < 25
      ? 'Daylight'
      : themeLevel < 50
        ? 'Soft Paper'
        : themeLevel < 75
          ? 'Dusk Slate'
          : 'Studio Dark';

  return (
    <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/70">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Workspace Luminance
          <span aria-hidden="true"> · </span>
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {modeLabel}
          </span>
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChangeThemeLevel(0)}
            aria-label="Set full light mode"
            className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs font-medium transition-colors whitespace-nowrap ${
              !isDark
                ? 'text-slate-900 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            Light
          </button>

          <div className="relative flex items-center">
            <label htmlFor="light-dark-slider" className="sr-only">
              Light to Dark Mode Slider
            </label>
            <input
              id="light-dark-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={themeLevel}
              onChange={(e) => onChangeThemeLevel(Number(e.target.value))}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={themeLevel}
              aria-valuetext={`${modeLabel} (${themeLevel}%)`}
              className="h-2 w-40 cursor-pointer appearance-none rounded-full bg-gradient-to-r from-slate-200 via-slate-400 to-slate-800 accent-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:from-slate-300 dark:via-slate-600 dark:to-slate-950"
            />
          </div>

          <button
            type="button"
            onClick={() => onChangeThemeLevel(100)}
            aria-label="Set full dark mode"
            className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs font-medium transition-colors whitespace-nowrap ${
              isDark
                ? 'text-slate-900 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            Dark
          </button>

          <span className="w-9 text-right font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
            {themeLevel}%
          </span>
        </div>
      </div>
    </div>
  );
};
