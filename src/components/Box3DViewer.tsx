import React, { useEffect, useRef, useState, useTransition } from 'react';
import * as THREE from 'three';
import { 
  RotateCw, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Box, 
  FileText, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Navigation
} from 'lucide-react';

export type Box3DState = 
  | 'CLOSED'          // Kotak box persegi panjang tertutup rapat
  | 'LID_OPEN'        // Tutup kotak terbuka, terlihat pelindung kertas panjang
  | 'PAPER_PEEK'      // Pelindung kertas panjang di sekitar kotak kecil seperti sabun
  | 'FINAL_UNWRAPPED' // Kertas terbuka penuh, kotak kecil terbuka memancarkan hadiah
  | 'CELEBRATING';

interface Box3DViewerProps {
  state: Box3DState;
  className?: string;
}

interface StepInfo {
  id: number;
  label: string;
  shortLabel: string;
  icon: typeof Box;
  description: string;
}

const STEPS: StepInfo[] = [
  {
    id: 1,
    label: '1. Kotak Persegi Panjang Tertutup',
    shortLabel: 'Kotak Luar',
    icon: Box,
    description: 'Kotak paket persegi panjang tertutup rapat dengan pita segel.',
  },
  {
    id: 2,
    label: '2. Buka Lapisan Luar (Tutup Terangkat)',
    shortLabel: 'Buka Tutup',
    icon: Layers,
    description: 'Tutup kotak terbuka, terlihat pelindung kertas panjang pelindung di dalam.',
  },
  {
    id: 3,
    label: '3. Pelindung Kertas Panjang & Kotak Sabun',
    shortLabel: 'Kertas & Sabun',
    icon: FileText,
    description: 'Pelindung kertas panjang membungkus kotak kecil seukuran sabun.',
  },
  {
    id: 4,
    label: '4. Kotak Sabun Terbuka & Hadiah Muncul',
    shortLabel: 'Buka Sabun',
    icon: Sparkles,
    description: 'Kertas terbuka penuh, kotak sabun terbuka memancarkan cahaya hadiah spesial.',
  },
];

export const Box3DViewer: React.FC<Box3DViewerProps> = ({ state, className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  // Active step override (allows user to scrub or preview steps independently, defaults to matching props)
  const [activeStepOverride, setActiveStepOverride] = useState<number | null>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showArrows, setShowArrows] = useState(true);

  // Map incoming props state to default step number (1..4)
  const defaultStepForState = (s: Box3DState): number => {
    switch (s) {
      case 'CLOSED':
        return 1;
      case 'LID_OPEN':
        return 2;
      case 'PAPER_PEEK':
        return 3;
      case 'FINAL_UNWRAPPED':
      case 'CELEBRATING':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = activeStepOverride ?? defaultStepForState(state);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);

  // Modular Model Meshes for physical actuation
  const outerBoxGroupRef = useRef<THREE.Group | null>(null);
  const outerLidRef = useRef<THREE.Group | null>(null);
  
  const paperWrapGroupRef = useRef<THREE.Group | null>(null);
  const paperLeftFlapRef = useRef<THREE.Mesh | null>(null);
  const paperRightFlapRef = useRef<THREE.Mesh | null>(null);
  
  const soapBoxGroupRef = useRef<THREE.Group | null>(null);
  const soapBoxLidRef = useRef<THREE.Group | null>(null);
  const giftItemRef = useRef<THREE.Group | null>(null);
  const prizeGlowRef = useRef<THREE.PointLight | null>(null);
  const sparkleParticlesRef = useRef<THREE.Points | null>(null);

  // STATIC CAMERA & ANGLE (NO AUTO ROTATION / TIDAK MUTER-MUTER)
  // Perfectly angled perspective looking down into the box so the interior is crystal clear
  const DEFAULT_PITCH = 0.58; // Tilts down into the box interior
  const DEFAULT_YAW = -0.35;   // Slight isometric 3/4 turn
  const isDraggingRef = useRef(false);
  const previousPointerPos = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: DEFAULT_PITCH, y: DEFAULT_YAW });
  const currentRotationRef = useRef({ x: DEFAULT_PITCH, y: DEFAULT_YAW });
  const targetCameraDistanceRef = useRef(6.0);
  const currentCameraDistanceRef = useRef(6.0);

  // Update target camera distance based on zoom level
  useEffect(() => {
    targetCameraDistanceRef.current = 6.0 / zoomLevel;
  }, [zoomLevel]);

  // Adjust camera focus angle cleanly per step (STATIC, NO SPINNING)
  useEffect(() => {
    if (currentStep === 1) {
      targetRotationRef.current = { x: 0.42, y: -0.42 };
    } else if (currentStep === 2) {
      targetRotationRef.current = { x: 0.58, y: -0.32 };
    } else if (currentStep === 3) {
      targetRotationRef.current = { x: 0.65, y: -0.22 };
    } else if (currentStep === 4) {
      targetRotationRef.current = { x: 0.52, y: 0.05 };
    }
  }, [currentStep]);

  // Reset override whenever outer state changes
  useEffect(() => {
    setActiveStepOverride(null);
  }, [state]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 280;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera: Angled to clearly see inside the hollow box
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 6.0);
    camera.lookAt(0, 0.1, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Bright, Clear Studio Lighting to illuminate the inside
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    // Main Key Light from front-top
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);

    // Interior Spot Fill Light directly illuminating inside the box
    const interiorFill = new THREE.DirectionalLight(0xfff7ed, 1.2);
    interiorFill.position.set(0, 6, 2);
    scene.add(interiorFill);

    // Cool rim light
    const rimLight = new THREE.DirectionalLight(0xe0e7ff, 0.8);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    // Ground Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(12, 12);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.85;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 5. Root Transform Group
    const rootGroup = new THREE.Group();
    rootGroup.position.set(0, 0, 0);
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // ==========================================
    // MATERIALS CONFIGURATION (HIGH CONTRAST & CRYSTAL CLEAR)
    // ==========================================
    // Outer parcel kraft box (warm clean cardboard)
    const kraftOuterMat = new THREE.MeshStandardMaterial({
      color: 0xecd9c4, // Warm clean kraft cardboard
      roughness: 0.65,
      metalness: 0.05,
    });

    const kraftInnerMat = new THREE.MeshStandardMaterial({
      color: 0xd9c5ad, // Interior cardboard
      roughness: 0.75,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });

    // Satin Amber Ribbon
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.35,
      metalness: 0.3,
    });

    // Gold Wax Stamp / Metallic Seal
    const goldSealMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.25,
      metalness: 0.85,
    });

    // Pelindung Kertas Panjang (Crisp Parchment White Wrapping with fold edges)
    const protectivePaperMat = new THREE.MeshStandardMaterial({
      color: 0xfaf5eb, // Bright clean ivory parchment paper
      roughness: 0.7,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });

    // Accordion Crinkle Bedding inside box
    const crinkleMat = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.9,
      metalness: 0.0,
    });

    // KOTAK KECIL SEPERTI SABUN (LUXURY SOAP BAR CARTON)
    // High contrast distinct color: Elegant Midnight Indigo & Gold so it POPs clearly!
    const soapBoxMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Crisp Royal Navy/Indigo - instantly recognizable from outer cardboard!
      roughness: 0.3,
      metalness: 0.25,
    });

    const soapLabelMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a, // Pale gold soap brand label band
      roughness: 0.35,
      metalness: 0.6,
    });

    const soapInnerMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Velvet interior
      roughness: 0.8,
      metalness: 0.05,
    });

    // ==========================================
    // 1. KOTAK PERSEGI PANJANG (OUTER BOX)
    // ==========================================
    const outerBoxGroup = new THREE.Group();
    rootGroup.add(outerBoxGroup);
    outerBoxGroupRef.current = outerBoxGroup;

    // Dimensions: Width = 3.6, Depth = 2.4, Height = 0.95 (Lower walls so inside is fully visible!)
    const boxW = 3.6;
    const boxD = 2.4;
    const boxH = 0.95;
    const wallThick = 0.07;

    // Bottom plate
    const bottomGeo = new THREE.BoxGeometry(boxW, wallThick, boxD);
    const bottomMesh = new THREE.Mesh(bottomGeo, kraftInnerMat);
    bottomMesh.position.y = -boxH / 2;
    bottomMesh.castShadow = true;
    bottomMesh.receiveShadow = true;
    outerBoxGroup.add(bottomMesh);

    // Front wall (Low profile so inside can be seen directly!)
    const frontWallGeo = new THREE.BoxGeometry(boxW, boxH * 0.75, wallThick);
    const frontWall = new THREE.Mesh(frontWallGeo, kraftOuterMat);
    frontWall.position.set(0, -boxH * 0.125, boxD / 2 - wallThick / 2);
    frontWall.castShadow = true;
    frontWall.receiveShadow = true;
    outerBoxGroup.add(frontWall);

    // Back wall
    const backWallGeo = new THREE.BoxGeometry(boxW, boxH, wallThick);
    const backWall = new THREE.Mesh(backWallGeo, kraftOuterMat);
    backWall.position.set(0, 0, -boxD / 2 + wallThick / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    outerBoxGroup.add(backWall);

    // Left wall
    const sideWallGeo = new THREE.BoxGeometry(wallThick, boxH, boxD - wallThick * 2);
    const leftWall = new THREE.Mesh(sideWallGeo, kraftOuterMat);
    leftWall.position.set(-boxW / 2 + wallThick / 2, 0, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    outerBoxGroup.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(sideWallGeo, kraftOuterMat);
    rightWall.position.set(boxW / 2 - wallThick / 2, 0, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    outerBoxGroup.add(rightWall);

    // Outer Ribbon Band around rectangular base
    const baseRibbon = new THREE.Mesh(
      new THREE.BoxGeometry(boxW + 0.02, boxH * 0.76, 0.42),
      ribbonMat
    );
    baseRibbon.position.set(0, -boxH * 0.125, 0);
    outerBoxGroup.add(baseRibbon);

    // OUTER BOX LID (Removable Top Lid with Bow)
    const outerLidGroup = new THREE.Group();
    outerLidGroup.position.set(0, boxH / 2 + 0.08, 0);
    outerBoxGroup.add(outerLidGroup);
    outerLidRef.current = outerLidGroup;

    // Lid Top Plate
    const lidTop = new THREE.Mesh(
      new THREE.BoxGeometry(boxW + 0.12, 0.1, boxD + 0.12),
      kraftOuterMat
    );
    lidTop.castShadow = true;
    outerLidGroup.add(lidTop);

    // Lid Skirt / Rim
    const lidRim = new THREE.Mesh(
      new THREE.BoxGeometry(boxW + 0.12, 0.22, boxD + 0.12),
      kraftOuterMat
    );
    lidRim.position.y = -0.11;
    lidRim.castShadow = true;
    outerLidGroup.add(lidRim);

    // Lid Cross Ribbon
    const lidRibbonX = new THREE.Mesh(
      new THREE.BoxGeometry(boxW + 0.14, 0.12, 0.44),
      ribbonMat
    );
    outerLidGroup.add(lidRibbonX);

    const lidRibbonZ = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.12, boxD + 0.14),
      ribbonMat
    );
    outerLidGroup.add(lidRibbonZ);

    // Lid Golden Seal Knot
    const bowKnot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.1, 24),
      goldSealMat
    );
    bowKnot.position.y = 0.1;
    outerLidGroup.add(bowKnot);

    // ==========================================
    // 2. PELINDUNG KERTAS YANG PANJANG (LONG PROTECTIVE PAPER SLEEVE)
    // ==========================================
    const paperGroup = new THREE.Group();
    paperGroup.position.set(0, -0.05, 0);
    outerBoxGroup.add(paperGroup);
    paperWrapGroupRef.current = paperGroup;

    // Crinkle paper shred bedding under the protective sleeve
    const crinkleBed = new THREE.Mesh(
      new THREE.BoxGeometry(boxW - 0.35, 0.2, boxD - 0.35),
      crinkleMat
    );
    crinkleBed.position.y = -0.25;
    paperGroup.add(crinkleBed);

    // Long Protective Paper Base Sheet
    const paperBase = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 1.8),
      protectivePaperMat
    );
    paperBase.rotation.x = -Math.PI / 2;
    paperBase.position.y = -0.12;
    paperBase.receiveShadow = true;
    paperGroup.add(paperBase);

    // LONG PAPER FLAPS ("Pelindung kertas yang panjang agar tidak hancur")
    // Left Flap
    const flapGeo = new THREE.PlaneGeometry(1.2, 1.4);
    const leftFlap = new THREE.Mesh(flapGeo, protectivePaperMat);
    leftFlap.position.set(-0.65, 0.26, 0);
    leftFlap.rotation.x = -Math.PI / 2;
    leftFlap.rotation.y = 0.12;
    leftFlap.castShadow = true;
    paperGroup.add(leftFlap);
    paperLeftFlapRef.current = leftFlap;

    // Right Flap
    const rightFlap = new THREE.Mesh(flapGeo, protectivePaperMat);
    rightFlap.position.set(0.65, 0.28, 0);
    rightFlap.rotation.x = -Math.PI / 2;
    rightFlap.rotation.y = -0.12;
    rightFlap.castShadow = true;
    paperGroup.add(rightFlap);
    paperRightFlapRef.current = rightFlap;

    // ==========================================
    // 3. KOTAK KECIL SEPERTI SABUN (INNER SOAP-SIZED BOX)
    // ==========================================
    // Proportions: classic rectangular soap bar carton: Width = 1.6, Depth = 1.05, Height = 0.58
    const soapW = 1.6;
    const soapD = 1.05;
    const soapH = 0.58;

    const soapBoxGroup = new THREE.Group();
    soapBoxGroup.position.set(0, 0.12, 0); // Elevated inside box for clear visibility!
    paperGroup.add(soapBoxGroup);
    soapBoxGroupRef.current = soapBoxGroup;

    // Soap Box Lower Shell (Royal Navy Carton)
    const soapBase = new THREE.Mesh(
      new THREE.BoxGeometry(soapW, soapH, soapD),
      soapBoxMat
    );
    soapBase.castShadow = true;
    soapBase.receiveShadow = true;
    soapBoxGroup.add(soapBase);

    // Luxury Gold Label Band wrapping around soap box
    const soapLabelBand = new THREE.Mesh(
      new THREE.BoxGeometry(soapW + 0.02, soapH * 0.55, soapD + 0.02),
      soapLabelMat
    );
    soapBase.add(soapLabelBand);

    // Interior Velvet Cushion inside Soap Box
    const velvet = new THREE.Mesh(
      new THREE.BoxGeometry(soapW - 0.1, 0.1, soapD - 0.1),
      soapInnerMat
    );
    velvet.position.y = 0.22;
    soapBoxGroup.add(velvet);

    // Soap Box Upper Lid
    const soapLidGroup = new THREE.Group();
    soapLidGroup.position.set(0, soapH / 2 + 0.05, 0);
    soapBoxGroup.add(soapLidGroup);
    soapBoxLidRef.current = soapLidGroup;

    const soapLidMesh = new THREE.Mesh(
      new THREE.BoxGeometry(soapW + 0.04, 0.12, soapD + 0.04),
      soapBoxMat
    );
    soapLidMesh.castShadow = true;
    soapLidGroup.add(soapLidMesh);

    // Gold Luxury Stamp on Soap Box Lid ("SABUN / SOAP EMBLEM")
    const soapSeal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.04, 32),
      goldSealMat
    );
    soapSeal.position.y = 0.07;
    soapLidGroup.add(soapSeal);

    // ==========================================
    // 4. PRIZE / SPECIAL SURPRISE GIFT INSIDE SOAP BOX
    // ==========================================
    const prizeGroup = new THREE.Group();
    prizeGroup.position.set(0, 0.35, 0);
    soapBoxGroup.add(prizeGroup);
    giftItemRef.current = prizeGroup;

    // Golden Gift Jewel / Birthday Token
    const prizeMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.24, 0),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.15,
        metalness: 0.9,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
      })
    );
    prizeMesh.castShadow = true;
    prizeGroup.add(prizeMesh);

    // Glowing Point Light inside the soap box
    const prizeLight = new THREE.PointLight(0xf59e0b, 0, 4);
    prizeLight.position.set(0, 0.3, 0);
    soapBoxGroup.add(prizeLight);
    prizeGlowRef.current = prizeLight;

    // Sparkle Particles Emitter
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 2.2;
      particlePos[i + 1] = Math.random() * 1.5 + 0.2;
      particlePos[i + 2] = (Math.random() - 0.5) * 2.2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const sparklePoints = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0xfbbf24,
        size: 0.07,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      })
    );
    prizeGroup.add(sparklePoints);
    sparkleParticlesRef.current = sparklePoints;

    // ==========================================
    // RENDER LOOP (STATIC, STABLE & DAMPED TWEENING - NO AUTO ROTATION!)
    // ==========================================
    let animFrameId: number;

    const renderLoop = () => {
      animFrameId = requestAnimationFrame(renderLoop);

      // Smooth rotation damping toward static target (NO SPINNING / TIDAK MUTER-MUTER)
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.12;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.12;

      // Smooth camera distance damping
      currentCameraDistanceRef.current += (targetCameraDistanceRef.current - currentCameraDistanceRef.current) * 0.12;
      camera.position.z = currentCameraDistanceRef.current;
      camera.position.y = currentCameraDistanceRef.current * 0.62;
      camera.lookAt(0, 0.15, 0);

      if (rootGroup) {
        rootGroup.rotation.x = currentRotationRef.current.x;
        rootGroup.rotation.y = currentRotationRef.current.y;
        // Keep completely stable, no oscillating bobbing so interior remains sharp and still
        rootGroup.position.y = 0;
      }

      // Gentle jewel spin when active
      if (giftItemRef.current && (currentStep === 4 || state === 'FINAL_UNWRAPPED')) {
        giftItemRef.current.rotation.y += 0.015;
      }

      // ----------------------------------------------------
      // PHYSICAL TWEENING BY STEP (CLEAR VISIBILITY OF INSIDE)
      // ----------------------------------------------------
      // Outer Lid Animation:
      if (outerLidRef.current) {
        if (isExploded) {
          outerLidRef.current.position.y += (2.2 - outerLidRef.current.position.y) * 0.09;
          outerLidRef.current.position.z += (0 - outerLidRef.current.position.z) * 0.09;
          outerLidRef.current.rotation.x += (0 - outerLidRef.current.rotation.x) * 0.09;
        } else if (currentStep === 1) {
          // Closed snug on top of box
          outerLidRef.current.position.y += (0.58 - outerLidRef.current.position.y) * 0.12;
          outerLidRef.current.position.z += (0 - outerLidRef.current.position.z) * 0.12;
          outerLidRef.current.rotation.x += (0 - outerLidRef.current.rotation.x) * 0.12;
        } else {
          // Outer lid opens high up & tilts back so the interior is 100% visible!
          outerLidRef.current.position.y += (2.5 - outerLidRef.current.position.y) * 0.09;
          outerLidRef.current.position.z += (-2.5 - outerLidRef.current.position.z) * 0.09;
          outerLidRef.current.rotation.x += (-0.75 - outerLidRef.current.rotation.x) * 0.09;
        }
      }

      // Protective Paper Flaps ("Pelindung kertas yang panjang agar tidak hancur")
      if (paperLeftFlapRef.current && paperRightFlapRef.current) {
        if (isExploded) {
          paperLeftFlapRef.current.position.x += (-1.35 - paperLeftFlapRef.current.position.x) * 0.09;
          paperLeftFlapRef.current.rotation.z += (-0.6 - paperLeftFlapRef.current.rotation.z) * 0.09;

          paperRightFlapRef.current.position.x += (1.35 - paperRightFlapRef.current.position.x) * 0.09;
          paperRightFlapRef.current.rotation.z += (0.6 - paperRightFlapRef.current.rotation.z) * 0.09;
        } else if (currentStep <= 2) {
          // Step 1 & 2: Wrapped snugly over soap box
          paperLeftFlapRef.current.position.x += (-0.65 - paperLeftFlapRef.current.position.x) * 0.1;
          paperLeftFlapRef.current.rotation.z += (0.05 - paperLeftFlapRef.current.rotation.z) * 0.1;

          paperRightFlapRef.current.position.x += (0.65 - paperRightFlapRef.current.position.x) * 0.1;
          paperRightFlapRef.current.rotation.z += (-0.05 - paperRightFlapRef.current.rotation.z) * 0.1;
        } else if (currentStep === 3) {
          // Step 3: Paper peeks open partially, clearly showing the rectangular navy soap box inside!
          paperLeftFlapRef.current.position.x += (-1.0 - paperLeftFlapRef.current.position.x) * 0.09;
          paperLeftFlapRef.current.rotation.z += (-0.4 - paperLeftFlapRef.current.rotation.z) * 0.09;

          paperRightFlapRef.current.position.x += (1.0 - paperRightFlapRef.current.position.x) * 0.09;
          paperRightFlapRef.current.rotation.z += (0.4 - paperRightFlapRef.current.rotation.z) * 0.09;
        } else {
          // Step 4: Fully unwrapped open to sides!
          paperLeftFlapRef.current.position.x += (-1.55 - paperLeftFlapRef.current.position.x) * 0.09;
          paperLeftFlapRef.current.rotation.z += (-0.85 - paperLeftFlapRef.current.rotation.z) * 0.09;

          paperRightFlapRef.current.position.x += (1.55 - paperRightFlapRef.current.position.x) * 0.09;
          paperRightFlapRef.current.rotation.z += (0.85 - paperRightFlapRef.current.rotation.z) * 0.09;
        }
      }

      // Soap Box Group & Lid
      if (soapBoxGroupRef.current && soapBoxLidRef.current && prizeGlowRef.current && sparkleParticlesRef.current) {
        if (isExploded) {
          soapBoxGroupRef.current.position.y += (1.25 - soapBoxGroupRef.current.position.y) * 0.09;
          soapBoxLidRef.current.position.y += (0.95 - soapBoxLidRef.current.position.y) * 0.09;
          soapBoxLidRef.current.rotation.x += (-0.7 - soapBoxLidRef.current.rotation.x) * 0.09;
        } else if (currentStep === 4) {
          // Inner soap box elevates for centerpiece presentation
          soapBoxGroupRef.current.position.y += (0.48 - soapBoxGroupRef.current.position.y) * 0.09;

          // Soap lid opens up
          soapBoxLidRef.current.position.y += (0.98 - soapBoxLidRef.current.position.y) * 0.09;
          soapBoxLidRef.current.position.z += (-0.4 - soapBoxLidRef.current.position.z) * 0.09;
          soapBoxLidRef.current.rotation.x += (-0.8 - soapBoxLidRef.current.rotation.x) * 0.09;

          // Prize Glow
          prizeGlowRef.current.intensity += (2.8 - prizeGlowRef.current.intensity) * 0.09;

          // Sparkle opacity
          sparkleParticlesRef.current.rotation.y += 0.02;
          (sparkleParticlesRef.current.material as THREE.PointsMaterial).opacity +=
            (0.95 - (sparkleParticlesRef.current.material as THREE.PointsMaterial).opacity) * 0.09;
        } else {
          // Soap box rests in protective bed (elevated for high visibility)
          soapBoxGroupRef.current.position.y += (0.12 - soapBoxGroupRef.current.position.y) * 0.12;
          soapBoxLidRef.current.position.y += (0.34 - soapBoxLidRef.current.position.y) * 0.12;
          soapBoxLidRef.current.position.z += (0 - soapBoxLidRef.current.position.z) * 0.12;
          soapBoxLidRef.current.rotation.x += (0 - soapBoxLidRef.current.rotation.x) * 0.12;

          prizeGlowRef.current.intensity += (0 - prizeGlowRef.current.intensity) * 0.12;
          (sparkleParticlesRef.current.material as THREE.PointsMaterial).opacity +=
            (0 - (sparkleParticlesRef.current.material as THREE.PointsMaterial).opacity) * 0.12;
        }
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 280;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [currentStep, isExploded]);

  // Touch & Pointer Drag Controls (User can inspect manually if they want, but does NOT rotate automatically)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousPointerPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousPointerPos.current.x;
    const deltaY = e.clientY - previousPointerPos.current.y;

    targetRotationRef.current.y += deltaX * 0.008;
    targetRotationRef.current.x = Math.max(
      0.15,
      Math.min(1.25, targetRotationRef.current.x + deltaY * 0.008)
    );

    previousPointerPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleResetAngle = () => {
    targetRotationRef.current = { x: DEFAULT_PITCH, y: DEFAULT_YAW };
    setZoomLevel(1);
    setIsExploded(false);
  };

  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(1.6, z + 0.15));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(0.75, z - 0.15));
  };

  const activeStepMeta = STEPS.find((s) => s.id === currentStep) ?? STEPS[0];

  return (
    <div
      className={`relative w-full rounded-[28px] bg-white border border-slate-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.04)] overflow-hidden select-none mb-6 ${className}`}
    >
      {/* Top Header: Step-by-Step Interactive Navigation Tabs */}
      <div className="border-b border-slate-100 bg-slate-50/90 backdrop-blur-md px-3 sm:px-4 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-800">
              3D MODEL & ILUSTRASI JELAS
            </span>
          </div>

          {/* Viewer Controls: Tanda Panah, Bongkar Lapisan, Zoom, Reset */}
          <div className="flex items-center gap-1.5">
            {/* Toggle Tanda Panah */}
            <button
              onClick={() => setShowArrows(!showArrows)}
              title="Tampilkan / Sembunyikan Tanda Panah Penunjuk"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                showArrows
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 border border-transparent'
              }`}
            >
              <Navigation className="w-3 h-3 text-amber-600 rotate-45" />
              <span>Panah {showArrows ? 'ON' : 'OFF'}</span>
            </button>

            {/* Bongkar Lapisan (Exploded View) */}
            <button
              onClick={() => setIsExploded(!isExploded)}
              title="Bongkar Lapisan 3D (Exploded View)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                isExploded
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200/60'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">Bongkar Lapisan</span>
            </button>

            <button
              onClick={handleZoomIn}
              title="Perbesar Tampilan"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleZoomOut}
              title="Perkecil Tampilan"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetAngle}
              title="Reset Sudut Pandang Posisi Awal"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Step Selector Buttons */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {STEPS.map((s) => {
            const isActive = s.id === currentStep;
            return (
              <button
                key={s.id}
                onClick={() => {
                  startTransition(() => {
                    setActiveStepOverride(s.id);
                  });
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 hover:text-slate-900'
                }`}
              >
                <s.icon className={`w-3 h-3 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="truncate text-[11px] sm:text-xs">{s.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D WebGL Canvas Container with Clear Pointer Overlay */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-[240px] sm:h-[280px] cursor-grab active:cursor-grabbing touch-none flex items-center justify-center relative bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40"
      >
        {/* ========================================================= */}
        {/* TANDA PANAH PENUNJUK JELAS & HIGH-CONTRAST CALLOUT LABELS */}
        {/* ========================================================= */}
        {showArrows && (
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-4">
            {/* Top Left Callout: Kotak Persegi Panjang Luar */}
            <div className="flex items-start gap-2 max-w-[210px] animate-fadeIn">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-amber-200/90 shadow-[0_4px_14px_rgba(217,119,6,0.12)] text-[11px] font-extrabold text-amber-950">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="truncate">1. Kotak Persegi Luar</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 rotate-45" />
              </div>
            </div>

            {/* Center Area Pointer: Pelindung Kertas Panjang */}
            <div className="self-end mr-1 sm:mr-3 -mt-3 flex items-center gap-2 max-w-[230px] animate-fadeIn">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-300 shadow-[0_4px_14px_rgba(0,0,0,0.06)] text-[11px] font-extrabold text-slate-800">
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 rotate-135" />
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="truncate">2. Pelindung Kertas Panjang</span>
              </div>
            </div>

            {/* Bottom Callout: Kotak Kecil Ukuran Sabun */}
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/95 backdrop-blur-md border border-blue-700 shadow-[0_4px_16px_rgba(30,58,138,0.25)] text-[11px] font-extrabold text-white animate-fadeIn">
                <ArrowRight className="w-3.5 h-3.5 text-amber-300 shrink-0 -rotate-45" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>3. Kotak Kecil Seperti Sabun (Di Dalam)</span>
              </div>

              <div className="font-mono text-[9px] font-semibold text-slate-400 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200">
                Posisi Diam (Tarik jika ingin memutar)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Guidance & Micro Description for the Selected Step */}
      <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/70 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold text-slate-900 shrink-0">
            {activeStepMeta.label}:
          </span>
          <span className="truncate text-slate-600">
            {activeStepMeta.description}
          </span>
        </div>

        {activeStepOverride !== null && (
          <button
            onClick={() => setActiveStepOverride(null)}
            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer ml-3 shrink-0 underline underline-offset-2"
          >
            Ikuti Tahap Saat Ini
          </button>
        )}
      </div>
    </div>
  );
};
