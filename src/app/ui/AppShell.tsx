import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { routes } from '@/shared/config/routes';
import styles from '@/app/ui/AppShell.module.scss';

export function AppShell() {
  const platform = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const startParam = platform.getStartParam();
    if (startParam?.startsWith('invite_') && !location.pathname.startsWith('/invite/')) {
      navigate(`/invite/${encodeURIComponent(startParam.slice('invite_'.length))}`, {
        replace: true,
      });
    }
  }, [location.pathname, navigate, platform]);

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
