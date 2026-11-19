import type { ChemicalCompound, CompoundAtom, CompoundBond, BondType } from '../types/advancedFeatures';
import compoundsDataRaw from '../data/compounds.json';
import elementsRaw from '../data/elements.json';
import type { ChemicalElement } from '../types/element';

const predefinedCompounds = compoundsDataRaw as unknown as ChemicalCompound[];
const allElements = elementsRaw as ChemicalElement[];

export interface DynamicCompoundResult {
  isPredefined: boolean;
  compound: ChemicalCompound;
  spokenTextTr: string;
  spokenTextEn: string;
  valenceWarning?: string;
}

// CPK Color standard mapping
export const CPK_COLORS: Record<string, string> = {
  H: '#ffffff',
  C: '#555555',
  N: '#3050f8',
  O: '#ff0d0d',
  F: '#90e050',
  Cl: '#1ff01f',
  Br: '#a62929',
  I: '#940094',
  He: '#40e0d0',
  Ne: '#ff3b00',
  Ar: '#80d0ff',
  Kr: '#5cb8ff',
  Xe: '#429bf4',
  Na: '#ab5cf2',
  K: '#8f40d4',
  Mg: '#8aff00',
  Ca: '#3dff00',
  Fe: '#e06633',
  Cu: '#c88033',
  Ti: '#bfc2c7',
  Au: '#ffd700',
  Ag: '#c0c0c0',
  Zn: '#7d80b0',
  S: '#ffff30',
  P: '#ff8000'
};

const TURKISH_PREFIXES: Record<number, string> = {
  1: 'Mono',
  2: 'Di',
  3: 'Tri',
  4: 'Tetra',
  5: 'Penta',
  6: 'Hekza',
  7: 'Hepta',
  8: 'Okta'
};

const ENGLISH_PREFIXES: Record<number, string> = {
  1: 'Mono',
  2: 'Di',
  3: 'Tri',
  4: 'Tetra',
  5: 'Penta',
  6: 'Hexa',
  7: 'Hepta',
  8: 'Octa'
};

const ANION_NAMES_TR: Record<string, string> = {
  O: 'oksit',
  H: 'hidrür',
  F: 'florür',
  Cl: 'klorür',
  Br: 'bromür',
  I: 'iyodür',
  S: 'sülfür',
  N: 'nitrür',
  P: 'fosfür',
  C: 'karbür'
};

const ANION_NAMES_EN: Record<string, string> = {
  O: 'oxide',
  H: 'hydride',
  F: 'fluoride',
  Cl: 'chloride',
  Br: 'bromide',
  I: 'iodide',
  S: 'sulfide',
  N: 'nitride',
  P: 'phosphide',
  C: 'carbide'
};

/**
 * Builds a chemical formula string with subscript characters (e.g. H2O -> H₂O, CO2 -> CO₂)
 */
export function formatChemicalFormula(inventory: Record<string, number>): string {
  const subscripts: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };

  // Hill system sorting: C first, then H, then others alphabetically
  const symbols = Object.keys(inventory).sort((a, b) => {
    if (a === 'C') return -1;
    if (b === 'C') return 1;
    if (a === 'H') return -1;
    if (b === 'H') return 1;
    return a.localeCompare(b);
  });

  return symbols
    .map((sym) => {
      const count = inventory[sym];
      if (count <= 1) return sym;
      const sub = String(count)
        .split('')
        .map((digit) => subscripts[digit] || digit)
        .join('');
      return `${sym}${sub}`;
    })
    .join('');
}

/**
 * Procedurally generates 3D atom positions and chemical bonds for any arbitrary element inventory.
 */
export function generateProceduralCompound(inventory: Record<string, number>): DynamicCompoundResult {
  const activeSymbols = Object.keys(inventory).filter((s) => (inventory[s] || 0) > 0);
  const totalAtomCount = activeSymbols.reduce((sum, s) => sum + inventory[s], 0);

  // 1. Check for exact match in predefined database
  const predefined = predefinedCompounds.find((c) => {
    const compSymbols = Object.keys(c.elements);
    if (compSymbols.length !== activeSymbols.length) return false;
    return compSymbols.every((sym) => c.elements[sym] === inventory[sym]);
  });

  if (predefined) {
    const spokenTr = `${predefined.nameTr} molekülü oluşturuldu. ${
      predefined.bondType === 'ionic'
        ? 'İyonik bağ içerir.'
        : predefined.bondType === 'polar_covalent'
        ? 'Polar kovalent bağ içerir.'
        : 'Apolar kovalent bağ içerir.'
    }`;
    const spokenEn = `${predefined.nameEn} molecule synthesized with ${predefined.bondType.replace('_', ' ')} bonding.`;

    return {
      isPredefined: true,
      compound: predefined,
      spokenTextTr: spokenTr,
      spokenTextEn: spokenEn
    };
  }

  // 2. Procedural Generation for Arbitrary Combinations
  const formula = formatChemicalFormula(inventory);
  const elementObjects = activeSymbols.map((sym) => allElements.find((e) => e.symbol === sym)!);

  // Check for noble gases
  const hasNobleGas = elementObjects.some((e) => e && e.category === 'noble-gas');
  if (hasNobleGas) {
    const noble = elementObjects.find((e) => e && e.category === 'noble-gas')!;
    const nameTr = `${noble.name.tr} Karışımı (Bağ Yapmaz)`;
    const nameEn = `${noble.name.en} Mixture (Non-bonding)`;
    const descTr = 'Soy gazlar tam dolu değerlik kabuğuna sahip olduklarından kimyasal bağ oluşturmazlar.';
    const descEn = 'Noble gases have complete valence electron shells and do not form bonds under standard conditions.';

    // Generate loose unbonded atoms
    const atoms: CompoundAtom[] = [];
    let idx = 0;
    activeSymbols.forEach((sym) => {
      const count = inventory[sym];
      for (let i = 0; i < count; i++) {
        const angle = (idx * 2 * Math.PI) / Math.max(totalAtomCount, 1);
        const r = 1.3;
        atoms.push({
          elementSymbol: sym,
          position: [r * Math.cos(angle), r * Math.sin(angle), 0],
          label: sym,
          cpkColor: CPK_COLORS[sym] || '#40e0d0'
        });
        idx++;
      }
    });

    return {
      isPredefined: false,
      compound: {
        id: `custom-${Date.now()}`,
        formula,
        nameTr,
        nameEn,
        elements: { ...inventory },
        bondType: 'covalent',
        deltaElectronegativity: 0,
        descriptionTr: descTr,
        descriptionEn: descEn,
        geometry: 'Bağsız / Serbest Atomlar (Non-bonded)',
        atoms,
        bonds: []
      },
      spokenTextTr: `${noble.name.tr} bir soy gazdır ve kararlı olduğundan kimyasal bağ yapmaz.`,
      spokenTextEn: `${noble.name.en} is an inert noble gas and does not form bonds.`
    };
  }

  // Calculate electronegativities and bond character
  const enValues = elementObjects.map((e) => e?.electronegativity ?? 2.0);
  const minEN = Math.min(...enValues);
  const maxEN = Math.max(...enValues);
  const deltaEN = Number((maxEN - minEN).toFixed(2));

  const allMetals = elementObjects.every(
    (e) => e && ['alkali-metal', 'alkaline-earth', 'transition-metal', 'post-transition-metal'].includes(e.category)
  );
  const allNonMetals = elementObjects.every(
    (e) => e && ['reactive-nonmetal', 'halogen', 'metalloid'].includes(e.category)
  );

  let bondType: BondType = 'covalent';
  let bondDescTr = '';
  let bondDescEn = '';
  let nameTr = '';
  let nameEn = '';
  let geometry = 'Doğrusal (Linear)';

  // Case A: Diatomic Homonuclear Molecule (e.g. O2, H2, N2, Cl2)
  if (activeSymbols.length === 1 && totalAtomCount === 2) {
    const sym = activeSymbols[0];
    const el = elementObjects[0];
    bondType = 'covalent';

    let order: 1 | 2 | 3 = 1;
    let orderName = 'Tekli';
    let orderNameEn = 'Single';
    if (sym === 'O') {
      order = 2;
      orderName = 'İkili';
      orderNameEn = 'Double';
    } else if (sym === 'N') {
      order = 3;
      orderName = 'Üçlü';
      orderNameEn = 'Triple';
    }

    nameTr = `Di${el.name.tr.toLowerCase()} (${el.name.tr} Gazı)`;
    nameEn = `Di${el.name.en.toLowerCase()} (${el.name.en} Gas)`;
    bondDescTr = `Apolar Kovalent Bağ: İki özdeş ametal atomu elektronları eşit paylaşarak ${orderName.toLowerCase()} kovalent bağ (:X=X:) oluşturdu. Elektronegatiflik farkı ΔEN = 0.00'dır.`;
    bondDescEn = `Non-polar Covalent Bond: Equal sharing of electron density creates a ${orderNameEn.toLowerCase()} covalent bond with ΔEN = 0.00.`;
    geometry = 'Doğrusal (Linear, 180°)';

    const atoms: CompoundAtom[] = [
      { elementSymbol: sym, position: [-0.65, 0, 0], label: `${sym}₁`, cpkColor: CPK_COLORS[sym] || '#38bdf8' },
      { elementSymbol: sym, position: [0.65, 0, 0], label: `${sym}₂`, cpkColor: CPK_COLORS[sym] || '#38bdf8' }
    ];
    const bonds: CompoundBond[] = [
      { fromIndex: 0, toIndex: 1, order, type: 'covalent' }
    ];

    const spokenTr = `${nameTr} molekülü sentezlendi. Atomlar arasında ${orderName.toLowerCase()} apolar kovalent bağ kuruldu.`;
    const spokenEn = `${nameEn} formed with a ${orderNameEn.toLowerCase()} non-polar covalent bond.`;

    return {
      isPredefined: false,
      compound: {
        id: `homo-${sym}-${totalAtomCount}`,
        formula,
        nameTr,
        nameEn,
        elements: { ...inventory },
        bondType,
        deltaElectronegativity: 0,
        descriptionTr: bondDescTr,
        descriptionEn: bondDescEn,
        geometry,
        atoms,
        bonds
      },
      spokenTextTr: spokenTr,
      spokenTextEn: spokenEn
    };
  }

  // Case B: Binary Compounds (e.g. NaF, HF, CO, SO2)
  if (allMetals) {
    bondType = 'metallic';
    nameTr = `${elementObjects.map((e) => e.name.tr).join(' - ')} Alaşımı`;
    nameEn = `${elementObjects.map((e) => e.name.en).join(' - ')} Alloy`;
    bondDescTr = `Metalik Bağ: Pozitif yüklü metal katyonları serbest elektron denizi ile birbirine bağlanır. Yüksek elektrik ve ısı iletkenliği sağlar.`;
    bondDescEn = `Metallic Bonding: Metal cations held in a sea of delocalized valence electrons.`;
    geometry = 'Kafes Kümesi (Cluster)';
  } else if (!allNonMetals && deltaEN > 1.4) {
    // Ionic compound (Metal + Nonmetal)
    bondType = 'ionic';
    const metal = elementObjects.find(
      (e) => ['alkali-metal', 'alkaline-earth', 'transition-metal'].includes(e.category)
    ) || elementObjects[0];
    const nonMetal = elementObjects.find((e) => e.symbol !== metal.symbol) || elementObjects[1];

    const anionTr = ANION_NAMES_TR[nonMetal.symbol] || `${nonMetal.name.tr.toLowerCase()}ür`;
    const anionEn = ANION_NAMES_EN[nonMetal.symbol] || `${nonMetal.name.en.toLowerCase()}ide`;

    nameTr = `${metal.name.tr} ${anionTr}`;
    nameEn = `${metal.name.en} ${anionEn}`;
    bondDescTr = `İyonik Bağ: ${metal.name.tr} atomu elektron verip pozitif katyona, ${nonMetal.name.tr} atomu elektron alıp negatif anyona dönüştü. Aralarındaki yüksek elektronegatiflik farkı (ΔEN = ${deltaEN}) güçlü elektrostatik çekim oluşturur.`;
    bondDescEn = `Ionic Bond: Electron transfer from ${metal.name.en} to ${nonMetal.name.en} creates an electrostatic ionic lattice (ΔEN = ${deltaEN}).`;
    geometry = 'İyonik Çift / Kübik Birim';
  } else {
    // Polar covalent compound
    bondType = deltaEN > 0.4 ? 'polar_covalent' : 'covalent';
    const firstSym = activeSymbols[0];
    const secondSym = activeSymbols[1];
    const count1 = inventory[firstSym] || 1;
    const count2 = inventory[secondSym] || 1;

    const prefix1Tr = count1 > 1 ? TURKISH_PREFIXES[count1] || '' : '';
    const prefix2Tr = TURKISH_PREFIXES[count2] || 'Mono';
    const el1 = elementObjects[0];
    const el2 = elementObjects[1] || elementObjects[0];

    const anionTr = ANION_NAMES_TR[el2.symbol] || `${el2.name.tr.toLowerCase()}ür`;
    nameTr = `${prefix1Tr}${el1.name.tr} ${prefix2Tr.toLowerCase()}${anionTr}`;
    nameEn = `${ENGLISH_PREFIXES[count1] || ''}${el1.name.en} ${(ENGLISH_PREFIXES[count2] || 'Mono').toLowerCase()}${ANION_NAMES_EN[el2.symbol] || 'ide'}`;

    bondDescTr = `Polar Kovalent Bağ: ${el1.name.tr} ve ${el2.name.tr} ametalleri elektronları ortaklaşa kullandı. ΔEN = ${deltaEN} farkından dolayı bağ elektronları daha elektronegatif olan atoma çekilerek kalıcı dipol oluşturur.`;
    bondDescEn = `Polar Covalent Bond: Unequal electron sharing between ${el1.name.en} and ${el2.name.en} creates dipole moments (ΔEN = ${deltaEN}).`;
    geometry = totalAtomCount === 3 ? 'Kırık Doğru (Bent, ~110°)' : totalAtomCount === 4 ? 'Üçgen Piramit (Trigonal Pyramidal)' : 'Doğrusal (Linear)';
  }

  // 3. Procedural 3D Layout Geometry Builder (VSEPR Center-Satellite Assembly)
  const atoms: CompoundAtom[] = [];
  const bonds: CompoundBond[] = [];

  // Pick the central atom (the atom with highest valence capacity or lowest electronegativity)
  let centralSym = activeSymbols[0];
  let maxBonds = 1;
  activeSymbols.forEach((sym) => {
    const val = sym === 'C' ? 4 : sym === 'N' ? 3 : sym === 'O' ? 2 : sym === 'S' ? 4 : 1;
    if (val > maxBonds) {
      maxBonds = val;
      centralSym = sym;
    }
  });

  // Center atom at (0, 0, 0)
  atoms.push({
    elementSymbol: centralSym,
    position: [0, 0, 0],
    label: centralSym,
    cpkColor: CPK_COLORS[centralSym] || '#555555'
  });

  // Remaining atoms positioned in 3D sphere/circle around center
  const remaining: string[] = [];
  activeSymbols.forEach((sym) => {
    const count = sym === centralSym ? inventory[sym] - 1 : inventory[sym];
    for (let i = 0; i < count; i++) {
      remaining.push(sym);
    }
  });

  const bondDistance = 1.15;
  remaining.forEach((sym, idx) => {
    const n = remaining.length;
    let x = 0;
    let y = 0;
    let z = 0;

    if (n === 1) {
      x = bondDistance;
    } else if (n === 2) {
      // Linear or bent
      const angle = (105 * Math.PI) / 180;
      x = bondDistance * Math.cos(idx === 0 ? -angle / 2 : angle / 2);
      y = bondDistance * Math.sin(idx === 0 ? -angle / 2 : angle / 2);
    } else if (n === 3) {
      // Trigonal planar
      const angle = (idx * 2 * Math.PI) / 3;
      x = bondDistance * Math.cos(angle);
      y = bondDistance * Math.sin(angle);
      z = 0.15;
    } else {
      // Tetrahedral
      const phi = Math.acos(1 - (2 * (idx + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (idx + 0.5);
      x = bondDistance * Math.sin(phi) * Math.cos(theta);
      y = bondDistance * Math.sin(phi) * Math.sin(theta);
      z = bondDistance * Math.cos(phi);
    }

    const atomIdx = atoms.length;
    atoms.push({
      elementSymbol: sym,
      position: [Number(x.toFixed(2)), Number(y.toFixed(2)), Number(z.toFixed(2))],
      label: `${sym}${idx + 1}`,
      cpkColor: CPK_COLORS[sym] || '#38bdf8'
    });

    // Connect to central atom
    bonds.push({
      fromIndex: 0,
      toIndex: atomIdx,
      order: 1,
      type: bondType
    });
  });

  const spokenTr = `${nameTr} molekülü oluşturuldu. ${
    bondType === 'ionic'
      ? 'Güçlü iyonik bağ meydana geldi.'
      : bondType === 'polar_covalent'
      ? 'Polar kovalent bağ meydana geldi.'
      : bondType === 'metallic'
      ? 'Metalik bağ meydana geldi.'
      : 'Kovalent bağ meydana geldi.'
  }`;

  const spokenEn = `${nameEn} formed with ${bondType.replace('_', ' ')} bonding.`;

  return {
    isPredefined: false,
    compound: {
      id: `dynamic-${formula}-${Date.now()}`,
      formula,
      nameTr,
      nameEn,
      elements: { ...inventory },
      bondType,
      deltaElectronegativity: deltaEN,
      descriptionTr: bondDescTr,
      descriptionEn: bondDescEn,
      geometry,
      atoms,
      bonds
    },
    spokenTextTr: spokenTr,
    spokenTextEn: spokenEn
  };
}
