import { useEffect, useState } from 'react';
import type { Scene } from 'three';

// Wait for SDK initialization before mounting Canvas, including across key changes and hot reloads.
export default function useLabScene(create: (key: string) => Scene, viewerKey: string, enabled: boolean) {
  const [state, setState] = useState<{ scene: any; error: Error | null }>({ scene: null, error: null });
  useEffect(() => {
    if (!enabled) { setState({ scene: null, error: null }); return; }
    let alive = true;
    const scene = create(viewerKey || '') as Scene & { ready?: Promise<unknown>; dispose?: () => void };
    setState({ scene: null, error: null });
    const ready = Promise.resolve(scene.ready);
    ready.then(() => { if (alive) setState({ scene, error: null }); })
      .catch(error => { if (alive) setState({ scene: null, error }); });
    return () => {
      alive = false;
      void ready.then(() => scene.dispose?.(), () => scene.dispose?.());
    };
  }, [create, viewerKey, enabled]);
  return state;
}
