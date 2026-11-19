import React from 'react';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import { X, Keyboard, Mouse } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  const language = usePeriodicStore((s) => s.language);

  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', descTr: 'Hızlı arama çubuğuna odaklan', descEn: 'Focus quick search bar' },
    { key: 'ESC', descTr: 'Bilgi kartını veya modalları kapat', descEn: 'Close card or modals' },
    { key: '← / →', descTr: 'Önceki / sonraki elemente geç', descEn: 'Navigate prev / next element' },
    { key: 'Space', descTr: '3B atom animasyonunu durdur / oynat', descEn: 'Pause / play 3D atom spin' },
    { key: 'B', descTr: 'Bohr ↔ Kuantum bulut modeli geçişi', descEn: 'Toggle Bohr ↔ Quantum cloud' },
    { key: 'C', descTr: 'Element karşılaştırma modunu aç / kapat', descEn: 'Toggle comparison modal' },
    { key: '1 - 4', descTr: 'Tablo, Düz, Küre ve Sarmal düzenleri', descEn: 'Switch Table, Flat, Sphere, Helix' }
  ];

  const mouseControls = [
    { actionTr: 'Sol Tık + Sürükle', actionEn: 'Left Click + Drag', descTr: '3B Sahneyi döndür', descEn: 'Rotate 3D scene' },
    { actionTr: 'Sağ Tık + Sürükle', actionEn: 'Right Click + Drag', descTr: 'Sahneyi kaydır (Pan)', descEn: 'Pan scene' },
    { actionTr: 'Fare Tekerleği', actionEn: 'Scroll Wheel', descTr: 'Yakınlaştır / Uzaklaştır', descEn: 'Zoom in / out' },
    { actionTr: 'Elemente Tıkla', actionEn: 'Click Element', descTr: '3B Atomu ve bilgi kartını aç', descEn: 'Open 3D atom & info card' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl glass-panel-glow text-slate-100 flex flex-col shadow-2xl overflow-hidden border border-cyan-500/40 animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'tr' ? 'Kontroller & Kısayollar' : 'Controls & Shortcuts'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'tr'
                  ? 'Uygulamayı klavye ve fare ile hızlıca yönetin'
                  : 'Navigate the application effortlessly with shortcuts'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 max-h-[70vh]">
          {/* Keyboard Shortcuts Table */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" />
              <span>{language === 'tr' ? 'Klavye Tuşları' : 'Keyboard Keys'}</span>
            </span>
            <div className="space-y-1.5">
              {shortcuts.map((sc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                >
                  <span className="text-slate-300">
                    {language === 'tr' ? sc.descTr : sc.descEn}
                  </span>
                  <kbd className="px-2 py-1 rounded-md bg-slate-950 border border-slate-700 font-mono font-bold text-cyan-400 text-[11px]">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Mouse Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
              <Mouse className="w-3.5 h-3.5" />
              <span>{language === 'tr' ? 'Fare & Dokunmatik' : 'Mouse & Touch'}</span>
            </span>
            <div className="space-y-1.5">
              {mouseControls.map((mc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                >
                  <span className="text-slate-300">
                    {language === 'tr' ? mc.descTr : mc.descEn}
                  </span>
                  <span className="font-mono text-indigo-300 text-[11px]">
                    {language === 'tr' ? mc.actionTr : mc.actionEn}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
