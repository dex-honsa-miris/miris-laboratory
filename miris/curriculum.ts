import type { Sub as TechnicalSub } from './technicalCurriculum';
export interface Sub extends TechnicalSub { activity?: 'experiment' | 'attribution' | 'source' | 'design' | 'connect' | 'story' | 'tradeoff' | 'publish' | 'reflection'; }
export interface Step { num:string; title:string; time:string; outcome:string; subs:Sub[]; }

export const STEPS: Step[] = [
  { num:'01', title:'Experience Miris', time:'0–10 min', outcome:'See what streaming changes before setting anything up.', subs:[
    { num:'1.1', title:'Meet a stream', activity:'experiment', check:'workshop:firstStream',
      body:'The laboratory is already built. These are real prepared assets streaming through Miris. Click a capsule to approach it; press Escape to return. Predict what happens when the available detail is reduced, then try it and describe what you actually see.',
      explain:'Miris supplies the streamed specimens. The room, lights and interaction are ordinary three.js scene elements. The render budget limits how much specimen detail the engine draws; it is not a network-speed control. Your observation may vary with the asset, viewpoint and device.' },
    { num:'1.2', title:'Know what each part does', activity:'attribution', check:'workshop:attribution',
      body:'A complete experience uses several tools. Identify the part Miris supplies so you can reuse it with assets and environments of your own.' },
  ]},
  { num:'02', title:'Make it yours', time:'10–30 min', outcome:'Choose your specimens and make a personal design decision.', subs:[
    { num:'2.1', title:'Choose your starting point', activity:'source', check:'workshop:source',
      body:'Prepared specimens let you complete the entire workshop without a generation account or payment. You can also generate your own creature or connect assets you already own. Your current display stays available while a generation run works in the background.' },
    { num:'2.2', title:'Direct your laboratory', activity:'design', check:'workshop:design',
      body:'The room is your supplied foundation. Give it a name and choose how people look at your specimens. Save, explore the result, and decide whether the pace and lens suit your creature.',
      explain:'These choices change ordinary scene behavior around the streams. MirisStream can live alongside familiar camera, lighting and transform controls. You can inspect the corresponding code in the optional code studio.' },
  ]},
  { num:'03', title:'Connect & curate', time:'30–55 min', outcome:'Connect a content source and give a specimen its own story.', subs:[
    { num:'3.1', title:'Bring your content into the room', activity:'connect', check:'workshop:connected',
      body:'If you chose prepared specimens, they are already connected. If you are bringing your own, upload the assets to Miris, wait for processing, then create a viewer key scoped to those assets. Connect that key here. If processing is taking too long, keep going with the prepared series.',
      explain:'A viewer key is designed to be readable by the browser. Scope it to the assets you intend to share. The SDK connects the asset id and viewer key to your scene; the workshop adds the room and interaction. Generation and Miris processing are separate jobs.' },
    { num:'3.2', title:'Give a specimen a story', activity:'story', check:'workshop:story',
      body:'Pick one capsule. Give its occupant a name and write a short field observation: what should a visitor notice or wonder about? Save it, then click that pedestal to read your words inside the room.',
      explain:'The pedestal shows ordinary HTML painted into the scene. This web-platform feature is separate from Miris streaming. The supplied version works with a fallback; experimenting with HTML-in-Canvas and shaders is optional.' },
  ]},
  { num:'04', title:'Explore the tradeoff', time:'55–90 min', outcome:'Explain a visible streaming tradeoff, then follow your curiosity.', subs:[
    { num:'4.1', title:'Spend detail where it matters', activity:'tradeoff', check:'workshop:tradeoff',
      body:'Predict which specimen will retain the most useful detail on a small budget. Compare a low and high budget from the same viewpoint, then approach another capsule. Record what changed and one reason you would use streaming in your own project. Release the budget when finished.',
      explain:'Frame time here comes from the render loop, not an isolated GPU benchmark. It also reflects the host scene and device load. This exercise makes the tradeoff observable; it does not claim a fixed speedup over another delivery method.',
      stretch:'Finished early? Open the code studio below. Explore the SDK integration, HTML-in-Canvas or the blue CRT graph. Save the final 30 minutes for publishing and sharing.' },
  ]},
  { num:'05', title:'Publish your world', time:'90–105 min', outcome:'Open a working public link outside your editing session.', subs:[
    { num:'5.1', title:'Give the laboratory an address', activity:'publish', check:'workshop:publish',
      body:'In Bolt, press Publish and wait for the public link. Open that link in a new tab and check that a capsule loads and a pedestal can be read. If running locally, build with npm run build and deploy the dist folder to your static host. Save your working link here.',
      explain:'The build snapshots the currently displayed specimens and design. Your fal key stays on the development server. The workshop guide hides in the published experience. Saving a link here records your own verification; the guide does not remotely test the hosting service.' },
  ]},
  { num:'06', title:'Share & take it further', time:'105–120 min', outcome:'Get a visitor’s response and connect Miris to your next project.', subs:[
    { num:'6.1', title:'Let someone else step inside', activity:'reflection', check:'workshop:reflection',
      body:'Exchange links with a neighbor. Ask them to find your named specimen and tell you what they noticed. Try a second device if one is available. Then explain Miris’s role in your own words and name a project where you could use it. Working solo? Open the link on another browser or device and record that observation.' },
  ]},
];
