import { MutableRefObject } from "react";

export interface MousePosition {
  x: number;
  y: number;
  lastX: number;
  lastY: number;
}

export interface PathData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
  ring: number;
}

export interface CanvasConfig {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  ctxRef: MutableRefObject<CanvasRenderingContext2D | null>;
  offscreenCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
  angleCountRef: MutableRefObject<number>;
  colorRef: MutableRefObject<string>;
  penSizeRef: MutableRefObject<number>;
  activeRingRef: MutableRefObject<number>;
  ringCountRef: MutableRefObject<number>;
  pathDataRef: MutableRefObject<PathData[]>;
  mousePos: MutableRefObject<MousePosition>;
  isDrawing: MutableRefObject<boolean>;
  needsDraw: MutableRefObject<boolean>;
  isVibing: MutableRefObject<boolean>;
  rotationRef: MutableRefObject<number>;
  scaleRef: MutableRefObject<number>;
  canvasSizeRef: MutableRefObject<number>;
  analyserRef: MutableRefObject<AnalyserNode | null>;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
}

export interface RingData {
 index: number;
 innerRadius: number;
 outerRadius: number;
 rotationSpeed: number;
 rotationDirection: number;
}