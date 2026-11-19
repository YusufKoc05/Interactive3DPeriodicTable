import type {
  ChemicalElement,
  ElementCategory,
  ElementBlock,
  StandardState,
  ColorMode,
  ViewLayout
} from '../types/element';

// Category color palette (Cinematic Sci-Fi Neon Palette)
export const CATEGORY_COLORS: Record<ElementCategory, string> = {
  'alkali-metal': '#ef4444', // Red-500
  'alkaline-earth': '#f97316', // Orange-500
  'transition-metal': '#eab308', // Yellow-500
  'post-transition-metal': '#10b981', // Emerald-500
  'metalloid': '#06b6d4', // Cyan-500
  'reactive-nonmetal': '#3b82f6', // Blue-500
  'halogen': '#8b5cf6', // Violet-500
  'noble-gas': '#ec4899', // Pink-500
  'lanthanide': '#d946ef', // Fuchsia-500
  'actinide': '#f43f5e', // Rose-500
  'unknown': '#64748b' // Slate-500
};

// Category localized labels
export const CATEGORY_LABELS: Record<ElementCategory, { tr: string; en: string }> = {
  'alkali-metal': { tr: 'Alkali Metal', en: 'Alkali Metal' },
  'alkaline-earth': { tr: 'Toprak Alkali Metal', en: 'Alkaline Earth Metal' },
  'transition-metal': { tr: 'Geçiş Metali', en: 'Transition Metal' },
  'post-transition-metal': { tr: 'Zayıf Metal', en: 'Post-transition Metal' },
  'metalloid': { tr: 'Yarı Metal', en: 'Metalloid' },
  'reactive-nonmetal': { tr: 'Reaktif Ametal', en: 'Reactive Nonmetal' },
  'halogen': { tr: 'Halojen', en: 'Halogen' },
  'noble-gas': { tr: 'Soygaz', en: 'Noble Gas' },
  'lanthanide': { tr: 'Lantanit', en: 'Lanthanide' },
  'actinide': { tr: 'Aktinit', en: 'Actinide' },
  'unknown': { tr: 'Bilinmeyen / Sentetik', en: 'Unknown / Synthetic' }
};

// Block colors
export const BLOCK_COLORS: Record<ElementBlock, string> = {
  s: '#38bdf8', // Light blue
  p: '#fbbf24', // Amber
  d: '#f472b6', // Pink
  f: '#a78bfa' // Purple
};

// State colors
export const STATE_COLORS: Record<StandardState, string> = {
  solid: '#38bdf8', // Ice blue
  liquid: '#34d399', // Emerald
  gas: '#fb7185', // Warm coral
  unknown: '#94a3b8' // Slate
};

/**
 * Calculates physical state at given temperature (in Kelvin)
 */
export function getPhysicalStateAtTemp(
  element: ChemicalElement,
  temperatureKelvin: number
): StandardState {
  if (element.meltingPoint == null && element.boilingPoint == null) {
    return element.stateAtSTP;
  }

  const mp = element.meltingPoint;
  const bp = element.boilingPoint;

  if (mp != null && temperatureKelvin < mp) {
    return 'solid';
  }

  if (bp != null && temperatureKelvin >= bp) {
    return 'gas';
  }

  if (mp != null && bp != null && temperatureKelvin >= mp && temperatureKelvin < bp) {
    return 'liquid';
  }

  if (mp != null && temperatureKelvin >= mp && bp == null) {
    return 'liquid';
  }

  return element.stateAtSTP;
}

/**
 * Computes color hex code for an element based on current ColorMode & Temperature
 */
export function getElementColor(
  element: ChemicalElement,
  colorMode: ColorMode,
  temperatureKelvin: number
): string {
  switch (colorMode) {
    case 'category':
      return CATEGORY_COLORS[element.category] || '#64748b';

    case 'block':
      return BLOCK_COLORS[element.block] || '#64748b';

    case 'state': {
      const state = getPhysicalStateAtTemp(element, temperatureKelvin);
      return STATE_COLORS[state];
    }

    case 'electronegativity': {
      if (element.electronegativity == null) return '#334155';
      // Pauling scale roughly 0.7 (Fr) to 4.0 (F)
      const ratio = Math.max(0, Math.min(1, (element.electronegativity - 0.7) / 3.3));
      // Gradient from deep blue (low) -> cyan -> yellow -> orange -> intense red (high)
      return interpolateGradient(ratio, ['#3b82f6', '#06b6d4', '#eab308', '#ef4444']);
    }

    case 'density': {
      if (element.density == null) return '#334155';
      // Density from 0 to 22.6 g/cm3 (Os)
      const ratio = Math.max(0, Math.min(1, Math.log10(element.density + 0.0001) / Math.log10(23)));
      return interpolateGradient(Math.max(0, ratio), ['#0284c7', '#10b981', '#f59e0b', '#dc2626']);
    }

    case 'discoveryYear': {
      if (element.discoveryYear === 'Ancient') return '#f59e0b'; // Gold
      const yr = Number(element.discoveryYear);
      // Range: 1660 to 2010
      const ratio = Math.max(0, Math.min(1, (yr - 1660) / (2010 - 1660)));
      return interpolateGradient(ratio, ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e']);
    }

    default:
      return CATEGORY_COLORS[element.category] || '#64748b';
  }
}

/**
 * Simple linear gradient interpolator for color arrays
 */
function interpolateGradient(ratio: number, hexPalette: string[]): string {
  const scaled = ratio * (hexPalette.length - 1);
  const idx = Math.floor(scaled);
  const frac = scaled - idx;

  if (idx >= hexPalette.length - 1) return hexPalette[hexPalette.length - 1];

  const c1 = hexToRgb(hexPalette[idx]);
  const c2 = hexToRgb(hexPalette[idx + 1]);

  const r = Math.round(c1.r + (c2.r - c1.r) * frac);
  const g = Math.round(c1.g + (c2.g - c1.g) * frac);
  const b = Math.round(c1.b + (c2.b - c1.b) * frac);

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16)
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate 3D spatial positions for each layout mode
 */
export function getElementTargetPosition(
  element: ChemicalElement,
  layout: ViewLayout
): [number, number, number] {
  const SPACING_X = 2.4;
  const SPACING_Y = 2.4;

  switch (layout) {
    case 'table': {
      // Classic 3D Table layout centered around origin
      const x = (element.gridCol - 9.5) * SPACING_X;
      const y = -(element.gridRow - 5.5) * SPACING_Y;
      // Slight depth curve to enhance 3D cinematic feel
      const z = Math.sin((element.gridCol / 18) * Math.PI) * 1.5;
      return [x, y, z];
    }

    case 'flat': {
      // Pure 2D plane grid
      const x = (element.gridCol - 9.5) * SPACING_X;
      const y = -(element.gridRow - 5.5) * SPACING_Y;
      return [x, y, 0];
    }

    case 'sphere': {
      // Fibonacci sphere mapping for 118 elements
      const i = element.atomicNumber - 1;
      const total = 118;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / total);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const radius = 17;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      return [x, y, z];
    }

    case 'helix': {
      // Cylindrical double/single helix spiral by atomic number
      const i = element.atomicNumber;
      const radius = 12;
      const pitch = 0.5; // vertical rise per element
      const theta = (i * 0.4) + Math.PI;

      const x = radius * Math.cos(theta);
      const y = (i - 59) * pitch;
      const z = radius * Math.sin(theta);
      return [x, y, z];
    }

    default:
      return [0, 0, 0];
  }
}
