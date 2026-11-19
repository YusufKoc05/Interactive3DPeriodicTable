import React, { useState, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import { generateProceduralCompound } from '../../utils/dynamicCompoundEngine';
import { MoleculeViewer3D } from '../scene/MoleculeViewer3D';
import compoundsDataRaw from '../../data/compounds.json';
import type { ChemicalCompound } from '../../types/advancedFeatures';
import {
  X,
  Plus,
  Minus,
  Sparkles,
  FlaskConical,
  RotateCcw,
  Volume2,
  Atom,
  Search,
  BookOpen
} from 'lucide-react';
import { sound } from '../../audio/soundEngine';
import { speech } from '../../audio/speechEngine';

const presetCompounds = compoundsDataRaw as unknown as ChemicalCompound[];

export const CompoundBuilderModal: React.FC = () => {
  const { isCompoundBuilderOpen, setIsCompoundBuilderOpen, language, elements } = usePeriodicStore();

  // Active builder inventory
  const [inventory, setInventory] = useState<{ [symbol: string]: number }>({
    O: 2
  });

  const [activeTab, setActiveTab] = useState<'free' | 'presets'>('free');
  const [elementSearch, setElementSearch] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);

  // Common quick palette
  const quickPaletteSymbols = ['H', 'C', 'N', 'O', 'F', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'K', 'Ca', 'Fe', 'Cu'];

  // Procedural Compound Engine calculation
  const dynamicResult = useMemo(() => {
    return generateProceduralCompound(inventory);
  }, [inventory]);

  // Voice narration upon synthesis
  useEffect(() => {
    if (isCompoundBuilderOpen && autoSpeak && Object.keys(inventory).length > 0) {
      const text = language === 'tr' ? dynamicResult.spokenTextTr : dynamicResult.spokenTextEn;
      speech.speak(text, language);
    }
  }, [dynamicResult, isCompoundBuilderOpen, autoSpeak, language]);

  const addAtom = (symbol: string) => {
    sound.playSelect();
    setInventory((prev) => ({
      ...prev,
      [symbol]: (prev[symbol] || 0) + 1
    }));
  };

  const removeAtom = (symbol: string) => {
    sound.playHover(20);
    setInventory((prev) => {
      const count = prev[symbol] || 0;
      if (count <= 1) {
        const next = { ...prev };
        delete next[symbol];
        return next;
      }
      return { ...prev, [symbol]: count - 1 };
    });
  };

  const resetInventory = () => {
    sound.playWhoosh();
    speech.stop();
    setInventory({});
  };

  const loadPreset = (preset: ChemicalCompound) => {
    sound.playReactionSuccess();
    setInventory({ ...preset.elements });
  };

  const speakCurrentCompound = () => {
    sound.playSelect();
    const text = language === 'tr' ? dynamicResult.spokenTextTr : dynamicResult.spokenTextEn;
    speech.speak(text, language);
  };

  if (!isCompoundBuilderOpen) return null;

  const currentCompound = dynamicResult.compound;

  const filteredPaletteElements = elements.filter((el) => {
    if (!elementSearch.trim()) return quickPaletteSymbols.includes(el.symbol);
    const q = elementSearch.toLowerCase().trim();
    return (
      el.symbol.toLowerCase().includes(q) ||
      el.name.tr.toLowerCase().includes(q) ||
      el.name.en.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] rounded-3xl bg-black/95 border border-white/15 text-slate-100 flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>{language === 'tr' ? 'Molekül Oluşturucu & Bağ Laboratuvarı' : 'Molecule Builder & Bonding Lab'}</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                  {language === 'tr' ? 'Dinamik Sentez' : 'Dynamic Synthesis'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'tr'
                  ? 'Atomları birleştirin; kovalent, iyonik ve metalik bağları sesli ve 3B olarak öğrenin'
                  : 'Combine atoms to synthesize molecules with real-time 3D models and speech narration'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-Speech Toggle */}
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                autoSpeak
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title="Otomatik sesli anlatım"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold">{language === 'tr' ? 'Sesli Anlatım' : 'Voice'}</span>
            </button>

            <button
              onClick={() => {
                speech.stop();
                setIsCompoundBuilderOpen(false);
              }}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Atoms Workbench & Inventory (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Mode Switch Tabs (Free Lab vs Presets) */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 gap-1 text-xs">
              <button
                onClick={() => setActiveTab('free')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'free'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Atom className="w-3.5 h-3.5" />
                <span>{language === 'tr' ? 'Serbest Sentez' : 'Free Synthesis'}</span>
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{language === 'tr' ? 'Hazır Moleküller' : 'Preset Catalog'}</span>
              </button>
            </div>

            {/* PRESETS LIST TAB */}
            {activeTab === 'presets' && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 animate-in fade-in">
                <span className="text-xs font-bold text-slate-300 block">
                  {language === 'tr' ? 'Popüler Kimyasal Moleküller Kataloğu' : 'Standard Molecule Presets'}
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                  {presetCompounds.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => loadPreset(comp)}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-slate-800 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black font-mono text-cyan-400 group-hover:text-white">
                          {comp.formula}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">
                          {comp.bondType.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300 block truncate">
                        {language === 'tr' ? comp.nameTr : comp.nameEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FREE SYNTHESIS PALETTE */}
            {activeTab === 'free' && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 animate-in fade-in">
                {/* Search Bar for 118 Elements */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={elementSearch}
                    onChange={(e) => setElementSearch(e.target.value)}
                    placeholder={
                      language === 'tr' ? '118 Element Ara (ör. H, O, Fe, Au)...' : 'Search 118 elements...'
                    }
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
                  {filteredPaletteElements.map((el) => (
                    <button
                      key={el.symbol}
                      onClick={() => addAtom(el.symbol)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-slate-800 text-center transition-all group"
                    >
                      <span className="block text-sm font-black text-white group-hover:text-emerald-300 font-mono">
                        {el.symbol}
                      </span>
                      <span className="block text-[9px] text-slate-400 truncate">
                        {language === 'tr' ? el.name.tr : el.name.en}
                      </span>
                      <span className="block text-[8px] text-slate-500 font-mono">
                        EN: {el.electronegativity ?? '-'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Inventory & Stoichiometry */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'tr' ? 'Seçili Atomlar (Stokiyometri)' : 'Selected Atoms'}</span>
                </span>
                {Object.keys(inventory).length > 0 && (
                  <button
                    onClick={resetInventory}
                    className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{language === 'tr' ? 'Temizle' : 'Clear'}</span>
                  </button>
                )}
              </div>

              {Object.keys(inventory).length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500 italic">
                  {language === 'tr'
                    ? 'Yukarıdan atom seçin (örnek: 2 adet O ekleyerek O₂ oluşturun)'
                    : 'Select atoms above (e.g. add two O atoms to create O₂)'}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(inventory).map(([sym, count]) => (
                    <div
                      key={sym}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold font-mono text-xs flex items-center justify-center border border-emerald-500/30">
                          {sym}
                        </span>
                        <span className="text-xs font-bold text-white font-mono">{sym}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => removeAtom(sym)}
                          className="w-5 h-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center font-mono font-bold text-xs text-white">
                          {count}
                        </span>
                        <button
                          onClick={() => addAtom(sym)}
                          className="w-5 h-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 3D Ball-and-Stick Viewer & Bonding Analysis (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* 3D Canvas Viewport */}
            <div className="relative w-full h-80 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
              {Object.keys(inventory).length > 0 && currentCompound.atoms.length > 0 ? (
                <>
                  <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                    <ambientLight intensity={0.9} />
                    <pointLight position={[10, 10, 10]} intensity={1.6} />
                    <pointLight position={[-10, -10, -10]} intensity={0.6} />
                    <MoleculeViewer3D compound={currentCompound} />
                    <OrbitControls enableZoom={true} enablePan={false} />
                  </Canvas>

                  {/* Formula and Speak Button Overlay */}
                  <div className="absolute top-3 left-3 p-2 px-3 rounded-2xl bg-black/85 backdrop-blur-md border border-white/15 flex items-center gap-3 shadow-xl">
                    <span className="text-lg font-black text-cyan-400 font-mono tracking-wider">
                      {currentCompound.formula}
                    </span>
                    <div className="h-4 w-px bg-white/20" />
                    <span className="text-xs text-white font-bold">
                      {language === 'tr' ? currentCompound.nameTr : currentCompound.nameEn}
                    </span>
                    <button
                      onClick={speakCurrentCompound}
                      className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black transition-all"
                      title="Seslendir / Dinle"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-center p-6 text-slate-500">
                  <FlaskConical className="w-12 h-12 opacity-30 animate-pulse text-cyan-400" />
                  <p className="text-xs max-w-sm">
                    {language === 'tr'
                      ? 'Atom havuzundan element ekleyin (örneğin 2 adet Oksijen seçin). Sistem anında bağ türünü hesaplayıp 3B molekülü oluşturacak ve seslendirecektir.'
                      : 'Add atoms to build a molecule. The engine will calculate bonding, create the 3D model, and speak the compound name.'}
                  </p>
                </div>
              )}
            </div>

            {/* Bonding & Educational Analysis Card */}
            {Object.keys(inventory).length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {language === 'tr' ? 'Kimyasal Bağ & Geometri Analizi' : 'Chemical Bonding & Geometry'}
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      currentCompound.bondType === 'ionic'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : currentCompound.bondType === 'polar_covalent'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : currentCompound.bondType === 'metallic'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {currentCompound.bondType.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      {language === 'tr' ? 'Molekül Geometrisi:' : 'Molecular Geometry:'}
                    </span>
                    <span className="font-bold text-cyan-300">{currentCompound.geometry}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      {language === 'tr' ? 'Elektronegatiflik Farkı (ΔEN):' : 'Electronegativity Diff (ΔEN):'}
                    </span>
                    <span className="font-bold text-amber-300 font-mono">
                      {currentCompound.deltaElectronegativity.toFixed(2)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  {language === 'tr' ? currentCompound.descriptionTr : currentCompound.descriptionEn}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
