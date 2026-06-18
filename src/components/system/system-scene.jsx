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

import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/* ── Palette constants ────────────────────────────────────────────────────── */
const ICE      = '#B2D5E5';
const ICE_HEX  = 0xb2d5e5;
const VOID     = '#020202';

// Dichromatic palette — ice-blue tints only (no green/amber/teal)
const CYAN_BRIGHT  = '#d6ecf4';   // core primary (light ice)
const CYAN_EMIS    = '#8fc4d8';   // core emissive (ice)
const NODE_COLOR   = '#B2D5E5';   // service node solid (ice)
const NODE_EMIS    = '#5f93a6';   // service node emissive (deep ice)
const DB_COLOR     = '#9fc6d6';   // database cylinder (ice)
const DB_EMIS      = '#4f7c8a';   // database emissive (deep ice)
const DB_RING      = '#cfe7f2';   // database ring accent (light ice)
const PACKET_COLOR = '#eaf6fb';   // traveling packets (near-white)
const EDGE_ICE     = '#9fd8ea';   // edge line colour (ice)

// Server rack unit lights — dichromatic ice tints (varied lightness for texture)
const LED_GREEN = '#9fdcea';
const LED_AMBER = '#cfe7f2';
const LED_ICE   = '#7fb8cc';

/* ── Node pulse registry ───────────────────────────────────────────────────
   Packets stamp the clock-time of their arrival per node key; nodes read it
   each frame and briefly flare, so the flow looks causal. Module-level
   singleton — the scene is a single instance on the page. */
const NODE_PULSE = new Map();
const PULSE_DECAY = 0.55; // seconds for a flare to fade
function firePulse(key, time) {
  if (key) NODE_PULSE.set(key, time);
}
function pulseAmount(key, time) {
  const last = NODE_PULSE.get(key);
  if (last == null) return 0;
  const dt = time - last;
  if (dt < 0 || dt > PULSE_DECAY) return 0;
  return 1 - dt / PULSE_DECAY;
}

/* ── Service-node configuration ─────────────────────────────────────────── */
const NODES_CONFIG = [
  { name: 'client',       position: [-18, 1.2, 11 ], hot: 'edge / entrypoint' },
  { name: 'gateway',      position: [-10, 2.0,  4 ], hot: 'api gateway' },
  { name: 'api · Go',     position: [ 13, 2.8, -6 ], hot: 'service: REST / gRPC' },
  { name: 'cloud · k8s',  position: [ 15, 2.2,  8 ], hot: 'AWS · Kubernetes · Terraform' },
  { name: 'worker · tf',  position: [ -9, 2.6, -11], hot: 'jobs / automation / terraform' },
  { name: 'cache',        position: [ -4, 1.6, 13 ], hot: 'in-memory cache' },
];

/* ── Rack positions (interactive — open Projects) ────────────────────────── */
const RACK_CONFIGS = [
  { position: [-14, 0, -14], name: 'rack-01' },
  { position: [ 14, 0, -14], name: 'rack-02' },
  { position: [-14, 0,  14], name: 'rack-03' },
  { position: [ 14, 0,  14], name: 'rack-04' },
];

/* ── Ambient server racks (decorative — build the server-room aisles) ─────── */
// Rows framing the scene; non-interactive, lighter geometry, same palette.
const AMBIENT_RACKS = [
  // back wall row
  ...[-18, -12, -6, 0, 6, 12, 18].map((x) => [x, 0, -22]),
  // left aisle
  ...[-14, -8, -2, 4].map((z) => [-22, 0, z]),
  // right aisle
  ...[-14, -8, -2, 4].map((z) => [22, 0, z]),
];

/* ── Cooling towers (decorative — far corners) ───────────────────────────── */
const COOLING_TOWERS = [
  [-25, 0, -25],
  [ 25, 0, -25],
  [-25, 0,  25],
  [ 25, 0,  25],
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
  experience: { target: [0, 1.3, -13],              camOffset: [0, 4, 4]    },
  contact:    { target: [0, 1.8, 0],               camOffset: [0, 3, 8]    },
  // null / overview
  overview:   { target: [0, 1.8, 0],               camOffset: [0, 9, 24]   },
};

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
function Core({ onSelect, onFocus }) {
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
    onFocus?.([0, 1.8, 0]);
    onSelect?.('about');
  }, [onSelect, onFocus]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const pulse = pulseAmount('core', t);
    if (coreRef.current) {
      coreRef.current.rotation.y += dt * 0.3;
      coreRef.current.rotation.x += dt * 0.1;
      if (coreRef.current.material) {
        coreRef.current.material.emissiveIntensity = (hovered ? 0.8 : 0.4) + pulse * 1.4;
      }
    }
    if (shellRef.current) {
      shellRef.current.rotation.y -= dt * 0.15;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.06 + pulse * 0.12);
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
function ServiceNode({ config, index, onSelect, onFocus }) {
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
    onFocus?.(config.position);
    onSelect?.('skills');
  }, [onSelect, onFocus, config.position]);

  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.6;
    const t = state.clock.elapsedTime;
    const pulse = pulseAmount(config.name, t);
    const targetScale = (hovered ? 1.5 : 1) + Math.sin(t * 2 + index) * 0.07 + pulse * 0.55;
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.18);
    if (ref.current.material) {
      ref.current.material.emissiveIntensity = (hovered ? 1.4 : 0.8) + pulse * 1.8;
    }
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

/* ── Led (flickering status indicator) ───────────────────────────────────── */
function Led({ color, position }) {
  const matRef = useRef();
  const seed = useMemo(() => Math.random() * 10, []);

  useFrame((state) => {
    if (!matRef.current) return;
    const t = state.clock.elapsedTime;
    // mostly-on with occasional dips — reads like live activity
    const f = Math.sin(t * 3 + seed) * Math.sin(t * 1.3 + seed * 2);
    matRef.current.opacity = 0.55 + 0.45 * Math.max(0, f);
  });

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[0.09, 0.09]} />
        <meshBasicMaterial ref={matRef} color={color} transparent />
      </mesh>
      <mesh>
        <planeGeometry args={[0.16, 0.16]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

/* ── Rack ────────────────────────────────────────────────────────────────── */
function Rack({ config, onSelect, onFocus }) {
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
    onFocus?.([x, 2, z]);
    onSelect?.('projects');
  }, [onSelect, onFocus, x, z]);

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
            {/* glowing, flickering LED indicator */}
            <Led color={ledColor} position={[0.72, 0, 0.001]} />
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

/* ── AmbientRack (decorative server cabinet — no label / no click) ───────── */
function AmbientRack({ position }) {
  const [x, , z] = position;
  const rotY = Math.atan2(-x, -z);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* solid metallic cabinet body — slightly darker so the hero racks read brighter */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[2.4, 3.6, 1.4]} />
        <meshStandardMaterial color="#0a151b" metalness={0.6} roughness={0.45} />
      </mesh>
      {/* subtle ice-blue edge outline */}
      <lineSegments position={[0, 1.8, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(2.4, 3.6, 1.4)]} />
        <lineBasicMaterial color={EDGE_ICE} transparent opacity={0.28} />
      </lineSegments>
      {/* 4 status LED strips (lighter than the interactive racks) */}
      {Array.from({ length: 4 }, (_, i) => {
        const ledColor = LED_PALETTE[(i + 1) % LED_PALETTE.length];
        return (
          <group key={i} position={[0, 0.75 + i * 0.7, 0.71]}>
            <mesh>
              <planeGeometry args={[1.8, 0.16]} />
              <meshStandardMaterial color="#091318" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[0.72, 0, 0.001]}>
              <planeGeometry args={[0.08, 0.08]} />
              <meshBasicMaterial color={ledColor} transparent opacity={0.85} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ── CoolingTower (decorative — tall finned cylinder + spinning fan + shaft) ── */
function CoolingTower({ position, index = 0 }) {
  const fanRef = useRef();

  useFrame((_, dt) => {
    // alternate spin direction per tower for life
    if (fanRef.current) fanRef.current.rotation.y += dt * (index % 2 ? -1.8 : 1.8);
  });

  return (
    <group position={position}>
      {/* tall body */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[1.3, 1.5, 6.4, 20, 1, false]} />
        <meshStandardMaterial color="#0b161c" metalness={0.55} roughness={0.5} />
      </mesh>
      {/* ice-blue fin rings */}
      {[1.4, 2.6, 3.8, 5.0].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.06, 6, 28]} />
          <meshBasicMaterial color={EDGE_ICE} transparent opacity={0.4} />
        </mesh>
      ))}
      {/* glowing vent cap */}
      <mesh position={[0, 6.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 1.2, 24]} />
        <meshBasicMaterial color={LED_ICE} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* spinning intake fan */}
      <group ref={fanRef} position={[0, 6.5, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.18, 10]} />
          <meshStandardMaterial color="#0d1b22" metalness={0.6} roughness={0.4} />
        </mesh>
        {[0, 1, 2, 3].map((b) => (
          <mesh key={b} rotation={[0, (b * Math.PI) / 2, 0]} position={[0.45, 0.02, 0]}>
            <boxGeometry args={[0.9, 0.02, 0.22]} />
            <meshStandardMaterial color={DB_COLOR} emissive={DB_EMIS} emissiveIntensity={0.4} metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ── Database cylinder ───────────────────────────────────────────────────── */
function Database({ onSelect, onFocus }) {
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
    onFocus?.([0, 1.3, -13]);
    onSelect?.('experience');
  }, [onSelect, onFocus]);

  useFrame((state, dt) => {
    if (!bodyRef.current) return;
    bodyRef.current.rotation.y += dt * 0.25;
    const pulse = pulseAmount('db', state.clock.elapsedTime);
    if (bodyRef.current.material) {
      bodyRef.current.material.emissiveIntensity = (hovered ? 1.6 : 0.9) + pulse * 1.8;
    }
  });

  return (
    <group
      position={[0, 0, -13]}
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
      opacity={bright ? 0.6 : 0.22}
    />
  );
}

function Packet({ start, end, speed, bright = false, endKey }) {
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

  useFrame((state, dt) => {
    tRef.current += dt * speed;
    if (tRef.current > 1) {
      tRef.current -= 1;
      firePulse(endKey, state.clock.elapsedTime); // arrived at destination
    }
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
const DB_POS   = [0, 1.3, -13];

const NP_EDGES = NODES_CONFIG.map(n => n.position);

/* Every hub in the live system: core + service nodes + database. */
const HUBS = [CORE_POS, ...NP_EDGES, DB_POS];
const HUB_KEYS = ['core', ...NODES_CONFIG.map(n => n.name), 'db'];

/* Complete graph — every hub linked to every other, each carrying a packet.
   Edges touching the core read brighter; the rest are an atmospheric mesh.
   Direction is randomized so packets arrive at (and pulse) every node. */
const CORE_INDEX = 0;
const MESH_EDGES = [];
for (let i = 0; i < HUBS.length; i++) {
  for (let j = i + 1; j < HUBS.length; j++) {
    const flip = Math.random() < 0.5;
    const s = flip ? j : i;
    const e = flip ? i : j;
    const touchesCore = i === CORE_INDEX || j === CORE_INDEX;
    MESH_EDGES.push({
      start: HUBS[s],
      end: HUBS[e],
      endKey: HUB_KEYS[e],
      bright: touchesCore,
      // far fewer packets: core links always flow, others only occasionally
      packet: touchesCore || Math.random() < 0.18,
    });
  }
}

// services → nearest rack (alternating)
const RACK_EDGES = [2, 3, 4, 5].map((ni, k) => ({
  start: NP_EDGES[ni],
  end: RACK_POSITIONS[k % RACK_POSITIONS.length],
  bright: false,
  packet: k % 2 === 0,
}));

/* Link every perimeter object (ambient racks + cooling towers) into the
   network via its nearest hub, so the flow reaches the whole server room. */
function nearestHub(p) {
  let best = HUBS[0];
  let bestD = Infinity;
  for (const h of HUBS) {
    const dx = h[0] - p[0];
    const dz = h[2] - p[2];
    const d = dx * dx + dz * dz;
    if (d < bestD) { bestD = d; best = h; }
  }
  return best;
}

const AMBIENT_EDGES = [
  // perimeter objects stay wired (lines) but carry no packets — keeps it calm
  ...AMBIENT_RACKS.map(p => ({
    start: [p[0], 2.2, p[2]], end: nearestHub(p), bright: false, packet: false,
  })),
  ...COOLING_TOWERS.map(p => ({
    start: [p[0], 3.2, p[2]], end: nearestHub(p), bright: false, packet: false,
  })),
];

const ALL_EDGES = [...MESH_EDGES, ...RACK_EDGES, ...AMBIENT_EDGES];

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
          endKey={e.endKey}
          speed={(e.bright ? 0.07 : 0.05) + Math.random() * 0.03}
        />
      ))}
    </>
  );
}

/* ── Trace-a-request ──────────────────────────────────────────────────────
   On each runId bump, a bright packet travels the full request path
   (client → gateway → core → api → db), drawing a glowing trail behind it
   and pulsing each hop as it arrives. */
const TRACE_PATH = [NP_EDGES[0], NP_EDGES[1], CORE_POS, NP_EDGES[2], DB_POS];

function Trace({ runId }) {
  const headRef = useRef();
  const haloRef = useRef();
  const [trail, setTrail] = useState(null);
  const run = useRef({ active: false, dist: 0 });

  const { pts, cum, total } = useMemo(() => {
    const p = TRACE_PATH.map((v) => new THREE.Vector3(...v));
    const c = [0];
    for (let i = 1; i < p.length; i++) c.push(c[i - 1] + p[i].distanceTo(p[i - 1]));
    return { pts: p, cum: c, total: c[c.length - 1] };
  }, []);

  useEffect(() => {
    if (runId > 0) run.current = { active: true, dist: 0 };
  }, [runId]);

  useFrame((_, dt) => {
    const r = run.current;
    if (!r.active) return;
    r.dist += dt * 9; // units / sec along the path
    if (r.dist >= total) {
      r.active = false;
      setTrail(null);
      return;
    }
    let seg = 0;
    while (seg < cum.length - 1 && r.dist > cum[seg + 1]) seg++;
    const segLen = (cum[seg + 1] - cum[seg]) || 1;
    const f = (r.dist - cum[seg]) / segLen;
    const cur = new THREE.Vector3().lerpVectors(pts[seg], pts[seg + 1], f);
    if (headRef.current) headRef.current.position.copy(cur);
    if (haloRef.current) haloRef.current.position.copy(cur);
    const tp = [];
    for (let i = 0; i <= seg; i++) tp.push(pts[i].toArray());
    tp.push(cur.toArray());
    setTrail(tp);
  });

  if (!trail) return null;
  return (
    <>
      <Line points={trail} color={PACKET_COLOR} lineWidth={2.4} transparent opacity={0.95} />
      <mesh ref={headRef}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshBasicMaterial color={PACKET_COLOR} />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshBasicMaterial color={PACKET_COLOR} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
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
      camera.position.y = 9 + introRef.current * 9;
      camera.position.z = 24 + introRef.current * 10;
    }
  });

  return null;
}

/* ── Camera fly-to on active section / focused node ─────────────────────── */
const _tmpTarget = new THREE.Vector3();
const _tmpCamPos = new THREE.Vector3();

/* Cinematic camera placement: dolly in close along the node's radial
   direction, slightly elevated, so the clicked object fills the frame
   with the rest of the topology behind it. */
const CINE_DIST = 6;     // camera distance from the focused object
const CINE_LIFT = 2.4;   // how far above the object the camera sits

function cinematicCam(target) {
  const [x, y, z] = target;
  const radial = Math.hypot(x, z);
  if (radial < 0.5) {
    // central core — no radial direction; frame it head-on
    return [x, y + CINE_LIFT, z + 8];
  }
  return [
    x + (x / radial) * CINE_DIST,
    y + CINE_LIFT,
    z + (z / radial) * CINE_DIST,
  ];
}

/* Default focus point per section (used when navigation comes from the HUD
   dock rather than a direct 3D click). */
const SECTION_FOCUS = {
  about:      [0, 1.8, 0],
  skills:     SKILL_NODE_CLUSTER_CENTER,
  projects:   [-14, 2, -14],
  experience: [0, 1.3, -13],
  contact:    [0, 1.8, 0],
};

function CameraFlyTo({ active, focus, controlsRef }) {
  const { camera } = useThree();
  const prevActiveRef = useRef(active);
  const returnRef = useRef(0); // seconds left flying back to overview

  useFrame((_, dt) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // ease toward the goal; clamp so big jumps stay smooth/cinematic
    const speed = Math.min(dt * 2.2, 1);

    // Detect a close (active → null): trigger a fly-back to overview.
    if (prevActiveRef.current && !active) returnRef.current = 1.6;
    prevActiveRef.current = active;

    const target = focus ?? (active ? SECTION_FOCUS[active] : null);

    if (active && target) {
      // Cinematic per-node shot
      _tmpTarget.set(...target);
      _tmpCamPos.set(...cinematicCam(target));
      controls.target.lerp(_tmpTarget, speed);
      camera.position.lerp(_tmpCamPos, speed);
      controls.autoRotate = false;
    } else {
      // Overview — recenter the look-at; pull the camera back briefly after a
      // close, then release control so the user can orbit freely.
      const f = FOCUS_TARGETS.overview;
      _tmpTarget.set(...f.target);
      controls.target.lerp(_tmpTarget, speed);

      if (returnRef.current > 0) {
        returnRef.current -= dt;
        _tmpCamPos.set(
          f.target[0] + f.camOffset[0],
          f.target[1] + f.camOffset[1],
          f.target[2] + f.camOffset[2]
        );
        camera.position.lerp(_tmpCamPos, speed);
        controls.autoRotate = false;
      } else {
        controls.autoRotate = true;
      }
    }

    controls.update();
  });

  return null;
}

/* ── Depth-of-field driver ──────────────────────────────────────────────────
   Smoothly ramps bokeh + focus target so the background blurs only when a node
   is focused (cinematic), staying crisp in the overview. Mutates the DoF effect
   via ref so DepthOfField can remain a direct EffectComposer child. */
function DofDriver({ dofRef, focus }) {
  const tgt = useMemo(() => new THREE.Vector3(0, 1.8, 0), []);
  useFrame(() => {
    const dof = dofRef.current;
    if (!dof) return;
    tgt.set(...(focus ?? [0, 1.8, 0]));
    if (dof.target) dof.target.lerp(tgt, 0.08);
    const goal = focus ? 3.2 : 0;
    if (typeof dof.bokehScale === 'number') {
      dof.bokehScale = THREE.MathUtils.lerp(dof.bokehScale, goal, 0.06);
    }
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
      args={[72, 72, ICE_HEX, ICE_HEX]}
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
function SceneGraph({ onSelect, active, trace }) {
  const controlsRef = useRef();
  const dofRef = useRef();
  const [focus, setFocus] = useState(null);

  // Clear the cinematic focus whenever the panel closes (return to overview).
  useEffect(() => {
    if (!active) setFocus(null);
  }, [active]);

  return (
    <>
      <fog attach="fog" args={[VOID, 34, 165]} />

      {/* lights — essential for meshStandardMaterial surfaces */}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 12, 8]}  intensity={120} distance={80} color="#bfe3f2" />
      <pointLight position={[8, 6, -10]} intensity={60}  distance={60} color="#a0cfe4" />

      <ReflectiveFloor />
      <GridFloor />
      <RadarRing />
      <Core onSelect={onSelect} onFocus={setFocus} />

      {NODES_CONFIG.map((cfg, i) => (
        <ServiceNode key={cfg.name} config={cfg} index={i} onSelect={onSelect} onFocus={setFocus} />
      ))}

      {RACK_CONFIGS.map(cfg => (
        <Rack key={cfg.name} config={cfg} onSelect={onSelect} onFocus={setFocus} />
      ))}

      {/* decorative server-room density */}
      {AMBIENT_RACKS.map((pos, i) => (
        <AmbientRack key={`ar-${i}`} position={pos} />
      ))}
      {COOLING_TOWERS.map((pos, i) => (
        <CoolingTower key={`ct-${i}`} position={pos} index={i} />
      ))}

      <Database onSelect={onSelect} onFocus={setFocus} />
      <EdgesAndPackets />
      <Trace runId={trace} />

      <CameraRig />
      <CameraFlyTo active={active} focus={focus} controlsRef={controlsRef} />
      <DofDriver dofRef={dofRef} focus={focus} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        autoRotate
        autoRotateSpeed={0.5}
        target={[0, 1.8, 0]}
        minDistance={4}
        maxDistance={52}
        maxPolarAngle={Math.PI * 0.52}
        makeDefault
      />

      <EffectComposer>
        <DepthOfField
          ref={dofRef}
          target={[0, 1.8, 0]}
          focalLength={0.015}
          focusRange={0.012}
          bokehScale={0}
        />
        <Bloom
          luminanceThreshold={0.34}
          luminanceSmoothing={0.85}
          mipmapBlur
          intensity={0.42}
          radius={0.55}
        />
        <Vignette offset={0.3} darkness={0.65} />
        <Noise opacity={0.025} premultiply blendFunction={BlendFunction.SOFT_LIGHT} />
      </EffectComposer>
    </>
  );
}

/* ── Canvas export ───────────────────────────────────────────────────────── */
export default function SystemScene({ onSelect, active, trace }) {
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
        camera={{ position: [0, 18, 32], fov: 52, near: 0.1, far: 280 }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.NoToneMapping }}
        dpr={[1, 2]}
        style={{ background: VOID, cursor: 'grab' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x020202, 1);
        }}
      >
        <SceneGraph onSelect={onSelect} active={active} trace={trace} />
      </Canvas>
    </>
  );
}
