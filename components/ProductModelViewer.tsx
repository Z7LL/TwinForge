'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

let scriptPromise: Promise<void> | null = null;

function loadModelViewer(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  if (typeof window !== 'undefined' && window.customElements && window.customElements.get('model-viewer')) {
    scriptPromise = Promise.resolve();
    return scriptPromise;
  }
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-model-viewer]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load model-viewer')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.3.0/dist/model-viewer.min.js';
    script.async = true;
    script.setAttribute('data-model-viewer', '');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load model-viewer'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface ProductModelViewerProps {
  src: string;
  poster?: string;
  alt?: string;
  className?: string;
  cameraControls?: boolean;
  autoRotate?: boolean;
  autoRotateDelay?: number;
  interactionPrompt?: 'auto' | 'none' | 'when-focused' | 'basic';
  exposure?: number;
  shadowSoftness?: number;
  environmentImage?: string;
  toneMapping?: 'neutral' | 'ACESFilmic' | 'AgX' | 'Neutral' | 'agx' | 'neutral';
  rotationPerSecond?: string;
  fieldOfView?: string;
  minFieldOfView?: string;
  maxFieldOfView?: string;
  minCameraOrbit?: string;
  maxCameraOrbit?: string;
  cameraOrbit?: string;
  onReady?: () => void;
}

export function ProductModelViewer({
  src,
  poster,
  alt = '3D product render',
  className = '',
  cameraControls = true,
  autoRotate = true,
  autoRotateDelay = 3000,
  interactionPrompt = 'none',
  exposure = 1.0,
  shadowSoftness = 1.0,
  environmentImage,
  toneMapping = 'neutral',
  rotationPerSecond = '20deg',
  fieldOfView = '30deg',
  minFieldOfView = '18deg',
  maxFieldOfView = '60deg',
  minCameraOrbit = 'auto auto 40%',
  maxCameraOrbit = 'auto auto 100%',
  cameraOrbit,
  onReady,
}: ProductModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadModelViewer().then(() => {
      if (mounted) setLoaded(true);
    }).catch(() => { if (mounted) setFailed(true); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current) return;
    // Create the model-viewer element on the client only to avoid SSR mismatch
    const mv = document.createElement('model-viewer') as any;
    mv.setAttribute('src', src);
    if (poster) mv.setAttribute('poster', poster);
    mv.setAttribute('alt', alt);
    mv.setAttribute('camera-controls', cameraControls ? 'true' : 'false');
    mv.setAttribute('auto-rotate', autoRotate ? 'true' : 'false');
    mv.setAttribute('auto-rotate-delay', String(autoRotateDelay));
    mv.setAttribute('interaction-prompt', interactionPrompt);
    mv.setAttribute('exposure', String(exposure));
    mv.setAttribute('shadow-softness', String(shadowSoftness));
    mv.setAttribute('tone-mapping', toneMapping);
    mv.setAttribute('rotation-per-second', rotationPerSecond);
    mv.setAttribute('field-of-view', fieldOfView);
    mv.setAttribute('min-field-of-view', minFieldOfView);
    mv.setAttribute('max-field-of-view', maxFieldOfView);
    mv.setAttribute('min-camera-orbit', minCameraOrbit);
    mv.setAttribute('max-camera-orbit', maxCameraOrbit);
    if (cameraOrbit) mv.setAttribute('camera-orbit', cameraOrbit);
    if (environmentImage) mv.setAttribute('environment-image', environmentImage);
    mv.setAttribute('reveal', 'interaction');
    mv.style.width = '100%';
    mv.style.height = '100%';
    mv.style.background = 'transparent';
    mv.style.cursor = 'grab';
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(mv);
    modelRef.current = mv;

    const handleLoad = () => {
      mv.style.cursor = 'grab';
      onReady?.();
    };
    mv.addEventListener('load', handleLoad);
    return () => { mv.removeEventListener('load', handleLoad); };
  }, [
    loaded, src, poster, alt, cameraControls, autoRotate, autoRotateDelay,
    interactionPrompt, exposure, shadowSoftness, toneMapping, rotationPerSecond,
    fieldOfView, minFieldOfView, maxFieldOfView, minCameraOrbit, maxCameraOrbit,
    cameraOrbit, environmentImage, onReady,
  ]);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-muted/40 rounded-lg ${className}`}>
        <p className="text-sm text-muted-foreground">3D preview unavailable</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label={alt}
    >
      {!loaded && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#F9733E]/20 border-t-[#F9733E] rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Loading 3D model…</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function useModelCameraControls() {
  const modelRef = useRef<HTMLElement | null>(null);

  const setCameraOrbit = useCallback((orbit: string) => {
    const mv = modelRef.current as any;
    if (mv) mv.cameraOrbit = orbit;
  }, []);

  const resetView = useCallback(() => {
    const mv = modelRef.current as any;
    if (mv) {
      mv.cameraOrbit = '0deg 75deg 80%';
      mv.fieldOfView = '30deg';
    }
  }, []);

  const zoom = useCallback((delta: number) => {
    const mv = modelRef.current as any;
    if (mv) {
      const cur = parseFloat(mv.fieldOfView || '30deg');
      const next = Math.min(60, Math.max(18, cur + delta));
      mv.fieldOfView = `${next}deg`;
    }
  }, []);

  return { modelRef, setCameraOrbit, resetView, zoom };
}
