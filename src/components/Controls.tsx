import { RefObject } from "react";

interface ControlsProps {
  isToolboxVisible: boolean;
  setIsToolboxVisible: (visible: boolean) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  isAudioUploaded: boolean;
  ringCount: number;
  angleCount: number;
  penSize: number;
  activeRing: number;
  handleAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateRingCount: (value: number) => void;
  updateAngleCount: (value: number) => void;
  updatePenSize: (value: number) => void;
  updateColor: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateActiveRing: (value: number) => void;
  clearCanvas: () => void;
  toggleVibe: () => void;
  clearSelectedRing: () => void;
  saveAndMint: () => void;
  isMinting: boolean;
  isVibingState: boolean; 
  isConnected: boolean;
}

export default function Controls({
  isToolboxVisible,
  setIsToolboxVisible,
  fileInputRef,
  isAudioUploaded,
  ringCount,
  angleCount,
  penSize,
  activeRing,
  handleAudioUpload,
  updateRingCount,
  updateAngleCount,
  updatePenSize,
  updateColor,
  updateActiveRing,
  clearCanvas,
  toggleVibe,
  clearSelectedRing,
  saveAndMint,
  isMinting,
  isVibingState,
  isConnected 
}: ControlsProps) {
  return (
    <div className={`container mt-4 sm:mt-0 sm:ml-6 bg-purple-100/90 p-4 sm:p-6 rounded-xl shadow-2xl shadow-purple-500/30 backdrop-blur-sm space-y-4 w-full max-w-sm min-w-0 relative ${isToolboxVisible ? "block" : "hidden"}`} style={{ transform: "none !important", maxHeight: "96vh", overflowY: "auto" }}>
      <button
        className="absolute top-2 right-2 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
        onClick={() => setIsToolboxVisible(false)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.54 1.69-4.9l11.21 11.21C15.54 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.46 4.63 10.15 4 12 4c4.41 0 8 3.59 8 8 0 1.85-.63 3.54-1.69 4.9z" fill="white"/>
        </svg>
      </button>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Upload Audio</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioUpload}
          disabled={isAudioUploaded}
          className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 ${isAudioUploaded ? "opacity-50 cursor-not-allowed" : ""}`}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Number of Rings: {ringCount}</label>
        <input
          type="range"
          min={1}
          max={5}
          value={ringCount}
          onChange={(e) => updateRingCount(parseInt(e.target.value))}
          className="w-full h-2 bg-purple-300 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Symmetry: {angleCount}</label>
        <input
          type="range"
          min={1}
          max={10}
          value={angleCount}
          onChange={(e) => updateAngleCount(parseInt(e.target.value))}
          className="w-full h-2 bg-purple-300 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Pen Size: {penSize}</label>
        <input
          type="range"
          min={1}
          max={10}
          value={penSize}
          onChange={(e) => updatePenSize(parseInt(e.target.value))}
          className="w-full h-2 bg-purple-300 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Color</label>
        <input
          type="color"
          defaultValue="#ff0000"
          onChange={updateColor}
          className="w-full h-10 rounded-md cursor-pointer"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Active Ring: {activeRing}</label>
        <input
          type="range"
          min={1}
          max={ringCount}
          value={activeRing}
          onChange={(e) => updateActiveRing(parseInt(e.target.value))}
          className="w-full h-2 bg-purple-300 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="flex-1 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-600 transition-colors"
          onClick={clearCanvas}
        >
          Clear Canvas
        </button>
        <button
          className={`flex-1 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isAudioUploaded ? "hover:bg-purple-700" : "opacity-50 cursor-not-allowed"}`}
          onClick={toggleVibe}
          disabled={!isAudioUploaded}
        >
          {isVibingState ? "Stop Vibing" : "Vibe to Music"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          onClick={clearSelectedRing}
        >
          Clear Selected Ring
        </button>
        <button
          className={`bg-purple-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors ${isMinting ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"}`}
          onClick={saveAndMint}
          disabled={isMinting}
        >
          {isMinting ? "Processing..." : isConnected ? "Save & Mint" : "Connect to Mint"}
        </button>
      </div>
    </div>
  );
}