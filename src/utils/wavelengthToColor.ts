/**
 * Translates an optical wavelength (in nanometers, 380nm - 780nm) to accurate sRGB color.
 * Uses Dan Bruton's physics-based approximation of CIE color matching curves with gamma correction.
 */
export function wavelengthToRGB(wavelength: number, intensity: number = 1.0): { r: number; g: number; b: number; hex: string; rgba: string } {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0.0;
    g = (wavelength - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1.0;
    g = -(wavelength - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelength >= 645 && wavelength <= 780) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  }

  // Vision attenuation factor at ends of visible spectrum (eye sensitivity curves)
  let factor = 0.0;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380);
  } else if (wavelength >= 420 && wavelength < 701) {
    factor = 1.0;
  } else if (wavelength >= 701 && wavelength <= 780) {
    factor = 0.3 + (0.7 * (780 - wavelength)) / (780 - 701);
  }

  const gamma = 0.8;
  const finalIntensity = Math.max(0.1, Math.min(1.0, intensity));

  const R = Math.round(255 * Math.pow(Math.max(0, r * factor * finalIntensity), gamma));
  const G = Math.round(255 * Math.pow(Math.max(0, g * factor * finalIntensity), gamma));
  const B = Math.round(255 * Math.pow(Math.max(0, b * factor * finalIntensity), gamma));

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const hex = `#${toHex(R)}${toHex(G)}${toHex(B)}`;
  const rgba = `rgba(${R}, ${G}, ${B}, ${finalIntensity})`;

  return { r: R, g: G, b: B, hex, rgba };
}

/**
 * Calculates photon energy in electron-volts (eV) from optical wavelength in nm.
 * E = hc / lambda => E (eV) = 1239.84193 / lambda (nm)
 */
export function wavelengthToEnergyEv(wavelengthNm: number): number {
  if (wavelengthNm <= 0) return 0;
  return Number((1239.84193 / wavelengthNm).toFixed(3));
}

/**
 * Calculates an integrated chromaticity glow color from a list of spectral lines.
 */
export function calculateIntegratedSpectralColor(lines: { wavelength: number; intensity: number }[]): string {
  if (!lines || lines.length === 0) return '#00f0ff'; // default cyan neon

  let totalWeight = 0;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;

  for (const line of lines) {
    const rgb = wavelengthToRGB(line.wavelength, line.intensity);
    const weight = line.intensity;
    rSum += rgb.r * weight;
    gSum += rgb.g * weight;
    bSum += rgb.b * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return '#00f0ff';

  const r = Math.round(rSum / totalWeight);
  const g = Math.round(gSum / totalWeight);
  const b = Math.round(bSum / totalWeight);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
