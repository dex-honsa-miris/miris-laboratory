import { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  DoubleSide,
  Shape,
  SRGBColorSpace,
  type Texture,
} from "three";
import StaticInstances, { type InstanceTransform } from "./StaticInstances";
import { FloorGlow, LightShaft, Pulse } from "./CapsuleFx";

// Industrial hardware surrounds the original capsule bounds and camera paths.
const steel = "#344651",
  enamel = "#71858c",
  blue = "#a4dcff";
const slots = (n: number) => Array.from({ length: n }, (_, i) => i);

const radial = (
  count: number,
  radius: number,
  y: number,
  x = 0,
): InstanceTransform[] =>
  slots(count).map((i) => {
    const a = (i * Math.PI * 2) / count;
    return {
      position: [
        x * Math.cos(a) - radius * Math.sin(a),
        y,
        -x * Math.sin(a) - radius * Math.cos(a),
      ],
      rotation: [0, a, 0],
    };
  });
const wallPosts = radial(18, 11.2, 2.8);
const ceilingRibs = radial(18, 8.2, 5.6);
const wallLights = radial(18, 11, 3.45, 0.42);
const wallBases = radial(18, 11, 0.4);
const walkwaySeams = radial(48, 3.15, 0.06);
const walkwayMarks = radial(48, 2.7, 0.065);
const brightMarks = walkwayMarks.filter((_, i) => i % 4 === 0);
const dimMarks = walkwayMarks.filter((_, i) => i % 4 !== 0);
const capBolts = radial(12, 1, 0.18).map(({ position }) => ({ position }));

function Ring({
  radius,
  y,
  tube = 0.025,
  color = blue,
  lit = false,
}: {
  radius: number;
  y: number;
  tube?: number;
  color?: string;
  lit?: boolean;
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <torusGeometry args={[radius, tube, 6, 80]} />
      {lit ? (
        <meshBasicMaterial color={color} />
      ) : (
        <meshStandardMaterial color={color} metalness={0.65} roughness={0.4} />
      )}
    </mesh>
  );
}

export function LabLabel({
  text,
  width = 2,
  height = 0.35,
}: {
  text: string;
  width?: number;
  height?: number;
}) {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 160;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#15232c";
    c.fillRect(0, 0, 1024, 160);
    c.strokeStyle = "#7eabc2";
    c.lineWidth = 3;
    c.strokeRect(8, 8, 1008, 144);
    c.font = "bold 64px monospace";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#b8e1f4";
    c.fillText(text, 512, 85, 940);
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [text]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={map} />
    </mesh>
  );
}

export function LabFloor({ floor }: { floor: Record<string, Texture> }) {
  return (
    <>
      <color attach="background" args={["#08121c"]} />
      <fog attach="fog" args={["#08121c", 12, 32]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]}>
        <circleGeometry args={[24, 96]} />
        <meshStandardMaterial
          {...floor}
          color="#a4b9c7"
          roughness={0.72}
          metalness={0.42}
          normalScale={[0.55, 0.55]}
        />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[11.5, 11.5, 6, 48, 1, true]} />
        <meshStandardMaterial
          color="#23343f"
          side={DoubleSide}
          roughness={0.8}
          metalness={0.35}
        />
      </mesh>
      <mesh position={[0, 6.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[11.5, 48]} />
        <meshStandardMaterial color="#17252d" roughness={0.8} />
      </mesh>
      {[5.65, 6.2, 10.9].map((r) => (
        <Ring key={r} radius={r} y={5.55} tube={0.14} color={steel} />
      ))}
      <Ring radius={5.8} y={5.48} tube={0.035} lit />
      <StaticInstances transforms={wallPosts}>
        <boxGeometry args={[0.24, 5.6, 0.38]} />
        <meshStandardMaterial color={enamel} metalness={0.5} roughness={0.6} />
      </StaticInstances>
      <StaticInstances transforms={ceilingRibs}>
        <boxGeometry args={[0.16, 0.24, 6]} />
        <meshStandardMaterial color={steel} metalness={0.6} roughness={0.5} />
      </StaticInstances>
      <StaticInstances transforms={wallLights}>
        <boxGeometry args={[0.08, 2.5, 0.06]} />
        <meshBasicMaterial color="#83b6d1" />
      </StaticInstances>
      <StaticInstances transforms={wallBases}>
        <boxGeometry args={[3.7, 0.5, 0.2]} />
        <meshStandardMaterial color="#182832" roughness={0.7} />
      </StaticInstances>
      <Ring radius={10.98} y={0.68} tube={0.02} lit />
    </>
  );
}

export function LabWalkway({ walk, wear }: { walk: Texture; wear: Texture }) {
  return (
    <group>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[3.8, 3.86, 0.07, 96]} />
        <meshStandardMaterial
          color="#34434d"
          map={walk}
          roughnessMap={wear}
          metalness={0.5}
          roughness={0.6}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.054, 0]}>
        <ringGeometry args={[2.62, 3.73, 96]} />
        <meshStandardMaterial
          color="#a1b0b5"
          map={walk}
          roughness={0.65}
          metalness={0.45}
        />
      </mesh>
      {[2.59, 3.77].map((r) => (
        <Ring key={r} radius={r} y={0.065} tube={0.018} lit />
      ))}
      <StaticInstances transforms={walkwaySeams}>
        <boxGeometry args={[0.018, 0.005, 1.06]} />
        <meshStandardMaterial color="#101e28" />
      </StaticInstances>
      <StaticInstances transforms={brightMarks}>
        <boxGeometry args={[0.09, 0.008, 0.12]} />
        <meshBasicMaterial color="#a4dcff" />
      </StaticInstances>
      <StaticInstances transforms={dimMarks}>
        <boxGeometry args={[0.09, 0.008, 0.12]} />
        <meshBasicMaterial color="#70848d" />
      </StaticInstances>
      {slots(6).map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 3, 0]}>
          <mesh position={[0, 0.067, -3.65]}>
            <boxGeometry args={[0.38, 0.006, 0.09]} />
            <meshStandardMaterial color="#c2b18a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 5.45, -4.2]}>
            <boxGeometry args={[1.4, 0.1, 0.16]} />
            <meshBasicMaterial color="#b2d7ea" />
          </mesh>
        </group>
      ))}
      <Ring radius={1.45} y={0.057} tube={0.012} color="#6a8797" />
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, -1.1]}>
        <LabLabel text="BIOLOGY DIVISION / 06" width={1.8} height={0.28} />
      </group>
      <mesh position={[0, 0.015, -7.2]}>
        <boxGeometry args={[2.3, 0.08, 7.4]} />
        <meshStandardMaterial
          color="#6e818a"
          map={walk}
          roughness={0.6}
          metalness={0.5}
        />
      </mesh>
      {[-1.12, 1.12].map((x) => (
        <mesh key={x} position={[x, 0.065, -7.2]}>
          <boxGeometry args={[0.04, 0.025, 7.4]} />
          <meshBasicMaterial color={blue} />
        </mesh>
      ))}
      {slots(12).map((i) => (
        <mesh key={i} position={[0, 0.06, -4.1 - i * 0.56]}>
          <boxGeometry args={[2.15, 0.006, 0.02]} />
          <meshStandardMaterial color="#1c303c" />
        </mesh>
      ))}
      <PressureDoor />
    </group>
  );
}

function PressureDoor() {
  const [frame, recess, leaf] = useMemo(() => {
    const panel = (w: number, h: number, cut: number) => {
      const shape = new Shape();
      shape.moveTo(-w / 2 + cut, -h / 2);
      shape.lineTo(w / 2 - cut, -h / 2);
      shape.lineTo(w / 2, -h / 2 + cut);
      shape.lineTo(w / 2, h / 2 - cut);
      shape.lineTo(w / 2 - cut, h / 2);
      shape.lineTo(-w / 2 + cut, h / 2);
      shape.lineTo(-w / 2, h / 2 - cut);
      shape.lineTo(-w / 2, -h / 2 + cut);
      shape.closePath();
      return shape;
    };
    const half = new Shape();
    half.moveTo(0.025, -1.69);
    half.lineTo(1.04, -1.69);
    half.lineTo(1.36, -1.37);
    half.lineTo(1.36, 1.37);
    half.lineTo(1.04, 1.69);
    half.lineTo(0.025, 1.69);
    half.closePath();
    return [panel(4.05, 4.35, 0.55), panel(3.28, 3.94, 0.46), half];
  }, []);
  return (
    <group position={[0, 2.18, -10.8]}>
      <mesh position={[0, 0, -0.12]}>
        <extrudeGeometry
          args={[
            frame,
            {
              depth: 0.25,
              bevelEnabled: true,
              bevelThickness: 0.07,
              bevelSize: 0.065,
              bevelSegments: 3,
              steps: 1,
            },
          ]}
        />
        <meshStandardMaterial
          color="#607986"
          metalness={0.65}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0, 0, 0.15]}>
        <extrudeGeometry
          args={[
            recess,
            {
              depth: 0.035,
              bevelEnabled: true,
              bevelThickness: 0.055,
              bevelSize: 0.05,
              bevelSegments: 3,
              steps: 1,
            },
          ]}
        />
        <meshStandardMaterial color="#101f29" metalness={0.4} roughness={0.7} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} scale={[side, 1, 1]}>
          <mesh position={[0, 0, 0.24]}>
            <extrudeGeometry
              args={[
                leaf,
                {
                  depth: 0.065,
                  bevelEnabled: true,
                  bevelThickness: 0.018,
                  bevelSize: 0.018,
                  bevelSegments: 3,
                  steps: 1,
                },
              ]}
            />
            <meshStandardMaterial
              color="#405d6d"
              metalness={0.55}
              roughness={0.62}
            />
          </mesh>
          <mesh position={[1.48, 0, 0.26]}>
            <boxGeometry args={[0.023, 2.64, 0.025]} />
            <meshBasicMaterial color="#93c4dc" />
          </mesh>
          <mesh position={[0.26, -0.12, 0.324]}>
            <boxGeometry args={[0.105, 0.54, 0.025]} />
            <meshStandardMaterial color="#162b38" roughness={0.7} />
          </mesh>
          <mesh position={[0.28, -0.12, 0.345]}>
            <boxGeometry args={[0.036, 0.4, 0.04]} />
            <meshStandardMaterial
              color="#8a9da4"
              metalness={0.8}
              roughness={0.4}
            />
          </mesh>
          {[-0.95, 0.95].map((y) => (
            <group key={y} position={[1.74, y, 0.22]}>
              <mesh>
                <boxGeometry args={[0.22, 0.46, 0.16]} />
                <meshStandardMaterial
                  color="#314957"
                  metalness={0.65}
                  roughness={0.5}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.065, 0.065, 0.2, 16]} />
                <meshStandardMaterial
                  color="#91a3a9"
                  metalness={0.75}
                  roughness={0.4}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <mesh position={[0, 0, 0.215]}>
        <boxGeometry args={[0.016, 3.32, 0.025]} />
        <meshBasicMaterial color="#77a9c5" />
      </mesh>
      <mesh position={[0, 1.94, 0.23]}>
        <boxGeometry args={[1.24, 0.055, 0.025]} />
        <meshBasicMaterial color="#c0e3f7" />
      </mesh>
      <mesh position={[0, -1.95, 0.2]}>
        <boxGeometry args={[2.25, 0.07, 0.36]} />
        <meshStandardMaterial
          color="#7c939e"
          metalness={0.65}
          roughness={0.5}
        />
      </mesh>
      <pointLight
        position={[0, 2.1, 1.3]}
        color={blue}
        intensity={12}
        distance={10}
        decay={2}
      />
      <group position={[0, -2.18, 1.6]}>
        <FloorGlow color={0xa4dcff} opacity={0.22} radius={3} />
      </group>
    </group>
  );
}

/* One capsule is a glass tube standing on the ring, with a cap at each end,
   two posts behind it, a lamp above it and a label on the front. The glass
   sets the size; the other parts are placed relative to it. */
const CAPSULES = 6;
const RING_RADIUS = 4.2; // how far each capsule stands from the middle of the room

const GLASS = { radius: 0.9, height: 2.6, bottom: 0.36 };
const glassTop = GLASS.bottom + GLASS.height;
const glassCentre = GLASS.bottom + GLASS.height / 2;

const CAP = { radiusTop: 1.08, radiusBottom: 1.16, thickness: 0.32 };
const BOLT = { radius: 0.045, height: 0.04 };
const POST = { offset: 0.74, width: 0.13, height: 2.8, depth: 0.19, behind: 0.7 };
const STRIP = { width: 0.035, height: 2.35, depth: 0.025, behind: 0.59 };
const LAMP = { y: 4.98, radiusTop: 0.45, radiusBottom: 0.58, thickness: 0.16, faceRadius: 0.42, stemRadius: 0.08, stemHeight: 0.6 };
const LABEL = { standoff: 1.1, width: 0.95, height: 0.15 };

const SMOOTH = 48; // segments for anything round that is seen up close
const COARSE = 32; // segments for the lamp, which is far overhead

const COLOR = { bolt: "#172932", lampFace: "#d2ebff", glassTint: "#a4dcff", glow: 0x94cfff, shaft: 0xa4dcff };

/** Where capsule `index` stands: on the ring, an equal share of the circle
 *  from its neighbours, turned so its front faces the middle of the room. */
function capsulePlacement(index: number) {
  const angle = (index / CAPSULES) * Math.PI * 2;
  return {
    position: [Math.cos(angle) * RING_RADIUS, 0, Math.sin(angle) * RING_RADIUS] as [number, number, number],
    facing: Math.PI / 2 - angle,
  };
}

/** The enamel disc that closes one end of the tube, with a lit ring on its
 *  face, a steel ring round its edge and twelve bolts. */
function EndCap({ y }: { y: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <cylinderGeometry args={[CAP.radiusTop, CAP.radiusBottom, CAP.thickness, SMOOTH]} />
        <meshStandardMaterial color={enamel} metalness={0.55} roughness={0.48} />
      </mesh>
      <Ring radius={CAP.radiusBottom - 0.02} y={0.02} tube={0.018} lit />
      <Ring radius={CAP.radiusBottom - 0.01} y={-0.1} tube={0.025} color={steel} />
      <StaticInstances transforms={capBolts}>
        <cylinderGeometry args={[BOLT.radius, BOLT.radius, BOLT.height, 6]} />
        <meshStandardMaterial color={COLOR.bolt} metalness={0.8} roughness={0.4} />
      </StaticInstances>
    </group>
  );
}

/** A steel upright behind the glass, with a thin blue light strip on its face.
 *  `side` is -1 for the left post and 1 for the right. */
function RearPost({ side }: { side: -1 | 1 }) {
  const x = side * POST.offset;
  return (
    <group>
      <mesh position={[x, glassCentre, -POST.behind]}>
        <boxGeometry args={[POST.width, POST.height, POST.depth]} />
        <meshStandardMaterial color={steel} metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[x, glassCentre, -STRIP.behind]}>
        <boxGeometry args={[STRIP.width, STRIP.height, STRIP.depth]} />
        <meshBasicMaterial color={blue} />
      </mesh>
    </group>
  );
}

/** The tube itself: almost clear, drawn on both sides, and named so GlassOrder
 *  can decide its draw order against the splats each frame. */
function Glass({ index }: { index: number }) {
  return (
    <mesh position={[0, glassCentre, 0]} name={`glass-${index}`}>
      <cylinderGeometry args={[GLASS.radius, GLASS.radius, GLASS.height, SMOOTH, 1, true]} />
      <meshStandardMaterial
        color={COLOR.glassTint}
        transparent
        opacity={0.035}
        roughness={0.22}
        metalness={0.1}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
}

/** The lamp above the tube: a steel housing with a lit face underneath, and
 *  the stem that hangs it from the ceiling. */
function Lamp() {
  return (
    <group position={[0, LAMP.y, 0]}>
      <mesh>
        <cylinderGeometry args={[LAMP.radiusTop, LAMP.radiusBottom, LAMP.thickness, COARSE]} />
        <meshStandardMaterial color={steel} metalness={0.65} roughness={0.4} />
      </mesh>
      <mesh position={[0, -LAMP.thickness / 2 - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[LAMP.faceRadius, COARSE]} />
        <meshBasicMaterial color={COLOR.lampFace} />
      </mesh>
      <mesh position={[0, LAMP.stemHeight / 2 + 0.02, 0]}>
        <cylinderGeometry args={[LAMP.stemRadius, LAMP.stemRadius, LAMP.stemHeight, 12]} />
        <meshStandardMaterial color={steel} />
      </mesh>
    </group>
  );
}

/** One containment capsule, part by part. */
export function LabCapsule({ index }: { index: number }) {
  const { position, facing } = capsulePlacement(index);
  const label = `SPECIMEN / ${String(index + 1).padStart(2, "0")}`;

  return (
    <group position={position} rotation={[0, facing, 0]}>
      <EndCap y={GLASS.bottom - CAP.thickness / 2} />
      <EndCap y={glassTop + CAP.thickness / 2} />

      <RearPost side={-1} />
      <RearPost side={1} />

      <Glass index={index} />
      <Ring radius={GLASS.radius + 0.02} y={GLASS.bottom} tube={0.024} lit />
      <Ring radius={GLASS.radius + 0.02} y={glassTop} tube={0.024} lit />

      <Pulse color={COLOR.glow} seed={index / CAPSULES} />
      <FloorGlow color={COLOR.glow} opacity={0.32} radius={1.75} />
      <LightShaft color={COLOR.shaft} radius={1.1} strength={0.2} />

      <Lamp />

      <group position={[0, glassTop + CAP.thickness / 2, LABEL.standoff]}>
        <LabLabel text={label} width={LABEL.width} height={LABEL.height} />
      </group>
    </group>
  );
}
