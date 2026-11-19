import compoundsData from '../data/compounds.json';
import type { ChemicalCompound, BondType } from '../types/advancedFeatures';

export interface MatchResult {
  exactMatch?: ChemicalCompound;
  partialMatches: ChemicalCompound[];
  deltaEN: number;
  predictedBondType: BondType;
  bondDescriptionTr: string;
  bondDescriptionEn: string;
}

/**
 * Predicts the bond character based on Pauling electronegativity difference (delta EN).
 * - deltaEN <= 0.4: Non-polar covalent (Apolar Kovalent)
 * - 0.4 < deltaEN <= 1.7: Polar covalent (Polar Kovalent)
 * - deltaEN > 1.7: Ionic (İyonik)
 */
export function predictBondType(deltaEN: number, isBothMetals: boolean = false): {
  type: BondType;
  descriptionTr: string;
  descriptionEn: string;
} {
  if (isBothMetals) {
    return {
      type: 'metallic',
      descriptionTr: 'Metalik Bağ: Serbest elektron denizi modeli ile güçlü kristal yapı.',
      descriptionEn: 'Metallic Bond: Sea of delocalized electrons holding metal cations together.'
    };
  }

  if (deltaEN > 1.7) {
    return {
      type: 'ionic',
      descriptionTr: `İyonik Bağ (ΔEN = ${deltaEN.toFixed(2)} > 1.7): Elektron transferi ve zıt yüklü iyonlar arası elektrostatik çekim.`,
      descriptionEn: `Ionic Bond (ΔEN = ${deltaEN.toFixed(2)} > 1.7): Electron transfer and strong electrostatic attraction between ions.`
    };
  } else if (deltaEN > 0.4) {
    return {
      type: 'polar_covalent',
      descriptionTr: `Polar Kovalent Bağ (0.4 < ΔEN = ${deltaEN.toFixed(2)} ≤ 1.7): Ortaklaşa kullanılan elektronların daha elektronegatif atoma kayması (kısmi dipol).`,
      descriptionEn: `Polar Covalent Bond (0.4 < ΔEN = ${deltaEN.toFixed(2)} ≤ 1.7): Unequal sharing of bonding electrons creating partial charges.`
    };
  } else {
    return {
      type: 'covalent',
      descriptionTr: `Apolar Kovalent Bağ (ΔEN = ${deltaEN.toFixed(2)} ≤ 0.4): Elektronların eşit ya da eşite çok yakın paylaşıldığı kovalent bağ.`,
      descriptionEn: `Non-polar Covalent Bond (ΔEN = ${deltaEN.toFixed(2)} ≤ 0.4): Equal or near-equal sharing of electron density.`
    };
  }
}

/**
 * Matches an inventory of selected elements { [symbol]: count } to the compounds database.
 */
export function matchCompound(counts: { [symbol: string]: number }): MatchResult {
  const activeSymbols = Object.keys(counts).filter(s => counts[s] > 0);
  const compounds = compoundsData as unknown as ChemicalCompound[];

  // Find exact formula match
  const exactMatch = compounds.find(c => {
    const compSymbols = Object.keys(c.elements);
    if (compSymbols.length !== activeSymbols.length) return false;
    return compSymbols.every(sym => c.elements[sym] === counts[sym]);
  });

  // Find partial matches (compounds that contain the active elements)
  const partialMatches = compounds.filter(c => {
    if (exactMatch && c.id === exactMatch.id) return false;
    return activeSymbols.every(sym => (c.elements[sym] || 0) > 0);
  });

  return {
    exactMatch,
    partialMatches,
    deltaEN: exactMatch?.deltaElectronegativity ?? 0,
    predictedBondType: exactMatch?.bondType ?? 'covalent',
    bondDescriptionTr: exactMatch?.descriptionTr ?? '',
    bondDescriptionEn: exactMatch?.descriptionEn ?? ''
  };
}
