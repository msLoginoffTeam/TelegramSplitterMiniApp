import { Link, Outlet } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { routes } from '@/shared/config/routes';
import styles from '@/app/ui/AppShell.module.scss';

export function AppShell() {
  const platform = usePlatform();

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} to={routes.groups}>
          Splitter
        </Link>
        <span className={styles.mode} data-testid="platform-kind">
          {platform.kind === 'telegram' ? 'Telegram' : 'Браузер'}
        </span>
      </header>
      <Outlet />
    </main>
  );
}
