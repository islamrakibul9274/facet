import { create } from "zustand";

export type ArtifactType = "cube" | "crystal" | "torus" | "pillar";
export type ColorThemeType = "obsidian" | "amethyst" | "emerald" | "amber";
export interface ColorPalette {
  start: string;
  end: string;
  accent: string;
  emissive: string;
  name: string;
}
export const THEME_PALETTES: Record<ColorThemeType, ColorPalette> = {
  obsidian: {
    start: "#a6c9dd",
    end: "#263746",
    accent: "#dceaf2",
    emissive: "#101c27",
    name: "Obsidian",
  },
  emerald: {
    start: "#a7e8c7",
    end: "#184d41",
    accent: "#d5ffe9",
    emissive: "#10362d",
    name: "Jade",
  },
  amethyst: {
    start: "#c4abea",
    end: "#49345c",
    accent: "#eee0ff",
    emissive: "#271a39",
    name: "Amethyst",
  },
  amber: {
    start: "#e6bd83",
    end: "#6a4322",
    accent: "#ffe5bd",
    emissive: "#392514",
    name: "Amber",
  },
};
interface AppState {
  isCameraOn: boolean;
  isTargetAcquired: boolean;
  targetPosition: [number, number];
  boundingBox: [number, number, number, number] | null;
  confidence: number;
  inferenceLatency: number;
  cameraError: string | null;
  activeArtifact: ArtifactType;
  colorTheme: ColorThemeType;
  soundEnabled: boolean;
  mousePosition: [number, number];
  showScanner: boolean;
  showInspector: boolean;
  isPlaying: boolean;
  reducedMotion: boolean;
  resetKey: number;
  motionSpeed: number;
  setCameraOn: (status: boolean) => void;
  toggleCamera: () => void;
  setCameraError: (error: string | null) => void;
  setDetectionResult: (result: {
    acquired: boolean;
    position: [number, number];
    box: [number, number, number, number] | null;
    confidence: number;
    latency: number;
  }) => void;
  setActiveArtifact: (artifact: ArtifactType) => void;
  setColorTheme: (theme: ColorThemeType) => void;
  toggleSound: () => void;
  setMousePosition: (position: [number, number]) => void;
  toggleScanner: () => void;
  toggleInspector: () => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlayback: () => void;
  setReducedMotion: (reduced: boolean) => void;
  resetView: () => void;
  setMotionSpeed: (speed: number) => void;
}
const clearedTracking = {
  isTargetAcquired: false,
  targetPosition: [0.5, 0.5] as [number, number],
  boundingBox: null,
  confidence: 0,
  inferenceLatency: 0,
};
export const useStore = create<AppState>((set) => ({
  ...clearedTracking,
  isCameraOn: false,
  cameraError: null,
  activeArtifact: "torus",
  colorTheme: "emerald",
  soundEnabled: false,
  mousePosition: [0.5, 0.5],
  showScanner: true,
  showInspector: false,
  isPlaying: true,
  reducedMotion: false,
  resetKey: 0,
  motionSpeed: 0.6,
  setCameraOn: (status) =>
    set((state) => ({
      isCameraOn: status,
      ...clearedTracking,
      cameraError: status ? null : state.cameraError,
    })),
  toggleCamera: () =>
    set((state) => ({
      isCameraOn: !state.isCameraOn,
      ...clearedTracking,
      cameraError: null,
      showScanner: true,
    })),
  setCameraError: (cameraError) => set({ cameraError }),
  setDetectionResult: ({ acquired, position, box, confidence, latency }) =>
    set((state) =>
      state.isCameraOn
        ? {
            isTargetAcquired: acquired,
            targetPosition: position,
            boundingBox: acquired ? box : null,
            confidence: acquired ? confidence : 0,
            inferenceLatency: latency,
          }
        : clearedTracking,
    ),
  setActiveArtifact: (activeArtifact) => set({ activeArtifact }),
  setColorTheme: (colorTheme) => set({ colorTheme }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setMousePosition: (mousePosition) => set({ mousePosition }),
  toggleScanner: () => set((state) => ({ showScanner: !state.showScanner })),
  toggleInspector: () =>
    set((state) => ({ showInspector: !state.showInspector })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setReducedMotion: (reducedMotion) =>
    set({ reducedMotion, ...(reducedMotion ? { isPlaying: false } : {}) }),
  resetView: () =>
    set((state) => ({
      resetKey: state.resetKey + 1,
      mousePosition: [0.5, 0.5],
    })),
  setMotionSpeed: (motionSpeed) =>
    set({ motionSpeed: Math.max(0.1, Math.min(1, motionSpeed)) }),
}));
