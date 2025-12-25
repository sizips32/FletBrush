
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

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (stroke.points.length < 2) return;
    
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    
    if (stroke.tool === Tool.HIGHLIGHTER) {
      ctx.globalAlpha = 0.4;
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
    const ctx = canvas.getContext('2d', { alpha: true }); // 투명도 지원
    if (!ctx) return;

    // 완전히 투명한 배경으로 지우기 (뒤 화면이 보이도록)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
  }, [history, currentStroke, textItems, laserPos, activeTool, drawStroke]);

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

  // Expose canvas methods via ref
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    exportAsImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL('image/png');
    }
  }));

  const getPoint = (e: React.MouseEvent | React.TouchEvent | MouseEvent): DrawingPoint => {
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

  const endDrawing = () => {
    if (isDrawing && currentStroke) {
      onStrokeComplete(currentStroke);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={moveDrawing}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onTouchStart={startDrawing}
      onTouchMove={moveDrawing}
      onTouchEnd={endDrawing}
      className="cursor-crosshair w-full h-full relative z-20"
    />
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
