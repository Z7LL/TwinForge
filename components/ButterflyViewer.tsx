'use client';

import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
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

// Clone the material on every mesh so shared GLB materials become independent.
function cloneMaterials(root: THREE.Object3D) {
  root.traverse(child => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const cloned = mats.map(mat => {
      if (!mat) return mat;
      return (mat as THREE.MeshStandardMaterial).clone();
    });
    mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
  });
}

// Set color + finish properties on a single mesh's material(s)
function paintMesh(mesh: THREE.Mesh, hex: string) {
  const color = new THREE.Color(hex);
  const matt = isMattBlack(hex);
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mats.forEach(mat => {
    if (!mat) return;
    const m = mat as THREE.MeshStandardMaterial;
    m.color = color;
    m.metalness = matt ? 0.0 : 0.9;
    m.roughness = matt ? 0.85 : 0.15;
    m.envMapIntensity = matt ? 0.3 : 1.5;
    m.needsUpdate = true;
  });
}

// Find a node anywhere in the tree whose name EXACTLY matches, then paint it as a mesh.
// Falls back to case-insensitive exact match if strict match misses.
function paintNamedMesh(root: THREE.Object3D, name: string, hex: string) {
  let mesh: THREE.Mesh | null = null;
  // First pass: exact match
  root.traverse(obj => {
    if (!mesh && obj.name === name && (obj as THREE.Mesh).isMesh) {
      mesh = obj as THREE.Mesh;
    }
  });
  // Second pass: case-insensitive match
  if (!mesh) {
    const lower = name.toLowerCase();
    root.traverse(obj => {
      if (!mesh && obj.name.toLowerCase() === lower && (obj as THREE.Mesh).isMesh) {
        mesh = obj as THREE.Mesh;
      }
    });
  }
  if (mesh) paintMesh(mesh, hex);
}

// Find a group/node anywhere in the tree by substring (case-insensitive),
// then paint all meshes inside it.
function paintGroupBySubstring(root: THREE.Object3D, substring: string, hex: string) {
  const lower = substring.toLowerCase();
  let found: THREE.Object3D | null = null;
  root.traverse(obj => {
    if (!found && obj.name.toLowerCase().includes(lower)) {
      found = obj;
    }
  });
  if (!found) return;
  (found as THREE.Object3D).traverse(child => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) paintMesh(mesh, hex);
  });
}

// Find a node anywhere in the full tree by substring (case-insensitive).
// Returns the first match.
function findBySubstring(root: THREE.Object3D, substring: string): THREE.Object3D | undefined {
  const lower = substring.toLowerCase();
  let found: THREE.Object3D | undefined;
  root.traverse(obj => {
    if (!found && obj.name.toLowerCase().includes(lower)) {
      found = obj;
    }
  });
  return found;
}

// Dev helper — logs every node name once so you can verify exact names from your GLB
function debugNodeNames(root: THREE.Object3D) {
  if (process.env.NODE_ENV !== 'development') return;
  const names: string[] = [];
  root.traverse(obj => { if (obj.name) names.push(`[${obj.type}] ${obj.name}`); });
  console.log('[ButterflyViewer] node names:\n' + names.join('\n'));
}

export const ButterflyViewer = forwardRef<ButterflyViewerHandle, Props>(function ButterflyViewer(
  {
    glbSrc,
    handleStyle = 'honeycomb',
    bladeShape = 'trainer-blunt',
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modelReady, setModelReady] = useState(0);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const cam = cameraRef.current;
      if (!cam) return;
      cam.zoom = Math.min(cam.zoom * 1.25, 5);
      cam.updateProjectionMatrix();
    },
    zoomOut: () => {
      const cam = cameraRef.current;
      if (!cam) return;
      cam.zoom = Math.max(cam.zoom / 1.25, 0.02);
      cam.updateProjectionMatrix();
    },
    resetView: () => {
      const cam = cameraRef.current;
      const ctrl = controlsRef.current;
      if (!cam || !ctrl) return;
      cam.zoom = 0.21;
      ctrl.reset();
    },
  }), []);

  // ── Init renderer / scene / camera / controls ──────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth || 500;
    const h = el.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmrem.dispose();

    const aspect = w / h;
    const frustumSize = 60;
    const camera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,
       frustumSize * aspect / 2,
       frustumSize / 2,
      -frustumSize / 2,
      -1000,
       1000
    );
    camera.position.set(0, 5, 50);
    camera.lookAt(0, 0, 0);
    camera.zoom = 0.21;
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    const key = new THREE.DirectionalLight(0xfff5e8, 3.0);
    key.position.set(8, 12, 10);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xe8f0ff, 1.5);
    fill.position.set(-10, 6, 6);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 2.0);
    rim.position.set(0, -8, -12);
    scene.add(rim);

    const top = new THREE.DirectionalLight(0xffffff, 1.2);
    top.position.set(0, 15, 0);
    scene.add(top);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

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
      const f = frustumSize;
      camera.left   = -f * a / 2;
      camera.right  =  f * a / 2;
      camera.top    =  f / 2;
      camera.bottom = -f / 2;
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

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

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

        // Center model at origin
        const box = new THREE.Box3().setFromObject(root);
        const center = new THREE.Vector3();
        box.getCenter(center);
        root.position.sub(center);

        // Clone all materials so each mesh has its own independent material.
        // The GLB shares materials between left/right handles — without this,
        // painting one handle overwrites the other.
        cloneMaterials(root);

        // Log all node names in dev so you can verify exact names from the GLB.
        debugNodeNames(root);

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

    // ── Find handle groups anywhere in the full tree by substring ──
    // This is robust: works whether Blender exported them as top-level nodes
    // or nested, and regardless of whether '.glb' was appended to the name.
    const arrowGroup     = findBySubstring(root, 'Arrow Pattern');
    const honeycombGroup = findBySubstring(root, 'Honeycomb Pattern')
                        ?? findBySubstring(root, 'Honycomb Pattern')
                        ?? findBySubstring(root, 'Honeycomb');

    if (arrowGroup)     arrowGroup.visible     = handleStyle === 'arrow';
    if (honeycombGroup) honeycombGroup.visible  = handleStyle === 'honeycomb';

    // ── Find blade groups anywhere in the full tree by substring ──
    const sharpBlade = findBySubstring(root, 'Sharp Blade');
    const knifeBlade = findBySubstring(root, 'Knife Blade');
    const moonBlade  = findBySubstring(root, 'Moon Blade');

    if (sharpBlade) sharpBlade.visible = bladeShape === 'tanto';
    if (knifeBlade) knifeBlade.visible = bladeShape === 'clip';
    if (moonBlade)  moonBlade.visible  = bladeShape === 'straight' || bladeShape === 'trainer-blunt';

    // ── Color handles ──
    // Try both correct spelling and the typo variant from the GLB export.
    if (handleStyle === 'arrow') {
      // Try exact names first, then substring fallback
      paintNamedMesh(root, 'Arrow Left Handle',  handle1Hex);
      paintNamedMesh(root, 'Arrow Right Handle', handle2Hex);
    } else {
      // Honeycomb — try both spellings (GLB may have 'Honycomb' typo)
      paintNamedMesh(root, 'Honycomb Left Handle',  handle1Hex);
      paintNamedMesh(root, 'Honycomb Right Handle', handle2Hex);
      // Fallback with correct spelling in case GLB is fixed later
      paintNamedMesh(root, 'Honeycomb Left Handle',  handle1Hex);
      paintNamedMesh(root, 'Honeycomb Right Handle', handle2Hex);
    }

    // ── Color active blade ──
    // paintGroupBySubstring searches the full tree, so '.glb' suffix in node
    // names is no longer a problem.
    if (bladeShape === 'tanto')                                           paintGroupBySubstring(root, 'Sharp Blade', bladeHex);
    if (bladeShape === 'clip')                                            paintGroupBySubstring(root, 'Knife Blade', bladeHex);
    if (bladeShape === 'straight' || bladeShape === 'trainer-blunt')     paintGroupBySubstring(root, 'Moon Blade',  bladeHex);

    // ── Color bolts / washers / bite handle ──
    const hardwareNames = ['Bolt 1', 'Bolt 2', 'washer 1', 'washer 2', 'washer 3', 'washer 4', 'Bite Handle'];
    hardwareNames.forEach(name => paintNamedMesh(root, name, screwsHex));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelReady, handleStyle, bladeShape, handle1Hex, handle2Hex, bladeHex, screwsHex]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#F9733E] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-muted-foreground tracking-wide">Loading model…</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Model unavailable</p>
        </div>
      )}
    </div>
  );
});
