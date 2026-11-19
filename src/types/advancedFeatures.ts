// Types for Advanced Periodic Table Features: Compounds, Spectra, Crystals, Isotopes

export type BondType = 'covalent' | 'polar_covalent' | 'ionic' | 'metallic';

export interface SpectralLine {
  wavelength: number; // in nanometers (nm), typically 380 - 750 nm
  intensity: number;  // relative intensity (0.0 - 1.0)
  colorHex?: string;  // computed or override hex color
}

export interface ElementSpectrum {
  atomicNumber: number;
  symbol: string;
  name: string;
  lines: SpectralLine[];
  dischargeColorHex: string; // Integrated chromatic color for gas discharge tube
}

export interface CompoundAtom {
  elementSymbol: string;
  position: [number, number, number]; // 3D coordinates in Angstroms or normalized units
  label?: string;
  cpkColor?: string;
}

export interface CompoundBond {
  fromIndex: number;
  toIndex: number;
  order: 1 | 2 | 3; // single, double, triple bond
  type: BondType;
}

export interface ChemicalCompound {
  id: string;
  formula: string;
  nameTr: string;
  nameEn: string;
  elements: { [symbol: string]: number }; // e.g. { H: 2, O: 1 }
  bondType: BondType;
  deltaElectronegativity: number;
  descriptionTr: string;
  descriptionEn: string;
  geometry: string; // e.g. "Doğrusal (Linear)", "Kırık Doğru (Bent)", "Dörtyüzlü (Tetrahedral)"
  atoms: CompoundAtom[];
  bonds: CompoundBond[];
}

export type DecayMode = 'alpha' | 'beta_minus' | 'beta_plus' | 'gamma' | 'electron_capture' | 'stable';

export interface Isotope {
  massNumber: number;      // A
  protons: number;         // Z
  neutrons: number;        // N = A - Z
  abundancePercent?: number; // e.g. 98.9%
  halfLifeText: string;    // e.g. "5,730 yıl" / "5,730 years" or "Kararlı / Stable"
  halfLifeSeconds?: number;
  decayMode: DecayMode;
  daughterProduct?: string; // e.g. "N-14"
  decayEnergyMeV?: number;
  descriptionTr: string;
  descriptionEn: string;
}

export type CrystalSystemType = 'fcc' | 'bcc' | 'hcp' | 'diamond' | 'simple_cubic' | 'other';

export interface LatticeAtom {
  id: string;
  position: [number, number, number];
  isCorner?: boolean;
  isFace?: boolean;
  isBody?: boolean;
}

export interface LatticeBond {
  from: [number, number, number];
  to: [number, number, number];
}

export interface CrystalCellData {
  system: CrystalSystemType;
  nameTr: string;
  nameEn: string;
  packingEfficiency: number; // e.g. 0.74 (74%)
  coordinationNumber: number; // e.g. 12
  atoms: LatticeAtom[];
  bonds: LatticeBond[];
  boxBounds: [number, number, number]; // [width, height, depth]
}
