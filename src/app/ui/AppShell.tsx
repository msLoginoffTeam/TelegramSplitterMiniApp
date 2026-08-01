import { usePlatform } from '@/app/providers/PlatformProvider';
import styles from '@/app/ui/AppShell.module.scss';

export function AppShell() {
  const platform = usePlatform();

  return (
    <main className={styles.shell}>
      <p className={styles.eyebrow}>Telegram Splitter</p>
      <h1>Совместные траты — без путаницы</h1>
      <p className={styles.copy}>
        Foundation готов. Следующий шаг — согласовать навигацию и сценарий создания траты.
      </p>
      <p className={styles.mode} data-testid="platform-kind">
        Режим: {platform.kind === 'telegram' ? 'Telegram Mini App' : 'браузер'}
      </p>
    </main>
  );
}
