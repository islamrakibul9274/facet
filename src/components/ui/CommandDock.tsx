"use client";
import {
  Camera,
  CameraOff,
  Check,
  Eye,
  Pause,
  Play,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import {
  useStore,
  ArtifactType,
  ColorThemeType,
  THEME_PALETTES,
} from "@/store/useStore";
import { sound } from "@/utils/sound";

export const ARTIFACTS: {
  id: ArtifactType;
  name: string;
  note: string;
  index: string;
}[] = [
  { id: "cube", name: "Monolith", note: "Beveled cube", index: "01" },
  { id: "crystal", name: "Prism", note: "Cut crystal", index: "02" },
  { id: "torus", name: "Continuum", note: "Endless knot", index: "03" },
  { id: "pillar", name: "Helix", note: "Twisted column", index: "04" },
];
function ShapeIcon({ type }: { type: ArtifactType }) {
  return (
    <svg
      viewBox="0 0 56 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      {type === "cube" && (
        <>
          <path d="m28 6 18 10v21L28 47 10 37V16L28 6Z" />
          <path d="m10 16 18 11 18-11M28 27v20M15 14l18 10v20" opacity=".4" />
        </>
      )}
      {type === "crystal" && (
        <>
          <path d="m28 3 18 17-7 21-11 7-11-7-7-21L28 3Z" />
          <path
            d="m28 3-8 18 8 27 8-27-8-18ZM10 20h36M17 41l19-20M39 41 20 21"
            opacity=".65"
          />
        </>
      )}
      {type === "torus" && (
        <>
          <path
            d="M29 9C8-4-1 36 17 39c17 3 10-38-1-27C0 29 33 52 43 34 54 14 13 9 15 27c2 17 42 4 26-9-13-11-38 20-21 24C40 46 43 17 29 9Z"
            strokeWidth="2"
          />
          <path d="M27 11C12 0 6 32 18 36" opacity=".4" />
        </>
      )}
      {type === "pillar" && (
        <>
          <path d="m21 3 17 6-6 11 4 14-9 14-16-7 7-14-3-13 6-11Z" />
          <path
            d="m21 3 5 12-2 12 3 21M38 9l-12 6-11-1M32 20l-8 7-6 0M36 34l-12-7M11 41l16-6 9-1"
            opacity=".6"
          />
        </>
      )}
    </svg>
  );
}
const themes: ColorThemeType[] = ["obsidian", "emerald", "amethyst", "amber"];
export function CommandDock() {
  const active = useStore((s) => s.activeArtifact);
  const theme = useStore((s) => s.colorTheme);
  const playing = useStore((s) => s.isPlaying);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const speed = useStore((s) => s.motionSpeed);
  const camera = useStore((s) => s.isCameraOn);
  const acquired = useStore((s) => s.isTargetAcquired);
  const scanner = useStore((s) => s.showScanner);
  return (
    <aside className="studio-panel" aria-label="Sculpture controls">
      <div className="panel-title">
        <span>MAKE IT YOURS</span>
        <span className="tiny-cross">+</span>
      </div>
      <section className="control-section">
        <div className="section-label">
          <h2>01 — Form</h2>
          <span>4 objects</span>
        </div>
        <div className="shape-grid" role="group" aria-label="Choose sculpture">
          {ARTIFACTS.map((item) => (
            <button
              key={item.id}
              className={`shape-card ${active === item.id ? "selected" : ""}`}
              aria-label={`${item.name}, ${item.note}`}
              aria-pressed={active === item.id}
              onClick={() => {
                useStore.getState().setActiveArtifact(item.id);
                sound.playSwitchTone();
              }}
            >
              <span className="shape-card-index">{item.index}</span>
              {active === item.id && <span className="selected-dot" />}
              <ShapeIcon type={item.id} />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="control-section">
        <div className="section-label">
          <h2>02 — Material</h2>
          <span>{THEME_PALETTES[theme].name}</span>
        </div>
        <div
          className="material-options"
          role="group"
          aria-label="Choose material"
        >
          {themes.map((id) => (
            <button
              key={id}
              className={`material-option ${theme === id ? "selected" : ""}`}
              title={THEME_PALETTES[id].name}
              aria-label={THEME_PALETTES[id].name}
              aria-pressed={theme === id}
              onClick={() => {
                useStore.getState().setColorTheme(id);
                sound.playSwitchTone(false);
              }}
            >
              <span
                className="material-swatch"
                style={{
                  background: `radial-gradient(circle at 30% 22%, ${THEME_PALETTES[id].accent}, ${THEME_PALETTES[id].start} 22%, ${THEME_PALETTES[id].end} 75%)`,
                }}
              >
                {theme === id && <Check size={13} />}
              </span>
              <span>{THEME_PALETTES[id].name}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="control-section motion-section">
        <div className="section-label">
          <h2>03 — Motion</h2>
          <span>
            {reducedMotion ? "Reduced" : playing ? "Flowing" : "Paused"}
          </span>
        </div>
        <div className="motion-controls">
          <button
            className="motion-toggle"
            aria-label={playing ? "Pause animation" : "Play animation"}
            aria-pressed={playing}
            onClick={() => {
              useStore.getState().togglePlayback();
              sound.playClick(500);
            }}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            <span>{playing ? "Pause" : "Play"}</span>
          </button>
          <input
            aria-label="Animation speed"
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={speed}
            onChange={(e) =>
              useStore.getState().setMotionSpeed(Number(e.target.value))
            }
          />
          <button
            className="icon-button reset-button"
            title="Reset view (R)"
            aria-label="Reset view"
            onClick={() => useStore.getState().resetView()}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </section>
      <div className="presence-control">
        <div className="presence-heading">
          <span className="presence-mark">
            <Eye size={17} />
          </span>
          <div>
            <h2>A little more personal.</h2>
            <p>Let the sculpture follow you.</p>
          </div>
        </div>
        <button
          className={`camera-button ${camera ? "camera-active" : ""}`}
          aria-pressed={camera}
          onClick={() => {
            useStore.getState().toggleCamera();
            sound.playClick();
          }}
        >
          {camera ? <CameraOff size={15} /> : <Camera size={15} />}
          <span>{camera ? "Turn camera off" : "Enable presence"}</span>
          {!camera && <ArrowUpRight size={15} />}
          {camera && <span className="status-dot" />}
        </button>
        <p className="privacy-note">
          {camera
            ? acquired
              ? "Presence detected. Move gently to explore."
              : "Camera on. Looking for your presence…"
            : "Camera optional. Processing stays on your device."}
        </p>
        {camera && (
          <button
            className="preview-toggle"
            onClick={() => useStore.getState().toggleScanner()}
          >
            {scanner ? "Hide camera preview" : "Show camera preview"}
          </button>
        )}
      </div>
    </aside>
  );
}
