import React from 'react';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../utils/elementCalculators';
import { X, ArrowRightLeft } from 'lucide-react';

export const ComparisonModal: React.FC = () => {
  const {
    isCompareOpen,
    setIsCompareOpen,
    compareElements,
    setCompareElement,
    elements,
    language
  } = usePeriodicStore();

  if (!isCompareOpen) return null;

  const [elemA, elemB] = compareElements;

  // Defaults if empty
  const activeA = elemA || elements[5]; // Carbon by default
  const activeB = elemB || elements[13]; // Silicon by default

  const renderComparisonRow = (
    labelTr: string,
    labelEn: string,
    valA: number | string | null,
    valB: number | string | null,
    unit: string = ''
  ) => {
    const isNum = typeof valA === 'number' && typeof valB === 'number';
    const numA = isNum ? (valA as number) : 0;
    const numB = isNum ? (valB as number) : 0;
    const maxVal = Math.max(numA, numB, 0.001);

    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-cyan-400">
            {valA != null ? `${valA} ${unit}` : '—'}
          </span>
          <span className="text-slate-400 font-medium">
            {language === 'tr' ? labelTr : labelEn}
          </span>
          <span className="font-mono font-bold text-amber-400">
            {valB != null ? `${valB} ${unit}` : '—'}
          </span>
        </div>

        {/* Comparative horizontal visual bar */}
        {isNum && valA != null && valB != null && (
          <div className="grid grid-cols-2 gap-2 h-2 rounded-full overflow-hidden bg-slate-950">
            <div className="flex justify-end">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (numA / maxVal) * 100)}%` }}
              />
            </div>
            <div className="flex justify-start">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (numB / maxVal) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-black/95 backdrop-blur-3xl text-slate-100 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden border border-white/15 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'tr' ? 'Element Karşılaştırma Modu' : 'Element Comparison Mode'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'tr'
                  ? 'İki element seçerek fiziksel ve kimyasal parametreleri yan yana inceleyin'
                  : 'Select two elements to compare physical and chemical properties side-by-side'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCompareOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selectors Header */}
        <div className="grid grid-cols-2 gap-4 p-5 border-b border-slate-800/80 bg-slate-950/40">
          {/* Element A Selector */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-xl border shrink-0"
              style={{
                borderColor: CATEGORY_COLORS[activeA.category],
                backgroundColor: `${CATEGORY_COLORS[activeA.category]}20`,
                color: CATEGORY_COLORS[activeA.category]
              }}
            >
              <span className="text-[9px] font-mono opacity-70 leading-none">
                {activeA.atomicNumber}
              </span>
              <span>{activeA.symbol}</span>
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-cyan-400 font-bold block mb-1">
                {language === 'tr' ? '1. ELEMENT' : 'ELEMENT A'}
              </span>
              <select
                value={activeA.atomicNumber}
                onChange={(e) => {
                  const el = elements.find((x) => x.atomicNumber === Number(e.target.value));
                  if (el) setCompareElement(0, el);
                }}
                className="w-full p-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {elements.map((el) => (
                  <option key={el.atomicNumber} value={el.atomicNumber}>
                    {el.atomicNumber}. {el.symbol} - {language === 'tr' ? el.name.tr : el.name.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Element B Selector */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-xl border shrink-0"
              style={{
                borderColor: CATEGORY_COLORS[activeB.category],
                backgroundColor: `${CATEGORY_COLORS[activeB.category]}20`,
                color: CATEGORY_COLORS[activeB.category]
              }}
            >
              <span className="text-[9px] font-mono opacity-70 leading-none">
                {activeB.atomicNumber}
              </span>
              <span>{activeB.symbol}</span>
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-amber-400 font-bold block mb-1">
                {language === 'tr' ? '2. ELEMENT' : 'ELEMENT B'}
              </span>
              <select
                value={activeB.atomicNumber}
                onChange={(e) => {
                  const el = elements.find((x) => x.atomicNumber === Number(e.target.value));
                  if (el) setCompareElement(1, el);
                }}
                className="w-full p-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {elements.map((el) => (
                  <option key={el.atomicNumber} value={el.atomicNumber}>
                    {el.atomicNumber}. {el.symbol} - {language === 'tr' ? el.name.tr : el.name.en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable Comparative Metrics */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {renderComparisonRow(
            'Kategori',
            'Category',
            CATEGORY_LABELS[activeA.category]?.[language],
            CATEGORY_LABELS[activeB.category]?.[language]
          )}
          {renderComparisonRow(
            'Atom Numarası',
            'Atomic Number',
            activeA.atomicNumber,
            activeB.atomicNumber
          )}
          {renderComparisonRow(
            'Atom Kütlesi',
            'Atomic Mass',
            Number(activeA.atomicMass.toFixed(3)),
            Number(activeB.atomicMass.toFixed(3)),
            'u'
          )}
          {renderComparisonRow(
            'Elektronegatiflik',
            'Electronegativity',
            activeA.electronegativity,
            activeB.electronegativity,
            'Pauling'
          )}
          {renderComparisonRow(
            'Erime Noktası',
            'Melting Point',
            activeA.meltingPoint,
            activeB.meltingPoint,
            'K'
          )}
          {renderComparisonRow(
            'Kaynama Noktası',
            'Boiling Point',
            activeA.boilingPoint,
            activeB.boilingPoint,
            'K'
          )}
          {renderComparisonRow(
            'Yoğunluk',
            'Density',
            activeA.density,
            activeB.density,
            'g/cm³'
          )}
          {renderComparisonRow(
            'Blok / Periyot',
            'Block / Period',
            `${activeA.block}-blok, P${activeA.period}`,
            `${activeB.block}-blok, P${activeB.period}`
          )}
          {renderComparisonRow(
            'Elektron Kabuk Dağılımı',
            'Shell Distribution',
            activeA.shells.join(' - '),
            activeB.shells.join(' - ')
          )}
        </div>
      </div>
    </div>
  );
};
