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

function hueAngle(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return h;
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
  let group: THREE.Object3D | null = null;
  root.traverse(obj => { if (!group && obj.name === groupName) group = obj; });
  if (!group) return;
  group.traverse(child => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) paintMesh(mesh, hex);
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
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const sceneReadyRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modelReady, setModelReady] = useState(0);
  const [sceneVersion, setSceneVersion] = useState(0);

  const dominantA = handle1Hex || '#111111';
  const dominantB = bladeHex || '#c8c9cb';
  const dominantC = screwsHex || '#c8c9cb';
  const softBlend = mixHex(dominantA, dominantB, 0.5);
  const warmBlend = mixHex(bladeHex || '#c8c9cb', '#ffd9b8', 0.45);
  const coolBlend = mixHex(handle2Hex || '#111111', '#eef2f7', 0.72);
  const baseBlend = mixHex(dominantA, dominantC, 0.82);

  const gradientStyle = useMemo(() => ({
    background: `
      radial-gradient(460px 220px at 10% 16%, ${rgba(coolBlend, 0.78)} 0%, ${rgba(coolBlend, 0.22)} 38%, rgba(255,255,255,0) 78%),
      radial-gradient(460px 220px at 90% 14%, ${rgba(warmBlend, 0.82)} 0%, ${rgba(warmBlend, 0.25)} 36%, rgba(255,255,255,0) 78%),
      radial-gradient(900px 420px at 50% 24%, ${rgba(softBlend, 0.28)} 0%, rgba(255,255,255,0.92) 24%, ${rgba(baseBlend, 0.18)} 52%, rgba(255,255,255,0) 82%),
      linear-gradient(180deg, #fbfbfc 0%, ${rgba(coolBlend, 0.16)} 30%, ${rgba(baseBlend, 0.18)} 66%, ${rgba(warmBlend, 0.22)} 100%)
    `
  }), [coolBlend, warmBlend, softBlend, baseBlend]);

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
    renderer.toneMappingExposure = 1.14;
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

    const key = new THREE.DirectionalLight(0xfff1de, 4.9);
    key.position.set(-22, 12, 20);
    scene.add(key);
    keyLightRef.current = key;

    const fill = new THREE.DirectionalLight(0xe8eef8, 1.2);
    fill.position.set(18, 9, 8);
    scene.add(fill);
    fillLightRef.current = fill;

    const rim = new THREE.DirectionalLight(0xf7c791, 1.35);
    rim.position.set(16, 4, -20);
    scene.add(rim);
    rimLightRef.current = rim;

    const hemi = new THREE.HemisphereLight(0xf8f7f5, 0xb99a7c, 0.95);
    scene.add(hemi);
    hemiLightRef.current = hemi;

    scene.add(new THREE.AmbientLight(0xffffff, 0.12));

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

  // Lighting now reacts continuously to the actual selected colors —
  // side (left/right), height, warmth, and intensity all shift with the spec.
  useEffect(() => {
    const key = keyLightRef.current;
    const fill = fillLightRef.current;
    const rim = rimLightRef.current;
    const hemi = hemiLightRef.current;
    if (!key || !fill || !rim || !hemi) return;

    const bladeLum = luminance(bladeHex);
    const h1Lum = luminance(handle1Hex);
    const h2Lum = luminance(handle2Hex);
    const avgLum = (bladeLum * 2 + h1Lum + h2Lum) / 4;

    const bladeHue = hueAngle(bladeHex);
    const handleHue = hueAngle(handle1Hex);

    // Side: derived from combined hue signal so left/right shifts as colors change
    const sideSignal = Math.sin((bladeHue + handleHue) * (Math.PI / 180));
    const side = sideSignal >= 0 ? 1 : -1;
    const sideStrength = 18 + Math.abs(sideSignal) * 8;

    key.position.set(side * sideStrength, 10 + avgLum * 6, 18 + (1 - avgLum) * 6);
    fill.position.set(-side * (sideStrength * 0.75), 9, 8);
    rim.position.set(-side * (sideStrength * 0.55), 4, -20);

    // Brightness/warmth respond to how light or dark the chosen colors are
    key.intensity = 4.2 + avgLum * 1.4;
    fill.intensity = 1.0 + (1 - avgLum) * 0.6;
    rim.intensity = 1.1 + avgLum * 0.5;

    const warmth = 1 - avgLum;
    key.color.setHSL(0.09 + warmth * 0.02, 0.55, 0.82);
    rim.color.setHSL(0.07 + warmth * 0.03, 0.6, 0.72);

    hemi.intensity = 0.85 + avgLum * 0.25;
  }, [handle1Hex, handle2Hex, bladeHex, screwsHex, sceneVersion]);

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
      <div className="absolute left-[4%] top-[6%] h-28 w-44 rounded-full bg-white/45 blur-3xl pointer-events-none" />
      <div className="absolute right-[5%] top-[7%] h-28 w-44 rounded-full bg-white/30 blur-3xl pointer-events-none" />
      <div className="absolute inset-x-[18%] bottom-[8%] h-16 rounded-full bg-black/8 blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/8 via-transparent to-transparent pointer-events-none" />
      <div ref={mountRef} className="w-full h-full relative z-[1]" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/12 backdrop-blur-[2px] z-[2]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-2 border-[#F9733E] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-[#6f5a49] tracking-wide">Loading preview…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-[2]">
          <p className="text-sm text-[#7c6552]">Model unavailable</p>
        </div>
      )}
    </div>
  );
});
