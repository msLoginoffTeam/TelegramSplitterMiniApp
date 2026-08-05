import type { HapticImpact, PlatformAdapter } from '@/shared/platform/types';

export class BrowserPlatform implements PlatformAdapter {
  public readonly kind = 'browser' as const;

  public async initialize(): Promise<void> {
    return Promise.resolve();
  }

  public getInitData(): undefined {
    return undefined;
  }

  public getStartParam(): undefined {
    return undefined;
  }

  public bindBackButton(_handler: () => void): () => void {
    return () => undefined;
  }

  public impact(_style: HapticImpact = 'light'): void {
    // Browser mode deliberately has no fake Telegram behavior.
  }
}
