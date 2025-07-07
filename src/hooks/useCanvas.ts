import { RefObject, useEffect } from "react";
import { CanvasConfig, PathData, RingData } from "../types";

interface UseCanvasProps {
  ctxRef: RefObject<CanvasRenderingContext2D>;
  canvasRef: RefObject<HTMLCanvasElement>;
  offscreenCanvasRef: RefObject<HTMLCanvasElement | null>;
  isVibing: RefObject<boolean>;
  isVibingState: boolean;
  isAudioUploaded: boolean;
  angleCount: number;
  penSize: number;
  activeRing: number;
  ringCount: number;
  setAngleCount: (value: number) => void;
  setPenSize: (value: number) => void;
  setActiveRing: (value: number) => void;
  setRingCount: (value: number) => void;
  setIsVibingState: (value: boolean) => void;
  angleCountRef: RefObject<number>;
  colorRef: RefObject<string>;
  penSizeRef: RefObject<number>;
  activeRingRef: RefObject<number>;
  ringCountRef: RefObject<number>;
  pathDataRef: RefObject<PathData[]>;
  mousePos: RefObject<{ x: number; y: number; lastX: number; lastY: number }>;
  isDrawing: RefObject<boolean>;
  needsDraw: RefObject<boolean>;
  rotationRef: RefObject<number>;
  scaleRef: RefObject<number>;
  canvasSizeRef: RefObject<number>;
  analyserRef: RefObject<AnalyserNode | null>;
  audioRef: RefObject<HTMLAudioElement | null>; 
  resetAudioFile: () => void; 
  handleMint: (svgData: string) => Promise<boolean>;
}

export default function useCanvas({
  ctxRef,
  canvasRef,
  offscreenCanvasRef,
  isVibing,
  isVibingState,
  isAudioUploaded,
  angleCount,
  penSize,
  activeRing,
  ringCount,
  setAngleCount,
  setPenSize,
  setActiveRing,
  setRingCount,
  setIsVibingState,
  angleCountRef,
  colorRef,
  penSizeRef,
  activeRingRef,
  ringCountRef,
  pathDataRef,
  mousePos,
  isDrawing,
  needsDraw,
  rotationRef,
  scaleRef,
  canvasSizeRef,
  analyserRef,
  audioRef, 
  resetAudioFile, 
  handleMint
}: UseCanvasProps) {
  const drawConcentricCircles = (ctx: CanvasRenderingContext2D) => {
    if (isVibing.current) return;
    ctx.save();
    ctx.strokeStyle = "#800080";
    ctx.lineWidth = 1;
    const canvasSize = canvasSizeRef.current;
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    for (let i = 1; i <= ringCountRef.current; i++) {
      const radius = i * (canvasSize / (2 * ringCountRef.current));
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.shadowColor = "#FFFFFF";
    const outerRadius = ringCountRef.current * (canvasSize / (2 * ringCountRef.current));
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const isPointInActiveRing = (x: number, y: number, centerX: number, centerY: number) => {
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const canvasSize = canvasSizeRef.current;
    const innerRadius = (activeRingRef.current - 1) * (canvasSize / (2 * ringCountRef.current));
    const outerRadius = activeRingRef.current * (canvasSize / (2 * ringCountRef.current));
    return distance >= innerRadius && distance <= outerRadius;
  };

  const drawWithSymmetry = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, lineWidth: number, ring: number) => {
    const canvasSize = canvasSizeRef.current;
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    for (let i = 1; i < angleCountRef.current; i++) {
      const angle = (i * (2 * Math.PI)) / angleCountRef.current;
      const dx1 = x1 - centerX;
      const dy1 = y1 - centerY;
      const dx2 = x2 - centerX;
      const dy2 = y2 - centerY;
      const x1Rot = centerX + dx1 * Math.cos(angle) - dy1 * Math.sin(angle);
      const y1Rot = centerY + dx1 * Math.sin(angle) + dy1 * Math.cos(angle);
      const x2Rot = centerX + dx2 * Math.cos(angle) - dy2 * Math.sin(angle);
      const y2Rot = centerY + dx2 * Math.sin(angle) + dy2 * Math.cos(angle);
      ctx.beginPath();
      ctx.moveTo(x1Rot, y1Rot);
      ctx.lineTo(x2Rot, y2Rot);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
    ctx.restore();
  };

  const clearCanvas = () => {
    if (!ctxRef.current || !canvasRef.current || !offscreenCanvasRef.current) return;
    const ctx = ctxRef.current;
    const offscreenCtx = offscreenCanvasRef.current.getContext("2d");
    if (!offscreenCtx) return;
    ctx.fillStyle = "#000";
    pathDataRef.current = [];
    const canvasSize = canvasSizeRef.current;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    offscreenCtx.clearRect(0, 0, canvasSize, canvasSize);
    isVibing.current = false;
    setIsVibingState(false);
    drawConcentricCircles(ctx);
    needsDraw.current = true;
  };

  const toggleVibe = () => {
    if (!isAudioUploaded) return;
    const newVibingState = !isVibing.current;
    isVibing.current = newVibingState;
    setIsVibingState(newVibingState);
    if (newVibingState) {
      rotationRef.current = 0;
      scaleRef.current = 1;
    }
    needsDraw.current = true;
  };

  const updateAngleCount = (value: number) => {
    angleCountRef.current = value;
    setAngleCount(value);
  };

  const updatePenSize = (value: number) => {
    const cappedValue = Math.min(Math.max(value, 1), 10);
    penSizeRef.current = cappedValue;
    setPenSize(cappedValue);
  };

  const updateColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    colorRef.current = e.target.value;
  };

  const updateActiveRing = (value: number) => {
    activeRingRef.current = value;
    setActiveRing(value);
  };

  const updateRingCount = (value: number) => {
    ringCountRef.current = value;
    setRingCount(value);
    setActiveRing(Math.min(value, activeRing));
    needsDraw.current = true;
  };

  const clearSelectedRing = () => {
    if (!offscreenCanvasRef.current || !ctxRef.current) return;
    const offscreenCtx = offscreenCanvasRef.current.getContext("2d");
    if (!offscreenCtx) return;
    const canvasSize = canvasSizeRef.current;
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const RING_WIDTH = canvasSize / (2 * ringCountRef.current);
    const innerRadius = (activeRingRef.current - 1) * RING_WIDTH;
    const outerRadius = activeRingRef.current * RING_WIDTH;
    offscreenCtx.save();
    offscreenCtx.beginPath();
    offscreenCtx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    if (innerRadius > 0) offscreenCtx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true);
    else offscreenCtx.arc(centerX, centerY, 0.1, 0, 2 * Math.PI);
    offscreenCtx.clip();
    offscreenCtx.clearRect(0, 0, canvasSize, canvasSize);
    offscreenCtx.restore();
    pathDataRef.current = pathDataRef.current.filter(({ ring }) => ring !== activeRingRef.current);
    offscreenCtx.beginPath();
    offscreenCtx.rect(0, 0, canvasSize, canvasSize);
    offscreenCtx.clip();
    pathDataRef.current.forEach(({ x1, y1, x2, y2, color, lineWidth, ring }) => {
      offscreenCtx.save();
      offscreenCtx.beginPath();
      offscreenCtx.arc(centerX, centerY, ring * (canvasSize / (2 * ringCountRef.current)), 0, 2 * Math.PI);
      if (ring > 1) {
        offscreenCtx.arc(centerX, centerY, (ring - 1) * (canvasSize / (2 * ringCountRef.current)), 0, 2 * Math.PI, true);
      }
      offscreenCtx.clip();
      drawWithSymmetry(offscreenCtx, x1 * canvasSize, y1 * canvasSize, x2 * canvasSize, y2 * canvasSize, color, lineWidth, ring);
      offscreenCtx.restore();
    });
    needsDraw.current = true;
  };

  const getRingData = () => {
    const rings = ringCountRef.current || 5;
    const centerX = offscreenCanvasRef.current?.width / 2 || 0;
    const centerY = offscreenCanvasRef.current?.height / 2 || 0;
    const maxRadius = Math.min(centerX, centerY);
    const ringWidth = maxRadius / rings;
    return Array.from({ length: rings }, (_, i) => ({
      index: i,
      innerRadius: i * ringWidth,
      outerRadius: (i + 1) * ringWidth,
      rotationSpeed: 9,
      rotationDirection: i % 2 === 0 ? 1 : -1
    }));
  };

  const createRingImage = async (sourceCanvas: HTMLCanvasElement, ring: RingData, centerX: number, centerY: number) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sourceCanvas.width;
    tempCanvas.height = sourceCanvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.save();
    tempCtx.beginPath();
    tempCtx.arc(centerX, centerY, ring.outerRadius, 0, 2 * Math.PI);
    if (ring.innerRadius > 0) {
      tempCtx.arc(centerX, centerY, ring.innerRadius, 0, 2 * Math.PI, true);
    }
    tempCtx.clip();
    tempCtx.drawImage(sourceCanvas, 0, 0);
    tempCtx.restore();
    return tempCanvas.toDataURL('image/png', 1.0);
  };

  const createIsolatedRingSVG = async () => {
    if (!offscreenCanvasRef.current) return;
    const canvas = offscreenCanvasRef.current;
    const actualWidth = canvas.width;
    const actualHeight = canvas.height;
    const centerX = actualWidth / 2;
    const centerY = actualHeight / 2;
    const ringData = getRingData();
    const ringImages = await Promise.all(
      ringData.map((ring) => createRingImage(canvas, ring, centerX, centerY))
    );
    let svgContent = '';
    let animationStyles = '';
    ringData.forEach((ring, index) => {
      const imageData = ringImages[index];
      if (!imageData) return;
      const direction = ring.rotationDirection > 0 ? 'rotate-cw' : 'rotate-ccw';
      const duration = `${ring.rotationSpeed}s`;
      animationStyles += `
        .ring-${ring.index} {
          animation: ${direction} ${duration} linear infinite;
          transform-origin: ${centerX}px ${centerY}px;
          transform-box: fill-box;
        }`;
      svgContent += `
        <g class="ring-${ring.index}">
          <image x="0" y="0" width="${actualWidth}" height="${actualHeight}" 
                 xlink:href="${imageData}"/>
        </g>`;
    });
    return `<svg width="${actualWidth}" height="${actualHeight}" viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <style>
        ${animationStyles}
        @keyframes rotate-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotate-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      </style>
      <rect width="100%" height="100%" fill="#000000"/>
      ${svgContent}
    </svg>`;
  };

  const downloadSVG = (svgString: string, filename: string) => {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveAndMint = async () => {
    if (!ctxRef.current || !offscreenCanvasRef.current) return;
    const animatedSVG = await createIsolatedRingSVG();
    if (animatedSVG) {
      downloadSVG(animatedSVG, "mandala_isolated_rings.svg");
      await handleMint(animatedSVG);
    }
  };

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!canvas || !offscreenCanvas) return;
    const ctx = canvas.getContext("2d");
    const offscreenCtx = offscreenCanvas.getContext("2d");
    if (!ctx || !offscreenCtx) return;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const size = Math.min(windowWidth, windowHeight) * 0.8;
    const canvasSize = Math.round(size);
    canvasSizeRef.current = canvasSize;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    offscreenCanvas.width = canvasSize * dpr;
    offscreenCanvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    canvas.style.borderRadius = "50%";
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    offscreenCtx.resetTransform();
    offscreenCtx.scale(dpr, dpr);
    offscreenCtx.lineCap = "round";
    offscreenCtx.lineJoin = "round";
    offscreenCtx.globalCompositeOperation = "source-over";
    offscreenCtx.clearRect(0, 0, canvasSize, canvasSize);
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    pathDataRef.current.forEach(({ x1, y1, x2, y2, color, lineWidth, ring }) => {
      offscreenCtx.save();
      offscreenCtx.beginPath();
      offscreenCtx.arc(centerX, centerY, ring * (canvasSize / (2 * ringCountRef.current)), 0, 2 * Math.PI);
      if (ring > 1) {
        offscreenCtx.arc(centerX, centerY, (ring - 1) * (canvasSize / (2 * ringCountRef.current)), 0, 2 * Math.PI, true);
      }
      offscreenCtx.clip();
      drawWithSymmetry(offscreenCtx, x1 * canvasSize, y1 * canvasSize, x2 * canvasSize, y2 * canvasSize, color, lineWidth, ring);
      offscreenCtx.restore();
    });
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    if (!isVibing.current) {
      drawConcentricCircles(ctx);
    }
    ctx.drawImage(offscreenCanvas, 0, 0, canvasSize, canvasSize);
    needsDraw.current = true;
  };

  const draw = () => {
    if (!ctxRef.current || !canvasRef.current || !offscreenCanvasRef.current) return;
    const ctx = ctxRef.current;
    const offscreenCtx = offscreenCanvasRef.current.getContext("2d");
    if (!offscreenCtx) return;
    const canvasSize = canvasSizeRef.current;
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    let bass = 0, amplitude = 0;
    if (isVibing.current || isDrawing.current) {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(128);
        analyserRef.current.getByteFrequencyData(dataArray);
        bass = dataArray.slice(0, 12).reduce((sum, val) => sum + val, 0) / (12 * 255);
        amplitude = dataArray.reduce((sum, val) => sum + val, 0) / (128 * 255);
      }
    }
    if (needsDraw.current) {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }
    if (isVibing.current) {
      rotationRef.current += amplitude * 0.0005;
      scaleRef.current = 1 + bass * 0.1;
      for (let ringIndex = 1; ringIndex <= ringCountRef.current; ringIndex++) {
        const innerRadius = (ringIndex - 1) * (canvasSize / (2 * ringCountRef.current));
        const outerRadius = ringIndex * (canvasSize / (2 * ringCountRef.current));
        const rotationDirection = ringIndex % 2 === 1 ? 1 : -1;
        const ringRotation = rotationRef.current * rotationDirection;
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
        if (innerRadius > 0) ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true);
        ctx.clip();
        ctx.translate(centerX, centerY);
        ctx.rotate(ringRotation);
        ctx.scale(scaleRef.current, scaleRef.current);
        ctx.translate(-centerX, -centerY);
        ctx.drawImage(offscreenCanvasRef.current, 0, 0, canvasSize, canvasSize);
        ctx.restore();
      }
    } else if (isDrawing.current) {
      const { x: clientX, y: clientY, lastX, lastY } = mousePos.current;
      const innerRadius = (activeRingRef.current - 1) * (canvasSize / (2 * ringCountRef.current));
      const outerRadius = activeRingRef.current * (canvasSize / (2 * ringCountRef.current));
      offscreenCtx.save();
      offscreenCtx.beginPath();
      offscreenCtx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
      if (innerRadius > 0) offscreenCtx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true);
      offscreenCtx.clip();
      drawWithSymmetry(offscreenCtx, clientX, clientY, lastX, lastY, colorRef.current, penSizeRef.current, activeRingRef.current);
      offscreenCtx.restore();
      ctx.drawImage(offscreenCanvasRef.current, 0, 0, canvasSize, canvasSize);
      const newPath = {
        ring: activeRingRef.current,
        x1: clientX / canvasSize,
        y1: clientY / canvasSize,
        x2: lastX / canvasSize,
        y2: lastY / canvasSize,
        color: colorRef.current,
        lineWidth: penSizeRef.current
      };
      pathDataRef.current.push(newPath);
      drawConcentricCircles(ctx);
    } else {
      ctx.drawImage(offscreenCanvasRef.current, 0, 0, canvasSize, canvasSize);
      drawConcentricCircles(ctx);
    }
    needsDraw.current = isVibing.current || isDrawing.current;
    if (needsDraw.current) requestAnimationFrame(draw);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvasRef.current = offscreenCanvas;
    resize();
    window.addEventListener("resize", resize);
    const getCanvasCoordinates = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const canvasSize = canvasSizeRef.current;
      const x = ((e.clientX - rect.left) * canvasSize) / rect.width;
      const y = ((e.clientY - rect.top) * canvasSize) / rect.height;
      return { x, y };
    };
    const handleMouseDown = (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e);
      const canvasSize = canvasSizeRef.current;
      const centerX = canvasSize / 2;
      const centerY = canvasSize / 2;
      if (isPointInActiveRing(x, y, centerX, centerY)) {
        isDrawing.current = true;
        isVibing.current = false;
        setIsVibingState(false);
        mousePos.current = { x, y, lastX: x, lastY: y };
        needsDraw.current = true;
      }
    };
    const handleMouseUp = () => {
      isDrawing.current = false;
      needsDraw.current = true;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing.current) return;
      const { x, y } = getCanvasCoordinates(e);
      const canvasSize = canvasSizeRef.current;
      const centerX = canvasSize / 2;
      const centerY = canvasSize / 2;
      if (isPointInActiveRing(x, y, centerX, centerY)) {
        mousePos.current = { x, y, lastX: mousePos.current.x, lastY: mousePos.current.y };
        needsDraw.current = true;
      } else {
        isDrawing.current = false;
      }
    };

    const handleAudioEnd = () => {
      isVibing.current = false;
      setIsVibingState(false);
      resetAudioFile();
      needsDraw.current = true;
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("ended", handleAudioEnd);
    }

    const animate = () => {
      if (needsDraw.current) draw();
      requestAnimationFrame(animate);
    };
    animate();
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleAudioEnd);
      }
    };
  }, []);

  return {
    clearCanvas,
    toggleVibe,
    updateAngleCount,
    updatePenSize,
    updateColor,
    updateActiveRing,
    updateRingCount,
    clearSelectedRing,
    saveAndMint
  };
}