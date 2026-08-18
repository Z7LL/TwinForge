/* Atelier Flipbook: a scroll-pinned workbench window that reveals supplied frame art without compromising reduced-motion access. */
'use client';

import { useEffect, useRef, useState } from 'react';

type FrameManifest = string[] | { frames?: string[] };

export function ScrollingSequence({ fallbackSrc }: { fallbackSrc: string }) {
  const sequenceRef = useRef<HTMLElement>(null);
  const activeIndexRef = useRef(0);
  const [frames, setFrames] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch('/assets/website-scrolling-animation/frames.json')
      .then((response) => (response.ok ? response.json() : null))
      .then((manifest: FrameManifest | null) => {
        if (!alive || !manifest) return;
        const rawFrames = Array.isArray(manifest) ? manifest : manifest.frames || [];
        setFrames(rawFrames
          .filter((frame) => typeof frame === 'string' && frame.length > 0)
          .map((frame) => (frame.startsWith('/') ? frame : `/assets/website-scrolling-animation/${frame}`)));
      })
      .catch(() => undefined);
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let frameId = 0;
    const update = () => {
      frameId = 0;
      const section = sequenceRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const nextProgress = Math.max(0, Math.min(1, -rect.top / travel));
      setProgress(nextProgress);
      if (frames.length > 0) {
        const nextIndex = Math.min(frames.length - 1, Math.round(nextProgress * (frames.length - 1)));
        if (nextIndex !== activeIndexRef.current) {
          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);
        }
      }
    };
    const requestUpdate = () => { if (!frameId) frameId = window.requestAnimationFrame(update); };
    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [frames.length]);

  const source = frames[activeIndex] || fallbackSrc;
  const hasSequence = frames.length > 0;

  return (
    <section ref={sequenceRef} className="tf-sequence" aria-label="TwinForge build animation">
      <div className="tf-sequence__sticky">
        <div className="tf-sequence__frame">
          <img src={source} alt="TwinForge custom build in progress" className="tf-sequence__image" />
          <div className="tf-sequence__ink" aria-hidden="true" />
          <div className="tf-sequence__index" aria-hidden="true"><span>FRAME</span><strong>{String(hasSequence ? activeIndex + 1 : Math.round(progress * 48) + 1).padStart(2, '0')}</strong></div>
          <div className="tf-sequence__measure" aria-hidden="true"><span>0</span><i style={{ transform: `scaleX(${Math.max(0.02, progress)})` }} /><span>100</span></div>
        </div>
      </div>
    </section>
  );
}
