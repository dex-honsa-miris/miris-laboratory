import { useEffect, useState } from 'react';

export default function useScenePreferences() {
  const [preferences, setPreferences] = useState({ compact: true, reducedMotion: true });
  useEffect(() => {
    const compact = matchMedia('(max-width: 720px), (pointer: coarse)');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPreferences({ compact: compact.matches, reducedMotion: motion.matches });
    update();
    compact.addEventListener('change', update);
    motion.addEventListener('change', update);
    return () => {
      compact.removeEventListener('change', update);
      motion.removeEventListener('change', update);
    };
  }, []);
  return preferences;
}
