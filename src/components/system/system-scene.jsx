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
 *
 * Token contract: raw hex only for Three.js color values (Three doesn't parse CSS vars).
 * DOM overlay (node labels via drei <Html>) uses CSS vars where possible.
 */

import { useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
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
function Core() {
  const coreRef = useRef();
  const glowRef = useRef();
  const shellRef = useRef();

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
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial
          color={CYAN_BRIGHT}
          emissive={CYAN_EMIS}
          emissiveIntensity={1.4}
          roughness={0.35}
          metalness={0.2}
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
        <meshBasicMaterial color={CYAN_EMIS} transparent opacity={0.05} />
      </mesh>
      {/* tracked label */}
      <Html position={[0, 1.6, 0]} center distanceFactor={18} zIndexRange={[10, 0]}>
        <span className="node-label">core</span>
      </Html>
    </group>
  );
}

/* ── ServiceNode ─────────────────────────────────────────────────────────── */
function ServiceNode({ config, index }) {
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
function Rack({ config }) {
  const [x, , z] = config.position;
  const rotY = Math.atan2(-x, -z);

  return (
    <group position={config.position} rotation={[0, rotY, 0]}>
      {/* solid metallic cabinet body */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[2.4, 3.6, 1.4]} />
        <meshStandardMaterial
          color="#0d1b22"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      {/* subtle ice-blue edge outline */}
      <lineSegments position={[0, 1.8, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(2.4, 3.6, 1.4)]} />
        <lineBasicMaterial color={EDGE_ICE} transparent opacity={0.45} />
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
        <span className="node-label node-label--dim">{config.name}</span>
      </Html>
    </group>
  );
}

/* ── Database cylinder ───────────────────────────────────────────────────── */
function Database() {
  const bodyRef = useRef();

  useFrame((_, dt) => {
    if (bodyRef.current) bodyRef.current.rotation.y += dt * 0.25;
  });

  return (
    <group position={[0, 0, -7.5]}>
      {/* solid cylinder body */}
      <mesh ref={bodyRef} position={[0, 1.3, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 1.8, 28, 1, false]} />
        <meshStandardMaterial
          color={DB_COLOR}
          emissive={DB_EMIS}
          emissiveIntensity={0.9}
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
        <span className="node-label node-label--dim">postgres</span>
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

const NP = NODES_CONFIG.map(n => n.position);

const EDGE_DEFS = [
  // request spine (bright)
  { start: NP[0], end: NP[1],      bright: true,  packet: true },
  { start: NP[1], end: CORE_POS,   bright: true,  packet: true },
  // core → services
  { start: CORE_POS, end: NP[2],   bright: false, packet: true },
  { start: CORE_POS, end: NP[3],   bright: false, packet: true },
  { start: CORE_POS, end: NP[4],   bright: false, packet: true },
  { start: CORE_POS, end: NP[5],   bright: false, packet: true },
  // services → db
  { start: NP[2], end: DB_POS,     bright: false, packet: true },
  { start: NP[4], end: DB_POS,     bright: false, packet: true },
  { start: CORE_POS, end: DB_POS,  bright: true,  packet: true },
];

// services → nearest rack (alternating)
const RACK_EDGES = [2, 3, 4, 5].map((ni, k) => ({
  start: NP[ni],
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

/* ── Grid floor with visible opacity ─────────────────────────────────────── */
function GridFloor() {
  const ref = useRef();

  return (
    <gridHelper
      ref={ref}
      args={[56, 56, ICE_HEX, ICE_HEX]}
      position={[0, 0, 0]}
      onUpdate={(self) => {
        // Both materials in GridHelper: set transparent + opacity
        if (self.material) {
          const mats = Array.isArray(self.material) ? self.material : [self.material];
          mats.forEach(m => {
            m.transparent = true;
            m.opacity = 0.28;
          });
        }
      }}
    />
  );
}

/* ── Full scene graph ────────────────────────────────────────────────────── */
function SceneGraph() {
  return (
    <>
      <fog attach="fog" args={[VOID, 60, 240]} />

      {/* lights — essential for meshStandardMaterial surfaces */}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 12, 8]}  intensity={120} distance={80} color="#bfe3f2" />
      <pointLight position={[8, 6, -10]} intensity={60}  distance={60} color="#a0cfe4" />

      <GridFloor />
      <Particles />
      <RadarRing />
      <Core />

      {NODES_CONFIG.map((cfg, i) => (
        <ServiceNode key={cfg.name} config={cfg} index={i} />
      ))}

      {RACK_CONFIGS.map(cfg => (
        <Rack key={cfg.name} config={cfg} />
      ))}

      <Database />
      <EdgesAndPackets />

      <CameraRig />

      <OrbitControls
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
          luminanceThreshold={0.2}
          luminanceSmoothing={0.82}
          mipmapBlur
          intensity={0.8}
          radius={0.6}
        />
      </EffectComposer>
    </>
  );
}

/* ── Canvas export ───────────────────────────────────────────────────────── */
export default function SystemScene() {
  return (
    <>
      {/* Node label styles — scoped via a style tag in the canvas wrapper */}
      <style>{`
        .node-label {
          font-family: var(--font-jetbrains-mono, 'JetBrains Mono', monospace);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(178,213,229,0.75);
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
        <SceneGraph />
      </Canvas>
    </>
  );
}
