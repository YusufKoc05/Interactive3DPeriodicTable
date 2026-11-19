export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'reactive-nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide'
  | 'unknown';

export type ElementBlock = 's' | 'p' | 'd' | 'f';

export type StandardState = 'solid' | 'liquid' | 'gas' | 'unknown';

export interface ChemicalElement {
  atomicNumber: number;
  symbol: string;
  name: {
    tr: string;
    en: string;
  };
  atomicMass: number;
  category: ElementCategory;
  group: number; // 1-18
  period: number; // 1-7
  block: ElementBlock;
  electronConfiguration: string;
  shells: number[]; // e.g., [2, 8, 1] for Sodium
  electronegativity: number | null; // Pauling scale
  meltingPoint: number | null; // Kelvin
  boilingPoint: number | null; // Kelvin
  density: number | null; // g/cm³ at room temp
  stateAtSTP: StandardState;
  discoveryYear: number | 'Ancient';
  discoveredBy: string;
  summary: {
    tr: string;
    en: string;
  };
  commonUses: {
    tr: string[];
    en: string[];
  };
  abundanceUniverse: number | null; // ppm
  abundanceCrust: number | null; // mg/kg (ppm)
  
  // Extended atomic & chemical properties
  oxidationStates: string; // e.g. "+2, +3"
  atomicRadius: number | null; // in picometers (pm)
  covalentRadius: number | null; // in pm
  ionizationEnergy: number | null; // 1st ionization energy in kJ/mol
  electronAffinity: number | null; // in kJ/mol
  crystalStructure: string; // e.g. "BCC", "FCC", "HCP", "Elmas Kübik"
  thermalConductivity: number | null; // W/(m·K)
  specificHeat: number | null; // J/(g·K)
  magneticOrdering: string; // Ferromanyetik, Paramanyetik, Diyamanyetik
  casNumber: string;
  appearance: {
    tr: string;
    en: string;
  };

  // Grid coordinates for standard 2D/3D periodic layout
  gridRow: number;
  gridCol: number;
}

export type ViewLayout = 'table' | 'sphere' | 'helix' | 'flat';

export type ColorMode =
  | 'category'
  | 'block'
  | 'state'
  | 'electronegativity'
  | 'density'
  | 'discoveryYear';

export type AtomViewModel = 'bohr' | 'orbital' | 'specimen' | 'lattice' | 'decay';

export type Language = 'tr' | 'en';
