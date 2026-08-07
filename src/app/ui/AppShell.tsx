import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { routes } from '@/shared/config/routes';
import styles from '@/app/ui/AppShell.module.scss';

export function AppShell() {
  const platform = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();
  const handledInviteToken = useRef<string | undefined>(undefined);

  useEffect(() => {
    const startParam = platform.getStartParam();
    const inviteToken = startParam?.startsWith('invite_')
      ? startParam.slice('invite_'.length)
      : undefined;
    const currentInviteToken = location.pathname.startsWith('/invite/')
      ? decodeURIComponent(location.pathname.slice('/invite/'.length))
      : undefined;

    if (
      inviteToken &&
      currentInviteToken !== inviteToken &&
      handledInviteToken.current !== inviteToken
    ) {
      handledInviteToken.current = inviteToken;
      navigate(`/invite/${encodeURIComponent(inviteToken)}`, {
        replace: true,
      });
    }
  }, [location.hash, location.pathname, location.search, navigate, platform]);

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
