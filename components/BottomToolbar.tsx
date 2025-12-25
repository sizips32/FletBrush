
import React from 'react';

interface BottomToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const BottomToolbar: React.FC<BottomToolbarProps> = ({ 
  onUndo, onRedo, onClear, canUndo, canRedo 
}) => {
  return (
    <div className="flex items-center gap-1 p-2 bg-white/90 dark:bg-[#1a2634]/90 backdrop-blur-sm rounded-full shadow-float border border-[#f0f2f5]/50 dark:border-[#2a3644]/50">
      <button 
        onClick={onUndo}
        disabled={!canUndo}
        className={`size-12 flex items-center justify-center rounded-full transition-colors ${canUndo ? 'text-[#101418] dark:text-white hover:bg-[#f0f2f5] dark:hover:bg-[#324050]' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
        title="Undo (↺)"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>undo</span>
      </button>
      
      <button 
        onClick={onRedo}
        disabled={!canRedo}
        className={`size-12 flex items-center justify-center rounded-full transition-colors ${canRedo ? 'text-[#101418] dark:text-white hover:bg-[#f0f2f5] dark:hover:bg-[#324050]' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
        title="Redo (↻)"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>redo</span>
      </button>
      
      <div className="w-px h-6 bg-[#dae0e7] dark:bg-[#3a4654] mx-2"></div>
      
      <button 
        onClick={onClear}
        className="h-12 px-6 flex items-center justify-center rounded-full text-[#ef4444] font-bold text-sm hover:bg-[#fff0f0] dark:hover:bg-[#3f1d1d] transition-colors"
        title="Clear All (🗑)"
      >
        <span className="material-symbols-outlined mr-2" style={{ fontSize: '20px' }}>delete</span>
        Clear All
      </button>
    </div>
  );
};

export default BottomToolbar;
