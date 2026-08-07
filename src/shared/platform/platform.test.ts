import { afterEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({
  isTMA: vi.fn<() => boolean>(() => false),
  init: vi.fn(),
  initData: {
    raw: vi.fn<() => string | undefined>(() => 'signed-init-data'),
    startParam: vi.fn<() => string | undefined>(() => undefined),
    restore: vi.fn(),
  },
  retrieveLaunchParams: vi.fn(() => ({})),
  retrieveRawLaunchParams: vi.fn<() => string>(() => ''),
  themeParams: {
    isMounted: vi.fn<() => boolean>(() => false),
    mount: vi.fn(),
    bindCssVars: vi.fn(),
  },
  miniApp: {
    isMounted: vi.fn<() => boolean>(() => false),
    mount: vi.fn(),
    bindCssVars: vi.fn(),
    ready: vi.fn(),
  },
  viewport: {
    isMounted: vi.fn<() => boolean>(() => false),
    mount: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    bindCssVars: vi.fn(),
  },
  backButton: {
    isSupported: vi.fn<() => boolean>(() => true),
    isMounted: vi.fn<() => boolean>(() => false),
    mount: vi.fn(),
    onClick: vi.fn(() => vi.fn()),
    show: vi.fn(),
    hide: vi.fn(),
  },
  hapticFeedback: {
    isSupported: vi.fn<() => boolean>(() => true),
    impactOccurred: vi.fn(),
  },
}));

vi.mock('@tma.js/sdk-react', () => sdk);

import { createPlatformAdapter } from '@/shared/platform';
import { TelegramPlatform } from '@/shared/platform/telegram/TelegramPlatform';

describe('platform adapters', () => {
  afterEach(() => {
    sdk.isTMA.mockReturnValue(false);
    vi.clearAllMocks();
    delete (window as typeof window & { Telegram?: unknown }).Telegram;
  });

  it('selects BrowserPlatform outside Telegram', () => {
    expect(createPlatformAdapter().kind).toBe('browser');
  });

  it('selects TelegramPlatform in Telegram', () => {
    sdk.isTMA.mockReturnValue(true);

    expect(createPlatformAdapter().kind).toBe('telegram');
  });

  it('initializes Telegram SDK only once under repeated calls', async () => {
    const platform = new TelegramPlatform();

    await Promise.all([platform.initialize(), platform.initialize()]);

    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.initData.restore).toHaveBeenCalledTimes(1);
    expect(sdk.miniApp.ready).toHaveBeenCalledTimes(1);
    expect(platform.getInitData()).toBe('signed-init-data');
  });

  it('reads the invite start parameter from Telegram hash launch params', () => {
    sdk.initData.startParam.mockReturnValue(undefined);
    sdk.retrieveLaunchParams.mockReturnValue({});
    window.history.replaceState({}, '', '/#tgWebAppStartParam=invite_token');

    expect(new TelegramPlatform().getStartParam()).toBe('invite_token');

    window.history.replaceState({}, '', '/');
  });

  it('prefers a current URL invite over stale init data', () => {
    sdk.initData.startParam.mockReturnValue('invite_old_token');
    sdk.retrieveLaunchParams.mockReturnValue({});
    window.history.replaceState({}, '', '/?startapp=invite_new_token');

    expect(new TelegramPlatform().getStartParam()).toBe('invite_new_token');

    window.history.replaceState({}, '', '/');
  });

  it('reads the invite start parameter from the native Telegram WebApp object', () => {
    sdk.initData.startParam.mockReturnValue(undefined);
    sdk.retrieveLaunchParams.mockReturnValue({});
    (
      window as typeof window & {
        Telegram?: { WebApp: { initDataUnsafe: { start_param: string } } };
      }
    ).Telegram = {
      WebApp: { initDataUnsafe: { start_param: 'invite_native_token' } },
    };

    expect(new TelegramPlatform().getStartParam()).toBe('invite_native_token');
  });

  it('reads the invite start parameter from raw Telegram launch params', () => {
    sdk.initData.startParam.mockReturnValue(undefined);
    sdk.retrieveLaunchParams.mockReturnValue({});
    sdk.retrieveRawLaunchParams.mockReturnValue('tgWebAppStartParam=invite_raw_token');

    expect(new TelegramPlatform().getStartParam()).toBe('invite_raw_token');
  });
});
