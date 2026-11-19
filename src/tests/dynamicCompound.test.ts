import { describe, it, expect } from 'vitest';
import { generateProceduralCompound, formatChemicalFormula } from '../utils/dynamicCompoundEngine';

describe('Dynamic Compound & Bonding Generator Engine', () => {
  it('formats chemical formulas with unicode subscripts correctly', () => {
    expect(formatChemicalFormula({ H: 2, O: 1 })).toBe('H₂O');
    expect(formatChemicalFormula({ C: 1, H: 4 })).toBe('CH₄');
    expect(formatChemicalFormula({ O: 2 })).toBe('O₂');
  });

  it('correctly predicts O2 as non-polar covalent double bond with Turkish naming', () => {
    const res = generateProceduralCompound({ O: 2 });
    expect(res.compound.formula).toBe('O₂');
    expect(res.compound.nameTr).toContain('Oksijen Gazı');
    expect(res.compound.bondType).toBe('covalent');
    expect(res.compound.bonds.length).toBe(1);
    expect(res.compound.bonds[0].order).toBe(2); // Double bond!
    expect(res.spokenTextTr.toLowerCase()).toContain('apolar kovalent bağ');
  });

  it('correctly predicts H2 as non-polar covalent single bond', () => {
    const res = generateProceduralCompound({ H: 2 });
    expect(res.compound.formula).toBe('H₂');
    expect(res.compound.nameTr).toContain('Hidrojen Gazı');
    expect(res.compound.bondType).toBe('covalent');
    expect(res.compound.bonds[0].order).toBe(1);
  });

  it('correctly predicts N2 as non-polar covalent triple bond', () => {
    const res = generateProceduralCompound({ N: 2 });
    expect(res.compound.formula).toBe('N₂');
    expect(res.compound.bonds[0].order).toBe(3); // Triple bond!
  });

  it('identifies metal + nonmetal as Ionic bond (e.g. NaF)', () => {
    const res = generateProceduralCompound({ Na: 1, F: 1 });
    expect(res.compound.bondType).toBe('ionic');
    expect(res.compound.nameTr).toContain('Sodyum');
    expect(res.compound.nameTr).toContain('florür');
    expect(res.compound.deltaElectronegativity).toBeGreaterThan(2.0);
    expect(res.spokenTextTr).toContain('iyonik bağ');
  });

  it('handles inert noble gases without forming bonds', () => {
    const res = generateProceduralCompound({ He: 2 });
    expect(res.compound.bonds.length).toBe(0);
    expect(res.compound.descriptionTr).toContain('Soy gazlar');
    expect(res.spokenTextTr).toContain('soy gaz');
  });
});
