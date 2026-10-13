"use client";

import { useStore, ArtifactType, ColorThemeType } from "@/store/useStore";
import { sound } from "@/utils/sound";
import { Camera, Box, Hexagon, Orbit, Columns } from "lucide-react";

const ARTIFACTS: {
  id: ArtifactType;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "cube", label: "Cube", icon: Box },
  { id: "crystal", label: "Crystal", icon: Hexagon },
  { id: "torus", label: "Torus", icon: Orbit },
  { id: "pillar", label: "Pillar", icon: Columns },
];

const THEMES: { id: ColorThemeType; name: string; hex: string }[] = [
  { id: "obsidian", name: "Obsidian", hex: "#38bdf8" },
  { id: "amethyst", name: "Amethyst", hex: "#c084fc" },
  { id: "emerald", name: "Emerald", hex: "#34d399" },
  { id: "amber", name: "Amber", hex: "#fbbf24" },
];

export const CommandDock = () => {
  const isCameraOn = useStore((state) => state.isCameraOn);
  const toggleCamera = useStore((state) => state.toggleCamera);
  const activeArtifact = useStore((state) => state.activeArtifact);
  const setActiveArtifact = useStore((state) => state.setActiveArtifact);
  const colorTheme = useStore((state) => state.colorTheme);
  const setColorTheme = useStore((state) => state.setColorTheme);
  const targetAcquired = useStore((state) => state.isTargetAcquired);

  return (
    <nav
      aria-label="Sculpture Controls"
      className="w-fit max-w-[calc(100vw-2rem)] mx-auto px-2.5 sm:px-3.5 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 rounded-full bg-zinc-950/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] select-none pointer-events-auto overflow-x-auto sm:overflow-visible"
    >
      {/* 1. Geometry Segmented Control */}
      <div className="p-1 rounded-full bg-white/[0.04] border border-white/5 flex items-center gap-1">
        {ARTIFACTS.map(({ id, label, icon: Icon }) => {
          const isSelected = activeArtifact === id;
          return (
            <button
              key={id}
              onClick={() => {
                sound.playSwitchTone(true);
                setActiveArtifact(id);
              }}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 sm:gap-2 leading-none transition-all shrink-0 ${
                isSelected
                  ? "bg-white/15 text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
              title={label}
            >
              <Icon size={14} className="shrink-0" />
              <span className="text-[12px] hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-white/10 shrink-0 self-center" />

      {/* 2. Face Tracking Toggle */}
      <button
        onClick={() => {
          sound.playClick(isCameraOn ? 400 : 800);
          toggleCamera();
        }}
        className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 leading-none transition-all shrink-0 ${
          isCameraOn
            ? targetAcquired
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
            : "bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/5"
        }`}
      >
        {isCameraOn ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[12px]">
              <span className="hidden sm:inline">
                {targetAcquired ? "Tracking Active" : "Searching..."}
              </span>
              <span className="sm:hidden">
                {targetAcquired ? "Active" : "Scan"}
              </span>
            </span>
          </>
        ) : (
          <>
            <Camera size={14} className="text-zinc-400 shrink-0" />
            <span className="text-[12px]">
              <span className="hidden sm:inline">Face Tracking</span>
              <span className="sm:hidden">Track</span>
            </span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-white/10 shrink-0 self-center" />

      {/* 3. Color Theme Selector */}
      <div className="px-2 sm:px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/5 flex items-center gap-1.5 sm:gap-2 shrink-0">
        {THEMES.map(({ id, name, hex }) => {
          const isSelected = colorTheme === id;
          return (
            <button
              key={id}
              onClick={() => {
                sound.playSwitchTone(false);
                setColorTheme(id);
              }}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                isSelected
                  ? "border border-white/60 bg-white/10"
                  : "border border-transparent opacity-40 hover:opacity-100 hover:bg-white/5"
              }`}
              title={name}
            >
              <span
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-transform"
                style={{ backgroundColor: hex }}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
