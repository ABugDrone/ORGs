// ── Theme Engine ──────────────────────────────────────────────────────────────

export type ThemeId =
  | 'default'
  | 'dark'
  | 'win11'
  | 'macos'
  | 'win7'
  | 'vista'
  | 'winxp'
  | 'win95'
  | 'neon'
  | 'glass';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  preview: string; // CSS gradient or color for preview swatch
  dark: boolean;
  vars: Record<string, string>;
  bodyClass?: string; // extra class on <body> for special effects
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'default',
    name: 'ORGs Light',
    description: 'Clean light theme',
    preview: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    dark: false,
    vars: {
      '--background': '210 20% 98%',
      '--foreground': '222 47% 11%',
      '--card': '0 0% 100%',
      '--card-foreground': '222 47% 11%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '222 47% 11%',
      '--secondary': '210 20% 95%',
      '--secondary-foreground': '222 47% 11%',
      '--muted': '210 20% 95%',
      '--muted-foreground': '215 16% 47%',
      '--border': '214 32% 91%',
      '--input': '214 32% 91%',
      '--sidebar-background': '222 47% 11%',
      '--sidebar-foreground': '210 20% 90%',
      '--sidebar-accent': '222 47% 16%',
      '--sidebar-border': '222 30% 18%',
    },
  },
  {
    id: 'dark',
    name: 'ORGs Dark',
    description: 'Deep dark theme',
    preview: 'linear-gradient(135deg, #0d1117, #161b22)',
    dark: true,
    vars: {
      '--background': '220 40% 8%',
      '--foreground': '210 20% 95%',
      '--card': '220 40% 11%',
      '--card-foreground': '210 20% 95%',
      '--popover': '220 40% 11%',
      '--popover-foreground': '210 20% 95%',
      '--secondary': '220 30% 16%',
      '--secondary-foreground': '210 20% 90%',
      '--muted': '220 30% 16%',
      '--muted-foreground': '215 16% 55%',
      '--border': '220 30% 18%',
      '--input': '220 30% 18%',
      '--sidebar-background': '220 45% 6%',
      '--sidebar-foreground': '210 20% 88%',
      '--sidebar-accent': '220 40% 12%',
      '--sidebar-border': '220 35% 14%',
    },
  },
  {
    id: 'win11',
    name: 'Windows 11',
    description: 'Fluent Design with acrylic blur',
    preview: 'linear-gradient(135deg, #e8f4fd, #cce4f7)',
    dark: false,
    bodyClass: 'theme-win11',
    vars: {
      '--background': '210 50% 97%',
      '--foreground': '220 15% 15%',
      '--card': '0 0% 100%',
      '--card-foreground': '220 15% 15%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '220 15% 15%',
      '--secondary': '210 40% 94%',
      '--secondary-foreground': '220 15% 15%',
      '--muted': '210 40% 94%',
      '--muted-foreground': '220 10% 45%',
      '--border': '210 30% 88%',
      '--input': '210 30% 88%',
      '--radius': '0.5rem',
      '--sidebar-background': '210 50% 96%',
      '--sidebar-foreground': '220 15% 20%',
      '--sidebar-accent': '210 50% 90%',
      '--sidebar-border': '210 30% 85%',
    },
  },
  {
    id: 'macos',
    name: 'Apple macOS',
    description: 'macOS Sonoma vibes',
    preview: 'linear-gradient(135deg, #f5f5f7, #e8e8ed)',
    dark: false,
    bodyClass: 'theme-macos',
    vars: {
      '--background': '0 0% 96%',
      '--foreground': '0 0% 10%',
      '--card': '0 0% 100%',
      '--card-foreground': '0 0% 10%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '0 0% 10%',
      '--secondary': '0 0% 92%',
      '--secondary-foreground': '0 0% 10%',
      '--muted': '0 0% 92%',
      '--muted-foreground': '0 0% 45%',
      '--border': '0 0% 85%',
      '--input': '0 0% 85%',
      '--radius': '0.75rem',
      '--sidebar-background': '0 0% 93%',
      '--sidebar-foreground': '0 0% 15%',
      '--sidebar-accent': '0 0% 87%',
      '--sidebar-border': '0 0% 82%',
    },
  },
  {
    id: 'win7',
    name: 'Windows 7',
    description: 'Aero Glass classic',
    preview: 'linear-gradient(135deg, #1e5799, #2989d8, #7db9e8)',
    dark: false,
    bodyClass: 'theme-win7',
    vars: {
      '--background': '210 60% 95%',
      '--foreground': '220 40% 10%',
      '--card': '210 50% 98%',
      '--card-foreground': '220 40% 10%',
      '--popover': '210 50% 98%',
      '--popover-foreground': '220 40% 10%',
      '--secondary': '210 50% 90%',
      '--secondary-foreground': '220 40% 10%',
      '--muted': '210 50% 90%',
      '--muted-foreground': '220 20% 45%',
      '--border': '210 40% 80%',
      '--input': '210 40% 80%',
      '--radius': '0.25rem',
      '--sidebar-background': '213 60% 25%',
      '--sidebar-foreground': '210 80% 95%',
      '--sidebar-accent': '213 60% 32%',
      '--sidebar-border': '213 50% 20%',
    },
  },
  {
    id: 'vista',
    name: 'Windows Vista',
    description: 'Aero with deep blues',
    preview: 'linear-gradient(135deg, #0a246a, #1e5799)',
    dark: true,
    bodyClass: 'theme-vista',
    vars: {
      '--background': '220 50% 12%',
      '--foreground': '210 80% 95%',
      '--card': '220 50% 16%',
      '--card-foreground': '210 80% 95%',
      '--popover': '220 50% 16%',
      '--popover-foreground': '210 80% 95%',
      '--secondary': '220 45% 20%',
      '--secondary-foreground': '210 80% 90%',
      '--muted': '220 45% 20%',
      '--muted-foreground': '210 40% 65%',
      '--border': '220 40% 25%',
      '--input': '220 40% 25%',
      '--radius': '0.25rem',
      '--sidebar-background': '220 55% 8%',
      '--sidebar-foreground': '210 80% 90%',
      '--sidebar-accent': '220 50% 14%',
      '--sidebar-border': '220 45% 18%',
    },
  },
  {
    id: 'winxp',
    name: 'Windows XP',
    description: 'Luna theme nostalgia',
    preview: 'linear-gradient(135deg, #245edb, #3a6eea)',
    dark: false,
    bodyClass: 'theme-winxp',
    vars: {
      '--background': '0 0% 82%',
      '--foreground': '0 0% 5%',
      '--card': '0 0% 95%',
      '--card-foreground': '0 0% 5%',
      '--popover': '0 0% 95%',
      '--popover-foreground': '0 0% 5%',
      '--secondary': '0 0% 88%',
      '--secondary-foreground': '0 0% 5%',
      '--muted': '0 0% 88%',
      '--muted-foreground': '0 0% 40%',
      '--border': '0 0% 70%',
      '--input': '0 0% 70%',
      '--radius': '0.125rem',
      '--sidebar-background': '225 70% 35%',
      '--sidebar-foreground': '0 0% 100%',
      '--sidebar-accent': '225 70% 42%',
      '--sidebar-border': '225 60% 28%',
    },
  },
  {
    id: 'win95',
    name: 'Windows 95',
    description: 'Classic retro desktop',
    preview: 'linear-gradient(135deg, #008080, #00aaaa)',
    dark: false,
    bodyClass: 'theme-win95',
    vars: {
      '--background': '180 100% 25%',
      '--foreground': '0 0% 0%',
      '--card': '0 0% 75%',
      '--card-foreground': '0 0% 0%',
      '--popover': '0 0% 75%',
      '--popover-foreground': '0 0% 0%',
      '--secondary': '0 0% 70%',
      '--secondary-foreground': '0 0% 0%',
      '--muted': '0 0% 70%',
      '--muted-foreground': '0 0% 30%',
      '--border': '0 0% 50%',
      '--input': '0 0% 85%',
      '--radius': '0rem',
      '--sidebar-background': '0 0% 75%',
      '--sidebar-foreground': '0 0% 0%',
      '--sidebar-accent': '0 0% 65%',
      '--sidebar-border': '0 0% 50%',
    },
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    description: 'Cyberpunk neon on black',
    preview: 'linear-gradient(135deg, #0d0d0d, #1a0033)',
    dark: true,
    bodyClass: 'theme-neon',
    vars: {
      '--background': '270 100% 3%',
      '--foreground': '180 100% 90%',
      '--card': '270 80% 6%',
      '--card-foreground': '180 100% 90%',
      '--popover': '270 80% 6%',
      '--popover-foreground': '180 100% 90%',
      '--secondary': '270 60% 10%',
      '--secondary-foreground': '180 100% 85%',
      '--muted': '270 60% 10%',
      '--muted-foreground': '270 30% 55%',
      '--border': '270 60% 18%',
      '--input': '270 60% 12%',
      '--radius': '0.25rem',
      '--sidebar-background': '270 100% 2%',
      '--sidebar-foreground': '180 100% 85%',
      '--sidebar-accent': '270 80% 8%',
      '--sidebar-border': '270 60% 15%',
    },
  },
  {
    id: 'glass',
    name: 'Glass UI',
    description: 'Liquid glass with animated gradients',
    preview: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.8), rgba(236,72,153,0.8))',
    dark: true,
    bodyClass: 'theme-glass',
    vars: {
      '--background': '240 20% 8%',
      '--foreground': '0 0% 98%',
      '--card': '240 20% 12%',
      '--card-foreground': '0 0% 98%',
      '--popover': '240 20% 12%',
      '--popover-foreground': '0 0% 98%',
      '--secondary': '240 15% 18%',
      '--secondary-foreground': '0 0% 95%',
      '--muted': '240 15% 18%',
      '--muted-foreground': '240 10% 60%',
      '--border': '240 20% 22%',
      '--input': '240 20% 18%',
      '--radius': '1rem',
      '--sidebar-background': '240 25% 6%',
      '--sidebar-foreground': '0 0% 95%',
      '--sidebar-accent': '240 20% 14%',
      '--sidebar-border': '240 20% 18%',
    },
  },
];

// ── Color application ─────────────────────────────────────────────────────────

// Convert hex to HSL string for CSS variables
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyTheme(themeId: ThemeId, accentHex: string) {
  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];
  const root = document.documentElement;

  // Remove all theme body classes
  document.body.classList.remove(...THEMES.map(t => t.bodyClass).filter(Boolean) as string[]);

  // Apply dark mode
  if (theme.dark) root.classList.add('dark');
  else root.classList.remove('dark');

  // Apply theme CSS vars
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));

  // Apply accent color
  const hsl = hexToHsl(accentHex);
  root.style.setProperty('--primary', hsl);
  root.style.setProperty('--accent', hsl);
  root.style.setProperty('--ring', hsl);
  root.style.setProperty('--sidebar-primary', hsl);
  root.style.setProperty('--sidebar-ring', hsl);

  // Apply body class for special effects
  if (theme.bodyClass) document.body.classList.add(theme.bodyClass);

  // Persist
  localStorage.setItem('orgs_theme', themeId);
  localStorage.setItem('orgs_accent', accentHex);
  localStorage.setItem('orgs_dark_mode', String(theme.dark));
}

export function loadSavedTheme() {
  const themeId = (localStorage.getItem('orgs_theme') as ThemeId) ?? 'default';
  const accent = localStorage.getItem('orgs_accent') ?? '#10b981';
  applyTheme(themeId, accent);
}
