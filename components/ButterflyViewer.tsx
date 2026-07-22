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

function tuneMaterial(mat: THREE.MeshStandardMaterial, hex: string) {
  const color = new THREE.Color(hex);
  const matt = isMattBlack(hex);

  mat.color = color;
  mat.metalness = matt ? 0.08 : 0.94;
  mat.roughness = matt ? 0.78 : 0.12;
  mat.envMapIntensity = matt ? 0.65 : 2.25;
  mat.needsUpdate = true;
}

function paintMesh(mesh: THREE.Mesh, hex: string) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mats.forEach(mat => {
    if (!mat) return;
    tuneMaterial(mat as THREE.MeshStandardMaterial, hex);
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
    renderer.toneMappingExposure = 1.18;
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
    const camera = new THREE.OrthographicCamera(
      -F * aspect / 2,
      F * aspect / 2,
      F / 2,
      -F / 2,
      -1000,
      1000
    );
    camera.position.set(0, 5.8, 52);
    camera.lookAt(0, 0, 0);
    camera.zoom = 0.245;
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    const key = new THREE.DirectionalLight(0xffedd6, 4.8);
    key.position.set(16, 22, 18);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xeef4ff, 1.35);
    fill.position.set(-18, 8, 10);
    scene.add(fill);

    const topAccentLeft = new THREE.PointLight(0xfff4e8, 0.9, 80, 2);
    topAccentLeft.position.set(-22, 22, 16);
    scene.add(topAccentLeft);

    const topAccentRight = new THREE.PointLight(0xffe2bf, 1.1, 80, 2);
    topAccentRight.position.set(22, 20, 14);
    scene.add(topAccentRight);

    const rim = new THREE.DirectionalLight(0xf4c48c, 1.25);
    rim.position.set(-8, 4, -18);
    scene.add(rim);

    const hemi = new THREE.HemisphereLight(0xfaf6ef, 0xb99472, 1.0);
    scene.add(hemi);

    scene.add(new THREE.AmbientLight(0xffffff, 0.14));

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

    return () => {
      cancelled = true;
    };
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
        background: `
          radial-gradient(420px 180px at 12% 8%, rgba(255,255,255,0.85) 0%, rgba(255,248,240,0.42) 38%, rgba(255,248,240,0) 76%),
          radial-gradient(420px 180px at 88% 10%, rgba(255,234,210,0.82) 0%, rgba(255,228,202,0.38) 36%, rgba(255,228,202,0) 76%),
          radial-gradient(860px 360px at 50% 18%, rgba(255,255,255,0.92) 0%, rgba(242,242,244,0.88) 22%, rgba(221,224,229,0.68) 46%, rgba(214,208,202,0.22) 66%, rgba(214,208,202,0) 82%),
          linear-gradient(180deg, #fbfbfc 0%, #eeeff2 34%, #dddfe4 62%, #cfc8c1 100%)
        `
      }}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.06)_34%,rgba(255,255,255,0)_68%)]" />
      <div className="absolute left-[6%] top-[3%] h-24 w-40 rounded-full bg-white/45 blur-3xl pointer-events-none" />
      <div className="absolute right-[6%] top-[4%] h-24 w-40 rounded-full bg-[#ffd9b8]/35 blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#9f8a76]/16 via-[#c8b6a5]/10 to-transparent pointer-events-none" />
      <div className="absolute inset-x-[18%] bottom-[8%] h-16 rounded-full bg-black/8 blur-3xl pointer-events-none" />
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
