
import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Tool, DrawingStroke, DrawingPoint, TextItem } from '../types';

interface CanvasProps {
  activeTool: Tool;
  activeColor: string;
  brushSize: number;
  history: DrawingStroke[];
  textItems: TextItem[];
  onStrokeComplete: (stroke: DrawingStroke) => void;
  onTextAdd: (text: TextItem) => void;
  activeFont: string;
  activeFontSize: number;
}

export interface CanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
  exportAsImage: () => string | null;
  resetPan: () => void;
}

const Canvas = forwardRef<CanvasHandle, CanvasProps>(({ 
  activeTool, 
  activeColor, 
  brushSize, 
  history, 
  textItems,
  onStrokeComplete,
  onTextAdd,
  activeFont,
  activeFontSize
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [laserPos, setLaserPos] = useState<DrawingPoint | null>(null);

  // Pan state
  const [panOffset, setPanOffset] = useState<DrawingPoint>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const panStartRef = useRef<DrawingPoint>({ x: 0, y: 0 });
  const panOffsetAtStartRef = useRef<DrawingPoint>({ x: 0, y: 0 });
  const lastTouchMidRef = useRef<DrawingPoint | null>(null);

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (stroke.points.length < 2) return;
    
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    
    if (stroke.tool === Tool.HIGHLIGHTER) {
      ctx.globalAlpha = stroke.opacity;
      ctx.strokeStyle = stroke.color;
    } else if (stroke.tool === Tool.ERASER) {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);

    // Render strokes from history
    history.forEach(stroke => drawStroke(ctx, stroke));

    // Render current active stroke
    if (currentStroke) {
      drawStroke(ctx, currentStroke);
    }

    // Render text items
    textItems.forEach(item => {
      ctx.font = `${item.fontSize}px "${item.fontFamily}"`;
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, item.x, item.y);
    });

    // Render Laser Pointer
    if (activeTool === Tool.LASER && laserPos) {
      ctx.beginPath();
      ctx.arc(laserPos.x, laserPos.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'red';
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }, [history, currentStroke, textItems, laserPos, activeTool, drawStroke, panOffset]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { width, height } = canvasRef.current.parentElement.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        render();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  // Spacebar listener for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Expose canvas methods via ref
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    exportAsImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL('image/png');
    },
    resetPan: () => setPanOffset({ x: 0, y: 0 })
  }));

  const getPoint = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent): DrawingPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left - panOffset.x,
      y: clientY - rect.top - panOffset.y
    };
  }, [panOffset]);

  const getScreenPoint = (e: React.MouseEvent | React.TouchEvent): DrawingPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // Two-finger touch → start panning
    if ('touches' in e && e.touches.length >= 2) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      lastTouchMidRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
      setIsPanning(true);
      return;
    }

    // Space + mouse → start panning
    if (spacePressed) {
      const sp = getScreenPoint(e);
      panStartRef.current = sp;
      panOffsetAtStartRef.current = panOffset;
      setIsPanning(true);
      return;
    }

    if (activeTool === Tool.LASER) return;
    if (activeTool === Tool.TEXT) {
      const p = getPoint(e);
      const text = prompt('Enter your text:');
      if (text) {
        onTextAdd({
          id: Date.now().toString(),
          x: p.x,
          y: p.y,
          text,
          color: activeColor,
          fontSize: activeFontSize,
          fontFamily: activeFont
        });
      }
      return;
    }

    setIsDrawing(true);
    const point = getPoint(e);
    setCurrentStroke({
      tool: activeTool,
      color: activeColor,
      size: brushSize,
      points: [point],
      opacity: activeTool === Tool.HIGHLIGHTER ? 0.4 : 1.0
    });
  };

  const moveDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // Two-finger touch panning
    if ('touches' in e && e.touches.length >= 2 && isPanning) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const mid = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
      if (lastTouchMidRef.current) {
        const dx = mid.x - lastTouchMidRef.current.x;
        const dy = mid.y - lastTouchMidRef.current.y;
        setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      }
      lastTouchMidRef.current = mid;
      return;
    }

    // Space + mouse panning
    if (isPanning && spacePressed) {
      const sp = getScreenPoint(e);
      setPanOffset({
        x: panOffsetAtStartRef.current.x + (sp.x - panStartRef.current.x),
        y: panOffsetAtStartRef.current.y + (sp.y - panStartRef.current.y)
      });
      return;
    }

    const point = getPoint(e);
    if (activeTool === Tool.LASER) {
      setLaserPos(point);
      return;
    }

    if (!isDrawing || !currentStroke) return;
    setCurrentStroke({
      ...currentStroke,
      points: [...currentStroke.points, point]
    });
  };

  const endDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
    // End touch panning when fewer than 2 fingers remain
    if (isPanning && e && 'touches' in e && e.touches.length < 2) {
      setIsPanning(false);
      lastTouchMidRef.current = null;
      return;
    }

    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing && currentStroke) {
      onStrokeComplete(currentStroke);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  const cursorClass = spacePressed
    ? (isPanning ? 'cursor-grabbing' : 'cursor-grab')
    : 'cursor-crosshair';

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={moveDrawing}
      onMouseUp={endDrawing}
      onMouseLeave={() => endDrawing()}
      onTouchStart={startDrawing}
      onTouchMove={moveDrawing}
      onTouchEnd={endDrawing}
      className={`${cursorClass} w-full h-full relative z-20`}
      style={{ touchAction: 'none' }}
    />
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
