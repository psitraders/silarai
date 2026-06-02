import { THEMES, useThemeStore } from '../../store/theme.store';
import { Palette } from 'lucide-react';
import { useState } from 'react';

export function ThemeSwitcher() {
  const { themeId, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 w-full"
        title="Change theme"
      >
        <Palette className="w-4 h-4" />
        <span>Theme</span>
        <div
          className="w-3 h-3 rounded-full ml-auto border border-white shadow-sm"
          style={{ backgroundColor: THEMES.find(t => t.id === themeId)?.primary }}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 z-20 bg-white rounded-xl shadow-lg border border-slate-100 p-3 w-44">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Pick a theme</p>
            <div className="space-y-0.5">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => { setTheme(theme.id); setOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm text-left"
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 shrink-0 shadow-sm"
                    style={{
                      backgroundColor: theme.primary,
                      borderColor: themeId === theme.id ? theme.primaryDark : 'transparent',
                      boxShadow: themeId === theme.id ? `0 0 0 2px ${theme.primaryBg}` : undefined,
                    }}
                  />
                  <span className={themeId === theme.id ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                    {theme.name}
                  </span>
                  {themeId === theme.id && (
                    <span className="ml-auto text-xs" style={{ color: theme.primary }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
