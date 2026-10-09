"use client";

// Loaded only through next/dynamic (ssr: false) so three.js stays out of the initial bundle.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { finishById, type Format } from "@/content/products";
import type { BadgeConfig } from "@/lib/badge-config";

export type ViewerApi = { rotate: () => void; reset: () => void; zoom: (dir: 1 | -1) => void };

type Props = {
  format: Format;
  config: BadgeConfig;
  face: HTMLCanvasElement;
  version: number;
  active: boolean; // on screen
  reducedMotion: boolean;
  apiRef: RefObject<ViewerApi | null>;
  onContextLost: () => void;
  onReady: () => void;
};

const MM = 1 / 100; // scene units per millimetre

export default function Viewer3D(props: Props) {
  const { active, reducedMotion, config, onContextLost, onReady } = props;
  const [idle, setIdle] = useState(!reducedMotion);
  // Continuous frames only while something animates on screen; otherwise render on demand.
  const animating = !reducedMotion && (idle || config.nfc);
  const frameloop = !active ? "never" : animating ? "always" : "demand";
  const view = useMemo(() => framing(props.format), [props.format]);

  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, 2]}
      camera={{ position: view.camera, fov: 30, near: 0.05, far: 20 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        onReady();
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
    >
      <Scene {...props} view={view} idle={idle} onInteract={() => setIdle(false)} />
    </Canvas>
  );
}

type View = ReturnType<typeof framing>;

/** Camera and limits per format, based on its real size. */
function framing(f: Format) {
  const w = f.size.w * MM;
  const h = f.size.h * MM;
  const tall = f.mount === "lanyard" ? h * 1.6 : f.mount === "ring" ? h * 1.35 : h;
  const size = Math.max(w, tall);
  const cy = f.mount === "lanyard" ? h * 0.75 : f.mount === "ring" ? h * 0.62 : h * 0.5;
  const dist = size * 2.9;
  return {
    target: new THREE.Vector3(0, cy, 0),
    camera: [0, cy + dist * 0.18, dist] as [number, number, number],
    minDist: size * 1.5,
    maxDist: size * 5,
    shadowScale: Math.max(w, h) * 3,
  };
}

function Scene({
  format,
  config,
  face,
  version,
  active,
  reducedMotion,
  apiRef,
  view,
  idle,
  onInteract,
}: Props & { view: View; idle: boolean; onInteract: () => void }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const spin = useRef<THREE.Group>(null);
  const { camera, invalidate } = useThree();

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(face);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [face]);
  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => {
    // three.js objects are mutable by design: flag the texture for re-upload after a redraw.
    // eslint-disable-next-line react-hooks/immutability
    texture.needsUpdate = true;
    invalidate();
  }, [texture, version, invalidate]);
  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);

  const geo = useMemo(() => badgeGeometry(format), [format]);
  useEffect(
    () => () => {
      geo.body.dispose();
      geo.face.dispose();
    },
    [geo],
  );

  // Reset the camera when the format (and so the framing) changes.
  useEffect(() => {
    camera.position.set(...view.camera);
    controls.current?.target.copy(view.target);
    controls.current?.update();
    invalidate();
  }, [view, camera, invalidate]);

  const preset = finishById(config.finish)!.material;

  useFrame(({ clock }) => {
    if (spin.current && idle && !reducedMotion) spin.current.rotation.y = Math.sin(clock.elapsedTime * 0.55) * 0.42;
  });

  useEffect(() => {
    apiRef.current = {
      rotate() {
        const c = controls.current;
        if (!c) return;
        onInteract();
        c.setAzimuthalAngle(c.getAzimuthalAngle() + Math.PI / 4);
        c.update();
        invalidate();
      },
      reset() {
        const c = controls.current;
        if (!c) return;
        if (spin.current) spin.current.rotation.y = 0;
        camera.position.set(...view.camera);
        c.target.copy(view.target);
        c.update();
        invalidate();
      },
      zoom(dir) {
        const c = controls.current;
        if (!c) return;
        const offset = camera.position.clone().sub(c.target);
        offset.setLength(THREE.MathUtils.clamp(offset.length() * (dir > 0 ? 0.8 : 1.25), view.minDist, view.maxDist));
        camera.position.copy(c.target).add(offset);
        c.update();
        invalidate();
      },
    };
  }, [apiRef, camera, invalidate, onInteract, view]);

  const color = new THREE.Color(config.color);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[1.5, 3, 2.5]} intensity={1.4} />
      <Environment resolution={256} frames={1}>
        {/* Studio light built in-scene: no HDR download from a CDN. */}
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffe6cf" position={[-5, 1.5, 1]} rotation-y={Math.PI / 2} scale={[5, 2, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#fff4e8" position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[5, 2, 1]} />
        <Lightformer form="ring" intensity={1.6} position={[2, 2, 4]} scale={1.5} />
      </Environment>

      <group ref={spin}>
        <Mount format={format} geo={geo}>
          <mesh geometry={geo.body}>
            <meshPhysicalMaterial color={color} {...preset} />
          </mesh>
          <mesh geometry={geo.face} position-z={geo.d / 2 + 0.0004}>
            {/* Printed face: less metallic than the body so the QR stays high-contrast. */}
            <meshPhysicalMaterial map={texture} {...preset} metalness={preset.metalness * 0.45} polygonOffset polygonOffsetFactor={-1} />
          </mesh>
          {config.nfc && <NfcPulse format={format} geo={geo} still={reducedMotion} />}
        </Mount>
      </group>

      <ContactShadows position={[0, 0, 0]} scale={view.shadowScale} blur={2.6} opacity={0.5} far={1.2} resolution={512} color="#15120f" />

      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.12}
        target={view.target}
        minDistance={view.minDist}
        maxDistance={view.maxDist}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.5} // never look from under the floor
        onStart={onInteract}
      />
    </>
  );
}

type Geo = ReturnType<typeof badgeGeometry>;

function roundedRect(path: THREE.Path, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r);
  path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r);
  path.quadraticCurveTo(x, y, x + r, y);
  return path;
}

/** Procedural body (extruded, with real hole) and a face whose UVs map the canvas 1:1. */
function badgeGeometry(f: Format) {
  const w = f.size.w * MM;
  const h = f.size.h * MM;
  const d = Math.max(f.size.d * MM, 0.008);
  const shape = roundedRect(new THREE.Shape(), -w / 2, -h / 2, w, h, f.radius * MM) as THREE.Shape;
  if (f.hole) {
    const hw = f.hole.w * MM;
    const hh = f.hole.h * MM;
    const top = h / 2 - f.hole.top * MM;
    shape.holes.push(roundedRect(new THREE.Path(), -hw / 2, top - hh, hw, hh, Math.min(hw, hh) / 2));
  }
  const bevel = Math.min(d * 0.3, 0.004);
  const body = new THREE.ExtrudeGeometry(shape, {
    depth: d - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 20,
  });
  body.translate(0, 0, -(d - bevel * 2) / 2);

  const face = new THREE.ShapeGeometry(shape, 20);
  const pos = face.attributes.position;
  const uv = face.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  uv.needsUpdate = true;
  return { body, face, w, h, d };
}

const standMaterial = <meshStandardMaterial color="#2a2420" roughness={0.55} metalness={0.1} />;
const steel = <meshStandardMaterial color="#c9c4bc" roughness={0.25} metalness={1} />;

/** Places the badge on its stand / strap / ring, with the floor at y = 0. */
function Mount({ format, geo, children }: { format: Format; geo: Geo; children: React.ReactNode }) {
  const { w, h } = geo;
  switch (format.mount) {
    case "easel": {
      const tilt = -0.2;
      return (
        <>
          <RoundedBox args={[w * 1.06, 0.022, 0.18]} radius={0.008} position={[0, 0.011, -0.02]}>
            {standMaterial}
          </RoundedBox>
          <group position={[0, 0.016 + (h / 2) * Math.cos(tilt), (h / 2) * Math.sin(tilt) - 0.005]} rotation-x={tilt}>
            {children}
          </group>
        </>
      );
    }
    case "base":
      return (
        <>
          <RoundedBox args={[w * 1.12, 0.045, 0.26]} radius={0.012} position={[0, 0.0225, 0]}>
            {standMaterial}
          </RoundedBox>
          <group position={[0, h / 2 + 0.025, 0]}>{children}</group>
        </>
      );
    case "lanyard": {
      const y = h / 2 + 0.1;
      const slotTop = y + h / 2 - (format.hole?.top ?? 5) * MM;
      return (
        <>
          <group position={[0, y, 0]}>{children}</group>
          {/* clip + strap */}
          <RoundedBox args={[0.11, 0.05, 0.012]} radius={0.004} position={[0, slotTop + 0.012, 0.004]}>
            {steel}
          </RoundedBox>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.07, slotTop + 0.3, -0.004]} rotation-z={s * -0.2}>
              <boxGeometry args={[0.05, 0.56, 0.004]} />
              <meshStandardMaterial color="#ff5a1f" roughness={0.8} />
            </mesh>
          ))}
        </>
      );
    }
    case "ring": {
      const y = h / 2 + 0.08;
      const holeY = y + h / 2 - ((format.hole?.top ?? 6) + (format.hole?.h ?? 6) / 2) * MM;
      return (
        <>
          <group position={[0, y, 0]}>{children}</group>
          <mesh position={[0, holeY + 0.11, 0]} rotation-y={Math.PI / 2}>
            <torusGeometry args={[0.13, 0.009, 16, 64]} />
            {steel}
          </mesh>
        </>
      );
    }
  }
  return <>{children}</>;
}

/** Pulsing ripple over the NFC coil, in the badge's own space. */
function NfcPulse({ format, geo, still }: { format: Format; geo: Geo; still: boolean }) {
  const rings = useRef<THREE.Mesh[]>([]);
  const r = format.nfc.r * Math.min(geo.w, geo.h);
  const x = (format.nfc.x - 0.5) * geo.w;
  const y = (0.5 - format.nfc.y) * geo.h;
  useFrame(({ clock }) => {
    if (still) return;
    rings.current.forEach((m, i) => {
      if (!m) return;
      const t = (clock.elapsedTime * 0.6 + i / 3) % 1;
      const k = 1 - (1 - t) ** 3; // ease-out
      m.scale.setScalar(0.35 + k * 1.1);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - t);
    });
  });
  return (
    <group position={[x, y, geo.d / 2 + 0.002]}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) rings.current[i] = m;
          }}
          scale={still ? 0.5 + i * 0.3 : 1}
        >
          <ringGeometry args={[r * 0.9, r, 48]} />
          <meshBasicMaterial color="#ff5a1f" transparent opacity={still ? 0.6 - i * 0.15 : 0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
