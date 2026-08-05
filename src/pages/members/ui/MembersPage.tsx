import { useParams } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { useGroupDashboardQuery } from '@/entities/group';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { PageLayout } from '@/shared/ui';
import styles from './MembersPage.module.scss';

export function MembersPage() {
  const { groupId } = useParams();
  const platform = usePlatform();
  const canRequest =
    platform.kind === 'telegram'
      ? Boolean(platform.getInitData())
      : Boolean(getRuntimeConfig().developmentTelegramUserId);

  const dashboardQuery = useGroupDashboardQuery(groupId ?? '', Boolean(groupId) && canRequest);

  if (!groupId) return null;
  if (!canRequest) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Участники"
        description="Откройте приложение из Telegram или настройте local development ID."
      />
    );
  }
  if (dashboardQuery.isPending) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Участники"
        description="Загружаем список…"
      />
    );
  }
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Участники"
        description="Не удалось загрузить список участников."
      >
        <button className={styles.retry} onClick={() => dashboardQuery.refetch()} type="button">
          Повторить
        </button>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      backTo={routes.group(groupId)}
      backLabel="К группе"
      title="Участники"
      description={`${dashboardQuery.data.members.length} участников в группе`}
    >
      <ul className={styles.list}>
        {dashboardQuery.data.members.map((member) => (
          <li key={member.userId}>
            <span className={styles.person}>
              <strong>
                {member.userId === dashboardQuery.data.currentUserId ? 'Вы' : member.displayName}
              </strong>
              {member.username ? <small>@{member.username}</small> : null}
            </span>
            <small>{member.isOwner ? 'Владелец' : 'Участник'}</small>
          </li>
        ))}
      </ul>
    </PageLayout>
  );
}
