import { CanvasConfig } from "../types";

interface CanvasProps {
  config: CanvasConfig;
  isVibingState: boolean;
}

export default function Canvas({ config, isVibingState }: CanvasProps) {
  const { canvasRef } = config;

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`border-2 ${isVibingState ? "border-transparent" : "border-purple-400"} transition-all duration-300 shadow-2xl shadow-purple-500/30`}
        style={{ borderRadius: "50%" }}
      />
    </>
  );
}