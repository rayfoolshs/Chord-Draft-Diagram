import React from 'react';

export type WorkspaceView =
  | 'studio'
  | 'learn'
  | 'progression'
  | 'embed'
  | 'theory';

interface HeaderProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  onQuickExportSvg: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  onQuickExportSvg,
}) => {
  const navItems: { id: WorkspaceView; label: string }[] = [
    { id: 'studio', label: 'Diagram Studio' },
    { id: 'learn', label: 'Learn Chords' },
    { id: 'progression', label: 'Progression Sheet' },
    { id: 'embed', label: 'Developer Embed' },
    { id: 'theory', label: 'Theory Guide' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-3.5">
        <button
          type="button"
          onClick={() => onSelectView('studio')}
          className="font-display text-base lg:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded"
        >
          Chord Draft Diagram Make by Ray Foo
        </button>

        <nav
          aria-label="Primary workspace navigation"
          className="hidden lg:flex items-center gap-5"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded ${
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[15px] h-0.5 bg-sky-600 dark:bg-sky-400"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onQuickExportSvg}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Download SVG
          </button>
        </div>
      </div>

      {/* Mobile / Tablet secondary single-row nav */}
      <nav
        aria-label="Mobile navigation"
        className="flex lg:hidden items-center gap-4 overflow-x-auto border-t border-slate-100 px-4 py-2 dark:border-slate-800"
      >
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`text-xs font-medium whitespace-nowrap shrink-0 px-2 py-1 rounded ${
                isActive
                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
