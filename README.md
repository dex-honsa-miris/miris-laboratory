# Spatial Streaming

A two hour workshop for a mixed audience. Explore real Miris streams, choose
prepared specimens or create your own, personalize a laboratory, and publish
an experience you can share.

```
npm install
npm run dev
```

Then follow the guide. Start with a real stream, personalize the supplied room,
and publish. The optional code studio explains the implementation.

## The core journey

This branch starts with the completed room as a supplied foundation. Attendees
make it their own through a name, a viewing style, specimen curation, and a
published experience. Code and paid generation are optional.

| Time | Core activity | Takeaway |
|---|---|---|
| 0–10 min | Enter the real prepared lab; predict, change the budget, observe | What Miris streaming contributes |
| 10–30 min | Choose prepared, generated, or existing assets; personalize the lab | Ownership without a setup gate |
| 30–55 min | Connect assets when ready; name a specimen and write its observation | Content, delivery, and presentation are separate |
| 55–90 min | Compare budgets and viewpoints; optionally explore the code studio | A concrete tradeoff and an integration starting point |
| 90–105 min | Publish and check a public link | A working experience outside the editor |
| 105–120 min | Exchange links, try another device, record takeaways | A visitor’s response and a next-project idea |

Every attendee can finish with the prepared six-stage series. Entering the lab
uses the recorded real UUIDs and their scoped viewer key from `miris/fixtures.json`.
It does not call fal, require an account, or create an archive. Existing specimen
data is preserved when entering the new flow. The visible `previewSeries` is
separate from an optional generation run, so switching to prepared specimens does
not erase a paid run; submitted jobs keep running in the background.

The ordinary guide leads through the core activities. **Optional code studio**
contains the original technical lessons for SDK integration, scene construction,
HTML-in-Canvas, and TSL. Those lessons are references, not gates to publishing.
The complete reference copy lives in `miris/technicalCurriculum.ts`.

## Before you arrive

- Use a laptop, a current browser, and a charger. Running locally requires Node
  20 or newer; in Bolt the environment is supplied.
- Prepared specimens need no generation account or payment. Have presenters
  verify the configured viewer key and all six streams on the venue network.
- For **optional generation**, prepare a fal.ai account with billing and a key.
  The guide explains `.env.local`; the key is needed only when Grow is pressed.
  Budget roughly twelve dollars and twelve minutes for the workshop’s six-stage
  run, with actual cost and duration depending on the services.
- For **your own uploads**, create a Miris account before the session if possible.
  You can still complete the workshop with prepared specimens if processing stalls.
- The experimental Chrome HTML-in-Canvas flag is only relevant to the optional
  code studio. The supplied fallback is sufficient for the core journey.

## Presenter priorities

Show the actual lab immediately after the opening film. Ask for predictions
before moving the budget controls; ask for observations before explaining the
result. Clearly attribute generation to its model providers, asset processing
and streaming to Miris, and the room/interface to React and three.js.

Do not wait for generation before continuing. At minute 90, move everyone to
publishing; the guide offers a finale shortcut and a reminder. Protect the final
half hour for opening a real public link and exchanging visitor feedback.

Rehearse with a mixed audience, on the venue network and representative devices.
Record time to first visible stream, setup failures, core completion, successful
public links, and whether participants can explain Miris’s role without prompting.
The budget exercise is an observation activity, not a benchmark. Any comparison
with conventional loading needs matched conditions and explicit quality differences.

## What it is

React, Vite, React Three Fiber and drei. Not Next: the App Router cannot run
in WebContainer, which is where most attendees run this.

- `app/stage.tsx` is your file. It ships with `miris:` marker comments and the
  guide writes between them when you press **Or paste it for me**. Everything
  outside the markers is yours and is never touched.
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
dossiers, and its scoped viewer key. The core flow uses it immediately;
`FALLBACK_KEYS` also exposes that key in the optional asset chooser. Verify the
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

Three small components in `miris/` exist to make the SDK behave inside an
ordinary three.js scene, and `AGENTS.md` records what each one fixes:
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

### Known risks

**Miris endpoint latency.** `app.miris.com/.well-known/jwks.json` cold-starts
at six to nine seconds and the engine's own fetch gives up during one. Forty
people starting at once on conference wifi is exactly that condition. Rehearse
under load.

**fal per-key concurrency is unverified on a fresh account.** The chain runs
six meshy jobs in parallel. If a new key serialises them, twelve minutes
becomes thirty and the arc does not fit.

**Per-attendee Miris signup, upload and processing at scale is untested.**
It is scheduled inside the twelve minute grow, which is the only reason it
fits. Anyone whose upload stalls can still seal their capsules: the stream
fills in on its own once processing finishes.

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
