import {
  backButton,
  hapticFeedback,
  init,
  initData,
  miniApp,
  themeParams,
  viewport,
} from '@tma.js/sdk-react';
import type { HapticImpact, PlatformAdapter } from '@/shared/platform/types';

export class TelegramPlatform implements PlatformAdapter {
  public readonly kind = 'telegram' as const;

  private initialization: Promise<void> | undefined;

  public initialize(): Promise<void> {
    this.initialization ??= this.initializeSdk();
    return this.initialization;
  }

  public getInitData(): string | undefined {
    return initData.raw();
  }

  public getStartParam(): string | undefined {
    return initData.startParam();
  }

  public bindBackButton(handler: () => void): () => void {
    if (!backButton.isSupported()) {
      return () => undefined;
    }

    if (!backButton.isMounted()) {
      backButton.mount();
    }

    const unsubscribe = backButton.onClick(handler);
    backButton.show();

    return () => {
      unsubscribe();
      backButton.hide();
    };
  }

  public impact(style: HapticImpact = 'light'): void {
    if (hapticFeedback.isSupported()) {
      hapticFeedback.impactOccurred(style);
    }
  }

  private async initializeSdk(): Promise<void> {
    init({ acceptCustomStyles: true });
    initData.restore();

    if (!themeParams.isMounted()) {
      themeParams.mount();
      themeParams.bindCssVars((key) => `--tg-theme-${key}`);
    }

    if (!miniApp.isMounted()) {
      miniApp.mount();
      miniApp.bindCssVars((key) => `--tg-mini-app-${key}`);
    }

    if (!viewport.isMounted()) {
      // Some Telegram clients may not answer the viewport request promptly.
      // Viewport CSS variables improve layout but must not block the entire app.
      void viewport
        .mount()
        .then(() => viewport.bindCssVars((key) => `--tg-viewport-${key}`))
        .catch(() => undefined);
    }

    if (backButton.isSupported() && !backButton.isMounted()) {
      backButton.mount();
    }

    miniApp.ready();
  }
}
