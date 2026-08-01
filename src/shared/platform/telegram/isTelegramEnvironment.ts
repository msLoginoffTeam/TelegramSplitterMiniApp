import { isTMA } from '@tma.js/sdk-react';

export function isTelegramEnvironment(): boolean {
  return typeof window !== 'undefined' && isTMA();
}
