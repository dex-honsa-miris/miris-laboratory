import { FAL_KEYS_URL, PORTAL_URL } from "./config";

export interface Sub {
  num: string;
  /** {noun} is replaced with the track's own word: creature, product,
   *  artifact. The same substitution runs over `body`. */
  title: string;
  body: string;
  code?: string;
  /** A snippet id from miris/snippets.mjs. Typed loosely on purpose: the
   *  snippets live in a plain .mjs file, so there is no exported union to
   *  narrow against. */
  fill?: string;
  /** Required whenever `fill` is set. What the button wrote, and why. */
  explain?: string;
  /** Renders an outbound link as a button, for steps that send you somewhere
   *  else to fetch something. Opens in a new tab: losing the guide mid-step
   *  would cost more than the link saves. */
  link?: { href: string; label: string };
  /** Renders the fal panel opener. */
  panel?: boolean;
  /** Renders the uuid and viewer key form for the active capsule. */
  capsuleUuid?: boolean;
  /** Renders the Write the label button. */
  /** A check id from the CHECKS map in miris/devApi.ts. Done verifies it before
   *  moving on. Steps whose work happens outside the project, signing up or
   *  deploying, deliberately have none. */
  check?: string;
  /** Renders the html-in-canvas path badge. */
  renderPath?: boolean;
  /** One thing to try for whoever finishes early. Shown under the card, never
   *  checked: a step is done when its check passes, stretch or not. */
  stretch?: string;
}

export interface Step {
  num: string;
  title: string;
  subs: Sub[];
}

export const STEPS: Step[] = [
  {
    num: "01",
    title: "Setup",
    subs: [
      {
        num: "1.1",
        title: "Add your fal key",
        body:
          "Sign in at fal.ai, create an API key, and paste it into a file called .env.local at the top of the project. Save it and press Done; the server reads the key on every request, so there is nothing to restart.",
        code: "FAL_KEY=your-key-here",
        link: { href: FAL_KEYS_URL, label: "Open fal keys" },
        check: "falKey",
      },
      {
        num: "1.2",
        title: "Describe your {noun}",
        body:
          "Describe one {noun} in one sentence, or press the dice for a suggestion. Growing takes about twelve minutes and costs real money, so if you already have a series uploaded you can skip ahead.",
        panel: true,
        check: "series",
        explain:
          "A model first decides what kind of animal this is and how it develops, then plans six life stages and renders each one from the one before it. All six meshes build at the same time, so the whole run takes about as long as one.",
      },
    ],
  },
  {
    num: "02",
    title: "Build the room",
    subs: [
      {
        num: "2.1",
        title: "Add the floor",
        body:
          "Add LabFloor between the miris:scene comments in app/stage.tsx. It gives you the deck, the walls, the ceiling lights and the fog.",
        fill: "floor",
        check: "floor",
        explain:
          "LabFloor lives in miris/LabRoom.tsx and combines a scanned metal deck, an inward-facing wall, a ceiling and fog. The repeated ribs and lights are drawn as instances, so they cost one draw call.",
      },
      {
        num: "2.2",
        title: "Add the walkway",
        body:
          "Add LabWalkway after LabFloor. It adds the raised ring you stand on, its lit edges, and the path to the door.",
        fill: "walkway",
        check: "walkway",
        explain:
          "The edge lights are thin rings and boxes with basic materials, so they stay bright without a bloom pass. The door at the end is built from bevelled shapes in miris/LabRoom.tsx.",
      },
      {
        num: "2.3",
        title: "Add the capsules",
        body:
          "Add the specimen map after the walkway. Each entry places one LabCapsule around the ring; the creatures arrive in the next step.",
        fill: "capsules",
        check: "capsules",
        explain:
          "Capsule i sits at angle i times sixty degrees on a 4.2 metre ring, using cosine for x and sine for z. The glass is almost clear, and the glow inside it is a second cylinder with its own shader.",
      },
      {
        num: "2.4",
        title: "Connect the streams",
        body:
          "Add the stream map after the capsules. Each stream needs an asset id and a viewer key, so the tubes stay empty until section 3.",
        fill: "streams",
        check: "streams",
        explain:
          "extend registers MirisStream as a JSX tag, so a stream takes position and rotation like any other object. A low-detail version arrives first and sharpens as more data streams in.",
      },
      {
        num: "2.5",
        title: "Fit each creature to its tube",
        body:
          "Replace the placeholder FitInGlass in the miris:parts block with this version. It measures each stream as it arrives, scales it to fit the glass, and slowly turns it.",
        fill: "fit",
        check: "fit",
        explain:
          "getBounds returns the stream's size in world space, so the fix is a ratio: measure, scale toward what fits, measure again, stop when it settles. The fill prop sets how much of the tube the creature uses.",
      },
      {
        num: "2.6",
        title: "Look around",
        body:
          "There is nothing to paste here; drag to look around the room. In the camera prop on Canvas, the middle number is your eye height and fov is how wide you see.",
        code: "camera={{ position: [0, 1.7, 0.02], fov: 55 }}",
        explain:
          "The camera sits in the middle of the room with its orbit target two centimetres in front of it, so dragging turns you on the spot instead of flying around. That is also why zoom and pan are off here.",
      },
    ],
  },
  {
    num: "03",
    title: "Go live",
    subs: [
      {
        num: "3.1",
        title: "Upload your meshes",
        body:
          "Download the archive from the tray, then sign in at app.miris.com and upload all six .glb files. Wait for processing to finish before the next step.",
        link: { href: PORTAL_URL, label: "Open Miris" },
      },
      {
        num: "3.2",
        title: "Create a viewer key",
        body:
          "In the portal, create a viewer key scoped to just these six assets. That key is the only thing you need to copy.",
        link: { href: PORTAL_URL, label: "Open Miris" },
        explain:
          "A viewer key ships inside your page, so anyone who opens it can read it. Scoping it to six assets means the worst anyone can do is stream your creatures.",
      },
      {
        num: "3.3",
        title: "Fill the capsules",
        code: `const scene = new MirisScene({ viewerKey });
try {
  await scene.ready;
  const assets = await scene.fetchAssets();
  console.table(assets);
} finally {
  scene.dispose();
}`,
        body:
          "Paste your viewer key and press Find my specimens. Check the order reads egg first and adult last, then seal all six.",
        capsuleUuid: true,
        check: "capsuleUuid",
        explain:
          "The form uses MirisScene to look up which assets the key can read, then hands their ids to your streams. Nothing in your scene changes except where the geometry comes from.",
      },
    ],
  },
  {
    num: "04",
    title: "The specimen file",
    subs: [
      {
        num: "4.1",
        title: "Write the file in HTML",
        body:
          "Put this function in the miris:markup block above the return. It builds the specimen file as plain HTML, styled by miris/lab.css.",
        fill: "markup",
        check: "markup",
        explain:
          "The browser lays this out like any web page before it becomes a texture, so the stat bars are just elements with widths. The layout is a fixed 640 by 400 pixels to match the pedestal screen.",
      },
      {
        num: "4.2",
        title: "Turn the HTML into a texture",
        body:
          "Add this under FitInGlass in the miris:parts block. It hands your markup to useHtmlTexture and puts the result on a plane.",
        fill: "file",
        check: "file",
        explain:
          "useHtmlTexture lays the markup out offscreen and paints it into a canvas with drawElementImage, or an SVG fallback where the browser lacks it. That canvas becomes an ordinary three.js texture.",
      },
      {
        num: "4.3",
        title: "Show it on the pedestal",
        renderPath: true,
        body:
          "Put these two lines in the miris:card block inside Canvas. Click a tube to walk up to the creature, click a screen to read its file, and press Escape to come back.",
        fill: "card",
        check: "cardOverlay",
        explain:
          "Pedestals places a screen in front of each tube and asks your File component to paint that specimen's file onto it. Clicks are tested against projected outlines, so none of your meshes needs a handler.",
      },
    ],
  },
  {
    num: "05",
    title: "The readout",
    subs: [
      {
        num: "5.1",
        title: "Add the readout",
        body:
          "Add this line in the miris:hud block, outside the Canvas. It adds the header, the specimen count, and brackets around whatever your pointer is over.",
        fill: "hud",
        check: "hud",
        explain:
          "The brackets are plain HTML positioned from the capsule outlines projected to the screen each frame. It has to sit outside the Canvas, or it would float in the scene instead of staying pinned to the window.",
      },
      {
        num: "5.2",
        title: "Read the budget",
        body:
          "The readout shows how many splats are drawn, the current budget, and the frame time. Pin the budget at 40k, compare it with a higher one, then press Release to let the controller take over again.",
        explain:
          "The adaptive controller raises and lowers the total splat budget from the frame time, and the engine spends that budget where the camera is looking. Pinning the slider switches the controller off until you release it.",
      },
      {
        num: "5.3",
        title: "Add the screen effect",
        body:
          "Add this line at the bottom of app/stage.tsx, outside the Canvas, in the miris:effect block. Nothing changes until the next step gives it a shader.",
        fill: "effect",
        check: "overlay",
        explain:
          "TSL cannot run in the same canvas as the streams, so ScreenFx draws the effect in a hidden canvas of its own and copies it onto the selected pedestal screen. The other screens keep their plain texture, so the copy costs one screen, not six.",
      },
      {
        num: "5.4",
        title: "Write the glitch shader",
        body:
          "Put this in the miris:field block above the return. It gives the selected screen scanlines, a blue phosphor tint, a faint flicker and the occasional signal tear.",
        fill: "field",
        check: "field",
        explain:
          "Each call here builds a node in a shader graph instead of computing a pixel, and the graph runs on the GPU for every pixel of the screen. hash turns the clock into a value that holds still for a moment, which is how a tear can stay in one place while it lasts.",
      },
    ],
  },
  {
    num: "06",
    title: "Ship it",
    subs: [
      {
        num: "6.1",
        title: "Publish it",
        body:
          "Press Publish in Bolt, wait for your link, and send it to someone. Open it on a phone, tap a tube and a pedestal, then press Finish.",
        explain:
          "The published build has no dev server, so it reads a snapshot of your scene data written at build time. Everything else is the code you wrote in app/stage.tsx.",
      },
    ],
  },
];
