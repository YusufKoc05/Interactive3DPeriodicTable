import React from 'react';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  getPhysicalStateAtTemp
} from '../../utils/elementCalculators';

export const TooltipHUD: React.FC = () => {
  const hoveredElement = usePeriodicStore((s) => s.hoveredElement);
  const selectedElement = usePeriodicStore((s) => s.selectedElement);
  const temperature = usePeriodicStore((s) => s.temperature);
  const language = usePeriodicStore((s) => s.language);

  // If already selecting an element or no hover, hide tooltip
  if (!hoveredElement || selectedElement?.atomicNumber === hoveredElement.atomicNumber) {
    return null;
  }

  const catColor = CATEGORY_COLORS[hoveredElement.category];
  const currentState = getPhysicalStateAtTemp(hoveredElement, temperature);

  return (
    <div className="absolute top-20 right-6 z-20 pointer-events-none transition-all duration-200 animate-in fade-in slide-in-from-top-2">
      <div className="w-64 p-3.5 rounded-2xl glass-panel-glow text-slate-200 shadow-2xl flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black" style={{ color: catColor }}>
              {hoveredElement.symbol}
            </span>
            <span className="text-sm font-bold text-white">
              {language === 'tr' ? hoveredElement.name.tr : hoveredElement.name.en}
            </span>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
            Z = {hoveredElement.atomicNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
            style={{
              backgroundColor: `${catColor}20`,
              borderColor: `${catColor}50`,
              color: catColor
            }}
          >
            {CATEGORY_LABELS[hoveredElement.category]?.[language]}
          </span>
          <span className="text-[10px] text-slate-400 capitalize">
            {language === 'tr' ? `Hâl: ${currentState}` : `State: ${currentState}`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
          <div>
            <span className="text-slate-500 block text-[9px]">
              {language === 'tr' ? 'KÜTLE' : 'MASS'}
            </span>
            <span className="text-slate-300">{hoveredElement.atomicMass.toFixed(3)} u</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">
              {language === 'tr' ? 'DİZİLİM' : 'CONFIG'}
            </span>
            <span className="text-slate-300 truncate block">
              {hoveredElement.electronConfiguration}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
