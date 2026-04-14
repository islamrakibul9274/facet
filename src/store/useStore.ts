import { create } from 'zustand';

interface AppState {
    isTargetAcquired: boolean;
    isCameraOn: boolean;
    // targetPosition [x, y] where 0.5 is center
    targetPosition: [number, number];
    setTargetAcquired: (status: boolean) => void;
    setTargetPosition: (pos: [number, number]) => void; // NEW
    toggleCamera: () => void;
}

export const useStore = create<AppState>((set) => ({
    isTargetAcquired: false,
    isCameraOn: false,
    targetPosition: [0.5, 0.5],
    setTargetAcquired: (status) => set({ isTargetAcquired: status }),
    setTargetPosition: (pos) => set({ targetPosition: pos }),
    // Inside your useStore.ts
    toggleCamera: () => set((state) => {
        const nextCameraState = !state.isCameraOn;
        return {
            isCameraOn: nextCameraState,
            // If turning off, reset targetAcquired so the UI turns white/black again
            isTargetAcquired: nextCameraState ? state.isTargetAcquired : false
        };
    }),
}));