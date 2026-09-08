import type { Sub as TechnicalSub } from './technicalCurriculum';

export interface Sub extends TechnicalSub {
  activity?: 'experiment' | 'attribution' | 'source' | 'keys' | 'design' | 'connect' | 'story' | 'tradeoff' | 'publish' | 'reflection';
  prompt?: string;
  observe?: string;
  variation?: string;
  evidence?: string;
}
export interface Step { num:string; title:string; time:string; outcome:string; subs:Sub[]; }

export const STEPS: Step[] = [
  { num:'01', title:'Discover your assets', time:'0–15 min', outcome:'Use a scoped viewer key to discover the content you will build with.', subs:[
    { num:'1.1', title:'Choose your content', activity:'source', check:'workshop:source',
      body:'Choose the prepared six-specimen series, bring processed Miris assets, or start an optional generation run. Prepared assets let everyone build without a generation account or payment. The opening film shows the destination; your stage starts incomplete. Open app/stage.tsx in the editor and find its miris: marker blocks.',
      explain:'You will ask an agent for a small code change, inspect it, make a personal variation, and observe it running. The prepared series supplies content; you write its SDK integration, scene, dossier and shader. Keep building with prepared assets while any generation or upload finishes.' },
    { num:'1.2', title:'Discover with a viewer key', activity:'keys', check:'workshop:keys',
      code: `const scene = new MirisScene({ viewerKey });
try {
  await scene.ready;
  const assets = await scene.fetchAssets();
  console.table(assets);
} finally {
  scene.dispose();
}`,
      body:'Use the prepared series key or a viewer key scoped to your processed assets. Run discovery, inspect the returned asset names and IDs, and confirm the six you intend to display in order. Read the MirisScene code shown here: construct with the viewer key, await ready, then call fetchAssets. Identify which returned ID will be your first stream.',
      explain:'MirisScene owns the SDK scene connection. ready waits for its initialization; fetchAssets lists assets the key can read. A viewer key is browser-readable and should be scoped to the assets you intend to publish. It is separate from a service authentication token or a fal key. Discovery changes the display bank without replacing your generation run or archive.' },
  ]},
  { num:'02', title:'Extend the SDK scene', time:'15–35 min', outcome:'Build a MirisScene subclass and compose the laboratory around it.', subs:[
    { num:'2.1', title:'Write LaboratoryScene', fill:'sdk', check:'build:sdk', evidence:'sdk',
      body:'Ask your agent to implement the SDK factory in app/stage.tsx. Inspect the class declaration and the method it adds. The supplied lifecycle hook uses your factory to create the actual scene passed to Canvas, waits for it to be ready, and disposes it when its lifetime ends.',
      prompt:'In app/stage.tsx, implement only the miris:sdk block. Read the installed @miris-inc/three declarations and the stage hook contract first. Define class LaboratoryScene extends MirisScene with constructor(viewerKey: string) calling super({ viewerKey }) and setting this.name to Sublevel 7. Add specimenPosition(index: number): [number, number, number], arranging six positions on a 4.2 metre circle at height 1.66. Define const createLabScene = (viewerKey: string) => new LaboratoryScene(viewerKey); do not export it. Use the explicit viewer key; do not add a fallback. Preserve every other marker and the supplied lifecycle hook. Explain how the subclass reaches Canvas.',
      explain:'LaboratoryScene extends MirisScene is JavaScript inheritance: you add a domain method to an SDK scene. extend({ MirisStream }) is different: it registers an SDK object with React Three Fiber so JSX can construct it. Your stream code will call specimenPosition instead of repeating the placement calculation.',
      variation:'Change the returned height from 1.66 to 1.6 metres, keeping the horizontal circle unchanged. Predict where your first stream will sit, and check the prediction in chapter 3.',
      observe:'The stage initializes without an SDK error after key discovery. Inspect Canvas and identify where the LaboratoryScene instance enters it. Record your position prediction; the room arrives with your next edit.' },
    { num:'2.2', title:'Compose the room', fill:'room', check:'build:room', evidence:'room',
      body:'Build the setting for your streams. Add the supplied floor and walkway components to the scene block, then inspect the two JSX elements your agent wrote.',
      prompt:'In app/stage.tsx, fill miris:scene with <VaultFloor floor={floor} /> and <VaultWalkway walk={walk} wear={wear} />. Use a fragment if the existing JSX position requires it. Preserve the SDK factory, camera, lifecycle, guards and other markers. Explain which scene elements these two components provide.',
      explain:'The room is ordinary three.js geometry composed through React Three Fiber. Miris supplies the asset streaming connection. Reusable workshop components keep the geometry manageable while you decide how to assemble the experience.',
      variation:'Change the existing floorMaps repeat argument from 14 to 8, or another nearby value. Keep the room dimensions unchanged and compare the apparent tile size.',
      observe:'A metal room and lit walkway appear. Describe the surface change caused by your repeat value.' },
    { num:'2.3', title:'Add six empty capsules', fill:'capsules', check:'build:capsules', evidence:'capsules',
      body:'Map your specimen records into physical housings. Keep the room you just built and add the capsule map after it.',
      prompt:'In app/stage.tsx, preserve VaultFloor and VaultWalkway in miris:scene and append specimens.map((s, i) => <VaultCapsule key={s.id} index={i} />). Do not add streams yet. Preserve every other block and explain why the key and index serve different purposes.',
      explain:'The record ID provides a stable React key. The index selects a position around the room. A capsule is a housing; adding it does not subscribe to a Miris asset.',
      variation:'Temporarily use specimens.slice(0, 3) for the housing map. Observe which capsules disappear, then restore all six before continuing.',
      observe:'Six empty housings surround the walkway. Record how the three-record variation changed the room.' },
  ]},
  { num:'03', title:'Stream & fit', time:'35–55 min', outcome:'Connect one asset, expand to six, and fit streamed bounds to the glass.', subs:[
    { num:'3.1', title:'Connect your first stream', fill:'singleStream', check:'build:singleStream', evidence:'singleStream',
      body:'Connect the first discovered asset. Inspect the asset ID, viewer key and position in the code before checking the rendered result.',
      prompt:'In app/stage.tsx miris:scene, preserve the floor, walkway and six housings. Add only the first specimen as a mirisStream inside FitInGlass. Skip records without a uuid. Pass args={[{ uuid: s.uuid, viewerKey: data.viewerKey }]} and obtain its position from scene.specimenPosition(i), using index 0. Keep the provided reduced-motion-aware rotation speed. Do not substitute a demo viewer key. Explain how extend({ MirisStream }) enables the JSX element.',
      explain:'The uuid selects the asset; the viewer key authorizes browser access to it. The stream is a scene object that can receive transforms. Your LaboratoryScene method places it consistently with the housing. The initial FitInGlass helper only positions it; the bounds exercise adds sizing.',
      variation:'Add a small rotation prop to the mirisStream, such as rotation={[0, 0.3, 0]}, and compare its orientation.',
      observe:'One specimen streams into the room. Identify its capsule and describe the orientation change; it may not fit its housing yet.' },
    { num:'3.2', title:'Expand to six streams', fill:'streams', check:'build:streams', evidence:'streams',
      body:'Turn the single connection into a data-driven map. Trace one record all the way from discovery through uuid and viewerKey to its position.',
      prompt:'In app/stage.tsx miris:scene, preserve the room and capsule map. Replace the single stream with a map over all specimens, skipping records without uuid. Give each FitInGlass a stable key combining record id and uuid, position={scene.specimenPosition(i)}, fill={0.7}, and the existing reduced-motion-aware speed. Each mirisStream must use its own s.uuid and explicit data.viewerKey. Preserve other blocks and explain which values are shared and which vary.',
      explain:'The same integration now serves six records. Each stream has an asset ID; the scoped viewer key is shared. These streams share the renderer’s adaptive splat budget rather than each receiving an independent fixed allowance.',
      variation:'Apply a small alternating rotation to the streams using the map index. Keep record order and the scene placement method unchanged.',
      observe:'All six discovered specimens appear. Describe which value makes one stream different from its neighbors.' },
    { num:'3.3', title:'Fit the arriving bounds', fill:'fit', check:'build:fit', evidence:'fit',
      body:'Implement FitInGlass in the parts block. Read the bounds calculation and identify why a full turn needs more than the object’s width at one angle.',
      prompt:'In app/stage.tsx miris:parts, implement FitInGlass with separate outer turntable and inner fitting groups. In useFrame, find the stream and call getBounds; wait for valid positive bounds. Scale and recenter toward the tighter of glass height 2.6*fill and horizontal diagonal allowance 1.8*fill. Bounds are world-space and include current scale, so apply a proportional correction. Settle within one percent, then rotate only the outer group using capped frame delta and speed. Preserve later helpers if present and all other markers. Respect the caller’s reduced-motion speed.',
      explain:'getBounds reports the current world-space size and center. Fitting the horizontal diagonal keeps a broad specimen inside the glass as it turns. Settling avoids resizing forever; frame-delta rotation keeps speed independent of frame rate.',
      variation:'Change one stream’s fill from 0.7 to 0.6 through the map prop. Compare its clearance with a neighbor and keep your preferred value.',
      observe:'The streams center and settle inside their tubes. Record the effect of your fill change and why the diagonal matters.' },
  ]},
  { num:'04', title:'Build a physical dossier', time:'55–80 min', outcome:'Write HTML, paint it into a texture, and mount it inside the scene.', subs:[
    { num:'4.1', title:'Write the dossier HTML', fill:'markup', check:'build:markup', evidence:'markup',
      body:'Write fileMarkup in app/stage.tsx. Use the supplied dossier data and CSS classes to create a readable 640 by 400 terminal record. Inspect the generated HTML before it becomes a texture.',
      prompt:'Implement fileMarkup(d) in app/stage.tsx miris:markup. Return HTML using mw-dossier mw-screen and the existing dossier CSS classes: terminal header, designation, series, name, classification, stage strip with d.index active, current stage, stats, notes and footer. Use escapeMarkup for free text. Read the dossier shape and existing CSS first; do not change workshop machinery. Keep the layout inside 640 by 400 pixels and preserve other markers.',
      explain:'This function describes a web document. The browser lays out its text and CSS; the next step turns those pixels into a surface inside the 3D room. Escaping free text keeps names and observations from becoming unintended markup.',
      variation:'Write your own terminal header and field-observation heading directly in fileMarkup. Keep all record values connected.',
      observe:'Inspect the function’s returned HTML and identify where your words enter it. The physical terminal appears after the next two code steps.' },
    { num:'4.2', title:'Paint HTML into a texture', fill:'file', check:'build:file', evidence:'file', renderPath:true,
      body:'Add a File component beside FitInGlass in the parts block. Trace the markup into useHtmlTexture, then trace the returned texture into the mesh material.',
      prompt:'In app/stage.tsx miris:parts, preserve FitInGlass and add function File({ html }: { html: string }). Call useHtmlTexture(html), return null until texture exists, then render a planeGeometry with the returned width and height and a meshBasicMaterial using map={texture} and toneMapped={false}. Preserve other blocks. Explain the native HTML-in-Canvas route and the supplied SVG fallback by reading useHtmlTexture.',
      explain:'The helper detects whether native HTML-in-Canvas painting is available here and otherwise uses an SVG fallback. Both produce pixels for a three.js texture. This is separate from Miris asset streaming. The path badge reports this browser’s selected route; no experimental flag is required to finish.',
      variation:'Add a subtle color tint such as color="#d9efff" to meshBasicMaterial. Predict how it will multiply the painted colors; compare it with white after mounting the file.',
      observe:'The new component compiles. Record the reported painting path and your tint prediction; the next step mounts File so you can compare it.' },
    { num:'4.3', title:'Mount and read the file', fill:'card', check:'build:card', evidence:'card',
      body:'Connect the HTML and texture component to the physical pedestals. Select a specimen and use Read file to approach its terminal.',
      prompt:'In app/stage.tsx miris:card, add <Dossier specimens={specimens} /> and <Pedestals specimens={specimens}>{(d: any) => <File html={fileMarkup(d)} />}</Pedestals>. Preserve other blocks, including File and fileMarkup. Explain how the render callback connects each dossier record to its own HTML texture.',
      explain:'The callback supplies a record, fileMarkup formats it, and File paints and mounts it. These are physical screens in the room. Selecting a specimen chooses the file; Read file moves the visitor close enough to inspect it.',
      variation:'Return to fileMarkup and shorten one of your headings after reading it on the pedestal. Keep the version that is easier to read at that size.',
      observe:'Read your custom heading on a pedestal, then select another specimen and confirm its record changes. Record what you adjusted for legibility.' },
  ]},
  { num:'05', title:'Shade & measure', time:'80–100 min', outcome:'Write a TSL screen graph, apply it, and observe a rendering tradeoff.', subs:[
    { num:'5.1', title:'Write the TSL graph', fill:'field', check:'build:field', evidence:'field',
      body:'Build the blue CRT effect in the field block. Follow the graph from UV coordinates through the painted screen sample to the returned color.',
      prompt:'In app/stage.tsx miris:field, define glitch with useMemo(() => Fn(() => { ... })(), []). Use the imported three/tsl nodes and screen texture. Sample screen at UVs, add a small intermittent horizontal displacement, derive luminance, and combine restrained scanlines, flicker and edge falloff with a blue phosphor tint vec3(0.48, 0.78, 1). Return vec4(color, float(1)). Preserve all other blocks. Explain which values affect coordinates and which affect color.',
      explain:'TSL expresses a shader as a graph of typed operations. uv and time are shader inputs; texture reads the painted dossier. Constructing a graph does not display it. The next edit connects the graph to a renderer.',
      variation:'Change the scanline strength or blue tint in the graph. Keep the letters readable and explain which operation you changed.',
      observe:'The graph compiles. Trace your changed value to the returned color; compare the visible effect once you wire it in the next step.' },
    { num:'5.2', title:'Apply the graph to a screen', fill:'effect', check:'build:effect', evidence:'effect',
      body:'Mount ScreenFx with your graph and select a pedestal. Compare the moving image with the still-painted file on the other five screens.',
      prompt:'In app/stage.tsx miris:effect, add <ScreenFx node={reducedMotion ? null : glitch} />. Preserve all other blocks. Read ScreenFx and Pedestals, then explain how the selected file texture becomes the graph input and the completed effect frame reaches its pedestal. Keep reduced motion and the durable painted fallback.',
      explain:'A separate renderer draws your graph and copies each completed frame into a persistent canvas. Only the selected screen receives the animated result; the other screens keep the painted file. If the effect cannot run or reduced motion is enabled, the readable file remains.',
      variation:'Adjust one parameter in your field graph after seeing it on the pedestal. Compare before and after from the same camera position.',
      observe:'The selected terminal shows your blue CRT treatment while other terminals remain still. Record your visible change and check that text stays readable.' },
    { num:'5.3', title:'Build the readout and test a budget', fill:'hud', check:'build:hud', evidence:'hud', activity:'tradeoff',
      body:'Add the laboratory readout in code. Predict what lowering the splat budget will change, compare low and high budgets from the same viewpoint, and record what you actually see. Release the pinned budget when finished.',
      prompt:'In app/stage.tsx miris:hud, mount <LabHud specimens={specimens} title={data.labDesign?.title} />. Preserve every other marker. Read the budget controls and explain why pinning stops the adaptive controller and Release starts it again. Do not alter SDK internals.',
      explain:'The splat budget limits rendered specimen detail; it is not a network-speed knob. The frame-time readout comes from the render loop and includes the scene and device load. Compare the same view and describe observations without treating this as an isolated GPU benchmark.',
      variation:'Set the LabHud title prop to a short laboratory name of your own in the code. Keep the specimens prop connected.',
      observe:'Your named readout appears. Save a low-versus-high budget observation, then confirm the budget is released back to automatic control.' },
  ]},
  { num:'06', title:'Publish & share', time:'100–120 min', outcome:'Test a public scene on a phone and explain the APIs you used.', subs:[
    { num:'6.1', title:'Publish and test the public link', activity:'publish', check:'workshop:publish',
      body:'Publish from your workspace host, or run npm run build and deploy dist to a static host. Open the public link outside the editor and on a phone. Check a stream, select a different specimen, drag and pinch, use Read file, and return to Overview. Check your custom text and shader, then save the working link.',
      explain:'The build snapshots the displayed assets and scene design, and hides the guide. Your code is part of the application build. Viewer keys remain browser-readable; fal credentials and generation archives are not part of the scene snapshot. Saving the link records your verification; the guide does not test the host remotely.' },
    { num:'6.2', title:'Share your code and takeaway', activity:'reflection', check:'workshop:reflection',
      body:'Exchange links with a neighbor and ask them to find your custom terminal. Show them LaboratoryScene.specimenPosition, one MirisStream connection, and the TSL value you changed. Explain how viewer-key discovery, SDK streaming and HTML texture painting fit together. Record their observation and a small project you could build next. Working solo? Test in another browser or device and record that result.',
      explain:'You have a reusable integration: a scoped viewer key, a MirisScene subclass, MirisStream objects placed by your extension, bounds fitting, an HTML texture, and a shader graph applied to a scene surface. Your next experiment can start with one asset and one interaction.' },
  ]},
];
