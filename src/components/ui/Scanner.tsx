"use client";

import { useEffect, useRef, useState, memo } from "react";
import { X, AlertCircle } from "lucide-react";
import { useYOLO } from "@/hooks/useYOLO";
import { useStore } from "@/store/useStore";

function cameraMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError")
      return "Camera access was declined. Allow it in your browser settings to try presence tracking.";
    if (error.name === "NotFoundError")
      return "No camera was found. You can still drag and explore every sculpture.";
    if (error.name === "NotReadableError" || error.name === "AbortError")
      return "Your camera is busy or unavailable. Close other apps using it and try again.";
  }
  return "The camera could not start. You can still explore with your cursor.";
}
export const Scanner = memo(function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [aspect, setAspect] = useState(4 / 3);
  const camera = useStore((s) => s.isCameraOn);
  const acquired = useStore((s) => s.isTargetAcquired);
  const box = useStore((s) => s.boundingBox);
  const confidence = useStore((s) => s.confidence);
  const visible = useStore((s) => s.showScanner);
  const error = useStore((s) => s.cameraError);
  const { startDetection, stopDetection, status } = useYOLO(videoRef);

  useEffect(() => {
    if (!camera) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    const video = videoRef.current;
    const stop = () => {
      stopDetection();
      stream?.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
      if (video) {
        video.onloadedmetadata = null;
        video.pause();
        video.srcObject = null;
      }
    };
    const fail = (message: string) => {
      if (cancelled) return;
      stop();
      useStore.getState().setCameraOn(false);
      useStore.getState().setCameraError(message);
    };
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          fail("Camera access needs a secure browser with camera support.");
          return;
        }
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 24, max: 30 },
            },
          });
        } catch (reason) {
          // Retry only constraint failures; permission denial must not prompt twice.
          if (
            !(reason instanceof DOMException) ||
            reason.name !== "OverconstrainedError"
          )
            throw reason;
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
          });
        }
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (!video) {
          fail("The camera preview could not start. Please try again.");
          return;
        }
        stream.getVideoTracks().forEach((track) => {
          track.onended = () =>
            fail(
              "The camera disconnected. Reconnect it and enable presence to try again.",
            );
        });
        video.srcObject = stream;
        await video.play();
        if (!cancelled) startDetection();
      } catch (reason) {
        fail(cameraMessage(reason));
      }
    };
    void start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [camera, startDetection, stopDetection]);

  // Keep the video attached while the preview is hidden so inference continues.
  return (
    <>
      {error && (
        <div className="scanner-error" role="alert">
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{error}</span>
          <button
            aria-label="Dismiss camera error"
            onClick={() => useStore.getState().setCameraError(null)}
          >
            <X size={13} />
          </button>
        </div>
      )}
      <div className="scanner-preview" hidden={!camera || !visible}>
        <div className="scanner-header">
          <span>
            <span
              className="status-dot"
              style={{ marginRight: 6, opacity: acquired ? 1 : 0.4 }}
            />
            {status === "loading"
              ? "Preparing presence…"
              : acquired
                ? "Presence connected"
                : "Finding your presence…"}
          </span>
          <button
            aria-label="Hide camera preview"
            onClick={() => useStore.getState().toggleScanner()}
          >
            <X size={12} />
          </button>
        </div>
        <div className="scanner-video-wrap" style={{ aspectRatio: aspect }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={(event) => {
              const video = event.currentTarget;
              if (video.videoHeight)
                setAspect(video.videoWidth / video.videoHeight);
            }}
          />
          {acquired && box && (
            <div
              className="tracking-frame"
              style={{
                left: `${(1 - box[2]) * 100}%`,
                top: `${box[1] * 100}%`,
                width: `${(box[2] - box[0]) * 100}%`,
                height: `${(box[3] - box[1]) * 100}%`,
              }}
            >
              <span>{confidence}%</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
});
