"use client";

import { useStore, THEME_PALETTES } from "@/store/useStore";
import { X, Sliders } from "lucide-react";
import { sound } from "@/utils/sound";

export const Inspector = () => {
  const showInspector = useStore((state) => state.showInspector);
  const toggleInspector = useStore((state) => state.toggleInspector);
  const activeArtifact = useStore((state) => state.activeArtifact);
  const colorTheme = useStore((state) => state.colorTheme);
  const isCameraOn = useStore((state) => state.isCameraOn);
  const latency = useStore((state) => state.inferenceLatency);
  const confidence = useStore((state) => state.confidence);

  const palette = THEME_PALETTES[colorTheme];

  if (!showInspector) return null;

  return (
    <div className="absolute top-20 sm:top-24 right-4 sm:right-6 md:right-8 lg:right-12 z-40 w-[calc(100vw-2rem)] sm:w-72 max-w-xs animate-in fade-in slide-in-from-right-3 duration-200 select-none pointer-events-auto">
      <div className="rounded-2xl bg-zinc-950/90 backdrop-blur-2xl border border-white/10 p-4 sm:p-5 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-zinc-400" />
            <span className="text-xs font-medium tracking-wide">Sculpture Details</span>
          </div>
          <button
            onClick={() => {
              sound.playClick(600);
              toggleInspector();
            }}
            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3 text-xs">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-zinc-400">Geometry</span>
            <span className="capitalize font-medium text-white">{activeArtifact}</span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-zinc-400">Glass Material</span>
            <span className="font-medium text-white">{palette.name}</span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-zinc-400">Tracking Engine</span>
            <span className="text-zinc-300">
              {isCameraOn ? "YOLO26n (WASM)" : "Cursor Parallax"}
            </span>
          </div>

          {isCameraOn && (
            <>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-zinc-400">Inference Speed</span>
                <span className="text-emerald-400 font-mono text-[11px]">
                  {latency ? `${latency} ms` : "..."}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-zinc-400">Detection Confidence</span>
                <span className="text-zinc-200 font-mono text-[11px]">
                  {confidence}%
                </span>
              </div>
            </>
          )}

          <div className="pt-2 border-t border-white/10 text-[10px] sm:text-[11px] text-zinc-500 text-center">
            Three.js &middot; WebGL 2.0 &middot; React 19
          </div>
        </div>
      </div>
    </div>
  );
};
