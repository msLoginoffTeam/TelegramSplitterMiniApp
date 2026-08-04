import { Link } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { useMyGroupsQuery } from '@/entities/group';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { PageLayout } from '@/shared/ui';
import styles from '@/pages/groups/ui/GroupsPage.module.scss';

export function GroupsPage() {
  const platform = usePlatform();
  const hasDevelopmentIdentity = Boolean(getRuntimeConfig().developmentTelegramUserId);
  const canRequestGroups =
    platform.kind === 'telegram' ? Boolean(platform.getInitData()) : hasDevelopmentIdentity;
  const groupsQuery = useMyGroupsQuery(canRequestGroups);

  return (
    <PageLayout
      title="Ваши группы"
      description="Здесь появятся совместные поездки, квартиры и другие общие траты."
    >
      {!canRequestGroups ? (
        <div className={styles.emptyState}>
          Откройте приложение из Telegram. Для локального browser-mode добавьте свой Telegram ID в
          <code> .env.local</code> как <code>VITE_DEV_TELEGRAM_USER_ID</code>.
        </div>
      ) : null}
      {groupsQuery.isPending ? <p className={styles.status}>Загружаем группы…</p> : null}
      {groupsQuery.isError ? (
        <div className={styles.emptyState}>
          <p>Не удалось загрузить группы.</p>
          <button onClick={() => groupsQuery.refetch()} type="button">
            Повторить
          </button>
        </div>
      ) : null}
      {groupsQuery.data?.length ? (
        <nav aria-label="Ваши группы" className={styles.groupList}>
          {groupsQuery.data.map((group) => (
            <Link className={styles.groupItem} key={group.id} to={routes.group(group.id)}>
              {group.title}
            </Link>
          ))}
        </nav>
      ) : null}
      {canRequestGroups &&
      !groupsQuery.isPending &&
      !groupsQuery.isError &&
      !groupsQuery.data?.length ? (
        <div className={styles.emptyState}>
          Пока групп нет. Создайте первую — затем добавите участников и траты.
        </div>
      ) : null}
      {canRequestGroups ? (
        <Link className={styles.primaryAction} to={routes.createGroup}>
          Создать группу
        </Link>
      ) : null}
    </PageLayout>
  );
}
