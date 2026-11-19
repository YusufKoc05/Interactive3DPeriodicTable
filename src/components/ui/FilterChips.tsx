import React, { useState } from 'react';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import type { ElementCategory, ElementBlock } from '../../types/element';
import { CATEGORY_COLORS, CATEGORY_LABELS, BLOCK_COLORS } from '../../utils/elementCalculators';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export const FilterChips: React.FC = () => {
  const {
    filterCategory,
    setFilterCategory,
    filterBlock,
    setFilterBlock,
    filterState,
    setFilterState,
    language
  } = usePeriodicStore();

  const [isExpanded, setIsExpanded] = useState(false);

  const categories: ElementCategory[] = [
    'alkali-metal',
    'alkaline-earth',
    'transition-metal',
    'post-transition-metal',
    'metalloid',
    'reactive-nonmetal',
    'halogen',
    'noble-gas',
    'lanthanide',
    'actinide'
  ];

  const blocks: ElementBlock[] = ['s', 'p', 'd', 'f'];

  const hasActiveFilter =
    filterCategory !== 'all' || filterBlock !== 'all' || filterState !== 'all';

  const activeCategoryLabel =
    filterCategory !== 'all' ? CATEGORY_LABELS[filterCategory]?.[language] : null;

  return (
    <div className="absolute top-20 left-4 z-20 flex flex-col gap-2 max-w-sm pointer-events-none">
      {/* Collapsed Header / Toggle Pill */}
      <div className="p-1.5 px-3 rounded-2xl bg-black/75 backdrop-blur-2xl border border-white/10 text-slate-300 pointer-events-auto shadow-2xl flex items-center justify-between gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-semibold text-white hover:text-cyan-400 transition-colors"
        >
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {activeCategoryLabel
              ? `${activeCategoryLabel}`
              : filterBlock !== 'all'
              ? `${filterBlock.toUpperCase()}-Blok`
              : language === 'tr'
              ? 'Filtreler'
              : 'Filters'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {hasActiveFilter && (
          <button
            onClick={() => {
              setFilterCategory('all');
              setFilterBlock('all');
              setFilterState('all');
            }}
            className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 flex items-center gap-1 transition-all"
            title="Filtreleri Sıfırla"
          >
            <X className="w-2.5 h-2.5" />
            <span>{language === 'tr' ? 'Temizle' : 'Reset'}</span>
          </button>
        )}
      </div>

      {/* Expanded Categories Drawer */}
      {isExpanded && (
        <div className="p-3 rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/10 text-slate-300 pointer-events-auto shadow-2xl flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const isSelected = filterCategory === cat;
              const color = CATEGORY_COLORS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(isSelected ? 'all' : cat)}
                  style={{
                    backgroundColor: isSelected ? `${color}25` : 'rgba(255, 255, 255, 0.03)',
                    borderColor: isSelected ? color : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#ffffff' : '#94a3b8'
                  }}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-medium border transition-all hover:text-white flex items-center gap-1.5"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate">{CATEGORY_LABELS[cat]?.[language]}</span>
                </button>
              );
            })}
          </div>

          {/* Block Selector (s, p, d, f) */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between px-1">
            <span className="text-[10px] text-slate-400 font-mono">
              {language === 'tr' ? 'Bloklar:' : 'Blocks:'}
            </span>
            <div className="flex items-center gap-1">
              {blocks.map((b) => {
                const isSelected = filterBlock === b;
                const color = BLOCK_COLORS[b];
                return (
                  <button
                    key={b}
                    onClick={() => setFilterBlock(isSelected ? 'all' : b)}
                    style={{
                      backgroundColor: isSelected ? color : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#000000' : color,
                      borderColor: `${color}50`
                    }}
                    className="w-6 h-6 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center"
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
