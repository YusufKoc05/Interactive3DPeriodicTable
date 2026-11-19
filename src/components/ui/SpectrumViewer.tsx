import React, { useState } from 'react';
import type { ChemicalElement } from '../../types/element';
import spectralLinesRaw from '../../data/spectralLines.json';
import { wavelengthToRGB, wavelengthToEnergyEv } from '../../utils/wavelengthToColor';
import type { ElementSpectrum, SpectralLine } from '../../types/advancedFeatures';
import { Eye, Zap } from 'lucide-react';
import { sound } from '../../audio/soundEngine';

const allSpectra = spectralLinesRaw as ElementSpectrum[];

interface SpectrumViewerProps {
  element: ChemicalElement;
  language: 'tr' | 'en';
}

export const SpectrumViewer: React.FC<SpectrumViewerProps> = ({ element, language }) => {
  const [hoveredLine, setHoveredLine] = useState<SpectralLine | null>(null);

  // Find exact spectrum or generate fallback based on atomic number
  const spectrumData = allSpectra.find((s) => s.atomicNumber === element.atomicNumber) || {
    atomicNumber: element.atomicNumber,
    symbol: element.symbol,
    name: element.name.tr,
    dischargeColorHex: '#00f0ff',
    lines: [
      { wavelength: 410 + (element.atomicNumber * 13) % 280, intensity: 0.8 },
      { wavelength: 460 + (element.atomicNumber * 23) % 240, intensity: 0.9 },
      { wavelength: 540 + (element.atomicNumber * 19) % 180, intensity: 0.7 },
      { wavelength: 630 + (element.atomicNumber * 7) % 110, intensity: 0.85 }
    ]
  };

  const minWl = 380;
  const maxWl = 750;

  const getPositionPercent = (wl: number) => {
    return ((wl - minWl) / (maxWl - minWl)) * 100;
  };

  return (
    <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            {language === 'tr' ? 'Optik Işıma Spektrumu (Emisyon)' : 'Optical Emission Spectrum'}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">
            {language === 'tr' ? 'Plazma Deşarj Rengi:' : 'Plasma Glow:'}
          </span>
          <span
            className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-md animate-pulse"
            style={{
              backgroundColor: spectrumData.dischargeColorHex,
              boxShadow: `0 0 10px ${spectrumData.dischargeColorHex}`
            }}
          />
        </div>
      </div>

      {/* Spectrogram Chamber */}
      <div className="relative w-full h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner flex items-center">
        {/* Dark absorption backing */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-black to-red-950/20" />

        {/* Spectral Lines */}
        {spectrumData.lines.map((line, idx) => {
          const leftPct = getPositionPercent(line.wavelength);
          const color = wavelengthToRGB(line.wavelength, line.intensity);
          const isHovered = hoveredLine?.wavelength === line.wavelength;

          return (
            <div
              key={idx}
              onMouseEnter={() => {
                sound.playHover(Math.round(line.wavelength));
                setHoveredLine(line);
              }}
              onMouseLeave={() => setHoveredLine(null)}
              className="absolute top-0 bottom-0 cursor-pointer transition-all duration-150 group"
              style={{
                left: `${leftPct}%`,
                width: isHovered ? '4px' : '2.5px',
                backgroundColor: color.hex,
                boxShadow: `0 0 ${isHovered ? '12px' : '6px'} ${color.hex}`,
                zIndex: isHovered ? 20 : 10
              }}
            >
              <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-white whitespace-nowrap shadow-xl">
                {line.wavelength.toFixed(1)} nm
              </div>
            </div>
          );
        })}

        {/* Wavelength ticks background */}
        <div className="absolute bottom-0 left-0 right-0 h-2 flex justify-between px-2 text-[8px] font-mono text-slate-600 pointer-events-none">
          <span>380 nm</span>
          <span>480 nm</span>
          <span>580 nm</span>
          <span>680 nm</span>
          <span>750 nm</span>
        </div>
      </div>

      {/* Selected/Hovered Line Inspector Box */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] text-slate-300">
            {hoveredLine ? (
              <>
                <span className="font-bold text-white font-mono">{hoveredLine.wavelength.toFixed(1)} nm</span>
                {' · '}
                <span className="text-cyan-300 font-mono">
                  {wavelengthToEnergyEv(hoveredLine.wavelength)} eV
                </span>
                {' · '}
                <span className="text-slate-400">
                  {language === 'tr' ? 'Şiddet: ' : 'Intensity: '}
                  {Math.round(hoveredLine.intensity * 100)}%
                </span>
              </>
            ) : (
              <span className="text-slate-500 italic">
                {language === 'tr'
                  ? 'Dalga boyunu incelemek için çizgilere gelin'
                  : 'Hover spectral lines to inspect wavelength & energy'}
              </span>
            )}
          </span>
        </div>

        {hoveredLine && (
          <div
            className="w-4 h-4 rounded-md border border-white/20"
            style={{
              backgroundColor: wavelengthToRGB(hoveredLine.wavelength, hoveredLine.intensity).hex
            }}
          />
        )}
      </div>

      {/* Continuous Reference Spectrum */}
      <div>
        <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
          <span>{language === 'tr' ? 'Sürekli Görünür Işık Bandı (Referans):' : 'Continuous Visible Spectrum (Ref):'}</span>
          <span className="text-[9px] text-slate-500 font-mono">380nm - 750nm</span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden opacity-75"
          style={{
            background:
              'linear-gradient(to right, #4b0082, #0000ff, #00ffff, #00ff00, #ffff00, #ff7f00, #ff0000)'
          }}
        />
      </div>
    </div>
  );
};
