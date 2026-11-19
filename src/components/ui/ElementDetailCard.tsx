import React, { useEffect, useState } from 'react';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  BLOCK_COLORS,
  getPhysicalStateAtTemp
} from '../../utils/elementCalculators';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Atom,
  Sparkles,
  Calendar,
  Compass,
  Play,
  Pause,
  Cloud,
  Zap,
  Box,
  Layers,
  Eye,
  Radiation
} from 'lucide-react';
import { SpectrumViewer } from './SpectrumViewer';
import isotopesDataRaw from '../../data/isotopes.json';
import type { Isotope } from '../../types/advancedFeatures';
import { sound } from '../../audio/soundEngine';

const allIsotopes = isotopesDataRaw as Record<string, Isotope[]>;

export const ElementDetailCard: React.FC = () => {
  const {
    selectedElement,
    setSelectedElement,
    selectNextElement,
    selectPrevElement,
    temperature,
    language,
    atomViewModel,
    setAtomViewModel,
    isAtomSpinning,
    setIsAtomSpinning,
    atomAnimationSpeed,
    setAtomAnimationSpeed
  } = usePeriodicStore();

  const [activeTab, setActiveTab] = useState<
    'atomic' | 'thermal' | 'shells' | 'uses' | 'spectrum' | 'isotopes'
  >('atomic');

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedElement(null);
      } else if (e.key === 'ArrowRight' && selectedElement) {
        selectNextElement();
      } else if (e.key === 'ArrowLeft' && selectedElement) {
        selectPrevElement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, selectNextElement, selectPrevElement, setSelectedElement]);

  if (!selectedElement) return null;

  const z = selectedElement.atomicNumber;
  const mass = selectedElement.atomicMass;
  const neutrons = Math.round(mass) - z;
  const catColor = CATEGORY_COLORS[selectedElement.category];
  const currentState = getPhysicalStateAtTemp(selectedElement, temperature);
  const displayName = language === 'tr' ? selectedElement.name.tr : selectedElement.name.en;
  const summaryText = language === 'tr' ? selectedElement.summary.tr : selectedElement.summary.en;
  const usesList = language === 'tr' ? selectedElement.commonUses.tr : selectedElement.commonUses.en;
  const appearanceText = language === 'tr' ? selectedElement.appearance.tr : selectedElement.appearance.en;

  return (
    <aside
      aria-label="Element Detail Panel"
      className="absolute top-20 right-4 bottom-4 z-30 w-full max-w-md sm:w-[440px] rounded-3xl bg-black/90 backdrop-blur-3xl text-slate-100 flex flex-col shadow-2xl overflow-hidden pointer-events-auto border border-white/15 animate-in slide-in-from-right duration-300"
    >
      {/* --- TOP BANNER WITH NAV & CLOSE --- */}
      <div className="p-5 pb-3 border-b border-white/10 bg-black/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={selectPrevElement}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Önceki Element (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={selectNextElement}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Sonraki Element (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-cyan-400 font-bold ml-2">
              #{z} / 118
            </span>
          </div>

          <button
            onClick={() => setSelectedElement(null)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
            title="Kapat (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* HERO HEADER: PROMINENT ATOMIC NUMBER, SYMBOL & MASS */}
        <div className="flex items-start gap-4">
          <div
            className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold border-2 shadow-2xl relative shrink-0"
            style={{
              borderColor: catColor,
              backgroundColor: `${catColor}15`,
              color: catColor
            }}
          >
            <span className="text-xs font-mono font-bold opacity-80 leading-none">
              {z}
            </span>
            <span className="font-black text-3xl tracking-tight">{selectedElement.symbol}</span>
            <span className="text-[9px] font-mono text-slate-400">
              {mass.toFixed(2)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-white truncate leading-tight">
              {displayName}
            </h2>
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <span
                className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border truncate"
                style={{
                  backgroundColor: `${catColor}20`,
                  borderColor: `${catColor}50`,
                  color: catColor
                }}
              >
                {CATEGORY_LABELS[selectedElement.category]?.[language]}
              </span>
              <span
                className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border text-slate-200"
                style={{ borderColor: `${BLOCK_COLORS[selectedElement.block]}60` }}
              >
                {selectedElement.block}-blok
              </span>
              <span className="text-[10px] text-cyan-400 capitalize font-medium">
                {language === 'tr' ? `Hâl: ${currentState}` : `State: ${currentState}`}
              </span>
            </div>

            {/* Appearance specimen quick badge */}
            <div className="mt-1.5 text-[11px] text-slate-300 italic truncate flex items-center gap-1">
              <Box className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">{appearanceText}</span>
            </div>
          </div>
        </div>

        {/* --- 3D VIEW TOGGLE BAR (Bohr | Bulut | 3B Numune Gerçek Hâli) --- */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <Atom className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] text-slate-200 font-semibold">
              {language === 'tr' ? '3B Sahne Modu:' : '3D View:'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Model Triple-Toggle */}
            <div className="flex items-center rounded-xl bg-slate-900 p-0.5 border border-slate-800">
              <button
                onClick={() => setAtomViewModel('bohr')}
                className={`px-2 py-1 text-[10px] rounded-lg transition-all ${
                  atomViewModel === 'bohr'
                    ? 'bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bohr Yörünge Modeli"
              >
                Bohr
              </button>
              <button
                onClick={() => setAtomViewModel('orbital')}
                className={`px-2 py-1 text-[10px] rounded-lg flex items-center gap-1 transition-all ${
                  atomViewModel === 'orbital'
                    ? 'bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Kuantum Olasılık Bulutu"
              >
                <Cloud className="w-2.5 h-2.5" />
                <span>{language === 'tr' ? 'Bulut' : 'Cloud'}</span>
              </button>
              <button
                onClick={() => {
                  sound.playSelect();
                  setAtomViewModel('specimen');
                }}
                className={`px-2 py-1 text-[10px] rounded-lg flex items-center gap-1 transition-all ${
                  atomViewModel === 'specimen'
                    ? 'bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/30'
                    : 'text-amber-400 hover:text-white'
                }`}
                title="Elementin Gerçek Fiziksel Numune Hâli"
              >
                <Box className="w-2.5 h-2.5" />
                <span>{language === 'tr' ? 'Numune' : 'Sample'}</span>
              </button>
              <button
                onClick={() => {
                  sound.playSelect();
                  setAtomViewModel('lattice');
                }}
                className={`px-2 py-1 text-[10px] rounded-lg flex items-center gap-1 transition-all ${
                  atomViewModel === 'lattice'
                    ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/30'
                    : 'text-emerald-400 hover:text-white'
                }`}
                title="3B Kristal Kafes Birim Hücresi"
              >
                <Layers className="w-2.5 h-2.5" />
                <span>{language === 'tr' ? 'Kafes' : 'Lattice'}</span>
              </button>
              <button
                onClick={() => {
                  sound.playSelect();
                  setAtomViewModel('decay');
                }}
                className={`px-2 py-1 text-[10px] rounded-lg flex items-center gap-1 transition-all ${
                  atomViewModel === 'decay'
                    ? 'bg-rose-500 text-white font-extrabold shadow-md shadow-rose-500/30'
                    : 'text-rose-400 hover:text-white'
                }`}
                title="Radyoaktif Bozunma Simülatörü"
              >
                <Radiation className="w-2.5 h-2.5" />
                <span>{language === 'tr' ? 'Bozunma' : 'Decay'}</span>
              </button>
            </div>

            {/* Play / Pause toggle */}
            <button
              onClick={() => setIsAtomSpinning(!isAtomSpinning)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title={isAtomSpinning ? 'Durdur' : 'Oynat'}
            >
              {isAtomSpinning ? (
                <Pause className="w-3 h-3 text-cyan-400" />
              ) : (
                <Play className="w-3 h-3 text-emerald-400" />
              )}
            </button>

            {/* Speed Toggle */}
            <button
              onClick={() => {
                const nextSpeed = atomAnimationSpeed === 1 ? 2 : atomAnimationSpeed === 2 ? 0.5 : 1;
                setAtomAnimationSpeed(nextSpeed);
              }}
              className="px-1.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-0.5"
              title="Animasyon Hızı"
            >
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              <span>{atomAnimationSpeed}x</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- TABS NAVIGATION --- */}
      <div className="flex items-center px-4 pt-2 border-b border-slate-800 bg-slate-900/40 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('atomic')}
          className={`px-3 py-2 border-b-2 font-medium transition-all ${
            activeTab === 'atomic'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {language === 'tr' ? 'Atomik & Kimyasal' : 'Atomic & Chemical'}
        </button>
        <button
          onClick={() => setActiveTab('thermal')}
          className={`px-3 py-2 border-b-2 font-medium transition-all ${
            activeTab === 'thermal'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {language === 'tr' ? 'Fiziksel & Termal' : 'Physical & Thermal'}
        </button>
        <button
          onClick={() => setActiveTab('shells')}
          className={`px-3 py-2 border-b-2 font-medium transition-all ${
            activeTab === 'shells'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {language === 'tr' ? 'Kabuk Şeması' : 'Shell Diagram'}
        </button>
        <button
          onClick={() => {
            sound.playSelect();
            setActiveTab('uses');
          }}
          className={`px-2.5 py-2 border-b-2 font-medium transition-all ${
            activeTab === 'uses'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {language === 'tr' ? 'Kullanım' : 'Uses'}
        </button>
        <button
          onClick={() => {
            sound.playSelect();
            setActiveTab('spectrum');
          }}
          className={`px-2.5 py-2 border-b-2 font-medium transition-all flex items-center gap-1 ${
            activeTab === 'spectrum'
              ? 'border-purple-400 text-purple-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3 h-3 text-purple-400" />
          <span>{language === 'tr' ? 'Spektrum' : 'Spectrum'}</span>
        </button>
        <button
          onClick={() => {
            sound.playSelect();
            setActiveTab('isotopes');
          }}
          className={`px-2.5 py-2 border-b-2 font-medium transition-all flex items-center gap-1 ${
            activeTab === 'isotopes'
              ? 'border-amber-400 text-amber-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radiation className="w-3 h-3 text-amber-400" />
          <span>{language === 'tr' ? 'İzotoplar' : 'Isotopes'}</span>
        </button>
      </div>

      {/* --- SCROLLABLE TAB CONTENTS --- */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* TAB 1: ATOMIC & FUNDAMENTAL CHEMICAL PROPERTIES */}
        {activeTab === 'atomic' && (
          <div className="space-y-4">
            {/* Fundamental Subatomic Particles Matrix */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                <span className="text-rose-400 text-[10px] font-semibold block">PROTON (Z)</span>
                <strong className="text-lg font-mono text-white">{z}</strong>
              </div>
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center">
                <span className="text-sky-400 text-[10px] font-semibold block">NÖTRON (N)</span>
                <strong className="text-lg font-mono text-white">{neutrons}</strong>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                <span className="text-cyan-400 text-[10px] font-semibold block">ELEKTRON (e⁻)</span>
                <strong className="text-lg font-mono text-white">{z}</strong>
              </div>
            </div>

            {/* Core Atomic Properties Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">
                  {language === 'tr' ? 'ATOM KÜTLESİ (A)' : 'ATOMIC MASS (A)'}
                </span>
                <strong className="text-cyan-300 text-sm font-mono block mt-0.5">
                  {mass.toFixed(4)} u
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">
                  {language === 'tr' ? 'OKSİDASYON BASAMAKLARI' : 'OXIDATION STATES'}
                </span>
                <strong className="text-amber-300 text-sm font-mono block mt-0.5 truncate">
                  {selectedElement.oxidationStates}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">
                  {language === 'tr' ? 'ATOM YARIÇAPI' : 'ATOMIC RADIUS'}
                </span>
                <strong className="text-slate-200 text-sm font-mono block mt-0.5">
                  {selectedElement.atomicRadius != null ? `${selectedElement.atomicRadius} pm` : '—'}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">
                  {language === 'tr' ? '1. İYONLAŞMA ENERJİSİ' : '1ST IONIZATION ENERGY'}
                </span>
                <strong className="text-slate-200 text-sm font-mono block mt-0.5">
                  {selectedElement.ionizationEnergy != null ? `${selectedElement.ionizationEnergy} kJ/mol` : '—'}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">
                  {language === 'tr' ? 'ELEKTRONEGATİFLİK' : 'ELECTRONEGATIVITY'}
                </span>
                <strong className="text-amber-400 text-sm font-mono block mt-0.5">
                  {selectedElement.electronegativity != null ? `${selectedElement.electronegativity} (Pauling)` : '—'}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">
                  {language === 'tr' ? 'ELEKTRON İLGİSİ' : 'ELECTRON AFFINITY'}
                </span>
                <strong className="text-slate-200 text-sm font-mono block mt-0.5">
                  {selectedElement.electronAffinity != null ? `${selectedElement.electronAffinity} kJ/mol` : '—'}
                </strong>
              </div>
            </div>

            {/* Electron Configuration Banner */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">
                  {language === 'tr' ? 'ELEKTRON DİZİLİMİ' : 'ELECTRON CONFIGURATION'}
                </span>
                <span className="text-cyan-400 font-mono font-bold text-xs">
                  {selectedElement.electronConfiguration}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">
                  {language === 'tr' ? 'KABUK DAĞILIMI' : 'SHELL COUNT'}
                </span>
                <span className="text-white font-mono text-xs">
                  {selectedElement.shells.join(', ')}
                </span>
              </div>
            </div>

            {/* Summary description */}
            <p className="text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              {summaryText}
            </p>
          </div>
        )}

        {/* TAB 2: PHYSICAL & THERMAL PROPERTIES */}
        {activeTab === 'thermal' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">
                  {language === 'tr' ? 'ERİME NOKTASI' : 'MELTING POINT'}
                </span>
                <strong className="text-white text-sm font-mono">
                  {selectedElement.meltingPoint != null
                    ? `${selectedElement.meltingPoint} K`
                    : '—'}
                </strong>
                <span className="text-slate-400 text-[10px] block">
                  {selectedElement.meltingPoint != null
                    ? `(${(selectedElement.meltingPoint - 273.15).toFixed(1)} °C)`
                    : ''}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">
                  {language === 'tr' ? 'KAYNAMA NOKTASI' : 'BOILING POINT'}
                </span>
                <strong className="text-white text-sm font-mono">
                  {selectedElement.boilingPoint != null
                    ? `${selectedElement.boilingPoint} K`
                    : '—'}
                </strong>
                <span className="text-slate-400 text-[10px] block">
                  {selectedElement.boilingPoint != null
                    ? `(${(selectedElement.boilingPoint - 273.15).toFixed(1)} °C)`
                    : ''}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">
                  {language === 'tr' ? 'YOĞUNLUK' : 'DENSITY'}
                </span>
                <strong className="text-white text-sm font-mono">
                  {selectedElement.density != null ? `${selectedElement.density} g/cm³` : '—'}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">
                  {language === 'tr' ? 'KRİSTAL YAPISI' : 'CRYSTAL STRUCTURE'}
                </span>
                <strong className="text-cyan-400 text-sm font-mono truncate block">
                  {selectedElement.crystalStructure}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">
                  {language === 'tr' ? 'ISIL İLETKENLİK' : 'THERMAL CONDUCTIVITY'}
                </span>
                <strong className="text-white text-sm font-mono">
                  {selectedElement.thermalConductivity != null
                    ? `${selectedElement.thermalConductivity} W/(m·K)`
                    : '—'}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">
                  {language === 'tr' ? 'ÖZGÜL ISI KAPASİTESİ' : 'SPECIFIC HEAT'}
                </span>
                <strong className="text-white text-sm font-mono">
                  {selectedElement.specificHeat != null
                    ? `${selectedElement.specificHeat} J/(g·K)`
                    : '—'}
                </strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">
                  {language === 'tr' ? 'MANYETİK DÜZEN' : 'MAGNETIC ORDERING'}
                </span>
                <span className="text-white font-medium">{selectedElement.magneticOrdering}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">CAS NUMARASI</span>
                <span className="text-cyan-400 font-mono">{selectedElement.casNumber}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ELECTRON SHELLS 2D MINI DIAGRAM */}
        {activeTab === 'shells' && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg viewBox="0 0 240 240" className="w-full h-full">
                <circle cx="120" cy="120" r="16" fill={catColor} opacity="0.9" />
                <text
                  x="120"
                  y="124"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                >
                  +{z}
                </text>

                {selectedElement.shells.map((count, sIdx) => {
                  const ringRadius = 26 + sIdx * 13;
                  const angles = Array.from(
                    { length: count },
                    (_, i) => (i * 2 * Math.PI) / count
                  );

                  return (
                    <g key={sIdx}>
                      <circle
                        cx="120"
                        cy="120"
                        r={ringRadius}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1"
                        opacity="0.4"
                        strokeDasharray="3 3"
                      />
                      {angles.map((ang, eIdx) => {
                        const ex = 120 + ringRadius * Math.cos(ang);
                        const ey = 120 + ringRadius * Math.sin(ang);
                        return (
                          <circle
                            key={eIdx}
                            cx={ex}
                            cy={ey}
                            r="3"
                            fill="#38bdf8"
                            stroke="#0284c7"
                            strokeWidth="0.8"
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="w-full space-y-1.5 font-mono">
              {selectedElement.shells.map((count, i) => {
                const shellLetters = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <span className="text-slate-400">
                      {shellLetters[i]} {language === 'tr' ? 'Kabuğu' : 'Shell'} (n={i + 1})
                    </span>
                    <span className="text-cyan-400 font-bold">{count} e⁻</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: USES & HISTORY */}
        {activeTab === 'uses' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Calendar className="w-4 h-4" />
                <span>{language === 'tr' ? 'Keşif ve Tarihçe' : 'Discovery & History'}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <p>
                  <strong className="text-slate-400">
                    {language === 'tr' ? 'Keşif Yılı: ' : 'Year: '}
                  </strong>
                  <span className="text-white font-mono">{selectedElement.discoveryYear}</span>
                </p>
                <p>
                  <strong className="text-slate-400">
                    {language === 'tr' ? 'Kaşif: ' : 'Discovered by: '}
                  </strong>
                  <span className="text-white">{selectedElement.discoveredBy}</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>{language === 'tr' ? 'Yaygın Kullanım Alanları' : 'Common Applications'}</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                {usesList.map((use, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Compass className="w-4 h-4" />
                <span>{language === 'tr' ? 'Doğadaki Varlık' : 'Natural Abundance'}</span>
              </div>
              <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                <p>
                  <span className="text-slate-500">
                    {language === 'tr' ? 'Yer Kabuğu: ' : 'Earth Crust: '}
                  </span>
                  {selectedElement.abundanceCrust != null
                    ? `${selectedElement.abundanceCrust} ppm`
                    : 'Eser / Yapay'}
                </p>
                <p>
                  <span className="text-slate-500">
                    {language === 'tr' ? 'Evren: ' : 'Universe: '}
                  </span>
                  {selectedElement.abundanceUniverse != null
                    ? `${selectedElement.abundanceUniverse} ppm`
                    : 'Bilinmiyor'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OPTICAL EMISSION SPECTRUM */}
        {activeTab === 'spectrum' && (
          <SpectrumViewer element={selectedElement} language={language} />
        )}

        {/* TAB 6: ISOTOPES & RADIOACTIVITY */}
        {activeTab === 'isotopes' && (
          <div className="space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Radiation className="w-4 h-4" />
                <span>{language === 'tr' ? 'Bilinen İzotoplar ve Radyoaktiflik' : 'Known Isotopes & Radioactivity'}</span>
              </div>
              <button
                onClick={() => {
                  sound.playSelect();
                  setAtomViewModel('decay');
                }}
                className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-[10px] font-bold transition-all flex items-center gap-1 shadow-lg"
              >
                <Zap className="w-3 h-3" />
                <span>{language === 'tr' ? '3B Bozunmayı Başlat' : 'Simulate 3D Decay'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {(allIsotopes[selectedElement.symbol] || [
                {
                  massNumber: Math.round(selectedElement.atomicMass),
                  protons: selectedElement.atomicNumber,
                  neutrons: Math.round(selectedElement.atomicMass) - selectedElement.atomicNumber,
                  abundancePercent: 100,
                  halfLifeText: 'Kararlı (Stable)',
                  decayMode: 'stable' as const,
                  descriptionTr: 'Kararlı izotop; radyoaktif bozunma göstermez.',
                  descriptionEn: 'Stable isotope; does not undergo spontaneous decay.'
                }
              ]).map((iso, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono text-sm">
                        {selectedElement.symbol}-{iso.massNumber}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          iso.decayMode === 'stable'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                        }`}
                      >
                        {iso.decayMode === 'stable'
                          ? language === 'tr' ? 'Kararlı' : 'Stable'
                          : `${iso.decayMode} ${language === 'tr' ? 'Bozunması' : 'Decay'}`}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-cyan-400">
                      {iso.abundancePercent != null && iso.abundancePercent > 0
                        ? `%${iso.abundancePercent.toFixed(2)}`
                        : language === 'tr' ? 'İz Miktar / Sentetik' : 'Trace / Synthetic'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
                    <div>
                      <span className="text-slate-500">
                        {language === 'tr' ? 'Yarılanma Ömrü: ' : 'Half-life: '}
                      </span>
                      <span className="text-amber-300">{iso.halfLifeText}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">
                        {language === 'tr' ? 'Nötron (N): ' : 'Neutrons: '}
                      </span>
                      <span className="text-white">{iso.neutrons}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    {language === 'tr' ? iso.descriptionTr : iso.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
