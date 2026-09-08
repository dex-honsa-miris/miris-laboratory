import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Plugin } from "vite";
import { readData } from "./store.mjs";
import { publishSnapshot } from "./workshop.mjs";

// A static JSON snapshot makes shared scenes independent of the development API.
export function mirisSnapshot(): Plugin {
  let outDir = resolve(process.cwd(), "dist");

  return {
    name: "miris-snapshot",
    apply: "build",

    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },

    async closeBundle() {
      const data = await readData(join(process.cwd(), "miris"));
      await mkdir(join(outDir, "api"), { recursive: true });
      const snapshot = JSON.stringify(publishSnapshot(data));
      await writeFile(join(outDir, "miris-scene.json"), snapshot);
      await writeFile(join(outDir, "api", "miris"), snapshot);

      // An empty track means nobody has run the workshop in this checkout, so
      // the built site would be a skeleton however it is served. Worth saying
      // out loud at the moment of publishing rather than after sharing a link.
      if (!data.track) {
        console.warn(
          "\n  miris: built with an empty data.json, so the published lab will have nothing in it." +
            "\n  Run the workshop with npm run dev first, then build.\n",
        );
      }
    },
  };
}
