"use client";

import { View } from "@/components/3d/View";
import { Scanner } from "@/components/ui/Scanner";
import { useStore } from "@/store/useStore";

export default function Home() {
  // We only subscribe to camera states here.
  // This keeps the Parent component from re-rendering and blinking the camera feed.
  const isCameraOn = useStore((state) => state.isCameraOn);
  const toggleCamera = useStore((state) => state.toggleCamera);

  return (
    <main 
      suppressHydrationWarning 
      className="relative h-screen w-full bg-black overflow-hidden"
    >
      {/* 1. HUD OVERLAY LAYER (Static White Design) */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-16 pointer-events-none">
        
        {/* TOP SECTION: Header remains clean white/gray as requested */}
        <div className="space-y-2">
          <h1 className="text-6xl font-black italic tracking-tighter text-white">
            ANTIGRAVITY <span className="opacity-40">OBSIDIAN</span>
          </h1>

          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-white/20" />
            <p className="text-[10px] font-mono tracking-widest uppercase text-white/50">
              Neural_Engine // Active_Sync
            </p>
          </div>
        </div>

        {/* BOTTOM SECTION: Telemetry & Interactive Controls */}
        <div className="flex justify-between items-end border-t border-white/10 pt-8">
          {/* Left Side: Mock Location Data */}
          <div className="font-mono text-[9px] text-white/30 space-y-1">
            <p>LAT: 23.8103° N</p>
            <p>LONG: 90.4125° E</p>
            <p>LOC: DHAKA_BD</p>
          </div>

          {/* Right Side: AI Controls (Only part that reacts here) */}
          <div className="text-right font-mono text-[9px] text-white/30 space-y-4 pointer-events-auto">
            <button
              onClick={toggleCamera}
              className={`px-5 py-2.5 border font-bold tracking-widest transition-all active:scale-90 cursor-pointer ${
                isCameraOn 
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                  : 'bg-transparent text-white border-white/20 hover:border-white'
              }`}
            >
              {isCameraOn ? '[ NEURAL_OFFLINE ]' : '[ NEURAL_LINK_START ]'}
            </button>
            <div className="opacity-50">
              <p>SYSTEM_LINK: STABLE</p>
              <p>© 2026 // AG_LABS</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 3D BACKGROUND LAYER (Handles the Purple Neon Tracing) */}
      <View />

      {/* 3. AI SCANNER LAYER (Stable/No-Blink) */}
      <Scanner />

    </main>
  );
}