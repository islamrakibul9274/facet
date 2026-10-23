"use client";
import Link from "next/link";
import { Volume2, VolumeX, ArrowUpRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { sound } from "@/utils/sound";

export function Header() {
  const soundEnabled = useStore((s) => s.soundEnabled);
  const showInspector = useStore((s) => s.showInspector);
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Facet home">
        <svg
          width="31"
          height="35"
          viewBox="0 0 32 36"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m16 1 15 8.5v17L16 35 1 26.5v-17L16 1Z"
            stroke="currentColor"
            strokeWidth="1.1"
          />
          <path
            d="m16 1 5 17-5 17L11 18 16 1ZM1 9.5 21 18 1 26.5M31 9.5 11 18l20 8.5"
            stroke="currentColor"
            strokeWidth=".8"
          />
        </svg>
        <span>
          facet<span className="brand-period">.</span>
        </span>
        <span className="brand-label">DIGITAL SCULPTURE STUDIO</span>
      </Link>
      <div className="header-actions">
        <span className="edition-tag">
          VOL. 01 <span>/</span> A STUDY IN FORM
        </span>
        <button
          className="icon-button"
          onClick={() => {
            const next = !soundEnabled;
            sound.setMuted(!next);
            useStore.getState().toggleSound();
            if (next) sound.playClick();
          }}
          aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
          aria-pressed={soundEnabled}
          title={soundEnabled ? "Mute sound" : "Enable sound"}
        >
          {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>
        <button
          className="about-button"
          aria-haspopup="dialog"
          aria-expanded={showInspector}
          onClick={() => useStore.getState().toggleInspector()}
        >
          About the project <ArrowUpRight size={15} />
        </button>
      </div>
    </header>
  );
}
