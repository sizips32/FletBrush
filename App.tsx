
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Tool, DrawingStroke, TextItem, COLORS, FONTS } from './types';
import Canvas, { CanvasHandle } from './components/Canvas';
import ToolPalette from './components/ToolPalette';
import BottomToolbar from './components/BottomToolbar';

const App: React.FC = () => {
  // Canvas ref for export functionality
  const canvasRef = useRef<CanvasHandle>(null);

  // Global App State
  const [activeTool, setActiveTool] = useState<Tool>(Tool.PEN);
  const [activeColor, setActiveColor] = useState<string>(COLORS[0]);
  const [brushSize, setBrushSize] = useState<number>(5);
  const [panelOpacity, setPanelOpacity] = useState<number>(100);
  const [gridOpacity, setGridOpacity] = useState<number>(60);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState<boolean>(true);

  // Text Tool State
  const [activeFont, setActiveFont] = useState<string>(FONTS[1]);
  const [activeFontSize, setActiveFontSize] = useState<number>(24);

  // History for Undo/Redo
  const [history, setHistory] = useState<DrawingStroke[]>([]);
  const [redoStack, setRedoStack] = useState<DrawingStroke[]>([]);
  const [textItems, setTextItems] = useState<TextItem[]>([]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastStroke = history[history.length - 1];
    setRedoStack(prev => [...prev, lastStroke]);
    setHistory(prev => prev.slice(0, -1));
  }, [history]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const lastRedo = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, lastRedo]);
    setRedoStack(prev => prev.slice(0, -1));
  }, [redoStack]);

  const handleClear = useCallback(() => {
    setHistory([]);
    setRedoStack([]);
    setTextItems([]);
  }, []);

  const handleStrokeComplete = (stroke: DrawingStroke) => {
    setHistory(prev => [...prev, stroke]);
    setRedoStack([]); // Clear redo stack on new action
  };

  const handleTextAdd = (text: TextItem) => {
    setTextItems(prev => [...prev, text]);
    setRedoStack([]);
  };

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('fletBrush_save');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.history) setHistory(parsed.history);
        if (parsed.textItems) setTextItems(parsed.textItems);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  const handleExport = useCallback(() => {
    const imageData = canvasRef.current?.exportAsImage();
    if (!imageData) {
      alert('Failed to export image. Please try again.');
      return;
    }

    // Create download link
    const link = document.createElement('a');
    link.download = `flet-brush-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = imageData;
    link.click();
  }, []);

  const handleSave = useCallback(() => {
    const saveData = {
      history,
      textItems,
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem('fletBrush_save', JSON.stringify(saveData));
      // Show success feedback
      const button = document.querySelector('[data-save-button]') as HTMLElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Saved!';
        button.classList.add('bg-green-500', 'hover:bg-green-600');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('bg-green-500', 'hover:bg-green-600');
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save. Please try again.');
    }
  }, [history, textItems]);

  return (
    <div className="h-screen w-screen flex flex-col bg-transparent overflow-hidden transition-colors duration-300">
      {/* Header Bar */}
      <header
        className={`flex-none z-40 bg-white/90 dark:bg-[#1a2634]/90 backdrop-blur-sm border-b border-[#f0f2f5]/50 dark:border-[#2a3644]/50 px-6 py-4 flex items-center justify-between shadow-sm transition-transform duration-300 ${isToolbarVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <div className="flex items-center gap-3">
          <div className="size-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">brush</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#101418] dark:text-white">Flet Brush</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="h-10 px-5 rounded-full bg-white dark:bg-[#2a3644] border border-[#dae0e7] dark:border-[#3a4654] text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#324050] transition-colors"
            title="Export as PNG image"
          >
            Export
          </button>
          <button
            onClick={handleSave}
            data-save-button
            className="h-10 px-5 rounded-full bg-primary text-white text-sm font-bold shadow-sm hover:bg-blue-600 transition-colors"
            title="Save to browser storage"
          >
            Save
          </button>
        </div>
      </header>

      {/* Main Tool Palette (Top/Central Controls) */}
      <div
        className={`transition-all duration-300 ease-in-out origin-top ${isToolbarVisible
          ? 'translate-y-0 opacity-100 z-30'
          : '-translate-y-full opacity-0 pointer-events-none z-0'
          }`}
        style={{ opacity: isToolbarVisible ? panelOpacity / 100 : 0, transform: isMinimized ? 'translateY(-90%) scaleY(0)' : 'translateY(0) scaleY(1)' }}
      >
        <ToolPalette
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          gridOpacity={gridOpacity}
          setGridOpacity={setGridOpacity}
          activeFont={activeFont}
          setActiveFont={setActiveFont}
          activeFontSize={activeFontSize}
          setActiveFontSize={setActiveFontSize}
          panelOpacity={panelOpacity}
          setPanelOpacity={setPanelOpacity}
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
        />
      </div>

      {/* Drawing Canvas Area */}
      <main className="flex-grow relative w-full h-full flex flex-col items-center justify-center">
        {/* Toolbar Toggle Button - Always visible */}
        <button
          onClick={() => setIsToolbarVisible(!isToolbarVisible)}
          className={`fixed top-4 right-4 z-50 size-12 flex items-center justify-center rounded-full bg-white/90 dark:bg-[#1a2634]/90 backdrop-blur-sm border border-[#f0f2f5]/50 dark:border-[#2a3644]/50 shadow-lg hover:bg-white dark:hover:bg-[#2a3644] transition-all ${isToolbarVisible ? 'rotate-180' : ''
            }`}
          title={isToolbarVisible ? 'Hide Toolbar' : 'Show Toolbar'}
        >
          <span className="material-symbols-outlined text-xl text-[#101418] dark:text-white">
            {isToolbarVisible ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
          </span>
        </button>

        <div className="absolute inset-0 w-full h-full bg-transparent overflow-hidden group">
          {/* Grid Background - 완전히 투명하게 (뒤 화면이 보이도록) */}
          {/* 그리드는 필요시에만 표시되도록 주석 처리 */}
          {/* <div
            className="absolute inset-0 bg-grid-pattern pointer-events-none transition-opacity duration-300"
            style={{ opacity: gridOpacity / 100 }}
          /> */}

          <Canvas
            ref={canvasRef}
            activeTool={activeTool}
            activeColor={activeColor}
            brushSize={brushSize}
            history={history}
            textItems={textItems}
            onStrokeComplete={handleStrokeComplete}
            onTextAdd={handleTextAdd}
            activeFont={activeFont}
            activeFontSize={activeFontSize}
          />

          {/* 힌트 텍스트 제거 - 완전히 투명한 배경을 위해 */}
          {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-700">
            <p className="text-[#101418] dark:text-gray-400 font-medium text-lg">
              {activeTool === Tool.TEXT ? 'Click to add text' : 'Start drawing...'}
            </p>
          </div> */}
        </div>

        {/* Bottom Floating Toolbar */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40">
          <BottomToolbar
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            canUndo={history.length > 0}
            canRedo={redoStack.length > 0}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
