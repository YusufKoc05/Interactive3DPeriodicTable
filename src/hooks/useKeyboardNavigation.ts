import { useEffect } from 'react';
import { usePeriodicStore } from '../store/usePeriodicStore';

export function useKeyboardNavigation(openShortcutsModal: () => void) {
  const {
    selectedElement,
    setSelectedElement,
    selectNextElement,
    selectPrevElement,
    setViewLayout,
    atomViewModel,
    setAtomViewModel,
    isAtomSpinning,
    setIsAtomSpinning,
    isCompareOpen,
    setIsCompareOpen
  } = usePeriodicStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or select
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'select' || activeTag === 'textarea') {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      switch (e.key) {
        case '/':
          e.preventDefault();
          document.querySelector<HTMLInputElement>('header input[type="text"]')?.focus();
          break;

        case 'Escape':
          if (isCompareOpen) {
            setIsCompareOpen(false);
          } else if (selectedElement) {
            setSelectedElement(null);
          }
          break;

        case 'ArrowRight':
          if (selectedElement) selectNextElement();
          break;

        case 'ArrowLeft':
          if (selectedElement) selectPrevElement();
          break;

        case ' ':
          e.preventDefault();
          setIsAtomSpinning(!isAtomSpinning);
          break;

        case 'b':
        case 'B':
          setAtomViewModel(atomViewModel === 'bohr' ? 'orbital' : 'bohr');
          break;

        case 'c':
        case 'C':
          setIsCompareOpen(!isCompareOpen);
          break;

        case '?':
          openShortcutsModal();
          break;

        case '1':
          setViewLayout('table');
          break;
        case '2':
          setViewLayout('flat');
          break;
        case '3':
          setViewLayout('sphere');
          break;
        case '4':
          setViewLayout('helix');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedElement,
    setSelectedElement,
    selectNextElement,
    selectPrevElement,
    setViewLayout,
    atomViewModel,
    setAtomViewModel,
    isAtomSpinning,
    setIsAtomSpinning,
    isCompareOpen,
    setIsCompareOpen,
    openShortcutsModal
  ]);
}
