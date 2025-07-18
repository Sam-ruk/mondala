import { RefObject } from "react";

interface UseAudioProps {
  audioRef: RefObject<HTMLAudioElement>;
  audioCtxRef: RefObject<AudioContext>;
  analyserRef: RefObject<AnalyserNode>;
  fileInputRef: RefObject<HTMLInputElement>;
  setIsAudioUploaded: (value: boolean) => void;
  setIsVibingState: (value: boolean) => void;
  isVibing: RefObject<boolean>;
  needsDraw: RefObject<boolean>;
}

export default function useAudio({
  audioRef,
  audioCtxRef,
  analyserRef,
  fileInputRef,
  setIsAudioUploaded,
  setIsVibingState,
  isVibing,
  needsDraw
}: UseAudioProps) {
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const audio = new Audio(URL.createObjectURL(file));
    audioRef.current = audio;
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    const analyserNode = ctx.createAnalyser();
    source.connect(analyserNode);
    analyserNode.connect(ctx.destination);
    analyserNode.fftSize = 256;
    audioCtxRef.current = ctx;
    analyserRef.current = analyserNode;
    setIsAudioUploaded(true);
    audio.play();
    audio.addEventListener("ended", () => {
      setIsAudioUploaded(false);
      setIsVibingState(false);
      isVibing.current = false;
      if (fileInputRef.current) fileInputRef.current.value = "";
      needsDraw.current = true;
    });
  };

  return { handleAudioUpload };
}