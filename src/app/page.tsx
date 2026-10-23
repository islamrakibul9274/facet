"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { MousePointer2, MoveUpRight, Rotate3D } from "lucide-react";
import { Scanner } from "@/components/ui/Scanner";
import { CommandDock, ARTIFACTS } from "@/components/ui/CommandDock";
import { Header } from "@/components/ui/Header";
import { Inspector } from "@/components/ui/Inspector";
import { useStore, THEME_PALETTES } from "@/store/useStore";
const View = dynamic(
  () => import("@/components/3d/View").then((mod) => mod.View),
  {
    ssr: false,
    loading: () => (
      <div className="scene-loading" role="status">
        <span className="loading-orbit" />
        Preparing your sculpture
        <span className="loading-caption">
          A little light. A little patience.
        </span>
      </div>
    ),
  },
);
export default function Home() {
  const active = useStore((s) => s.activeArtifact);
  const theme = useStore((s) => s.colorTheme);
  const camera = useStore((s) => s.isCameraOn);
  const acquired = useStore((s) => s.isTargetAcquired);
  const artifact = ARTIFACTS.find((item) => item.id === active)!;
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () =>
      useStore.getState().setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    const keydown = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        useStore.getState().showInspector ||
        (e.target instanceof HTMLElement &&
          (e.target.isContentEditable ||
            /INPUT|TEXTAREA|SELECT|BUTTON|A/.test(e.target.tagName)))
      )
        return;
      const item = ARTIFACTS[Number(e.key) - 1];
      if (item) useStore.getState().setActiveArtifact(item.id);
      if (e.code === "Space") {
        e.preventDefault();
        useStore.getState().togglePlayback();
      }
      if (e.key.toLowerCase() === "r") useStore.getState().resetView();
    };
    window.addEventListener("keydown", keydown);
    return () => {
      media.removeEventListener("change", updateMotion);
      window.removeEventListener("keydown", keydown);
    };
  }, []);
  return (
    <main
      className="studio"
      style={
        { "--mineral": THEME_PALETTES[theme].start } as React.CSSProperties
      }
    >
      <Header />
      <div className="workspace">
        <section className="intro" aria-labelledby="studio-title">
          <div className="eyebrow">
            <span className="status-dot" /> AN EXPERIMENT IN LIGHT
          </div>
          <h1 id="studio-title">
            Matter.
            <br />
            <em>In motion.</em>
          </h1>
          <p>
            A playground for form, light,
            <br className="desktop-break" /> and your own curiosity.
          </p>
          <span className="intro-rule" />
          <div className="interaction-caption">
            <MousePointer2 size={14} />
            <span>
              {camera
                ? acquired
                  ? "Responding to your presence"
                  : "Finding your presence"
                : "Move your cursor. Make a connection."}
            </span>
          </div>
          <div className="collection-note">
            <span>THE COLLECTION</span>
            <strong>
              Four forms.
              <br />
              Endless perspectives.
            </strong>
            <MoveUpRight size={18} strokeWidth={1} />
          </div>
        </section>
        <section
          className="sculpture-stage"
          aria-label={`${artifact.name} sculpture in ${THEME_PALETTES[theme].name}. Drag to rotate.`}
        >
          <div className="stage-grid" aria-hidden="true" />
          <div className="stage-halo" aria-hidden="true" />
          <View />
          <div className="stage-coordinate coordinate-top" aria-hidden="true">
            Y +
          </div>
          <div className="stage-coordinate coordinate-left" aria-hidden="true">
            − X
          </div>
          <div className="stage-coordinate coordinate-right" aria-hidden="true">
            X +
          </div>
          <div
            className="specimen-caption"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="specimen-number">
              {artifact.index} <span>/ 04</span>
            </span>
            <div>
              <h2>{artifact.name}</h2>
              <p>
                {artifact.note} <span>·</span> {THEME_PALETTES[theme].name}
              </p>
            </div>
          </div>
          <div className="drag-hint">
            <Rotate3D size={14} />
            <span>Drag to explore</span>
          </div>
        </section>
        <CommandDock />
      </div>
      <div className="scanner-anchor">
        <Scanner />
      </div>
      <footer className="site-footer">
        <span>DESIGNED TO BE EXPLORED.</span>
        <span className="footer-center">
          <span className="status-dot" />{" "}
          {camera && acquired
            ? "CONNECTED TO YOUR PRESENCE"
            : "REAL-TIME. A LITTLE OTHERWORLDLY."}
        </span>
        <span>
          TAKE A MOMENT. <span className="footer-spark">✳</span>
        </span>
      </footer>
      <Inspector />
    </main>
  );
}
