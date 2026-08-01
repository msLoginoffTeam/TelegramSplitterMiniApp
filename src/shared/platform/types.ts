export type PlatformKind = 'browser' | 'telegram';

export type HapticImpact = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

export interface PlatformAdapter {
  readonly kind: PlatformKind;
  initialize(): Promise<void>;
  getInitData(): string | undefined;
  bindBackButton(handler: () => void): () => void;
  impact(style?: HapticImpact): void;
}
