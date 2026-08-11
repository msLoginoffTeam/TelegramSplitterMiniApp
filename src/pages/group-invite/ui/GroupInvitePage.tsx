import { useParams } from 'react-router-dom';
import { useCreateGroupInvite } from '@/entities/group';
import { routes } from '@/shared/config/routes';
import { PageLayout } from '@/shared/ui';
import styles from './GroupInvitePage.module.scss';

export function GroupInvitePage() {
  const { groupId } = useParams();
  const inviteMutation = useCreateGroupInvite(groupId ?? '');

  if (!groupId) return null;

  const copyInvite = async () => {
    const url = inviteMutation.data?.inviteUrl;
    if (!url) return;
    await navigator.clipboard?.writeText(url);
  };

  return (
    <PageLayout
      backTo={routes.group(groupId)}
      backLabel="К группе"
      title="Пригласить участника"
      description="Одна ссылка работает до истечения срока и подходит для нескольких участников"
    >
      <button
        className={styles.primaryAction}
        disabled={inviteMutation.isPending}
        onClick={() => inviteMutation.mutate()}
        type="button"
      >
        {inviteMutation.isPending ? 'Создаём ссылку…' : 'Создать ссылку'}
      </button>

      {inviteMutation.data ? (
        <section className={styles.result}>
          <p>Отправьте эту ссылку участникам в Telegram:</p>
          <code>{inviteMutation.data.inviteUrl}</code>
          <button onClick={copyInvite} type="button">
            Скопировать ссылку
          </button>
          <p>
            Если Telegram сначала покажет кнопку «Старт», нажмите её и затем снова откройте эту же
            ссылку. Так параметр приглашения попадёт в Mini App.
          </p>
          <small>
            {inviteMutation.data.expiresAtUtc
              ? `Действует до ${new Date(inviteMutation.data.expiresAtUtc).toLocaleString('ru-RU')}`
              : 'Срок действия не определён'}
          </small>
        </section>
      ) : null}

      {inviteMutation.isError ? (
        <p className={styles.error}>Не удалось создать ссылку. Проверьте настройки бота.</p>
      ) : null}
    </PageLayout>
  );
}
