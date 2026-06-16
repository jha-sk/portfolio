'use client';

/**
 * SystemScene — React Three Fiber port of the approved vanilla-Three.js prototype.
 *
 * Scene elements (dark void #020202 with vivid data-center objects):
 *   • Server-room GridHelper floor
 *   • 4 corner solid metallic racks with multi-colour status LEDs
 *   • Central glowing core (icosahedron — the identity) — bright ice-blue emissive
 *   • Orbiting service nodes (octahedrons) — solid cyan, lit, emissive
 *   • Postgres database cylinder — solid teal, lit, bright rings
 *   • drei <Line> edges + traveling bright packet spheres
 *   • Ambient particle cloud
 *   • Radar scan ring
 *   • Bloom (EffectComposer / @react-three/postprocessing) — tuned threshold 0.2
 *   • Ambient + point lights for proper meshStandardMaterial shading
 *   • OrbitControls (auto-rotate + damping + zoom clamps)
 *   • Intro camera fly-in (~2.5 s lerp)
 *   • Hover-to-inspect node highlight
 *   • Click-to-navigate: onSelect prop + camera fly-to on active change
 *
 * Token contract: raw hex only for Three.js color values (Three doesn't parse CSS vars).
 * DOM overlay (node labels via drei <Html>) uses CSS vars where possible.
 */

import { useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/* ── Palette constants ────────────────────────────────────────────────────── */
const ICE      = '#B2D5E5';
const ICE_HEX  = 0xb2d5e5;
const VOID     = '#020202';

// Vivid data-center colours
const CYAN_BRIGHT  = '#bfe6f5';   // core primary
const CYAN_EMIS    = '#7fd4ee';   // core emissive
const NODE_COLOR   = '#5fd0e6';   // service node solid
const NODE_EMIS    = '#2aa7c8';   // service node emissive
const DB_COLOR     = '#1aa7c0';   // database cylinder
const DB_EMIS      = '#0e6e80';   // database emissive
const DB_RING      = '#3dd6e8';   // database ring accent
const PACKET_COLOR = '#dffaff';   // traveling packets
const EDGE_ICE     = '#9fd8ea';   // edge line colour

// Server rack LED colours (status lights: green, amber, ice)
const LED_GREEN = '#46d17f';
const LED_AMBER = '#e8b34a';
const LED_ICE   = '#9fdcea';

/* ── Service-node configuration ─────────────────────────────────────────── */
const NODES_CONFIG = [
  { name: 'client',       position: [-12, 1.2,  7 ], hot: 'edge / entrypoint' },
  { name: 'gateway',      position: [ -6, 1.6,  4 ], hot: 'api gateway' },
  { name: 'api · Go',     position: [  6, 2.7, -2 ], hot: 'service: REST / gRPC' },
  { name: 'cloud · k8s',  position: [  5, 2.4,  4 ], hot: 'AWS · Kubernetes · Terraform' },
  { name: 'worker · tf',  position: [ -5.5, 2.1, -4], hot: 'jobs / automation / terraform' },
  { name: 'cache',        position: [ -3, 1.6,  6 ], hot: 'in-memory cache' },
];

/* ── Rack positions ──────────────────────────────────────────────────────── */
const RACK_CONFIGS = [
  { position: [-11, 0, -11], name: 'rack-01' },
  { position: [ 11, 0, -11], name: 'rack-02' },
  { position: [-11, 0,  11], name: 'rack-03' },
  { position: [ 11, 0,  11], name: 'rack-04' },
];

/* ── Rack positions as Vector3 for edge connections ─────────────────────── */
const RACK_POSITIONS = RACK_CONFIGS.map(r => new THREE.Vector3(...r.position).setY(2.2));

/* ── LED colour palette per unit (cycles) ───────────────────────────────── */
const LED_PALETTE = [LED_GREEN, LED_GREEN, LED_AMBER, LED_ICE, LED_GREEN, LED_AMBER];

/* ── Camera focus points per section ────────────────────────────────────── */
// overview: target=[0,1.8,0], camera pulls back
// about→core; skills→avg service-node cluster; projects→rack cluster; experience→db
const NP = NODES_CONFIG.map(n => n.position);

const SKILL_NODE_CLUSTER_CENTER = NP.slice(1, 6).reduce(
  (acc, p) => [acc[0] + p[0] / 5, acc[1] + p[1] / 5, acc[2] + p[2] / 5],
  [0, 0, 0]
);

const RACK_CLUSTER_CENTER = RACK_CONFIGS.reduce(
  (acc, r) => [acc[0] + r.position[0] / 4, acc[1] + r.position[1] / 4 + 1.8, acc[2] + r.position[2] / 4],
  [0, 0, 0]
);

const FOCUS_TARGETS = {
  about:      { target: [0, 1.8, 0],               camOffset: [0, 3, 8]    },
  skills:     { target: SKILL_NODE_CLUSTER_CENTER,  camOffset: [0, 5, 12]   },
  projects:   { target: RACK_CLUSTER_CENTER,        camOffset: [0, 6, 14]   },
  experience: { target: [0, 1.3, -7.5],             camOffset: [0, 4, 2]    },
  contact:    { target: [0, 1.8, 0],               camOffset: [0, 3, 8]    },
  // null / overview
  overview:   { target: [0, 1.8, 0],               camOffset: [0, 7, 17]   },
};

/* ── Particles ───────────────────────────────────────────────────────────── */
function Particles() {
  const ref = useRef();
  const count = 320;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 60;
      arr[i * 3 + 1] = Math.random() * 22;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.012;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={ICE_HEX} size={0.07} transparent opacity={0.55} />
    </points>
  );
}

/* ── RadarRing ───────────────────────────────────────────────────────────── */
function RadarRing() {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const rs = (t % 3) / 3;
    if (ref.current) {
      ref.current.scale.setScalar(1 + rs * 6);
      ref.current.material.opacity = 0.55 * (1 - rs);
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
      <ringGeometry args={[1.2, 1.32, 64]} />
      <meshBasicMaterial color={ICE_HEX} transparent opacity={0.55} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Core (identity icosahedron) ─────────────────────────────────────────── */
function Core({ onSelect }) {
  const coreRef = useRef();
  const glowRef = useRef();
  const shellRef = useRef();
  const [hovered, setHovered] = useState(false);

  const handleOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handleOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'grab';
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect?.('about');
  }, [onSelect]);

  useFrame((state, dt) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += dt * 0.3;
      coreRef.current.rotation.x += dt * 0.1;
    }
    if (shellRef.current) {
      shellRef.current.rotation.y -= dt * 0.15;
    }
    if (glowRef.current) {
      const t = state.clock.elapsedTime;
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.06);
    }
  });

  return (
    <group position={[0, 1.8, 0]}>
      {/* solid emissive core — bright focal point */}
      <mesh
        ref={coreRef}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial
          color={CYAN_BRIGHT}
          emissive={CYAN_EMIS}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          roughness={0.4}
          metalness={0.25}
        />
      </mesh>
      {/* outer wireframe shell */}
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.7, 1]} />
        <meshBasicMaterial color={ICE_HEX} wireframe transparent opacity={0.22} />
      </mesh>
      {/* bloom glow volume */}
      <mesh ref={glowRef}>
        <icosahedronGeometry args={[2.1, 1]} />
        <meshBasicMaterial color={CYAN_EMIS} transparent opacity={0.015} />
      </mesh>
      {/* tracked label */}
      <Html position={[0, 1.6, 0]} center distanceFactor={18} zIndexRange={[10, 0]}>
        <span className={`node-label${hovered ? ' node-label--hot' : ''}`}>core</span>
      </Html>
    </group>
  );
}

/* ── ServiceNode ─────────────────────────────────────────────────────────── */
function ServiceNode({ config, index, onSelect }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  const handleOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handleOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'grab';
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect?.('skills');
  }, [onSelect]);

  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.6;
    const t = state.clock.elapsedTime;
    const targetScale = (hovered ? 1.5 : 1) + Math.sin(t * 2 + index) * 0.07;
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
  });

  return (
    <group position={config.position}>
      <mesh
        ref={ref}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial
          color={NODE_COLOR}
          emissive={NODE_EMIS}
          emissiveIntensity={hovered ? 1.4 : 0.8}
          roughness={0.3}
          metalness={0.15}
        />
      </mesh>
      <Html position={[0, 0.9, 0]} center distanceFactor={18} zIndexRange={[10, 0]}>
        <span className={`node-label${hovered ? ' node-label--hot' : ' node-label--dim'}`}>
          {config.name}
        </span>
      </Html>
    </group>
  );
}

/* ── Rack ────────────────────────────────────────────────────────────────── */
function Rack({ config, onSelect }) {
  const [x, , z] = config.position;
  const rotY = Math.atan2(-x, -z);
  const [hovered, setHovered] = useState(false);

  const handleOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handleOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'grab';
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect?.('projects');
  }, [onSelect]);

  return (
    <group
      position={config.position}
      rotation={[0, rotY, 0]}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={handleClick}
    >
      {/* solid metallic cabinet body */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[2.4, 3.6, 1.4]} />
        <meshStandardMaterial
          color={hovered ? '#132530' : '#0d1b22'}
          metalness={0.6}
          roughness={0.4}
          emissive={hovered ? '#1a3040' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      {/* subtle ice-blue edge outline */}
      <lineSegments position={[0, 1.8, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(2.4, 3.6, 1.4)]} />
        <lineBasicMaterial color={EDGE_ICE} transparent opacity={hovered ? 0.75 : 0.45} />
      </lineSegments>
      {/* status LED unit strips */}
      {Array.from({ length: 6 }, (_, i) => {
        const ledColor = LED_PALETTE[i % LED_PALETTE.length];
        return (
          <group key={i} position={[0, 0.55 + i * 0.5, 0.71]}>
            {/* dark panel */}
            <mesh>
              <planeGeometry args={[1.8, 0.18]} />
              <meshStandardMaterial color="#091318" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* glowing LED indicator */}
            <mesh position={[0.72, 0, 0.001]}>
              <planeGeometry args={[0.09, 0.09]} />
              <meshBasicMaterial color={ledColor} />
            </mesh>
            <mesh position={[0.72, 0, 0.001]}>
              <planeGeometry args={[0.16, 0.16]} />
              <meshBasicMaterial color={ledColor} transparent opacity={0.18} />
            </mesh>
          </group>
        );
      })}
      {/* label above rack */}
      <Html position={[0, 3.9, 0]} center distanceFactor={22} zIndexRange={[5, 0]}>
        <span className={`node-label${hovered ? ' node-label--hot' : ' node-label--dim'}`}>{config.name}</span>
      </Html>
    </group>
  );
}

/* ── Database cylinder ───────────────────────────────────────────────────── */
function Database({ onSelect }) {
  const bodyRef = useRef();
  const [hovered, setHovered] = useState(false);

  const handleOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handleOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'grab';
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect?.('experience');
  }, [onSelect]);

  useFrame((_, dt) => {
    if (bodyRef.current) bodyRef.current.rotation.y += dt * 0.25;
  });

  return (
    <group
      position={[0, 0, -7.5]}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={handleClick}
    >
      {/* solid cylinder body */}
      <mesh ref={bodyRef} position={[0, 1.3, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 1.8, 28, 1, false]} />
        <meshStandardMaterial
          color={DB_COLOR}
          emissive={DB_EMIS}
          emissiveIntensity={hovered ? 1.6 : 0.9}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      {/* bright ring bands */}
      {[0.45, 1.3, 2.15].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.12, 0.05, 8, 36]} />
          <meshBasicMaterial color={DB_RING} />
        </mesh>
      ))}
      {/* label */}
      <Html position={[0, 3.1, 0]} center distanceFactor={18} zIndexRange={[10, 0]}>
        <span className={`node-label${hovered ? ' node-label--hot' : ' node-label--dim'}`}>postgres</span>
      </Html>
    </group>
  );
}

/* ── Edge (drei <Line>) + Packet ─────────────────────────────────────────── */
function Edge({ start, end, bright = false }) {
  const startArr = Array.isArray(start) ? start : [start.x, start.y, start.z];
  const endArr   = Array.isArray(end)   ? end   : [end.x,   end.y,   end.z];
  const points   = [startArr, endArr];

  return (
    <Line
      points={points}
      color={EDGE_ICE}
      lineWidth={1}
      transparent
      opacity={bright ? 0.6 : 0.35}
    />
  );
}

function Packet({ start, end, speed, bright = false }) {
  const ref  = useRef();
  const tRef = useRef(Math.random());
  const a = useMemo(
    () => new THREE.Vector3(...(Array.isArray(start) ? start : [start.x, start.y, start.z])),
    [start]
  );
  const b = useMemo(
    () => new THREE.Vector3(...(Array.isArray(end) ? end : [end.x, end.y, end.z])),
    [end]
  );

  useFrame((_, dt) => {
    tRef.current += dt * speed;
    if (tRef.current > 1) tRef.current -= 1;
    if (ref.current) ref.current.position.lerpVectors(a, b, tRef.current);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[bright ? 0.15 : 0.1, 8, 8]} />
      <meshBasicMaterial color={PACKET_COLOR} />
    </mesh>
  );
}

/* ── Edges + Packets scene layer ─────────────────────────────────────────── */
const CORE_POS = [0, 1.8, 0];
const DB_POS   = [0, 1.3, -7.5];

const NP_EDGES = NODES_CONFIG.map(n => n.position);

const EDGE_DEFS = [
  // request spine (bright)
  { start: NP_EDGES[0], end: NP_EDGES[1],      bright: true,  packet: true },
  { start: NP_EDGES[1], end: CORE_POS,   bright: true,  packet: true },
  // core → services
  { start: CORE_POS, end: NP_EDGES[2],   bright: false, packet: true },
  { start: CORE_POS, end: NP_EDGES[3],   bright: false, packet: true },
  { start: CORE_POS, end: NP_EDGES[4],   bright: false, packet: true },
  { start: CORE_POS, end: NP_EDGES[5],   bright: false, packet: true },
  // services → db
  { start: NP_EDGES[2], end: DB_POS,     bright: false, packet: true },
  { start: NP_EDGES[4], end: DB_POS,     bright: false, packet: true },
  { start: CORE_POS, end: DB_POS,  bright: true,  packet: true },
];

// services → nearest rack (alternating)
const RACK_EDGES = [2, 3, 4, 5].map((ni, k) => ({
  start: NP_EDGES[ni],
  end: RACK_POSITIONS[k % RACK_POSITIONS.length],
  bright: false,
  packet: k % 2 === 0,
}));

const ALL_EDGES = [...EDGE_DEFS, ...RACK_EDGES];

function EdgesAndPackets() {
  return (
    <>
      {ALL_EDGES.map((e, i) => (
        <Edge key={`e-${i}`} start={e.start} end={e.end} bright={e.bright} />
      ))}
      {ALL_EDGES.filter(e => e.packet).map((e, i) => (
        <Packet
          key={`p-${i}`}
          start={e.start}
          end={e.end}
          bright={e.bright}
          speed={(e.bright ? 0.3 : 0.18) + Math.random() * 0.2}
        />
      ))}
    </>
  );
}

/* ── Intro camera fly-in ─────────────────────────────────────────────────── */
function CameraRig() {
  const introRef = useRef(1);
  const { camera } = useThree();

  useFrame((_, dt) => {
    if (introRef.current > 0) {
      introRef.current = Math.max(0, introRef.current - dt * 0.4);
      camera.position.y = 7 + introRef.current * 9;
      camera.position.z = 17 + introRef.current * 9;
    }
  });

  return null;
}

/* ── Camera fly-to on active section ────────────────────────────────────── */
const _tmpTarget = new THREE.Vector3();
const _tmpCamPos = new THREE.Vector3();

function CameraFlyTo({ active, controlsRef }) {
  const { camera } = useThree();

  useFrame((_, dt) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const key = active ?? 'overview';
    const focus = FOCUS_TARGETS[key] ?? FOCUS_TARGETS.overview;

    // Build desired target and camera position
    _tmpTarget.set(...focus.target);
    const [ox, oy, oz] = focus.camOffset;
    _tmpCamPos.set(
      focus.target[0] + ox,
      focus.target[1] + oy,
      focus.target[2] + oz
    );

    const speed = dt * 2.2;

    // Lerp controls target
    controls.target.lerp(_tmpTarget, speed);

    // Lerp camera position only when a section is active (give user freedom when overview)
    if (active) {
      camera.position.lerp(_tmpCamPos, speed);
    }

    controls.update();

    // Disable autoRotate while a panel is open
    controls.autoRotate = !active;
  });

  return null;
}

/* ── Reflective floor plane ──────────────────────────────────────────────── */
function ReflectiveFloor() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <MeshReflectorMaterial
        resolution={1024}
        blur={[400, 120]}
        mixBlur={1}
        mixStrength={1.2}
        depthScale={1.1}
        minDepthThreshold={0.4}
        color="#040608"
        metalness={0.6}
        roughness={0.9}
      />
    </mesh>
  );
}

/* ── Grid floor with visible opacity ─────────────────────────────────────── */
function GridFloor() {
  const ref = useRef();

  return (
    <gridHelper
      ref={ref}
      args={[56, 56, ICE_HEX, ICE_HEX]}
      position={[0, 0.02, 0]}
      onUpdate={(self) => {
        // Both materials in GridHelper: set transparent + opacity
        if (self.material) {
          const mats = Array.isArray(self.material) ? self.material : [self.material];
          mats.forEach(m => {
            m.transparent = true;
            m.opacity = 0.18;
          });
        }
      }}
    />
  );
}

/* ── Full scene graph ────────────────────────────────────────────────────── */
function SceneGraph({ onSelect, active }) {
  const controlsRef = useRef();

  return (
    <>
      <fog attach="fog" args={[VOID, 60, 240]} />

      {/* lights — essential for meshStandardMaterial surfaces */}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 12, 8]}  intensity={120} distance={80} color="#bfe3f2" />
      <pointLight position={[8, 6, -10]} intensity={60}  distance={60} color="#a0cfe4" />

      <ReflectiveFloor />
      <GridFloor />
      <Particles />
      <RadarRing />
      <Core onSelect={onSelect} />

      {NODES_CONFIG.map((cfg, i) => (
        <ServiceNode key={cfg.name} config={cfg} index={i} onSelect={onSelect} />
      ))}

      {RACK_CONFIGS.map(cfg => (
        <Rack key={cfg.name} config={cfg} onSelect={onSelect} />
      ))}

      <Database onSelect={onSelect} />
      <EdgesAndPackets />

      <CameraRig />
      <CameraFlyTo active={active} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        autoRotate
        autoRotateSpeed={0.5}
        target={[0, 1.8, 0]}
        minDistance={7}
        maxDistance={40}
        maxPolarAngle={Math.PI * 0.52}
        makeDefault
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.34}
          luminanceSmoothing={0.85}
          mipmapBlur
          intensity={0.42}
          radius={0.55}
        />
        <Vignette offset={0.3} darkness={0.65} />
        <Noise opacity={0.025} premultiply blendFunction={BlendFunction.SOFT_LIGHT} />
        <ChromaticAberration offset={[0.0006, 0.0006]} />
      </EffectComposer>
    </>
  );
}

/* ── Canvas export ───────────────────────────────────────────────────────── */
export default function SystemScene({ onSelect, active }) {
  return (
    <>
      {/* Node label styles — scoped via a style tag in the canvas wrapper */}
      <style>{`
        .node-label {
          font-family: var(--font-jetbrains-mono, 'JetBrains Mono', monospace);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #eaf6fb;
          white-space: nowrap;
          text-shadow: 0 0 10px rgba(178,213,229,0.5);
          pointer-events: none;
          transition: color 0.2s, opacity 0.2s;
        }
        .node-label--dim { opacity: 0.5; }
        .node-label--hot {
          color: #eaf6fb;
          text-shadow: 0 0 16px rgba(178,213,229,0.9);
          opacity: 1;
        }
      `}</style>

      <Canvas
        camera={{ position: [0, 16, 26], fov: 52, near: 0.1, far: 240 }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.NoToneMapping }}
        dpr={[1, 2]}
        style={{ background: VOID, cursor: 'grab' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x020202, 1);
        }}
      >
        <SceneGraph onSelect={onSelect} active={active} />
      </Canvas>
    </>
  );
}
