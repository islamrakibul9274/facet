"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { sound } from "@/utils/sound";

const INPUT_SIZE = 640;
const FRAME_INTERVAL = 120;

export const useYOLO = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const workerRef = useRef<Worker | null>(null);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef(false);
  const readyRef = useRef(false);
  const processingRef = useRef(false);
  const acquiredRef = useRef(false);
  const lastFrameRef = useRef(0);
  const positionRef = useRef<[number, number]>([0.5, 0.5]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");

  const stopDetection = useCallback(() => {
    activeRef.current = false;
    readyRef.current = false;
    processingRef.current = false;
    acquiredRef.current = false;
    positionRef.current = [0.5, 0.5];
    if (animationRef.current !== null)
      cancelAnimationFrame(animationRef.current);
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    animationRef.current = null;
    timeoutRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  // A stable callback is essential: detection results must not reopen the camera.
  const startDetection = useCallback(() => {
    if (activeRef.current || !useStore.getState().isCameraOn) return;
    activeRef.current = true;
    lastFrameRef.current = 0;
    setStatus("loading");

    const fail = (message: string) => {
      if (!activeRef.current) return;
      stopDetection();
      useStore.getState().setCameraOn(false);
      useStore.getState().setCameraError(message);
      setStatus("idle");
    };

    try {
      // Load the model only after the visitor explicitly enables their camera.
      const worker = new Worker(
        new URL("../workers/yoloWorker.ts", import.meta.url),
      );
      workerRef.current = worker;
      timeoutRef.current = setTimeout(() => {
        fail("Tracking could not load. Check your connection and try again.");
      }, 60000);

      worker.onerror = () =>
        fail(
          "Tracking is unavailable in this browser. Try a current version of Chrome or Safari.",
        );
      worker.onmessage = (event: MessageEvent) => {
        if (!activeRef.current || workerRef.current !== worker) return;
        const { type, acquired, confidence, position, box, latency } =
          event.data;

        if (type === "READY") {
          readyRef.current = true;
          if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
          setStatus("ready");
          return;
        }
        if (type === "ERROR") {
          fail(
            "Tracking could not start. Your camera has been turned off; you can try again.",
          );
          return;
        }
        if (type !== "RESULT") return;
        processingRef.current = false;
        if (!useStore.getState().isCameraOn) return;

        if (acquired && position) {
          // Acquire immediately, then ease small changes without adding a long lag.
          positionRef.current = acquiredRef.current
            ? [
                positionRef.current[0] * 0.55 + position[0] * 0.45,
                positionRef.current[1] * 0.55 + position[1] * 0.45,
              ]
            : position;
          if (!acquiredRef.current && useStore.getState().soundEnabled)
            sound.playTargetAcquired();
        }
        acquiredRef.current = !!acquired;
        useStore.getState().setDetectionResult({
          acquired: !!acquired,
          position: positionRef.current,
          box: box ?? null,
          confidence: confidence ?? 0,
          latency: latency ?? 0,
        });
      };
    } catch {
      fail("This browser could not start camera tracking.");
      return;
    }

    const detectFrame = (timestamp: number) => {
      if (!activeRef.current) return;
      if (!useStore.getState().isCameraOn) {
        stopDetection();
        return;
      }
      const video = videoRef.current;

      if (processingRef.current && timestamp - lastFrameRef.current > 15000) {
        fail("Tracking stopped responding. Turn the camera on to try again.");
        return;
      }

      if (
        readyRef.current &&
        !processingRef.current &&
        !document.hidden &&
        timestamp - lastFrameRef.current >= FRAME_INTERVAL &&
        video &&
        !video.paused &&
        video.readyState >= 2 &&
        video.videoWidth > 0
      ) {
        try {
          if (!canvasRef.current) {
            canvasRef.current = document.createElement("canvas");
            canvasRef.current.width = INPUT_SIZE;
            canvasRef.current.height = INPUT_SIZE;
          }
          const context = canvasRef.current.getContext("2d", {
            willReadFrequently: true,
          });
          if (!context) {
            fail("This browser does not support camera tracking.");
            return;
          }

          // Letterbox instead of stretching people into a square. The worker maps
          // detections back to the original camera coordinates for the preview.
          const scale = Math.min(
            INPUT_SIZE / video.videoWidth,
            INPUT_SIZE / video.videoHeight,
          );
          const width = video.videoWidth * scale;
          const height = video.videoHeight * scale;
          const left = (INPUT_SIZE - width) / 2;
          const top = (INPUT_SIZE - height) / 2;
          context.fillStyle = "#727272";
          context.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
          context.drawImage(video, left, top, width, height);
          const frame = context.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
          processingRef.current = true;
          lastFrameRef.current = timestamp;
          workerRef.current?.postMessage(
            {
              rgbaBuffer: frame.data.buffer,
              imageRect: [
                left / INPUT_SIZE,
                top / INPUT_SIZE,
                width / INPUT_SIZE,
                height / INPUT_SIZE,
              ],
            },
            [frame.data.buffer],
          );
        } catch {
          fail(
            "The camera frame could not be read. Turn the camera on to retry.",
          );
          return;
        }
      }
      animationRef.current = requestAnimationFrame(detectFrame);
    };

    animationRef.current = requestAnimationFrame(detectFrame);
  }, [stopDetection, videoRef]);

  useEffect(() => stopDetection, [stopDetection]);

  return { startDetection, stopDetection, status };
};
