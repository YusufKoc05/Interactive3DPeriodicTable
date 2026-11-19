import { describe, it, expect } from 'vitest';
import { wavelengthToRGB, wavelengthToEnergyEv, calculateIntegratedSpectralColor } from '../utils/wavelengthToColor';
import { matchCompound, predictBondType } from '../utils/compoundMatcher';
import { generateFCCLattice, generateBCCLattice, generateHCPLattice, generateDiamondLattice } from '../utils/crystalGenerators';
import spectralLinesData from '../data/spectralLines.json';
import compoundsData from '../data/compounds.json';
import isotopesData from '../data/isotopes.json';

describe('Advanced Features: Spectral Lines & Wavelength Math', () => {
  it('correctly maps visual wavelengths to RGB', () => {
    // Red wavelength ~ 656nm (Hydrogen alpha)
    const red = wavelengthToRGB(656.3);
    expect(red.r).toBeGreaterThan(180);
    expect(red.b).toBeLessThan(50);

    // Green wavelength ~ 520nm
    const green = wavelengthToRGB(520);
    expect(green.g).toBeGreaterThan(180);

    // Blue/violet wavelength ~ 434nm
    const blue = wavelengthToRGB(434);
    expect(blue.b).toBeGreaterThan(180);
  });

  it('calculates correct photon energy in eV', () => {
    // E = hc / lambda. For 500 nm, E ~ 2.48 eV
    const energy500 = wavelengthToEnergyEv(500);
    expect(energy500).toBeCloseTo(2.48, 1);
  });

  it('contains valid spectral line data in spectralLines.json', () => {
    expect(spectralLinesData.length).toBeGreaterThanOrEqual(15);
    const hydrogen = spectralLinesData.find(s => s.symbol === 'H');
    expect(hydrogen).toBeDefined();
    expect(hydrogen?.lines.length).toBeGreaterThanOrEqual(4);
    // Balmer alpha line ~ 656.3 nm
    expect(hydrogen?.lines.some(l => Math.abs(l.wavelength - 656.3) < 1.0)).toBe(true);
  });

  it('computes integrated chromatic discharge color for Hydrogen', () => {
    const hydrogen = spectralLinesData.find(s => s.symbol === 'H');
    const color = calculateIntegratedSpectralColor(hydrogen!.lines);
    expect(color.startsWith('#')).toBe(true);
  });
});

describe('Advanced Features: Chemical Compounds & Bonding Predictor', () => {
  it('predicts ionic bond for large electronegativity difference', () => {
    const ionic = predictBondType(2.23); // Na - Cl
    expect(ionic.type).toBe('ionic');

    const polar = predictBondType(1.24); // H - O
    expect(polar.type).toBe('polar_covalent');

    const covalent = predictBondType(0.0); // O - O
    expect(covalent.type).toBe('covalent');
  });

  it('matches exact formula for H2O and NaCl', () => {
    const waterMatch = matchCompound({ H: 2, O: 1 });
    expect(waterMatch.exactMatch).toBeDefined();
    expect(waterMatch.exactMatch?.formula).toBe('H₂O');
    expect(waterMatch.exactMatch?.atoms.length).toBe(3);
    expect(waterMatch.exactMatch?.bonds.length).toBe(2);

    const saltMatch = matchCompound({ Na: 1, Cl: 1 });
    expect(saltMatch.exactMatch).toBeDefined();
    expect(saltMatch.exactMatch?.formula).toBe('NaCl');
  });

  it('verifies all compounds have valid 3D coordinates and bond indices', () => {
    expect(compoundsData.length).toBeGreaterThanOrEqual(10);
    for (const compound of compoundsData) {
      expect(compound.atoms.length).toBeGreaterThan(0);
      for (const atom of compound.atoms) {
        expect(atom.position.length).toBe(3);
      }
      for (const bond of compound.bonds) {
        expect(bond.fromIndex).toBeLessThan(compound.atoms.length);
        expect(bond.toIndex).toBeLessThan(compound.atoms.length);
      }
    }
  });
});

describe('Advanced Features: 3D Crystal Lattice Geometry', () => {
  it('generates correct FCC unit cell with 14 atoms and 74% packing efficiency', () => {
    const fcc = generateFCCLattice();
    expect(fcc.system).toBe('fcc');
    expect(fcc.atoms.length).toBe(14); // 8 corners + 6 faces
    expect(fcc.packingEfficiency).toBe(0.74);
    expect(fcc.coordinationNumber).toBe(12);
  });

  it('generates correct BCC unit cell with 9 atoms and 68% packing efficiency', () => {
    const bcc = generateBCCLattice();
    expect(bcc.system).toBe('bcc');
    expect(bcc.atoms.length).toBe(9); // 8 corners + 1 center
    expect(bcc.packingEfficiency).toBe(0.68);
    expect(bcc.coordinationNumber).toBe(8);
  });

  it('generates correct HCP and Diamond unit cells', () => {
    const hcp = generateHCPLattice();
    expect(hcp.system).toBe('hcp');
    expect(hcp.atoms.length).toBe(17); // 12 ring + 2 faces + 3 mid
    expect(hcp.coordinationNumber).toBe(12);

    const diamond = generateDiamondLattice();
    expect(diamond.system).toBe('diamond');
    expect(diamond.atoms.length).toBe(18); // 14 fcc + 4 tetrahedral
    expect(diamond.coordinationNumber).toBe(4);
  });
});

describe('Advanced Features: Isotopes Database', () => {
  it('contains isotopes for Carbon and Uranium', () => {
    const cIsotopes = (isotopesData as any)['C'];
    expect(cIsotopes).toBeDefined();
    expect(cIsotopes.length).toBeGreaterThanOrEqual(3);

    const c14 = cIsotopes.find((iso: any) => iso.massNumber === 14);
    expect(c14).toBeDefined();
    expect(c14.decayMode).toBe('beta_minus');
    expect(c14.daughterProduct).toBe('¹⁴N');

    const uIsotopes = (isotopesData as any)['U'];
    expect(uIsotopes).toBeDefined();
    const u235 = uIsotopes.find((iso: any) => iso.massNumber === 235);
    expect(u235.decayMode).toBe('alpha');
    expect(u235.daughterProduct).toBe('²³¹Th');
  });
});
