import React, { useState, useRef, useEffect } from 'react';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import type { ViewLayout, ColorMode } from '../../types/element';
import {
  Layers,
  Palette,
  Search,
  Globe,
  Sparkles,
  RotateCcw,
  ArrowRightLeft,
  HelpCircle,
  Volume2,
  VolumeX,
  FlaskConical,
  Trophy
} from 'lucide-react';
import { CATEGORY_COLORS } from '../../utils/elementCalculators';
import { sound } from '../../audio/soundEngine';

interface ToolbarProps {
  onOpenShortcuts: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenShortcuts }) => {
  const {
    viewLayout,
    setViewLayout,
    colorMode,
    setColorMode,
    searchQuery,
    setSearchQuery,
    language,
    setLanguage,
    setSelectedElement,
    setIsCompareOpen,
    isCompareOpen,
    setIsCompoundBuilderOpen,
    isCompoundBuilderOpen,
    setIsQuizOpen,
    isQuizOpen,
    isSoundMuted,
    toggleSoundMute,
    elements,
    performanceMode,
    setPerformanceMode
  } = usePeriodicStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const layouts: { id: ViewLayout; labelTr: string; labelEn: string }[] = [
    { id: 'table', labelTr: '3B Tablo', labelEn: '3D Table' },
    { id: 'flat', labelTr: '2B Düz', labelEn: '2D Flat' },
    { id: 'sphere', labelTr: 'Küre', labelEn: 'Sphere' },
    { id: 'helix', labelTr: 'Sarmal', labelEn: 'Helix' }
  ];

  const colorModes: { id: ColorMode; labelTr: string; labelEn: string }[] = [
    { id: 'category', labelTr: 'Kategori', labelEn: 'Category' },
    { id: 'block', labelTr: 'Blok', labelEn: 'Block' },
    { id: 'state', labelTr: 'Madde Hâli', labelEn: 'State' },
    { id: 'electronegativity', labelTr: 'Elektronegatiflik', labelEn: 'Electronegativity' },
    { id: 'density', labelTr: 'Yoğunluk', labelEn: 'Density' },
    { id: 'discoveryYear', labelTr: 'Keşif Yılı', labelEn: 'Discovery' }
  ];

  const searchSuggestions = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return elements
      .filter(
        (el) =>
          el.symbol.toLowerCase().includes(q) ||
          el.name.tr.toLowerCase().includes(q) ||
          el.name.en.toLowerCase().includes(q) ||
          el.atomicNumber.toString() === q
      )
      .slice(0, 6);
  }, [elements, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* Brand Badge - Pitch Dark Luxury */}
      <div className="flex items-center gap-2.5 p-1.5 px-3 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 pointer-events-auto shadow-2xl">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div>
          <h1 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
            <span>{language === 'tr' ? '3B Periyodik Tablo' : '3D Periodic Table'}</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              60 FPS
            </span>
          </h1>
        </div>
      </div>

      {/* Center Search Input with Instant Dropdown */}
      <div
        ref={searchContainerRef}
        className="relative pointer-events-auto min-w-[260px] max-w-sm flex-1"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={
            language === 'tr'
              ? 'Element ara (Au, Demir, 26)... [/]'
              : 'Search element (Au, Iron, 26)... [/]'
          }
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchFocused(true);
          }}
          onFocus={() => setIsSearchFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchSuggestions.length > 0) {
              setSelectedElement(searchSuggestions[0]);
              setIsSearchFocused(false);
            }
          }}
          className="w-full pl-10 pr-8 py-2 text-xs rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 transition-all shadow-2xl"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsSearchFocused(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        )}

        {/* Live Search Suggestions Dropdown */}
        {isSearchFocused && searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 p-1.5 rounded-2xl bg-black/90 backdrop-blur-2xl border border-cyan-500/40 shadow-2xl flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2">
            {searchSuggestions.map((item) => (
              <div
                key={item.atomicNumber}
                onClick={() => {
                  sound.playSelect();
                  setSelectedElement(item);
                  setIsSearchFocused(false);
                }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono border"
                    style={{
                      borderColor: CATEGORY_COLORS[item.category],
                      backgroundColor: `${CATEGORY_COLORS[item.category]}20`,
                      color: CATEGORY_COLORS[item.category]
                    }}
                  >
                    {item.symbol}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {language === 'tr' ? item.name.tr : item.name.en}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.block}-blok, Periyot {item.period}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-cyan-400">#{item.atomicNumber}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls cluster */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Layout Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 gap-1 shadow-2xl">
          <Layers className="w-3.5 h-3.5 ml-2 mr-1 text-cyan-400" />
          {layouts.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                sound.playWhoosh();
                setViewLayout(l.id);
              }}
              className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all ${
                viewLayout === l.id
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {language === 'tr' ? l.labelTr : l.labelEn}
            </button>
          ))}
        </div>

        {/* Color Mode Dropdown */}
        <div className="flex items-center p-1 px-2.5 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 gap-2 shadow-2xl">
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value as ColorMode)}
            className="bg-transparent text-xs text-slate-300 font-medium focus:outline-none cursor-pointer"
          >
            {colorModes.map((cm) => (
              <option key={cm.id} value={cm.id} className="bg-slate-950 text-slate-200">
                {language === 'tr' ? cm.labelTr : cm.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Compound Builder (Molekül Sandbox) Button */}
        <button
          onClick={() => {
            sound.playSelect();
            setIsCompoundBuilderOpen(!isCompoundBuilderOpen);
          }}
          className={`p-2 px-3 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xl ${
            isCompoundBuilderOpen
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title={language === 'tr' ? 'Molekül Oluşturucu Sandbox' : 'Molecule Builder Sandbox'}
        >
          <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{language === 'tr' ? 'Molekül' : 'Molecules'}</span>
        </button>

        {/* Chemistry Quiz (Kimya Avcısı) Button */}
        <button
          onClick={() => {
            sound.playSelect();
            setIsQuizOpen(!isQuizOpen);
          }}
          className={`p-2 px-3 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xl ${
            isQuizOpen
              ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title={language === 'tr' ? 'Kimya Avcısı / Quiz Modu' : 'Chemistry Hunter / Quiz Mode'}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{language === 'tr' ? 'Quiz' : 'Quiz'}</span>
        </button>

        {/* Compare Mode Button */}
        <button
          onClick={() => {
            sound.playSelect();
            setIsCompareOpen(!isCompareOpen);
          }}
          className={`p-2 px-3 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xl ${
            isCompareOpen
              ? 'bg-cyan-500 text-white border-cyan-400 shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title={language === 'tr' ? 'Elementleri Karşılaştır (C)' : 'Compare Elements (C)'}
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'tr' ? 'Kıyasla' : 'Compare'}</span>
        </button>

        {/* Sound Toggle (Web Audio Synthesizer) */}
        <button
          onClick={() => {
            toggleSoundMute();
            sound.toggleMute();
            if (isSoundMuted) sound.playSelect();
          }}
          className={`p-2 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 transition-all flex items-center justify-center shadow-2xl ${
            !isSoundMuted
              ? 'text-cyan-400 hover:bg-white/5'
              : 'text-slate-600 hover:text-slate-400'
          }`}
          title={
            language === 'tr'
              ? !isSoundMuted ? 'Sesi Kapat (Mute)' : 'Sesi Aç (Unmute)'
              : !isSoundMuted ? 'Mute Audio' : 'Unmute Audio'
          }
        >
          {!isSoundMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
          className="p-2 px-3 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 shadow-2xl"
          title="Change language / Dil değiştir"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language.toUpperCase()}</span>
        </button>

        {/* Performance Mode Toggle */}
        <button
          onClick={() => setPerformanceMode(!performanceMode)}
          className={`p-2 px-2.5 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 text-xs font-mono transition-all flex items-center gap-1 shadow-2xl ${
            performanceMode
              ? 'bg-amber-500 text-black font-bold'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title={
            language === 'tr'
              ? 'Performans Modu (Post-processing aç/kapat)'
              : 'Performance Mode (Toggle Bloom & Post-processing)'
          }
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{performanceMode ? 'PERF' : 'FX'}</span>
        </button>

        {/* Keyboard Shortcuts Help */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all shadow-2xl"
          title={language === 'tr' ? 'Klavye Kısayolları (?)' : 'Keyboard Shortcuts (?)'}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Reset Camera View */}
        <button
          onClick={() => {
            sound.playWhoosh();
            setSelectedElement(null);
          }}
          className="p-2 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all shadow-2xl"
          title={language === 'tr' ? 'Kamerayı Sıfırla' : 'Reset Camera'}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
