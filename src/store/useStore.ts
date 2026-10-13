import { create } from 'zustand';

export type ArtifactType = 'cube' | 'crystal' | 'torus' | 'pillar';
export type ColorThemeType = 'obsidian' | 'amethyst' | 'emerald' | 'amber';

export interface ColorPalette {
  start: string;
  end: string;
  accent: string;
  emissive: string;
  name: string;
}

export const THEME_PALETTES: Record<ColorThemeType, ColorPalette> = {
  obsidian: {
    start: '#38bdf8', // Cool Iced Cyan
    end: '#1e3a8a',   // Deep Cobalt
    accent: '#818cf8', // Indigo
    emissive: '#030712',
    name: 'Obsidian',
  },
  amethyst: {
    start: '#c084fc', // Soft Violet
    end: '#581c87',   // Smoked Plum
    accent: '#e879f9', // Orchid
    emissive: '#10051d',
    name: 'Amethyst',
  },
  emerald: {
    start: '#34d399', // Mint Jade
    end: '#064e3b',   // Forest Glass
    accent: '#a7f3d0', // Seafoam
    emissive: '#021e14',
    name: 'Emerald',
  },
  amber: {
    start: '#fbbf24', // Warm Champagne
    end: '#78350f',   // Smoked Cognac
    accent: '#f59e0b', // Radiant Amber
    emissive: '#1a0b02',
    name: 'Amber',
  },
};

interface AppState {
  // Vision & Tracking
  isCameraOn: boolean;
  isTargetAcquired: boolean;
  targetPosition: [number, number]; // [x, y] normalized 0..1
  boundingBox: [number, number, number, number] | null; // [x1, y1, x2, y2]
  confidence: number;
  inferenceLatency: number; // in ms
  cameraError: string | null;

  // 3D Sculpture & Aesthetics
  activeArtifact: ArtifactType;
  colorTheme: ColorThemeType;
  soundEnabled: boolean;
  mousePosition: [number, number];

  // UI State
  showScanner: boolean;
  showInspector: boolean;

  // Actions
  setCameraOn: (status: boolean) => void;
  toggleCamera: () => void;
  setCameraError: (err: string | null) => void;
  setDetectionResult: (params: {
    acquired: boolean;
    position: [number, number];
    box: [number, number, number, number] | null;
    confidence: number;
    latency: number;
  }) => void;
  setActiveArtifact: (artifact: ArtifactType) => void;
  setColorTheme: (theme: ColorThemeType) => void;
  toggleSound: () => void;
  setMousePosition: (pos: [number, number]) => void;
  toggleScanner: () => void;
  toggleInspector: () => void;
}

export const useStore = create<AppState>((set) => ({
  isCameraOn: false,
  isTargetAcquired: false,
  targetPosition: [0.5, 0.5],
  boundingBox: null,
  confidence: 0,
  inferenceLatency: 0,
  cameraError: null,

  activeArtifact: 'cube',
  colorTheme: 'obsidian',
  soundEnabled: false, // Default off to be polite and unobtrusive
  mousePosition: [0.5, 0.5],

  showScanner: true,
  showInspector: false,

  setCameraOn: (status) =>
    set({
      isCameraOn: status,
      isTargetAcquired: status ? undefined : false,
      cameraError: null,
    }),

  toggleCamera: () =>
    set((state) => {
      const nextState = !state.isCameraOn;
      return {
        isCameraOn: nextState,
        isTargetAcquired: nextState ? state.isTargetAcquired : false,
        boundingBox: nextState ? state.boundingBox : null,
        cameraError: null,
      };
    }),

  setCameraError: (err) => set({ cameraError: err }),

  setDetectionResult: ({ acquired, position, box, confidence, latency }) =>
    set({
      isTargetAcquired: acquired,
      targetPosition: position,
      boundingBox: box,
      confidence,
      inferenceLatency: latency,
    }),

  setActiveArtifact: (artifact) => set({ activeArtifact: artifact }),
  setColorTheme: (theme) => set({ colorTheme: theme }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setMousePosition: (pos) => set({ mousePosition: pos }),
  toggleScanner: () => set((state) => ({ showScanner: !state.showScanner })),
  toggleInspector: () => set((state) => ({ showInspector: !state.showInspector })),
}));