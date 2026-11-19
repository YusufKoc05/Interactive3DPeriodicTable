import { describe, it, expect } from 'vitest';
import elementsRaw from '../data/elements.json';
import type { ChemicalElement } from '../types/element';
import {
  getPhysicalStateAtTemp,
  getElementColor,
  getElementTargetPosition
} from '../utils/elementCalculators';

const elements = elementsRaw as ChemicalElement[];

describe('Periodic Table 118 Elements Verification', () => {
  it('should contain exactly 118 chemical elements', () => {
    expect(elements.length).toBe(118);
  });

  it('should have strictly sequential atomic numbers from 1 to 118 without gaps', () => {
    elements.forEach((elem, index) => {
      expect(elem.atomicNumber).toBe(index + 1);
    });
  });

  it('should have every element shells sum strictly matching its atomic number (Z)', () => {
    elements.forEach((elem) => {
      const sum = elem.shells.reduce((acc, count) => acc + count, 0);
      expect(
        sum,
        `Element ${elem.symbol} (Z=${elem.atomicNumber}) shell sum ${sum} must equal ${elem.atomicNumber}`
      ).toBe(elem.atomicNumber);
    });
  });

  it('should have non-empty symbols, names and summaries in both TR and EN', () => {
    elements.forEach((elem) => {
      expect(elem.symbol.length).toBeGreaterThan(0);
      expect(elem.name.tr.length).toBeGreaterThan(0);
      expect(elem.name.en.length).toBeGreaterThan(0);
      expect(elem.summary.tr.length).toBeGreaterThan(10);
      expect(elem.summary.en.length).toBeGreaterThan(10);
      expect(elem.commonUses.tr.length).toBeGreaterThan(0);
      expect(elem.commonUses.en.length).toBeGreaterThan(0);
    });
  });

  it('should have valid periodic table grid coordinates for all elements', () => {
    elements.forEach((elem) => {
      expect(elem.gridRow).toBeGreaterThanOrEqual(1);
      expect(elem.gridRow).toBeLessThanOrEqual(10);
      expect(elem.gridCol).toBeGreaterThanOrEqual(1);
      expect(elem.gridCol).toBeLessThanOrEqual(18);
    });
  });
});

describe('Physical State & Thermodynamic Calculations', () => {
  it('should correctly calculate states across temperature boundaries for Mercury (Hg Z=80)', () => {
    const hg = elements.find((e) => e.symbol === 'Hg')!;
    expect(hg).toBeDefined();

    // Hg mp: 234.32 K, bp: 629.88 K
    expect(getPhysicalStateAtTemp(hg, 100)).toBe('solid'); // Cold
    expect(getPhysicalStateAtTemp(hg, 298.15)).toBe('liquid'); // Room temp (STP)
    expect(getPhysicalStateAtTemp(hg, 1000)).toBe('gas'); // Boiling hot
  });

  it('should correctly calculate states for Hydrogen (H Z=1)', () => {
    const h = elements.find((e) => e.symbol === 'H')!;
    expect(getPhysicalStateAtTemp(h, 5)).toBe('solid');
    expect(getPhysicalStateAtTemp(h, 16)).toBe('liquid');
    expect(getPhysicalStateAtTemp(h, 298.15)).toBe('gas');
  });

  it('should produce valid hex colors across different modes', () => {
    const fe = elements.find((e) => e.symbol === 'Fe')!;
    const catColor = getElementColor(fe, 'category', 298);
    const stateColor = getElementColor(fe, 'state', 298);
    const enColor = getElementColor(fe, 'electronegativity', 298);

    expect(catColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(stateColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(enColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe('Spatial 3D Layout Coordinates', () => {
  it('should produce finite 3D coordinates for all layouts', () => {
    const layouts = ['table', 'flat', 'sphere', 'helix'] as const;

    layouts.forEach((layout) => {
      elements.forEach((elem) => {
        const [x, y, z] = getElementTargetPosition(elem, layout);
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
        expect(Number.isFinite(z)).toBe(true);
      });
    });
  });
});
