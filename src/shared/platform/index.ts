import { BrowserPlatform } from '@/shared/platform/browser/BrowserPlatform';
import { isTelegramEnvironment } from '@/shared/platform/telegram/isTelegramEnvironment';
import { TelegramPlatform } from '@/shared/platform/telegram/TelegramPlatform';
import type { PlatformAdapter } from '@/shared/platform/types';

export type { HapticImpact, PlatformAdapter, PlatformKind } from '@/shared/platform/types';

export function createPlatformAdapter(): PlatformAdapter {
  if (isTelegramEnvironment()) {
    return new TelegramPlatform();
  }

  return new BrowserPlatform();
}
