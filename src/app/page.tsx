"use client";

import { View } from "@/components/3d/View";
import { Scanner } from "@/components/ui/Scanner";
import { CommandDock } from "@/components/ui/CommandDock";
import { Header } from "@/components/ui/Header";
import { Inspector } from "@/components/ui/Inspector";
import { useStore } from "@/store/useStore";

export default function Home() {
  const isCameraOn = useStore((state) => state.isCameraOn);
  const latency = useStore((state) => state.inferenceLatency);

  return (
    <main
      suppressHydrationWarning
      className="relative w-full max-w-full h-[100dvh] bg-[#030305] overflow-x-hidden overflow-y-hidden select-none flex justify-center"
    >
      {/* 1. Fullscreen WebGL Three.js Canvas Backdrop */}
      <View />

      {/* 2. Responsive Application Stage (Fluid width up to max-w-7xl with standard responsive padding) */}
      <div className="relative z-20 w-full max-w-7xl h-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-6 sm:pb-8 md:pb-10 lg:pb-12 flex flex-col justify-between pointer-events-none">
        
        {/* TOP: Header with Generous Breathing Room */}
        <div className="w-full pointer-events-auto">
          <Header />
        </div>

        {/* CENTER STAGE: 3D Focal Space */}
        <div className="flex-1 relative flex items-center justify-center pointer-events-none" />

        {/* BOTTOM: Responsive Control Bar */}
        <div className="w-full relative pointer-events-auto flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          {/* Left Slot: Camera Scanner Capsule (Fluid docking) */}
          <div className="sm:absolute sm:left-0 sm:bottom-0 z-30 pointer-events-auto w-full sm:w-auto flex justify-center sm:justify-start">
            <Scanner />
          </div>

          {/* Center Slot: Symmetrical Command Dock Centered with Auto Margin (mx-auto) */}
          <div className="w-full flex justify-center mx-auto z-20 pointer-events-auto">
            <CommandDock />
          </div>

          {/* Right Slot: Technical Telemetry & Spatial Specs (Desktop / Tablet) */}
          <div className="sm:absolute sm:right-0 sm:bottom-0 z-30 hidden md:flex items-center pointer-events-auto">
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono tracking-wider px-3 py-1.5 rounded-full bg-zinc-950/70 backdrop-blur-md border border-white/5 shadow-sm">
              <span>{isCameraOn ? `${latency || 12}MS` : "CURSOR"}</span>
              <span className="text-white/15">&bull;</span>
              <span>RESPONSIVE</span>
            </div>
          </div>
        </div>

        {/* Floating Inspector Panel (Responsive anchor) */}
        <Inspector />
      </div>
    </main>
  );
}