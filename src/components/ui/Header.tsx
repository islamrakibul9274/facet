"use client";

import { useStore, THEME_PALETTES } from "@/store/useStore";
import { Sliders, Volume2, VolumeX } from "lucide-react";
import { sound } from "@/utils/sound";

export const Header = () => {
  const isCameraOn = useStore((state) => state.isCameraOn);
  const isTargetAcquired = useStore((state) => state.isTargetAcquired);
  const colorTheme = useStore((state) => state.colorTheme);
  const activeArtifact = useStore((state) => state.activeArtifact);
  const showInspector = useStore((state) => state.showInspector);
  const toggleInspector = useStore((state) => state.toggleInspector);
  const soundEnabled = useStore((state) => state.soundEnabled);
  const toggleSound = useStore((state) => state.toggleSound);

  const palette = THEME_PALETTES[colorTheme];

  return (
    <header className="w-full flex items-center justify-between select-none pointer-events-auto">
      {/* Brand Identity */}
      <div className="flex flex-col gap-1 sm:gap-1.5 group">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refractive Facet Logomark */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="sm:w-6 sm:h-6 transition-transform duration-700 ease-out group-hover:rotate-45"
            >
              <polygon
                points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"
                stroke="currentColor"
                strokeWidth="1.2"
                className="text-white/40"
              />
              <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="0.8" className="text-white/20" />
              <line x1="2" y1="8.5" x2="22" y2="15.5" stroke="currentColor" strokeWidth="0.8" className="text-white/20" />
              <line x1="2" y1="15.5" x2="22" y2="8.5" stroke="currentColor" strokeWidth="0.8" className="text-white/20" />
              <circle
                cx="12"
                cy="12"
                r="2"
                fill={palette.start}
                className="transition-colors duration-500 shadow-sm"
              />
            </svg>
            {isTargetAcquired && (
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ backgroundColor: palette.start }}
              />
            )}
          </div>

          {/* Stylized Typography */}
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-light tracking-[0.22em] sm:tracking-[0.32em] uppercase bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,255,255,0.12)]">
              F A C E T
            </h1>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
              STUDIO
            </span>
          </div>

          {/* Active Sculpture Pill */}
          <div className="hidden xs:flex sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-zinc-300">
            <span
              className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
              style={{ backgroundColor: palette.start }}
            />
            <span className="capitalize tracking-wide font-normal">{activeArtifact}</span>
          </div>
        </div>

        {/* Minimal Subtitle (Hidden on smallest mobile to prevent wrapping) */}
        <p className="hidden sm:block text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-normal pl-8 sm:pl-9">
          Interactive Glass &middot; Real-Time Vision
        </p>
      </div>

      {/* Right Controls: Status & Toggles */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Badge (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/70 backdrop-blur-xl border border-white/10 text-xs text-zinc-300 shadow-sm">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              isCameraOn
                ? isTargetAcquired
                  ? "bg-emerald-400"
                  : "bg-amber-400 animate-pulse"
                : "bg-zinc-500"
            }`}
          />
          <span className="text-[11px] tracking-wide">
            {isCameraOn
              ? isTargetAcquired
                ? "Face tracking active"
                : "Searching for face..."
              : "Mouse interaction"}
          </span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            const next = !soundEnabled;
            sound.setMuted(!next);
            toggleSound();
            if (next) sound.playClick(900);
          }}
          className={`p-2 sm:p-2.5 rounded-full border transition-colors touch-manipulation ${
            soundEnabled
              ? "bg-white/10 text-white border-white/20"
              : "bg-zinc-950/70 text-zinc-400 border-white/10 hover:text-white"
          }`}
          title={soundEnabled ? "Mute audio" : "Unmute audio"}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>

        {/* Inspector Toggle */}
        <button
          onClick={() => {
            sound.playClick(600);
            toggleInspector();
          }}
          className={`p-2 sm:p-2.5 rounded-full border transition-colors touch-manipulation ${
            showInspector
              ? "bg-white/15 text-white border-white/25"
              : "bg-zinc-950/70 text-zinc-400 border-white/10 hover:text-white"
          }`}
          title="Toggle Details"
        >
          <Sliders size={14} />
        </button>
      </div>
    </header>
  );
};
