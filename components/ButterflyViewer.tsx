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

function cloneMaterials(root: THREE.Object3D) {
  root.traverse(child => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const cloned = mats.map(mat => mat ? (mat as THREE.MeshStandardMaterial).clone() : mat);
    mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
  });
}

function paintMesh(mesh: THREE.Mesh, hex: string) {
  const color = new THREE.Color(hex);
  const matt = isMattBlack(hex);
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

  mats.forEach(mat => {
    if (!mat) return;
    const m = mat as THREE.MeshStandardMaterial;
    m.color = color;
    m.metalness = matt ? 0.08 : 0.88;
    m.roughness = matt ? 0.82 : 0.18;
    m.envMapIntensity = matt ? 0.5 : 1.8;
    m.needsUpdate = true;
  });
}

function paintNamedMesh(root: THREE.Object3D, name: string, hex: string) {
  let found: THREE.Mesh | null = null;
  root.traverse(obj => {
    if (!found && obj.name === name && (obj as THREE.Mesh).isMesh) {
      found = obj as THREE.Mesh;
    }
  });
  if (found) paintMesh(found, hex);
}

function paintGroupExact(root: THREE.Object3D, groupName: string, hex: string) {
  let group: THREE.Object3D | null = null;
  root.traverse(obj => {
    if (!group && obj.name === groupName) group = obj;
  });

  if (!group) return;

  group.traverse(child => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) paintMesh(mesh, hex);
  });
}

function findExact(root: THREE.Object3D, name: string): THREE.Object3D | undefined {
  let found: THREE.Object3D | undefined;
  root.traverse(obj => {
    if (!found && obj.name === name) found = obj;
  });
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modelReady, setModelReady] = useState(0);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const cam = cameraRef.current;
      if (!cam) return;
      cam.zoom = Math.min(cam.zoom * 1.2, 5);
      cam.updateProjectionMatrix();
    },
    zoomOut: () => {
      const cam = cameraRef.current;
      if (!cam) return;
      cam.zoom = Math.max(cam.zoom / 1.2, 0.02);
      cam.updateProjectionMatrix();
    },
    resetView: () => {
      const cam = cameraRef.current;
      const ctrl = controlsRef.current;
      if (!cam || !ctrl) return;
      cam.zoom = 0.24;
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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    rendererRef.current = renderer;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f4e3cf');
    scene.fog = new THREE.Fog('#f4e3cf', 65, 110);
    sceneRef.current = scene;

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    pmrem.dispose();

    const aspect = w / h;
    const F = 60;
    const camera = new THREE.OrthographicCamera(
      -F * aspect / 2,
       F * aspect / 2,
       F / 2,
      -F / 2,
      -1000,
       1000
    );
    camera.position.set(0, 6, 52);
    camera.lookAt(0, 0, 0);
    camera.zoom = 0.24;
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    const sun = new THREE.DirectionalLight(0xffe2b8, 4.8);
    sun.position.set(18, 20, 16);
    scene.add(sun);

    const skyFill = new THREE.DirectionalLight(0xfff5ea, 1.9);
    skyFill.position.set(-14, 10, 12);
    scene.add(skyFill);

    const rim = new THREE.DirectionalLight(0xffc58a, 1.6);
    rim.position.set(-8, 2, -16);
    scene.add(rim);

    const hemi = new THREE.HemisphereLight(0xffefd6, 0xd7b18a, 1.4);
    scene.add(hemi);

    scene.add(new THREE.AmbientLight(0xffffff, 0.32));

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

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

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
        root.scale.setScalar(1.04);

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

    if (bladeShape === 'Sharp_Bladeglb') {
      paintGroupExact(root, 'Sharp_Bladeglb', bladeHex);
    }
    if (bladeShape === 'Knife_Bladeglb') {
      paintGroupExact(root, 'Knife_Bladeglb', bladeHex);
    }
    if (bladeShape === 'Moon_Bladeglb') {
      paintGroupExact(root, 'Moon_Bladeglb', bladeHex);
    }

    ['Bolt_1', 'Bolt_2', 'washer_1', 'washer_2', 'washer_3', 'washer_4', 'Bite_Handle']
      .forEach(name => paintNamedMesh(root, name, screwsHex));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelReady, handleStyle, bladeShape, handle1Hex, handle2Hex, bladeHex, screwsHex]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        background:
          'radial-gradient(circle at 50% 18%, rgba(255,244,220,0.95) 0%, rgba(248,220,180,0.85) 28%, rgba(237,188,132,0.48) 52%, rgba(255,255,255,0) 70%), linear-gradient(180deg, #fff2de 0%, #f7e5cf 38%, #f1dcc0 100%)'
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#d7b38e]/35 via-[#edc9a5]/10 to-transparent pointer-events-none" />
      <div ref={mountRef} className="w-full h-full relative z-[1]" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] z-[2]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-2 border-[#F9733E] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-[#7f5a34] tracking-wide">Loading preview…</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-[2]">
          <p className="text-sm text-[#8b6846]">Model unavailable</p>
        </div>
      )}
    </div>
  );
});
