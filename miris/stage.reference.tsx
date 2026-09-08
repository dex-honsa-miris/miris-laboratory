import { referenceData } from "./referenceData";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { MirisScene, MirisStream } from "@miris-inc/three";
import { Group, Scene, NoToneMapping } from "three";
import { Fn, float, hash, step, texture, time, uv, vec2, vec3, vec4 } from "three/tsl";
import LabHud, { CapsuleProbe } from "../miris/LabHud";
import CapsuleFocus from "../miris/CapsuleFocus";
import Pedestals from "../miris/Pedestals";
import useHtmlTexture from "../miris/htmlTexture";
import HdrGuard from "../miris/HdrGuard";
import BudgetGuard from "../miris/BudgetGuard";
import GlassOrder from "../miris/GlassOrder";
import { floorMaps, walkwayTexture, wearMap } from "../miris/textures";
import ScreenFx, { screen } from "../miris/ScreenFx";
import { VaultFloor, VaultWalkway, VaultCapsule } from "../miris/VaultRoom";
import { StageSkeleton } from "../miris/Skeleton";
import useLabScene from "../miris/useLabScene";
import SceneControls from "../miris/SceneControls";
import useScenePreferences from "../miris/useScenePreferences";
import { activeSeries, escapeMarkup } from "../miris/workshop.mjs";

extend({ MirisStream });

// miris:sdk-start
class LaboratoryScene extends MirisScene {
  constructor(viewerKey: string) {
    super({ viewerKey });
    this.name = "Sublevel 7";
  }

  specimenPosition(index: number): [number, number, number] {
    const angle = (index / 6) * Math.PI * 2;
    return [Math.cos(angle) * 4.2, 1.66, Math.sin(angle) * 4.2];
  }
}

const createLabScene = (viewerKey: string) => new LaboratoryScene(viewerKey);
// miris:sdk-end

// miris:parts-start
function FitInGlass({ position, fill = 0.7, speed = 0.08, children }: any) {
  const turntable = useRef<Group>(null);
  const box = useRef<Group>(null);
  const settled = useRef(false);
  useFrame((_, dt) => {
    const g = box.current;
    if (!g || !turntable.current) return;
    if (settled.current) {
      turntable.current.rotation.y = (turntable.current.rotation.y + Math.min(dt, 0.1) * speed) % (Math.PI * 2);
      return;
    }
    let stream: any = null;
    g.traverse((o: any) => { if (!stream && o.getBounds) stream = o; });
    const b = stream?.getBounds();
    if (!b || !(b.size[1] > 0)) return;
    // Fit the horizontal diagonal so every angle clears the glass.
    const want = Math.min((2.6 * fill) / b.size[1], (1.8 * fill) / Math.hypot(b.size[0], b.size[2]));
    if (Math.abs(want - 1) < 0.01) {
      g.position.x += position[0] - b.center[0];
      g.position.y += position[1] - b.center[1];
      g.position.z += position[2] - b.center[2];
      settled.current = true;
      return;
    }
    g.scale.multiplyScalar(1 + (want - 1) * 0.6);
    g.position.x += (position[0] - b.center[0]) * 0.6;
    g.position.y += (position[1] - b.center[1]) * 0.6;
    g.position.z += (position[2] - b.center[2]) * 0.6;
  });
  return <group ref={turntable} position={position}><group ref={box}>{children}</group></group>;
}

// Paint the markup into a canvas and wear it as a texture. The browser lays
// the HTML out, drawElementImage copies the pixels, and three samples them.
function File({ html }: { html: string }) {
  const { texture, width, height } = useHtmlTexture(html);
  if (!texture) return null;
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
// miris:parts-end

// Your file. Each step's code goes between the miris: comments below.
export default function Stage() {
  const [data, setData] = useState<any>(null);
  const { compact, reducedMotion } = useScenePreferences();

  useEffect(() => {
    let alive = true;
    const load = () => { if (alive) setData(referenceData); };
    void load();
    window.addEventListener("miris:refresh", load);
    return () => { alive = false; window.removeEventListener("miris:refresh", load); };
  }, []);


  // miris:markup-start
  // The file is HTML. The browser lays it out with the guide's own CSS, then
  // paints it into a canvas, and that canvas becomes a texture on a plane.
  const fileMarkup = (d: any) => `
    <div class="mw-dossier mw-screen">
      <header class="mw-d-terminal">MIRIS BIOLOGY DIVISION <span>M-06 / RECORD ACCESS</span></header>
      <div>
        <p class="mw-d-code">${d.designation} / ${d.series}</p>
        <h3>${escapeMarkup(d.name)}</h3>
        <p class="mw-d-class">${d.classification}</p>
        <ol class="mw-d-series">
          ${d.stages.map((name: string, k: number) => `
            <li class="${k === d.index ? "on" : ""}"><b>${String(k + 1).padStart(2, "0")}</b><span>${name}</span></li>`).join("")}
        </ol>
        <p class="mw-d-stage">Stage ${d.index + 1} of ${d.stages.length}: ${d.stage}</p>
        <ul class="mw-d-stats">
          ${(d.stats || []).map((s: any) => `
            <li><span>${s.label}</span><i><b style="width:${s.value}%"></b></i><span>${s.value}</span></li>`).join("")}
        </ul>
      </div>
      <div>
        <p class="mw-d-head">Field observations</p>
        <p class="mw-d-notes">${escapeMarkup(d.notes)}</p>
      </div>
      <footer class="mw-d-terminal">BIOLOGICAL RECORD / READ ONLY <span>TERMINAL ${String(d.index + 1).padStart(2, "0")} / 06</span></footer>
    </div>`;
  // miris:markup-end

  // miris:field-start
  const glitch = useMemo(() => Fn(() => {
    const p = uv();
    const tick = time.mul(0.55).floor();
    const live = step(float(0.83), hash(tick.add(3))).mul(step(time.mul(0.55).fract(), float(0.055)));
    const band = step(p.y.sub(hash(tick)).abs(), float(0.018));
    const shift = band.mul(live).mul(0.014);
    const q = vec2(p.x.add(shift), p.y);
    const c = texture(screen, q);
    const phosphor = c.r.mul(0.21).add(c.g.mul(0.72)).add(c.b.mul(0.07));
    const scan = p.y.mul(1131).sin().mul(0.035).add(0.965);
    const flicker = time.mul(8).sin().mul(0.006).add(0.994);
    const edge = p.x.mul(p.x.oneMinus()).mul(p.y).mul(p.y.oneMinus()).mul(16).pow(0.12);
    const glow = texture(screen, q.add(vec2(0.0015, 0))).g.mul(0.08);
    return vec4(vec3(0.48, 0.78, 1).mul(phosphor.add(glow)).mul(scan).mul(flicker).mul(edge), float(1));
  })(), []);
  // miris:field-end

  const specimens = data?.specimens ?? [];
  const floor = useMemo(() => floorMaps(14), []);
  const walk = useMemo(() => { const t = walkwayTexture(); t.repeat.set(6, 6); return t; }, []);
  const wear = useMemo(() => { const t = wearMap(); t.repeat.set(7, 7); return t; }, []);

  useEffect(() => () => {
    Object.values(floor).forEach((map) => map.dispose());
    walk.dispose();
    wear.dispose();
  }, [floor, walk, wear]);

  const { scene, error } = useLabScene(createLabScene, data?.viewerKey, !!data?.track);
  if (error) throw error;
  if (!data?.track || !scene) return <StageSkeleton />;

  return (
    <>
    <Canvas
      key={scene.uuid}
      scene={scene}
      dpr={compact ? 1 : [1, 1.5]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: NoToneMapping,
      }}
      camera={{ position: [0, 1.7, 0.02], fov: data.labDesign?.fov ?? 55 }}
      style={{ position: "fixed", top: 0, left: 0, width: "calc(100vw - var(--mw-side, 0px))", height: "100dvh", touchAction: "none" }}
    >
      <hemisphereLight args={[0xb7d8f0, 0x26323b, 1.2]} />
      <directionalLight position={[-6, 9, 4]} intensity={2.1} color={0xbfe0f2} />
      <pointLight position={[0, 0.3, 0]} intensity={4} distance={9} decay={2} color={0x3bd6fe} />

      {/* miris:scene-start */}
      <VaultFloor floor={floor} />
      <VaultWalkway walk={walk} wear={wear} />
      {specimens.map((s, i) => <VaultCapsule key={s.id} index={i} />)}
      {specimens.map((s, i) => {
        if (!s.uuid) return null;
        return (
          <FitInGlass key={`${s.id}:${s.uuid}`} position={scene.specimenPosition(i)} fill={0.7} speed={reducedMotion ? 0 : data.labDesign?.rotationSpeed ?? 0.08}>
            <mirisStream args={[{ uuid: s.uuid, viewerKey: data.viewerKey }]} />
          </FitInGlass>
        );
      })}
      {/* miris:scene-end */}

      {/* miris:card-start */}
      <Pedestals specimens={specimens}>{(d: any) => <File html={fileMarkup(d)} />}</Pedestals>
      {/* miris:card-end */}


      <HdrGuard />
      <BudgetGuard />
      <CapsuleProbe />
      <GlassOrder />
      <CapsuleFocus />
      <OrbitControls
        makeDefault
        target={[0, 1.7, 0]}
        enablePan={false}
        enableZoom={false}
        rotateSpeed={-0.35}
      />
    </Canvas>

    {/* miris:hud-start */}
    <LabHud specimens={specimens} title={data.labDesign?.title} />
    {/* miris:hud-end */}

    <SceneControls specimens={specimens} />

    {/* miris:effect-start */}
    <ScreenFx node={reducedMotion ? null : glitch} />
    {/* miris:effect-end */}
    </>
  );
}
