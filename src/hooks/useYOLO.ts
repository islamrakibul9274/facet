"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { sound } from "@/utils/sound";

export const useYOLO = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const workerRef = useRef<Worker | null>(null);
  const isProcessing = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationId = useRef<number | null>(null);
  const prevAcquiredRef = useRef(false);
  const lastInferenceTime = useRef(0);

  // EMA coordinate smoothing
  const smoothedCoord = useRef<[number, number]>([0.5, 0.5]);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/yoloWorker.ts", import.meta.url)
    );

    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, acquired, confidence, position, box, latency } = event.data;

      if (type === "READY") {
        return;
      }

      if (type === "RETRY" || type === "ERROR") {
        isProcessing.current = false;
        return;
      }

      if (type === "RESULT") {
        if (!useStore.getState().isCameraOn) {
          isProcessing.current = false;
          return;
        }

        // Play subtle acoustic chime if newly acquired
        if (acquired && !prevAcquiredRef.current && useStore.getState().soundEnabled) {
          sound.playTargetAcquired();
        }
        prevAcquiredRef.current = acquired;

        // Apply EMA filter: smooth = smooth * 0.7 + raw * 0.3
        if (acquired && position) {
          smoothedCoord.current = [
            smoothedCoord.current[0] * 0.7 + position[0] * 0.3,
            smoothedCoord.current[1] * 0.7 + position[1] * 0.3,
          ];
        }

        useStore.getState().setDetectionResult({
          acquired: !!acquired,
          position: smoothedCoord.current,
          box: box || null,
          confidence: confidence || 0,
          latency: latency || 0,
        });

        isProcessing.current = false;
      }
    };

    return () => {
      workerRef.current?.terminate();
      if (animationId.current) cancelAnimationFrame(animationId.current);
    };
  }, []);

  const detectFrame = (timestamp: number) => {
    if (!useStore.getState().isCameraOn || !videoRef.current || !workerRef.current) {
      animationId.current = requestAnimationFrame(detectFrame);
      return;
    }

    // Throttle inference to ~16 FPS (every 60ms) to ensure butter-smooth 60fps video playback & 0 lag
    const elapsedSinceLast = timestamp - lastInferenceTime.current;

    if (
      !isProcessing.current &&
      elapsedSinceLast >= 60 &&
      videoRef.current.readyState >= 2 &&
      videoRef.current.videoWidth > 0
    ) {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
        canvasRef.current.width = 640;
        canvasRef.current.height = 640;
      }

      const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 640);
        const imgData = ctx.getImageData(0, 0, 640, 640);

        isProcessing.current = true;
        lastInferenceTime.current = timestamp;

        // Zero-copy Transferable ArrayBuffer: transfers memory instantly with 0ms UI delay!
        workerRef.current.postMessage(
          { rgbaBuffer: imgData.data.buffer },
          [imgData.data.buffer]
        );
      }
    }

    animationId.current = requestAnimationFrame(detectFrame);
  };

  return { startDetection: () => requestAnimationFrame(detectFrame) };
};