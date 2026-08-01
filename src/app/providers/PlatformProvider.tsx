import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { createPlatformAdapter, type PlatformAdapter } from '@/shared/platform';

const PlatformContext = createContext<PlatformAdapter | null>(null);

export function PlatformProvider({ children }: PropsWithChildren) {
  const platform = useMemo(createPlatformAdapter, []);
  const [isReady, setIsReady] = useState(platform.kind === 'browser');

  useEffect(() => {
    let isActive = true;

    void platform.initialize().finally(() => {
      if (isActive) {
        setIsReady(true);
      }
    });

    return () => {
      isActive = false;
    };
  }, [platform]);

  if (!isReady) {
    return <div aria-live="polite">Открываем приложение…</div>;
  }

  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): PlatformAdapter {
  const platform = useContext(PlatformContext);

  if (!platform) {
    throw new Error('usePlatform must be used inside PlatformProvider.');
  }

  return platform;
}
