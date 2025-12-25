
export enum Tool {
  PEN = 'pen',
  HIGHLIGHTER = 'highlighter',
  ERASER = 'eraser',
  TEXT = 'text',
  LASER = 'laser'
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  tool: Tool;
  color: string;
  size: number;
  points: DrawingPoint[];
  opacity: number;
}

export interface TextItem {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
}

export const COLORS = [
  '#000000', '#5e758d', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#78350f', '#ffffff'
];

export const FONTS = [
  'Arial', 'Plus Jakarta Sans', 'Times New Roman', 'Courier New', 'Georgia'
];
