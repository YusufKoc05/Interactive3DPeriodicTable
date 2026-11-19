import React, { useMemo } from 'react';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import { getPhysicalStateAtTemp } from '../../utils/elementCalculators';
import { Thermometer, Flame, Snowflake, Sun } from 'lucide-react';

export const TemperatureSlider: React.FC = () => {
  const { temperature, setTemperature, elements, language } = usePeriodicStore();

  const celsius = (temperature - 273.15).toFixed(1);

  const stateCounts = useMemo(() => {
    let solid = 0;
    let liquid = 0;
    let gas = 0;
    elements.forEach((elem) => {
      const st = getPhysicalStateAtTemp(elem, temperature);
      if (st === 'solid') solid++;
      else if (st === 'liquid') liquid++;
      else if (st === 'gas') gas++;
    });
    return { solid, liquid, gas };
  }, [elements, temperature]);

  const presets = [
    { label: '0 K', temp: 0, icon: Snowflake, title: 'Mutlak Sıfır' },
    { label: '77 K', temp: 77.36, icon: Snowflake, title: 'Sıvı Azot' },
    { label: '298 K', temp: 298.15, icon: Thermometer, title: 'Oda Sıcaklığı (25°C)' },
    { label: '1811 K', temp: 1811, icon: Flame, title: 'Demir Erimesi' },
    { label: '5778 K', temp: 5778, icon: Sun, title: 'Güneş Yüzeyi' }
  ];

  return (
    <div className="absolute bottom-5 left-5 z-20 w-80 p-3.5 rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/10 text-slate-200 pointer-events-auto shadow-2xl flex flex-col gap-2.5">
      {/* Header and Value readout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Thermometer className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            {language === 'tr' ? 'Termal Simülasyon' : 'Thermal Simulation'}
          </span>
        </div>
        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-sm font-bold text-cyan-400">{Math.round(temperature)} K</span>
          <span className="text-[10px] text-slate-400">({celsius} °C)</span>
        </div>
      </div>

      {/* Main Slider */}
      <div className="relative flex items-center">
        <input
          type="range"
          min="0"
          max="6000"
          step="1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* State breakdown counters */}
      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
        <div className="p-1.5 rounded-xl bg-white/5 border border-white/5">
          <span className="text-slate-400 block">{language === 'tr' ? 'Katı' : 'Solid'}</span>
          <strong className="text-sky-300 font-mono text-xs">{stateCounts.solid}</strong>
        </div>
        <div className="p-1.5 rounded-xl bg-white/5 border border-white/5">
          <span className="text-slate-400 block">{language === 'tr' ? 'Sıvı' : 'Liquid'}</span>
          <strong className="text-emerald-300 font-mono text-xs">{stateCounts.liquid}</strong>
        </div>
        <div className="p-1.5 rounded-xl bg-white/5 border border-white/5">
          <span className="text-slate-400 block">{language === 'tr' ? 'Gaz' : 'Gas'}</span>
          <strong className="text-rose-300 font-mono text-xs">{stateCounts.gas}</strong>
        </div>
      </div>

      {/* Quick presets */}
      <div className="flex items-center justify-between pt-1 border-t border-white/10">
        {presets.map((p) => {
          const Icon = p.icon;
          const isActive = Math.abs(temperature - p.temp) < 2;
          return (
            <button
              key={p.label}
              onClick={() => setTemperature(p.temp)}
              title={p.title}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all ${
                isActive
                  ? 'bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-2.5 h-2.5" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
