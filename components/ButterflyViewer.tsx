'use client';

import { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface ButterflyViewerHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

interface Props {
  glbSrc: string;
  handleStyle: string;
  bladeShape: string;
  handle1Hex?: string;
  handle2Hex?: string;
  bladeHex?: string;
  screwsHex?: string;
  className?: string;
}

function isMattBlack(hex: string) {
  return hex.toLowerCase() === '#111111' || hex.toLowerCase() === '#111';
}

function hexToRgb(hex: string) {
  const safe = hex.replace('#', '');
  const normalized = safe.length === 3 ? safe.split('').map(c => c + c).join('') : safe;
  const num = parseInt(normalized || '111111', 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixHex(hexA: string, hexB: string, weight = 0.5) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const mix = (x: number, y: number) => Math.round(x * (1 - weight) + y * weight);
  return `rgb(${mix(a.r, b.r)}, ${mix(a.g, b.g)}, ${mix(a.b, b.b)})`;
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function cloneMaterials(root: THREE.Object3D) {
  root.traverse(child => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const cloned = mats.map(mat => (mat ? (mat as THREE.MeshStandardMaterial).clone() : mat));
    mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
  });
}

function tuneMaterial(mat: THREE.MeshStandardMaterial, hex: string) {
  const color = new THREE.Color(hex);
  const matt = isMattBlack(hex);
  mat.color = color;
  mat.metalness = matt ? 0.08 : 0.94;
  mat.roughness = matt ? 0.78 : 0.12;
  mat.envMapIntensity = matt ? 0.7 : 2.35;
  mat.needsUpdate = true;
}

function paintMesh(mesh: THREE.Mesh, hex: string) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mats.forEach(mat => mat && tuneMaterial(mat as THREE.MeshStandardMaterial, hex));
}

function paintNamedMesh(root: THREE.Object3D, name: string, hex: string) {
  let found: THREE.Mesh | null = null;
  root.traverse(obj => {
    if (!found && obj.name === name && (obj as THREE.Mesh).isMesh) found = obj as THREE.Mesh;
  });
  if (found) paintMesh(found, hex);
}

function paintGroupExact(root: THREE.Object3D, groupName: string, hex: string) {
  let found = false;
  root.traverse(obj => {
    if (found) return;
    if (obj.name === groupName) {
      found = true;
      obj.traverse(child => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh) paintMesh(mesh, hex);
      });
    }
  });
}

function findExact(root: THREE.Object3D, name: string): THREE.Object3D | undefined {
  let found: THREE.Object3D | undefined;
  root.traverse(obj => { if (!found && obj.name === name) found = obj; });
  return found;
}

export const ButterflyViewer = forwardRef<ButterflyViewerHandle, Props>(function ButterflyViewer(
  {
    glbSrc,
    handleStyle = 'honeycomb',
    bladeShape = 'Moon_Bladeglb',
    handle1Hex = '#111111',
    handle2Hex = '#111111',
    bladeHex = '#111111',
    screwsHex = '#111111',
    className = '',
  },
  ref
) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sceneReadyRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modelReady, setModelReady] = useState(0);
  const [sceneVersion, setSceneVersion] = useState(0);

  // Clean, subtle studio backdrop — tints very gently based on handle color
  const dominantA = handle1Hex || '#111111';
  const dominantB = bladeHex || '#c8c9cb';
  const softBlend = mixHex(dominantA, dominantB, 0.5);
  const coolBlend = mixHex(handle2Hex || '#111111', '#eef2f7', 0.85);
  const warmBlend = mixHex(bladeHex || '#c8c9cb', '#fff5e8', 0.7);

  const gradientStyle = useMemo(() => ({
    background: `
      radial-gradient(600px 300px at 30% 20%, ${rgba(coolBlend, 0.35)} 0%, rgba(255,255,255,0) 60%),
      radial-gradient(500px 280px at 75% 30%, ${rgba(warmBlend, 0.28)} 0%, rgba(255,255,255,0) 55%),
      linear-gradient(180deg, #fafafa 0%, #f5f5f7 50%, #f0f0f2 100%)
    `
  }), [coolBlend, warmBlend]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const cam = cameraRef.current;
      if (!cam) return;
      cam.zoom = Math.min(cam.zoom * 1.16, 5);
      cam.updateProjectionMatrix();
    },
    zoomOut: () => {
      const cam = cameraRef.current;
      if (!cam) return;
      cam.zoom = Math.max(cam.zoom / 1.16, 0.02);
      cam.updateProjectionMatrix();
    },
    resetView: () => {
      const cam = cameraRef.current;
      const ctrl = controlsRef.current;
      if (!cam || !ctrl) return;
      cam.zoom = 0.245;
      cam.updateProjectionMatrix();
      ctrl.reset();
    },
  }), []);

  // ── Init: professional 3-point studio lighting ────────────────────────
  // Key light from front-left-upper at ~40° — rakes across blade bevels
  // and handle texture to reveal geometry. Fill from right at low intensity
  // to soften shadows without flattening. Rim from behind to separate edges.
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth || 500;
    const h = el.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    pmrem.dispose();

    const aspect = w / h;
    const F = 60;
    const camera = new THREE.OrthographicCamera(-F * aspect / 2, F * aspect / 2, F / 2, -F / 2, -1000, 1000);
    camera.position.set(0, 5.8, 52);
    camera.lookAt(0, 0, 0);
    camera.zoom = 0.245;
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    // Key — warm white, strong, front-left-upper. This is the primary
    // light that rakes across the blade surface to show bevels and edges.
    const key = new THREE.DirectionalLight(0xfff4e8, 3.6);
    key.position.set(-16, 14, 18);
    scene.add(key);
    keyLightRef.current = key;

    // Fill — cool, soft, from front-right. Lifts shadows on the opposite
    // side without killing the directional contrast from the key.
    const fill = new THREE.DirectionalLight(0xe8edf5, 0.8);
    fill.position.set(14, 6, 10);
    scene.add(fill);
    fillLightRef.current = fill;

    // Rim — warm, from behind-upper. Creates a highlight along the top
    // edge of handles and blade spine, separating the object from the bg.
    const rim = new THREE.DirectionalLight(0xffe8d0, 1.2);
    rim.position.set(4, 10, -16);
    scene.add(rim);
    rimLightRef.current = rim;

    // Very low ambient — we want directional shadows, not flat even light.
    scene.add(new THREE.AmbientLight(0xffffff, 0.08));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.minZoom = 0.02;
    controls.maxZoom = 5;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    const ro = new ResizeObserver(() => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      const a = nw / nh;
      camera.left = -F * a / 2;
      camera.right = F * a / 2;
      camera.top = F / 2;
      camera.bottom = -F / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    ro.observe(el);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    sceneReadyRef.current = true;
    setSceneVersion(v => v + 1);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  // ── Reactive lighting: intensity & warmth adapt to material darkness ──
  // Positions stay stable (no disorienting shifts). Only brightness and
  // subtle warmth change so dark builds get slightly more light and warm
  // builds get slightly cooler fill for natural contrast.
  useEffect(() => {
    const key = keyLightRef.current;
    const fill = fillLightRef.current;
    const rim = rimLightRef.current;
    if (!key || !fill || !rim) return;

    const bladeLum = luminance(bladeHex);
    const h1Lum = luminance(handle1Hex);
    const h2Lum = luminance(handle2Hex);
    const avgLum = (bladeLum * 2 + h1Lum + h2Lum) / 4;

    // Darker materials need more light to show surface detail.
    // Brighter materials need less to avoid blowout.
    const darkness = 1 - avgLum;

    key.intensity = 3.2 + darkness * 1.0;
    fill.intensity = 0.6 + darkness * 0.4;
    rim.intensity = 1.0 + darkness * 0.4;

    // Subtle warmth shift: dark/matt builds get slightly warmer key
    // (like a studio softbox), bright/silk builds stay neutral-cool.
    const warmth = darkness * 0.04;
    key.color.setHSL(0.08 + warmth, 0.5, 0.85);
    fill.color.setHSL(0.58 - warmth * 0.3, 0.12, 0.88);
    rim.color.setHSL(0.06 + warmth, 0.4, 0.78);
  }, [handle1Hex, handle2Hex, bladeHex, screwsHex, sceneVersion]);

  // ── Load GLB ───────────────────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    setLoading(true);
    setError(false);

    if (modelRootRef.current) {
      scene.remove(modelRootRef.current);
      modelRootRef.current = null;
    }

    let cancelled = false;
    const loader = new GLTFLoader();

    loader.load(
      glbSrc,
      gltf => {
        if (cancelled) return;
        const root = gltf.scene;

        const box = new THREE.Box3().setFromObject(root);
        const center = new THREE.Vector3();
        box.getCenter(center);
        root.position.sub(center);

        root.rotation.y = -0.12;
        root.rotation.z = -0.02;
        root.scale.setScalar(1.05);

        cloneMaterials(root);

        scene.add(root);
        modelRootRef.current = root;
        setLoading(false);
        setModelReady(n => n + 1);
      },
      undefined,
      err => {
        if (!cancelled) {
          console.error('ButterflyViewer load error:', err);
          setError(true);
          setLoading(false);
        }
      }
    );

    return () => { cancelled = true; };
  }, [glbSrc]);

  // ── Apply visibility + colors ──────────────────────────────────────────
  useEffect(() => {
    const root = modelRootRef.current;
    if (!root) return;

    const arrowGroup = findExact(root, '2_Arrow_Pattern_Handles_+_Improvedglb');
    const honeycombGroup = findExact(root, '2_Honeycomb_Pattern_Handles_+_Improvedglb');

    if (arrowGroup) arrowGroup.visible = handleStyle === 'arrow';
    if (honeycombGroup) honeycombGroup.visible = handleStyle === 'honeycomb';

    const sharpBlade = findExact(root, 'Sharp_Bladeglb');
    const knifeBlade = findExact(root, 'Knife_Bladeglb');
    const moonBlade = findExact(root, 'Moon_Bladeglb');

    if (sharpBlade) sharpBlade.visible = bladeShape === 'Sharp_Bladeglb';
    if (knifeBlade) knifeBlade.visible = bladeShape === 'Knife_Bladeglb';
    if (moonBlade) moonBlade.visible = bladeShape === 'Moon_Bladeglb';

    if (handleStyle === 'arrow') {
      paintNamedMesh(root, 'Arrow_Left_Handle', handle1Hex);
      paintNamedMesh(root, 'Arrow_Right_Handle', handle2Hex);
    } else {
      paintNamedMesh(root, 'Honycomb_Left_Handle', handle1Hex);
      paintNamedMesh(root, 'Honycomb_Right_Handle', handle2Hex);
    }

    if (bladeShape === 'Sharp_Bladeglb') paintGroupExact(root, 'Sharp_Bladeglb', bladeHex);
    if (bladeShape === 'Knife_Bladeglb') paintGroupExact(root, 'Knife_Bladeglb', bladeHex);
    if (bladeShape === 'Moon_Bladeglb') paintGroupExact(root, 'Moon_Bladeglb', bladeHex);

    ['Bolt_1', 'Bolt_2', 'washer_1', 'washer_2', 'washer_3', 'washer_4', 'Bite_Handle']
      .forEach(name => paintNamedMesh(root, name, screwsHex));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelReady, handleStyle, bladeShape, handle1Hex, handle2Hex, bladeHex, screwsHex]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={gradientStyle}>
      <div ref={mountRef} className="w-full h-full relative z-[1]" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] z-[2]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#F9733E] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-neutral-400 tracking-wide">Loading preview…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-[2]">
          <p className="text-sm text-neutral-400">Model unavailable</p>
        </div>
      )}
    </div>
  );
});
