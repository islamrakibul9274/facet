"use client";
import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

export const useYOLO = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const workerRef = useRef<Worker | null>(null);
  const isProcessing = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationId = useRef<number | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("../workers/yoloWorker.ts", import.meta.url));
    
    workerRef.current.onmessage = (event) => {
      const { type, detections, position } = event.data;

      if (type === "READY") {
        console.log("✅ NEURAL ENGINE ONLINE");
        return;
      }

      if (type === "RETRY" || type === "ERROR") {
        isProcessing.current = false;
        return;
      }

      if (type === "RESULT") {
        if (!useStore.getState().isCameraOn) return;
        const hasHighConfidence = detections.length > 0;
        useStore.getState().setTargetAcquired(hasHighConfidence);
        if (hasHighConfidence) {
          useStore.getState().setTargetPosition(position);
        }
        isProcessing.current = false;
      }
    };

    return () => {
      workerRef.current?.terminate();
      if (animationId.current) cancelAnimationFrame(animationId.current);
    };
  }, []);

  const detectFrame = () => {
    if (!useStore.getState().isCameraOn || !videoRef.current || !workerRef.current) {
      animationId.current = requestAnimationFrame(detectFrame);
      return;
    }

    // Only send a new frame if the worker is done with the last one
    if (!isProcessing.current && videoRef.current.readyState === 4) {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
        canvasRef.current.width = 640;
        canvasRef.current.height = 640;
      }

      const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 640);
        const imageData = ctx.getImageData(0, 0, 640, 640).data;
        const imageBuffer = new Float32Array(640 * 640 * 3);
        for (let i = 0; i < 640 * 640; i++) {
          imageBuffer[i] = imageData[i * 4];
          imageBuffer[i + 640 * 640] = imageData[i * 4 + 1];
          imageBuffer[i + 2 * 640 * 640] = imageData[i * 4 + 2];
        }
        isProcessing.current = true;
        workerRef.current.postMessage({ imageBuffer });
      }
    }
    
    animationId.current = requestAnimationFrame(detectFrame);
  };

  return { startDetection: detectFrame };
};