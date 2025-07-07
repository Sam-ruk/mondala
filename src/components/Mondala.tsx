"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useSwitchChain, useWriteContract } from 'wagmi';
import { wagmiConfig, publicClient } from '../wagmiConfig';
import Controls from "./Controls";
import Canvas from "./Canvas";
import Alert from "./Alert";
import useCanvas from "../hooks/useCanvas";
import useAudio from "../hooks/useAudio";
import useMint from "../hooks/useMint";
import { CanvasConfig, MousePosition, PathData } from "../types";

import SVGNFTABI from '../abis/Mondala.json';

const CONTRACT_ADDRESS = '0xa28509E0fd6Bd2E7584cEf5d980BF015B0F2bc20';
const CHAIN_ID = 10143;

type AlertState = { message: string; type: 'success' | 'error' } | null;

export default function Mondala() {
  const [isVibingState, setIsVibingState] = useState(false);
  const [isToolboxVisible, setIsToolboxVisible] = useState(true);
  const [angleCount, setAngleCount] = useState(6);
  const [penSize, setPenSize] = useState(2);
  const [activeRing, setActiveRing] = useState(1);
  const [ringCount, setRingCount] = useState(5);
  const [isAudioUploaded, setIsAudioUploaded] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const offscreenCanvasRef = useRef<HTMLCanvasElement>(null!);
  const ctxRef = useRef<CanvasRenderingContext2D>(null!);
  const fileInputRef = useRef<HTMLInputElement>(null!);
  const audioCtxRef = useRef<AudioContext>(null!);
  const analyserRef = useRef<AnalyserNode>(null!);
  const audioRef = useRef<HTMLAudioElement>(null!);
  const angleCountRef = useRef(6);
  const colorRef = useRef("#ff0000");
  const penSizeRef = useRef(2);
  const activeRingRef = useRef(1);
  const ringCountRef = useRef(5);
  const pathDataRef = useRef<PathData[]>([]);
  const mousePos = useRef<MousePosition>({ x: 0, y: 0, lastX: 0, lastY: 0 });
  const isDrawing = useRef(false);
  const needsDraw = useRef(false);
  const isVibing = useRef(false);
  const rotationRef = useRef(0);
  const scaleRef = useRef(1);
  const canvasSizeRef = useRef(600);

  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, isPending: isMinting } = useWriteContract(); 

  const { handleMint } = useMint({
    address,
    isConnected,
    chainId,
    connect,
    connectors,
    switchChainAsync,
    writeContractAsync,
    isPending: isMinting, 
    setAlert,
    CONTRACT_ADDRESS,
    CHAIN_ID,
    SVGNFTABI,
    publicClient
  });

  const { handleAudioUpload } = useAudio({
    audioRef,
    audioCtxRef,
    analyserRef,
    fileInputRef,
    setIsAudioUploaded,
    setIsVibingState,
    isVibing,
    needsDraw
  });

  const resetAudioFile = () => { 
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      setIsAudioUploaded(false);
    }
  };

  const {
    clearCanvas,
    toggleVibe,
    updateAngleCount,
    updatePenSize,
    updateColor,
    updateActiveRing,
    updateRingCount,
    clearSelectedRing,
    saveAndMint
  } = useCanvas({
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
  });

  const canvasConfig: CanvasConfig = {
    canvasRef,
    ctxRef,
    offscreenCanvasRef,
    angleCountRef,
    colorRef,
    penSizeRef,
    activeRingRef,
    ringCountRef,
    pathDataRef,
    mousePos,
    isDrawing,
    needsDraw,
    isVibing,
    rotationRef,
    scaleRef,
    canvasSizeRef,
    analyserRef,
    audioRef,
  };

  return (
  <div className="fixed top-0 left-0 w-screen h-screen bg-gradient-to-br from-purple-900 to-purple-700 flex flex-col" style={{ overflowX: "hidden" }}>
    <div className="flex flex-col sm:flex-row items-center justify-center flex-1 p-4 sm:p-6 overflow-y-auto">
      {!isToolboxVisible && (
        <button
          className="fixed top-4 transform bg-purple-600 right-4 zoom-proof text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
          onClick={() => setIsToolboxVisible(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.5C7.5 4.5 3.73 7.61 2.25 12c1.48 4.39 5.25 7.5 9.75 7.5s8.27-3.11 9.75-7.5c-1.48-4.39-5.25-7.5-9.75-7.5zm0 12c-2.62 0-4.75-2.13-4.75-4.75S9.38 7 12 7s4.75 2.13 4.75 4.75S14.62 16.5 12 16.5zm0-7.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="white"/>
          </svg>
        </button>
      )}
      <div className="relative flex items-center justify-center">
        <Canvas config={canvasConfig} isVibingState={isVibingState}/>
        {alert && (
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        )}
      </div>
      <Controls
        isToolboxVisible={isToolboxVisible}
        setIsToolboxVisible={setIsToolboxVisible}
        fileInputRef={fileInputRef}
        isAudioUploaded={isAudioUploaded}
        ringCount={ringCount}
        angleCount={angleCount}
        penSize={penSize}
        activeRing={activeRing}
        handleAudioUpload={handleAudioUpload}
        updateRingCount={updateRingCount}
        updateAngleCount={updateAngleCount}
        updatePenSize={updatePenSize}
        updateColor={updateColor}
        updateActiveRing={updateActiveRing}
        clearCanvas={clearCanvas}
        toggleVibe={toggleVibe}
        clearSelectedRing={clearSelectedRing}
        saveAndMint={saveAndMint}
        isMinting={isMinting} 
        isVibingState={isVibingState}
      />
    </div>
  </div>
);
}