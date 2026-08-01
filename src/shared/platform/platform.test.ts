import { afterEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({
  isTMA: vi.fn<() => boolean>(() => false),
  init: vi.fn(),
  initData: { raw: vi.fn<() => string | undefined>(() => 'signed-init-data') },
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
    expect(sdk.miniApp.ready).toHaveBeenCalledTimes(1);
    expect(platform.getInitData()).toBe('signed-init-data');
  });
});
