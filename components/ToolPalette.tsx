
import React, { useState } from 'react';
import { Tool, COLORS, FONTS } from '../types';

interface ToolPaletteProps {
  activeTool: Tool;
  setActiveTool: (t: Tool) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  activeColor: string;
  setActiveColor: (c: string) => void;
  activeFont: string;
  setActiveFont: (f: string) => void;
  activeFontSize: number;
  setActiveFontSize: (s: number) => void;
  panelOpacity: number;
  setPanelOpacity: (o: number) => void;
  isMinimized: boolean;
  setIsMinimized: (m: boolean) => void;
}

const ToolPalette: React.FC<ToolPaletteProps> = ({
  activeTool, setActiveTool,
  brushSize, setBrushSize,
  activeColor, setActiveColor,
  activeFont, setActiveFont,
  activeFontSize, setActiveFontSize,
  panelOpacity, setPanelOpacity,
  isMinimized, setIsMinimized
}) => {
  const [showColorGrid, setShowColorGrid] = useState(false);

  return (
    <div className="bg-white/90 dark:bg-[#1a2634]/90 backdrop-blur-sm px-4 py-2 shadow-soft border-b border-[#f0f2f5]/50 dark:border-[#2a3644]/50 relative overflow-visible">
      <div className="flex flex-col xl:flex-row items-center justify-between gap-3 max-w-[1400px] mx-auto">

        {/* Drawing & Text Tools */}
        <div className="flex flex-col lg:flex-row w-full xl:w-auto items-center gap-3 lg:gap-4">
          <div className="flex items-center bg-[#f0f2f5] dark:bg-[#2a3644] rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setActiveTool(Tool.PEN)}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${activeTool === Tool.PEN ? 'bg-white dark:bg-[#3a4654] text-primary shadow-sm' : 'text-[#5e758d] hover:bg-white/50 dark:hover:bg-[#3a4654]/50'}`}
              title="Pen (✎)"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              onClick={() => setActiveTool(Tool.HIGHLIGHTER)}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${activeTool === Tool.HIGHLIGHTER ? 'bg-white dark:bg-[#3a4654] text-primary shadow-sm' : 'text-[#5e758d] hover:bg-white/50 dark:hover:bg-[#3a4654]/50'}`}
              title="Highlighter (✒)"
            >
              <span className="material-symbols-outlined text-lg">stylus</span>
            </button>
            <button
              onClick={() => setActiveTool(Tool.ERASER)}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${activeTool === Tool.ERASER ? 'bg-white dark:bg-[#3a4654] text-primary shadow-sm' : 'text-[#5e758d] hover:bg-white/50 dark:hover:bg-[#3a4654]/50'}`}
              title="Eraser (⌦)"
            >
              <span className="material-symbols-outlined text-lg">ink_eraser</span>
            </button>
            <button
              onClick={() => setActiveTool(Tool.TEXT)}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${activeTool === Tool.TEXT ? 'bg-white dark:bg-[#3a4654] text-primary shadow-sm' : 'text-[#5e758d] hover:bg-white/50 dark:hover:bg-[#3a4654]/50'}`}
              title="Text Tool (T)"
            >
              <span className="material-symbols-outlined text-lg">title</span>
            </button>
            <button
              onClick={() => setActiveTool(Tool.LASER)}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${activeTool === Tool.LASER ? 'bg-white dark:bg-[#3a4654] text-red-500 shadow-sm' : 'text-[#5e758d] hover:bg-white/50 dark:hover:bg-[#3a4654]/50'}`}
              title="Laser Pointer (●)"
            >
              <span className="material-symbols-outlined text-lg">flare</span>
            </button>
          </div>

          <div className="hidden lg:block h-8 w-px bg-[#f0f2f5] dark:bg-[#3a4654]"></div>

          {/* Size / Font Controls */}
          {activeTool === Tool.TEXT ? (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#5e758d] text-base">font_download</span>
                <select
                  value={activeFont}
                  onChange={(e) => setActiveFont(e.target.value)}
                  className="bg-white dark:bg-[#2a3644] border-[#dae0e7] dark:border-[#3a4654] rounded-lg text-xs font-bold h-8 px-2 outline-none focus:ring-1 focus:ring-primary"
                >
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#101418] dark:text-gray-200">Size</span>
                <input
                  type="range" min="8" max="72" value={activeFontSize}
                  onChange={(e) => setActiveFontSize(parseInt(e.target.value))}
                  className="w-20 lg:w-24"
                />
                <span className="w-10 text-center text-xs font-bold">{activeFontSize}px</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#5e758d] text-base">
                {activeTool === Tool.ERASER ? 'ink_eraser' : 'straighten'}
              </span>
              <span className="font-bold text-xs text-[#101418] dark:text-gray-200">
                {activeTool === Tool.ERASER ? 'Eraser Size' : 'Size'}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range" min="1" max="50" value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-24 lg:w-28"
                />
                <div className="w-12 h-8 flex items-center justify-center rounded-lg border border-[#dae0e7] dark:border-[#3a4654] bg-white dark:bg-[#2a3644] text-xs font-bold">
                  {brushSize}px
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden xl:block h-6 w-px bg-[#f0f2f5] dark:bg-[#3a4654]"></div>

        {/* Color Palette & Panel Controls */}
        <div className="flex w-full xl:w-auto items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-visible relative">
            <button
              onClick={() => setShowColorGrid(!showColorGrid)}
              className="flex items-center gap-1 shrink-0 group"
            >
              <span className="material-symbols-outlined text-[#5e758d] text-base group-hover:text-primary transition-colors">palette</span>
              <span className="font-bold text-xs text-[#101418] dark:text-gray-200 group-hover:text-primary transition-colors">Color</span>
            </button>

            <div className="flex items-center gap-1 no-scrollbar py-1">
              {COLORS.slice(0, 6).map(color => (
                <button
                  key={color}
                  onClick={() => setActiveColor(color)}
                  className={`size-6 rounded-full border-2 transition-all hover:scale-110 ${activeColor === color ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              {showColorGrid && (
                <div className="absolute top-10 left-0 z-50 p-2 bg-white dark:bg-[#1a2634] rounded-xl shadow-float border border-[#f0f2f5] dark:border-[#2a3644] grid grid-cols-6 gap-1.5">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => { setActiveColor(color); setShowColorGrid(false); }}
                      className={`size-6 rounded-full border-2 transition-all hover:scale-110 ${activeColor === color ? 'border-primary' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#5e758d] text-base">opacity</span>
              <input
                type="range" min="20" max="100" value={panelOpacity}
                onChange={(e) => setPanelOpacity(parseInt(e.target.value))}
                className="w-12"
              />
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="size-7 flex items-center justify-center rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a4654] transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                {isMinimized ? 'expand_more' : 'expand_less'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Minimize Button (Visible when minimized) */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-50 size-10 flex items-center justify-center bg-white dark:bg-[#1a2634] rounded-b-xl shadow-soft border border-t-0 border-[#f0f2f5] dark:border-[#2a3644]"
        >
          <span className="material-symbols-outlined">expand_more</span>
        </button>
      )}
    </div>
  );
};

export default ToolPalette;
