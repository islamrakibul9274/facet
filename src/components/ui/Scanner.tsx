"use client";
import { useEffect, useRef, memo } from "react";
import { useYOLO } from "@/hooks/useYOLO";
import { useStore } from "@/store/useStore";

const ScannerStatus = () => {
  const isCameraOn = useStore((state) => state.isCameraOn);
  const targetAcquired = useStore((state) => state.isTargetAcquired);

  return (
    <div suppressHydrationWarning className="absolute top-2 left-2 flex gap-1 items-center">
      <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
        isCameraOn 
          ? (targetAcquired ? 'bg-amber-400 animate-pulse' : 'bg-red-500') 
          : 'bg-zinc-800'
      }`} />
      <span className="text-[8px] font-mono text-white/50 uppercase tracking-tight">
        {isCameraOn ? (targetAcquired ? 'Target_Locked' : 'System_Standby') : 'Sensor_Offline'}
      </span>
    </div>
  );
};

export const Scanner = memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // 1. THE FIX: Create a permanent memory bank for the hardware stream
  const streamRef = useRef<MediaStream | null>(null); 
  
  const isCameraOn = useStore((state) => state.isCameraOn);
  const { startDetection } = useYOLO(videoRef);

  useEffect(() => {
    async function togglePower() {
      if (isCameraOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 640 },
            audio: false,
          });
          
          // 2. Save the stream to our permanent memory bank
          streamRef.current = stream; 
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => startDetection();
          }
        } catch (err) {
          console.error("CAMERA_ACCESS_DENIED", err);
        }
      } else {
        // 3. THE FIX: Kill the camera directly from memory, ignoring the video tag entirely
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop(); // This explicitly murders the hardware process
          });
          streamRef.current = null; // Wipe the memory
        }
      }
    }
    
    togglePower();
    
    // Safety cleanup if the whole app closes
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn, startDetection]);

  return (
    <div 
      suppressHydrationWarning 
      className={`fixed bottom-12 left-12 z-20 w-48 aspect-square border transition-all duration-700 overflow-hidden rounded-sm bg-black ${
        isCameraOn ? 'border-white/20 opacity-100' : 'border-white/5 opacity-40'
      }`}
    >
      {isCameraOn ? (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale brightness-110 contrast-125" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-950">
          <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.2em]">Scanner_Standby</p>
        </div>
      )}
      
      <ScannerStatus />
    </div>
  );
});

Scanner.displayName = "Scanner";