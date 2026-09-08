# Spatial Streaming

A two hour, agent-assisted coding workshop. Build a laboratory with the Miris
SDK: discover assets with a scoped viewer key, extend `MirisScene`, connect
streams, paint HTML onto physical pedestals, write a TSL screen effect, and
publish a scene someone else can visit.

```sh
npm install
npm run dev
```

Follow the guide with `app/stage.tsx` open. Each coding exercise asks you to
prompt your agent, inspect the diff, make a personal change, run it, and save
an observation. Prepared specimens remove the need to pay for generation.
Writing and understanding the integration is the workshop.

## The two hour build

| Time | Required work | Result |
|---|---|---|
| 0–15 min | Choose content; initialize `MirisScene`, await `ready`, inspect `fetchAssets` | An explicit scoped viewer key and confirmed asset list |
| 15–35 min | Write `LaboratoryScene extends MirisScene`; compose room and capsules | An SDK subclass used by the actual Canvas scene |
| 35–55 min | Add one `MirisStream`, map six, fit their bounds | Assets placed by your `specimenPosition` method |
| 55–80 min | Write dossier HTML; call `useHtmlTexture`; mount a `File` on pedestals | Readable HTML inside the 3D room |
| 80–100 min | Write and apply a TSL graph; build a readout and compare budgets | A personal blue CRT effect and a recorded tradeoff |
| 100–120 min | Publish; test on a phone; exchange links and explain your code | A public experience and a reusable SDK integration |

The opening film shows the completed reference, not the attendee starting
state. `app/stage.tsx` starts incomplete and matches
`miris/stage.template.tsx`, which reset restores. The completed implementation
is `miris/stage.reference.tsx`. Recovery snippets can restore a missing lesson
block; after using one, inspect it, make the required variation, and observe
it running. A successful insertion alone is not an exercise outcome.

Prepared content comes from `miris/fixtures.json`. Attendees still perform
viewer-key discovery and confirm the asset order. Viewer keys are deliberately
browser-readable and should be scoped to the assets being shared. Do not use
service authentication tokens or fal credentials as viewer keys.

The display bank (`previewSeries`) is separate from optional generation data.
Choosing or discovering display assets does not erase a paid run or its archive;
submitted generation jobs can continue while you build.

## Before you arrive

- Bring a laptop, a browser and a charger. Local development requires Node 20
  or newer; Bolt supplies its own environment.
- Prepared specimens require no generation account or payment. Presenters should
  verify their configured viewer key and all six assets on the venue network.
- If bringing your own assets, upload and process them in Miris ahead of time
  and create a viewer key scoped to those assets. Use the prepared series if
  processing is delayed.
- Optional generation needs a fal.ai account, billing and `FAL_KEY` in
  `.env.local`. The guide explains setup. Costs and processing times vary;
  generation is not on the critical path of the two hour build.
- HTML-in-Canvas is a required coding topic. The runtime detects the native
  painting route and has an SVG fallback, so an experimental browser flag is
  not required to complete the exercise.

Presenter timing, recovery steps and acceptance criteria are in
[the facilitator guide](docs/facilitator-sdk-workshop.md).

## What it is

React, Vite, React Three Fiber and drei. Not Next: the App Router cannot run
in WebContainer, which is where most attendees run this.

- `app/stage.tsx` is your file. It ships with `miris:` marker comments and the
  guide can write recovery snippets between them. Normal exercises use your
  editor and agent; preserve markers so lesson checks and reset keep working.
- `app/main.tsx` mounts the stage and the guide. The guide hides in a published build, so removing it is optional.
- `miris/` is the workshop's machinery: the guide, the curriculum, the
  snippets, the dev API that proxies fal, and a handful of scene helpers.
  Nothing in it needs editing to finish the workshop.

### Money and time

The image renders cost cents. Each mesh is about $1.40 and four to five
minutes on fal's `meshy/v7/image-to-3d`; the six renders run in series, each
one editing the last so the creature stays the same creature, and each mesh
starts the moment its render lands. Wall clock is about twelve minutes and
the tray keeps a stage list and a running total while it works.

The workshop's dev server reads `FAL_KEY` from `.env.local` on every request,
so there is nothing to restart when you add it.

## For presenters

### Rehearsing without spending

`MIRIS_OFFLINE=1` in `.env.local` replays a recorded run from
`miris/fixtures.json` instead of calling fal. `hatch` and `label` return
instantly, and a **Seed the lab** control appears bottom left that fills all
six capsules with the recorded specimen in one press. Everything after the
twelve minute wait can be rehearsed in seconds. The archive it writes is
`miris/specimens.offline.zip`, six tiny synthetic cubes, so a rehearsal can
never overwrite a paid run.

Offline is never inferred from a missing key: "FAL_KEY is not set" is a
sentence attendees are meant to see.

### The prepared series

`miris/fixtures.json` contains a recorded deep-sea series with six real asset IDs,
dossiers, and its scoped viewer key. The content chooser makes it available, then the key-discovery exercise
confirms the assets before you connect streams in code. Verify the
assets remain accessible before each session. Offline synthetic cubes remain
separate from this real streaming demonstration.

### The SDK is vendored, and the pin is not negotiable

```
@miris-inc/core   0.0.9-budget-lab.bd3d02d
@miris-inc/three  0.0.9-budget-lab.bd3d02d
```

Both tarballs are in `vendor/` and `package.json` installs from there. This is
an unreleased build carrying the adaptive splat budget, which six streams at
once need. A clone without `vendor/` fails `npm install` outright, and a
machine with them in its npm cache can hide that, so test with
`npm install --cache $(mktemp -d)`. `three` is pinned to `0.185.0`, the
version the SDK was built against; the SDK bundles its own copy too, so the
console warns about multiple instances, which is expected.

Three small components in `miris/` handle the vendored SDK’s rendering
integration, and `AGENTS.md` records what each one fixes:
`HdrGuard` (everything that is not a splat went dark), `BudgetGuard` (the
adaptive budget does not start itself), `GlassOrder` (glass and splats cannot
be depth sorted against each other). If the SDK fixes these, the guards go.

### Renderer settings that are not style choices

`alpha: true`, `antialias: true`, `NoToneMapping`, `dpr` capped at 1.5,
`powerPreference: "high-performance"`. Splats are fill-rate bound and the SDK's
composite depends on the first two. Tone mapping is off because the SDK's HDR
pass, not the curve, was what darkened the room; `HdrGuard` switches that pass
off and ACES could come back.

### Publishing

The dev API is Vite middleware, so a built site has no endpoint behind it:
nothing there can spend a fal key or rewrite a file. `miris/snapshot.ts` writes
the currently displayed specimens and saved design to `dist/miris-scene.json` at build
time. Generation metadata and workshop reflections are excluded. Production
builds explicitly omit the guide, independently of the static host’s content
type headers. Keeping the guide mounted in the source is harmless.

### Publishing the public starter repository

`origin` is private. Publishing the starter source is a separate maintainer
operation from deploying an attendee’s `dist` directory. Never push the private
history directly to the public starter. Use a temporary clone and filter history
before the force push, as documented in `AGENTS.md`:

```sh
git clone --single-branch -b <branch> . /tmp/pub
cd /tmp/pub
git filter-repo --force --invert-paths \
  --path docs --path miris-web-kit --path miris/kit --path dist \
  --path-glob '*SKILL.md' --path-glob '*voice.md'
```

Verify the filtered paths against **every commit**, including older locations
such as `public/kit/`. Then add the public repository as a remote in that
throwaway clone and publish the filtered branch to its `main`. Keep `vendor/`
and both SDK tarballs in the public history. A clean tip alone does not prove
that internal documents were removed from history.

### Known risks

**Miris endpoint latency.** `app.miris.com/.well-known/jwks.json` cold-starts
at six to nine seconds and the engine's own fetch gives up during one. Forty
people starting at once on conference wifi is exactly that condition. Rehearse
under load.

**fal per-key concurrency is unverified on a fresh account.** The chain runs
six meshy jobs in parallel. If a new key serialises them, twelve minutes
becomes thirty and the arc does not fit.

**Per-attendee Miris signup, upload and processing at scale is untested.**
Use processed assets or the prepared series for the required build. Do not let
a processing queue consume time reserved for coding or publishing.

**Laptops on battery drop to 30fps.** Say so out loud at the start.

### Testing

Browser verification lives outside this repo so a fork carries no Playwright:
see `verify-stage.mjs` and `measure-seat.mjs` in the sibling `miris-atelier`
checkout. `AGENTS.md` carries the measurement method for frame costs.

## Mobile and shared-link acceptance

The shared scene includes touch navigation independently of the guide: choose a
specimen, drag to orbit, pinch to zoom, return with Overview, and open Read file
to approach the physical pedestal terminal. Pinch to inspect its text, then
use Specimen to return to the capsule. The guide becomes a compact sheet on phones;
Explore scene hides it and Guide brings it back. No keyboard is needed to visit.

Small screens and coarse pointers use a pixel ratio of 1 while Miris keeps its
adaptive splat budget. Their selected terminal effect uses a 640×400 canvas at
20 Hz. Reduced-motion preferences stop specimen rotation, camera travel and the
CRT animation. Pedestal painting has a fallback when native HTML-in-Canvas is
unavailable; the file remains on the pedestal in the live scene. A readable HTML record
is available only in the recovery view when the 3D scene cannot open.

Before sharing, open the actual HTTPS deployment on iPhone Safari and Android
Chrome. Check portrait and landscape, all six specimens, a pinch/drag, Overview,
Read file pedestal framing and return to Specimen, browser toolbar resizing, and a reload over a
mobile connection. Confirm the guide and API-dependent controls are absent.
Viewport emulation checks layout; it does not establish physical phone GPU,
memory, thermal or browser compatibility. Modern WebGL2-capable browsers are
required for the live 3D scene; no experimental HTML-in-Canvas flag is required.
