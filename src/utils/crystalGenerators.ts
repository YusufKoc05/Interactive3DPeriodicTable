import type { CrystalCellData, LatticeAtom, LatticeBond } from '../types/advancedFeatures';

/**
 * Generates Face-Centered Cubic (FCC) unit cell data.
 * Used by: Gold (Au), Silver (Ag), Copper (Cu), Platinum (Pt), Aluminium (Al), Lead (Pb).
 * Coordination Number: 12, Packing Efficiency: ~74% (pi / (3 * sqrt(2)) ~ 0.7405)
 */
export function generateFCCLattice(scale: number = 2.0): CrystalCellData {
  const s = scale / 2;
  const atoms: LatticeAtom[] = [];

  // 8 Corner Atoms
  const corners: [number, number, number][] = [
    [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
    [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]
  ];
  corners.forEach((pos, i) => {
    atoms.push({ id: `fcc-corner-${i}`, position: pos, isCorner: true });
  });

  // 6 Face-Centered Atoms
  const faces: [number, number, number][] = [
    [0, 0, -s], // Back face
    [0, 0, s],  // Front face
    [-s, 0, 0], // Left face
    [s, 0, 0],  // Right face
    [0, -s, 0], // Bottom face
    [0, s, 0]   // Top face
  ];
  faces.forEach((pos, i) => {
    atoms.push({ id: `fcc-face-${i}`, position: pos, isFace: true });
  });

  // Bonds: connect corner atoms along cube wireframe, and face centers to adjacent corners
  const bonds: LatticeBond[] = [];
  // Cube edges
  const edgePairs = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];
  edgePairs.forEach(([a, b]) => {
    bonds.push({ from: corners[a], to: corners[b] });
  });

  // Face to adjacent corners (face diagonals)
  const faceConnections = [
    { face: faces[0], corners: [0, 1, 2, 3] },
    { face: faces[1], corners: [4, 5, 6, 7] },
    { face: faces[2], corners: [0, 3, 7, 4] },
    { face: faces[3], corners: [1, 2, 6, 5] },
    { face: faces[4], corners: [0, 1, 5, 4] },
    { face: faces[5], corners: [3, 2, 6, 7] }
  ];
  faceConnections.forEach(({ face, corners: cIndices }) => {
    cIndices.forEach(ci => {
      bonds.push({ from: face, to: corners[ci] });
    });
  });

  return {
    system: 'fcc',
    nameTr: 'Yüzey Merkezli Kübik (FCC)',
    nameEn: 'Face-Centered Cubic (FCC)',
    packingEfficiency: 0.74,
    coordinationNumber: 12,
    atoms,
    bonds,
    boxBounds: [scale, scale, scale]
  };
}

/**
 * Generates Body-Centered Cubic (BCC) unit cell data.
 * Used by: Iron (Fe), Chromium (Cr), Tungsten (W), Sodium (Na), Potassium (K).
 * Coordination Number: 8, Packing Efficiency: ~68% (pi * sqrt(3) / 8 ~ 0.6802)
 */
export function generateBCCLattice(scale: number = 2.0): CrystalCellData {
  const s = scale / 2;
  const atoms: LatticeAtom[] = [];

  // 8 Corner Atoms
  const corners: [number, number, number][] = [
    [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
    [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]
  ];
  corners.forEach((pos, i) => {
    atoms.push({ id: `bcc-corner-${i}`, position: pos, isCorner: true });
  });

  // 1 Body-Centered Atom
  const center: [number, number, number] = [0, 0, 0];
  atoms.push({ id: 'bcc-body-0', position: center, isBody: true });

  const bonds: LatticeBond[] = [];
  // Cube edges
  const edgePairs = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];
  edgePairs.forEach(([a, b]) => {
    bonds.push({ from: corners[a], to: corners[b] });
  });

  // Center connected to all 8 corners
  corners.forEach(c => {
    bonds.push({ from: center, to: c });
  });

  return {
    system: 'bcc',
    nameTr: 'Hacim Merkezli Kübik (BCC)',
    nameEn: 'Body-Centered Cubic (BCC)',
    packingEfficiency: 0.68,
    coordinationNumber: 8,
    atoms,
    bonds,
    boxBounds: [scale, scale, scale]
  };
}

/**
 * Generates Hexagonal Close-Packed (HCP) unit cell data.
 * Used by: Titanium (Ti), Zinc (Zn), Magnesium (Mg), Cobalt (Co), Zirconium (Zr).
 * Coordination Number: 12, Packing Efficiency: ~74%
 */
export function generateHCPLattice(radius: number = 1.4, height: number = 2.3): CrystalCellData {
  const atoms: LatticeAtom[] = [];
  const bonds: LatticeBond[] = [];

  const halfH = height / 2;
  const topRing: [number, number, number][] = [];
  const bottomRing: [number, number, number][] = [];

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    topRing.push([x, halfH, z]);
    bottomRing.push([x, -halfH, z]);
  }

  // Top ring atoms + center
  topRing.forEach((pos, i) => {
    atoms.push({ id: `hcp-top-${i}`, position: pos, isCorner: true });
  });
  const topCenter: [number, number, number] = [0, halfH, 0];
  atoms.push({ id: 'hcp-top-center', position: topCenter, isFace: true });

  // Bottom ring atoms + center
  bottomRing.forEach((pos, i) => {
    atoms.push({ id: `hcp-bottom-${i}`, position: pos, isCorner: true });
  });
  const bottomCenter: [number, number, number] = [0, -halfH, 0];
  atoms.push({ id: 'hcp-bottom-center', position: bottomCenter, isFace: true });

  // Middle layer: 3 interstitial atoms inside unit prism
  const midH = 0;
  const midRadius = radius * 0.58;
  const midAtoms: [number, number, number][] = [
    [midRadius * Math.cos(Math.PI / 6), midH, midRadius * Math.sin(Math.PI / 6)],
    [midRadius * Math.cos((5 * Math.PI) / 6), midH, midRadius * Math.sin((5 * Math.PI) / 6)],
    [midRadius * Math.cos((3 * Math.PI) / 2), midH, midRadius * Math.sin((3 * Math.PI) / 2)]
  ];
  midAtoms.forEach((pos, i) => {
    atoms.push({ id: `hcp-mid-${i}`, position: pos, isBody: true });
  });

  // Bonds: Hexagon top edges & spokes to center
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    bonds.push({ from: topRing[i], to: topRing[next] });
    bonds.push({ from: topCenter, to: topRing[i] });
    bonds.push({ from: bottomRing[i], to: bottomRing[next] });
    bonds.push({ from: bottomCenter, to: bottomRing[i] });
    bonds.push({ from: topRing[i], to: bottomRing[i] }); // Vertical prism struts
  }

  // Bonds from mid atoms to top/bottom centers
  midAtoms.forEach(mPos => {
    bonds.push({ from: mPos, to: topCenter });
    bonds.push({ from: mPos, to: bottomCenter });
  });

  return {
    system: 'hcp',
    nameTr: 'Hekzagonal Sıkı Paket (HCP)',
    nameEn: 'Hexagonal Close-Packed (HCP)',
    packingEfficiency: 0.74,
    coordinationNumber: 12,
    atoms,
    bonds,
    boxBounds: [radius * 2, height, radius * 2]
  };
}

/**
 * Generates Diamond Cubic unit cell data.
 * Used by: Carbon (Diamond), Silicon (Si), Germanium (Ge).
 * Coordination Number: 4, Packing Efficiency: ~34%
 */
export function generateDiamondLattice(scale: number = 2.0): CrystalCellData {
  const fcc = generateFCCLattice(scale);
  const s = scale / 2;
  const atoms: LatticeAtom[] = [...fcc.atoms];
  const bonds: LatticeBond[] = [...fcc.bonds];

  // 4 Tetrahedral Interstitial Sublattice Atoms (at 1/4 and 3/4 fractional positions)
  const quarter = s / 2;
  const interstitials: [number, number, number][] = [
    [-quarter, -quarter, -quarter],
    [quarter, quarter, -quarter],
    [-quarter, quarter, quarter],
    [quarter, -quarter, quarter]
  ];

  interstitials.forEach((pos, i) => {
    atoms.push({ id: `diamond-tetra-${i}`, position: pos, isBody: true });
  });

  // Connect tetrahedral atoms to nearest corners/faces
  interstitials.forEach(tPos => {
    fcc.atoms.slice(0, 14).forEach(hostAtom => {
      const dx = tPos[0] - hostAtom.position[0];
      const dy = tPos[1] - hostAtom.position[1];
      const dz = tPos[2] - hostAtom.position[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      // Tetrahedral nearest neighbor distance is sqrt(3)/4 * scale ~ 0.433 * scale
      if (dist < scale * 0.48) {
        bonds.push({ from: tPos, to: hostAtom.position });
      }
    });
  });

  return {
    system: 'diamond',
    nameTr: 'Elmas Kübik (Diamond Lattice)',
    nameEn: 'Diamond Cubic Lattice',
    packingEfficiency: 0.34,
    coordinationNumber: 4,
    atoms,
    bonds,
    boxBounds: [scale, scale, scale]
  };
}

/**
 * Factory selector that returns the appropriate crystal cell based on structure keyword.
 */
export function getLatticeDataForStructure(structure: string): CrystalCellData {
  const norm = (structure || '').toLowerCase();
  if (norm.includes('fcc') || norm.includes('yüzey')) {
    return generateFCCLattice();
  }
  if (norm.includes('bcc') || norm.includes('hacim')) {
    return generateBCCLattice();
  }
  if (norm.includes('hcp') || norm.includes('hekzagonal') || norm.includes('hexagonal')) {
    return generateHCPLattice();
  }
  if (norm.includes('elmas') || norm.includes('diamond')) {
    return generateDiamondLattice();
  }
  // Default to FCC for metals or BCC
  return generateFCCLattice();
}
