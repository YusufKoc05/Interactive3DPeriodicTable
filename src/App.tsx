import React, { useState } from 'react';
import { PeriodicCanvas } from './components/scene/PeriodicCanvas';
import { Toolbar } from './components/ui/Toolbar';
import { FilterChips } from './components/ui/FilterChips';
import { TemperatureSlider } from './components/ui/TemperatureSlider';
import { TooltipHUD } from './components/ui/TooltipHUD';
import { ElementDetailCard } from './components/ui/ElementDetailCard';
import { ComparisonModal } from './components/ui/ComparisonModal';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';
import { CompoundBuilderModal } from './components/ui/CompoundBuilderModal';
import { QuizModal } from './components/ui/QuizModal';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

export const App: React.FC = () => {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Initialize global keyboard shortcuts (/, ESC, Space, B, C, Arrow keys, 1-4)
  useKeyboardNavigation(() => setIsShortcutsOpen(true));

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Top Floating Glass Navigation with Search & Dropdown */}
      <Toolbar onOpenShortcuts={() => setIsShortcutsOpen(true)} />

      {/* Category and Block Filter Chips Bar */}
      <FilterChips />

      {/* Main 3D Canvas Scene with 118 Element Cards & Interactive Atom Model */}
      <main className="w-full h-full">
        <PeriodicCanvas />
      </main>

      {/* Futuristic Hover HUD Tooltip */}
      <TooltipHUD />

      {/* Thermal Simulation Slider Widget (0K - 6000K) */}
      <TemperatureSlider />

      {/* Glassmorphism Full Element Detail Card with 2D Shells & 3D Controls */}
      <ElementDetailCard />

      {/* Side-by-Side Comparison Modal */}
      <ComparisonModal />

      {/* Chemical Compound Builder & Bonding Sandbox Modal */}
      <CompoundBuilderModal />

      {/* Chemistry Hunter Gamified Quiz Modal */}
      <QuizModal />

      {/* Keyboard Shortcuts and Controls Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default App;
