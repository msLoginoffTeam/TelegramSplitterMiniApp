import { Link, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom';
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
    let retryTimeout: number | undefined;
    let attempts = 0;

    const handleInvite = () => {
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
        return;
      }

      // Telegram may populate its native bridge shortly after React has mounted.
      // Retry briefly so a direct invite link is not lost to that initialization race.
      attempts += 1;
      if (platform.kind === 'telegram' && attempts < 16) {
        retryTimeout = window.setTimeout(handleInvite, 200);
      }
    };

    handleInvite();

    return () => {
      if (retryTimeout !== undefined) {
        window.clearTimeout(retryTimeout);
      }
    };
  }, [location.hash, location.pathname, location.search, navigate, platform]);

  useEffect(() => {
    if (location.pathname === routes.groups) {
      return;
    }

    return platform.bindBackButton(() => navigate(-1));
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
      <ScrollRestoration
        getKey={(scrollLocation) => `${scrollLocation.pathname}${scrollLocation.search}`}
      />
    </main>
  );
}
