"use client";
import { useEffect, useRef } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { useStore } from "@/store/useStore";
export function Inspector() {
  const open = useStore((s) => s.showInspector);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="about-dialog"
      aria-labelledby="about-title"
      onCancel={() => useStore.getState().toggleInspector()}
      onClick={(e) => {
        if (e.target === e.currentTarget) useStore.getState().toggleInspector();
      }}
    >
      <button
        className="icon-button dialog-close"
        aria-label="Close about"
        onClick={() => useStore.getState().toggleInspector()}
      >
        <X size={19} />
      </button>
      <span className="eyebrow">FACET / AN INTERACTIVE STUDY</span>
      <h2 id="about-title">
        A quiet moment
        <br />
        with <em>digital matter.</em>
      </h2>
      <p>
        Four sculptural forms. Four mineral finishes. A small space to explore
        the way shape, light, and movement feel together.
      </p>
      <p>
        Drag to turn an object. Try a new material. Enable presence to let the
        sculpture respond to your movement. Camera frames are processed on your
        device and are never uploaded.
      </p>
      <div className="shortcut-list">
        <span>
          <kbd>1</kbd>–<kbd>4</kbd> Change form
        </span>
        <span>
          <kbd>Space</kbd> Play / pause
        </span>
        <span>
          <kbd>R</kbd> Reset view
        </span>
        <span>
          <kbd>Esc</kbd> Close
        </span>
      </div>
      <a
        href="https://github.com/islamrakibul9274/facet"
        target="_blank"
        rel="noopener noreferrer"
      >
        Made by Rakibul Islam Rumel <ArrowUpRight size={14} />
      </a>
    </dialog>
  );
}
