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

function hexToRgb(hex: string) {
  const safe = hex.replace('#', '');
  const n = safe.length === 3 ? safe.split('').map(c => c + c).join('') : safe;
  const num = parseInt(n || '111111', 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Lighten a hex toward white so the blob isn't too saturated */
function lighten(hex: string, amount = 0.55) {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `rgb(${lr},${lg},${lb})`;
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function isMattBlack(hex: string) {
  return luminance(hex) < 0.12;
}

function cloneMaterials(root: THREE.Object3D) {
  root.traverse(child => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const cloned = mats.map(m => (m ? (m as THREE.MeshStandardMaterial).clone() : m));
    mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
  });
}

function tuneMaterial(mat: THREE.MeshStandardMaterial, hex: string) {
  const matt = isMattBlack(hex);
  mat.color = new THREE.Color(hex);
  // Matte black: low metalness, high roughness — diffuse shading reveals relief.
  // Metallic/colored: high metalness, low roughness — specular glints trace edges.
  mat.metalness = matt ? 0.05 : 0.92;
  mat.roughness = matt ? 0.72 : 0.18;
  // envMap gives the reflective base; direct lights add the revealing highlights.
  mat.envMapIntensity = matt ? 0.5 : 1.6;
  mat.needsUpdate = true;
}

function paintMesh(mesh: THREE.Mesh, hex: string) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mats.forEach(m => m && tuneMaterial(m as THREE.MeshStandardMaterial, hex));
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
        if ((child as THREE.Mesh).isMesh) paintMesh(child as THREE.Mesh, hex);
      });
    }
  });
}

function findExact(root: THREE.Object3D, name: string) {
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

  // Individual light refs for reactive updates
  const keyRef = useRef<THREE.DirectionalLight | null>(null);
  const fillRef = useRef<THREE.DirectionalLight | null>(null);
  const rimRef = useRef<THREE.DirectionalLight | null>(null);
  const grazeRef = useRef<THREE.DirectionalLight | null>(null);
  const ambRef = useRef<THREE.AmbientLight | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modelReady, setModelReady] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);

  // ── Dynamic blurry gradient background ──────────────────────────────────
  // Each color blob maps to one of the user's selected colors, lightened so
  // the background stays soft. The blobs are placed at different positions
  // so the composition always has movement. CSS filter:blur on the blob layer
  // creates the soft bleed effect — the 3D canvas sits transparently on top.
  const blobStyle = useMemo(() => {
    const c1 = lighten(handle1Hex, 0.5);
    const c2 = lighten(handle2Hex, 0.45);
    const c3 = lighten(bladeHex, 0.48);
    const c4 = lighten(screwsHex, 0.52);
    return {
      background: `
        radial-gradient(ellipse 70% 55% at 18% 25%, ${rgba(handle1Hex, 0.72)} 0%, transparent 65%),
        radial-gradient(ellipse 65% 50% at 82% 18%, ${rgba(bladeHex, 0.68)} 0%, transparent 60%),
        radial-gradient(ellipse 60% 48% at 72% 78%, ${rgba(handle2Hex, 0.65)} 0%, transparent 58%),
        radial-gradient(ellipse 55% 45% at 22% 80%, ${rgba(screwsHex, 0.55)} 0%, transparent 55%),
        radial-gradient(ellipse 50% 40% at 50% 50%, ${rgba(bladeHex, 0.30)} 0%, transparent 50%),
        linear-gradient(135deg, ${c1} 0%, ${c3} 35%, ${c2} 65%, ${c4} 100%)
      `,
    };
  }, [handle1Hex, handle2Hex, bladeHex, screwsHex]);

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

  // ── Scene + lighting init ────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth || 500;
    const h = el.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Transparent canvas — CSS gradient background shows through
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    rendererRef.current = renderer;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Studio environment — moderate intensity so it doesn't drown directional lights
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const aspect = w / h;
    const F = 60;
    const camera = new THREE.OrthographicCamera(-F * aspect / 2, F * aspect / 2, F / 2, -F / 2, -1000, 1000);
    camera.position.set(0, 6, 52);
    camera.lookAt(0, 0, 0);
    camera.zoom = 0.245;
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    // ── 5-light setup for surface-detail revelation ────────────────────────
    //
    // KEY — front-left, elevated ~45°. Main illumination. Warm white.
    // Positioned so it hits the face of the blade at roughly 45° angle,
    // catching the bevel edge as a bright highlight.
    const key = new THREE.DirectionalLight(0xfff8f0, 4.2);
    key.position.set(-12, 18, 22);
    scene.add(key);
    keyRef.current = key;

    // FILL — soft, front-right, low elevation. Lifts shadow side without
    // killing contrast. Cool tint balances the warm key.
    const fill = new THREE.DirectionalLight(0xdde8ff, 1.1);
    fill.position.set(18, 4, 14);
    scene.add(fill);
    fillRef.current = fill;

    // GRAZE — almost horizontal, from the LEFT side at blade-level height.
    // This is the critical light for texture: it rakes across honeycomb/arrow
    // relief at a very shallow angle (~10–15°), casting tiny shadows into
    // every recess and making the pattern jump out visually.
    const graze = new THREE.DirectionalLight(0xffe0c8, 2.8);
    graze.position.set(-26, 2, 8);
    scene.add(graze);
    grazeRef.current = graze;

    // RIM — from behind-upper-right. Traces the spine of the blade and the
    // outer edge of handles with a bright highlight, separating the object
    // from the background and giving it a premium product-photo look.
    const rim = new THREE.DirectionalLight(0xfff0e0, 1.8);
    rim.position.set(8, 16, -20);
    scene.add(rim);
    rimRef.current = rim;

    // AMBIENT — kept very low so the directional contrast is preserved.
    // Too much ambient flattens everything and kills the texture illusion.
    const amb = new THREE.AmbientLight(0xffffff, 0.06);
    scene.add(amb);
    ambRef.current = amb;

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

    setSceneReady(true);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  // ── Reactive lighting: adapt intensity to material brightness ───────────
  // Dark / matte builds absorb light; we boost all sources so detail still
  // reads. Bright / metallic builds need less light to avoid blowout.
  useEffect(() => {
    if (!sceneReady) return;
    const key = keyRef.current;
    const fill = fillRef.current;
    const rim = rimRef.current;
    const graze = grazeRef.current;
    const amb = ambRef.current;
    if (!key || !fill || !rim || !graze || !amb) return;

    const lumBlade = luminance(bladeHex);
    const lumH1 = luminance(handle1Hex);
    const lumH2 = luminance(handle2Hex);
    // Blade surface gets double weight since it's the hero element
    const avgLum = (lumBlade * 2 + lumH1 + lumH2) / 4;
    const dark = 1 - avgLum; // 0 = bright, 1 = dark

    key.intensity = 3.8 + dark * 1.4;
    fill.intensity = 0.9 + dark * 0.5;
    rim.intensity = 1.6 + dark * 0.6;
    // Graze light is most critical for matte/dark builds where texture is hardest to see
    graze.intensity = 2.4 + dark * 1.8;
    amb.intensity = 0.04 + dark * 0.08;
  }, [handle1Hex, handle2Hex, bladeHex, screwsHex, sceneReady]);

  // ── Load GLB ─────────────────────────────────────────────────────────────
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
    new GLTFLoader().load(
      glbSrc,
      gltf => {
        if (cancelled) return;
        const root = gltf.scene;
        const box = new THREE.Box3().setFromObject(root);
        const center = new THREE.Vector3();
        box.getCenter(center);
        root.position.sub(center);
        // Slight angle so the blade bevel catches the key light as a highlight
        root.rotation.y = -0.15;
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

  // ── Apply visibility + colors ─────────────────────────────────────────────
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
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Blurry gradient layer — behind the transparent 3D canvas */}
      <div
        className="absolute inset-0 z-0"
        style={{ ...blobStyle, filter: 'blur(48px)', transform: 'scale(1.12)' }}
      />
      {/* Subtle white veil to prevent blobs from being too garish */}
      <div className="absolute inset-0 z-0 bg-white/30" />

      {/* 3D canvas — transparent background so CSS gradient shows through */}
      <div ref={mountRef} className="absolute inset-0 z-[1]" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px] z-[2]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-[#F9733E] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-neutral-500 tracking-wide">Loading…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-[2]">
          <p className="text-sm text-neutral-500">Model unavailable</p>
        </div>
      )}
    </div>
  );
});
