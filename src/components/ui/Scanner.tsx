"use client";

import { useEffect, useRef, memo } from "react";
import { useYOLO } from "@/hooks/useYOLO";
import { useStore } from "@/store/useStore";
import { X, AlertCircle } from "lucide-react";

export const Scanner = memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isCameraOn = useStore((state) => state.isCameraOn);
  const targetAcquired = useStore((state) => state.isTargetAcquired);
  const boundingBox = useStore((state) => state.boundingBox);
  const confidence = useStore((state) => state.confidence);
  const showScanner = useStore((state) => state.showScanner);
  const toggleScanner = useStore((state) => state.toggleScanner);
  const cameraError = useStore((state) => state.cameraError);
  const setCameraError = useStore((state) => state.setCameraError);
  const setCameraOn = useStore((state) => state.setCameraOn);

  const { startDetection } = useYOLO(videoRef);

  useEffect(() => {
    let isCancelled = false;

    async function startCamera() {
      if (!isCameraOn) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        return;
      }

      setCameraError(null);

      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 640, max: 1280 },
              height: { ideal: 480, max: 720 },
            },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!isCancelled) startDetection();
          };
        }
      } catch (err: unknown) {
        console.error("Camera access failed:", err);
        const errMsg =
          err instanceof Error
            ? err.message.includes("Timeout")
              ? "Camera timed out or in use by another app"
              : err.message
            : "Camera unavailable";
        setCameraError(errMsg);
        setCameraOn(false);
      }
    }

    startCamera();

    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOn, setCameraError, setCameraOn, startDetection]);

  if (!isCameraOn && !cameraError) return null;
  if (!showScanner && !cameraError) return null;

  return (
    <div className="select-none animate-in fade-in duration-300 pointer-events-auto">
      {cameraError ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-950/70 border border-red-800/40 text-red-200 text-xs shadow-xl backdrop-blur-xl max-w-xs">
          <AlertCircle size={13} className="shrink-0 text-red-400" />
          <span className="leading-tight text-[11px]">{cameraError}</span>
          <button
            onClick={() => setCameraError(null)}
            className="p-0.5 hover:text-white rounded ml-auto"
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <div className="w-48 sm:w-52 rounded-2xl overflow-hidden bg-zinc-950/90 backdrop-blur-xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.6)]">
          {/* Top minimal bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  targetAcquired ? "bg-emerald-400" : "bg-zinc-500 animate-pulse"
                }`}
              />
              <span className="text-[10px] font-medium text-white/70">
                {targetAcquired ? "Face detected" : "Finding face..."}
              </span>
            </div>
            <button
              onClick={toggleScanner}
              className="text-white/40 hover:text-white p-0.5 rounded transition-colors"
              title="Hide preview"
            >
              <X size={12} />
            </button>
          </div>

          {/* Video canvas container */}
          <div className="relative aspect-4/3 bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1] filter grayscale opacity-90"
            />

            {/* Subtle face frame reticle */}
            {targetAcquired && boundingBox && (
              <div
                className="absolute pointer-events-none transition-all duration-100 ease-out"
                style={{
                  left: `${(1 - boundingBox[2]) * 100}%`,
                  top: `${boundingBox[1] * 100}%`,
                  width: `${(boundingBox[2] - boundingBox[0]) * 100}%`,
                  height: `${(boundingBox[3] - boundingBox[1]) * 100}%`,
                }}
              >
                <div className="w-full h-full border border-emerald-400/60 rounded relative">
                  <span className="absolute -bottom-3.5 right-0 text-[8px] font-mono text-emerald-400 bg-black/80 px-1 rounded">
                    {confidence}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

Scanner.displayName = "Scanner";