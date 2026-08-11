import { Link, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef } from 'react';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { routes } from '@/shared/config/routes';
import styles from '@/app/ui/AppShell.module.scss';

export function AppShell() {
  const platform = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();
  const handledInviteToken = useRef<string | undefined>(undefined);
  const swipeStart = useRef<{ x: number; y: number; startedAt: number } | undefined>(undefined);

  const navigateBack = useCallback(() => {
    const historyIndex = (window.history.state as { idx?: unknown } | null)?.idx;

    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(routes.groups);
  }, [navigate]);

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

    return platform.bindBackButton(navigateBack);
  }, [location.pathname, navigateBack, platform]);

  useEffect(() => {
    const edgeWidth = 28;
    const minDistance = 72;
    const maxDuration = 650;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;

      const touch = event.touches[0];
      const startsAtEdge =
        touch.clientX <= edgeWidth || touch.clientX >= window.innerWidth - edgeWidth;
      if (!startsAtEdge) return;

      swipeStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        startedAt: Date.now(),
      };
    };

    const onTouchEnd = (event: TouchEvent) => {
      const start = swipeStart.current;
      swipeStart.current = undefined;
      if (!start || event.changedTouches.length !== 1) return;

      const touch = event.changedTouches[0];
      const horizontalDistance = touch.clientX - start.x;
      const verticalDistance = touch.clientY - start.y;
      const isHorizontalGesture =
        Math.abs(horizontalDistance) >= minDistance &&
        Math.abs(horizontalDistance) > Math.abs(verticalDistance) * 1.35 &&
        Date.now() - start.startedAt <= maxDuration;

      if (!isHorizontalGesture) return;

      if (horizontalDistance > 0 && location.pathname !== routes.groups) {
        navigateBack();
      } else if (horizontalDistance < 0) {
        navigate(1);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [location.pathname, navigate, navigateBack]);

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
