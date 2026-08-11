import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import {
  formatAuditEvent,
  formatEntityKey,
  getAuditFieldChanges,
  useGroupAuditLogQuery,
} from '@/entities/audit-log';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { routes } from '@/shared/config/routes';
import { PageLayout } from '@/shared/ui';
import styles from './AuditLogPage.module.scss';

export function AuditLogPage() {
  const { groupId } = useParams();
  const platform = usePlatform();
  const canRequest =
    platform.kind === 'telegram'
      ? Boolean(platform.getInitData())
      : Boolean(getRuntimeConfig().developmentTelegramUserId);
  const auditLogQuery = useGroupAuditLogQuery(groupId ?? '', Boolean(groupId) && canRequest);
  const [expandedEventId, setExpandedEventId] = useState<string>();

  if (!groupId) return null;
  if (!canRequest) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="История"
        description="Откройте приложение из Telegram или настройте local development ID"
      />
    );
  }
  if (auditLogQuery.isPending) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="История"
        description="Загружаем события…"
      />
    );
  }
  if (auditLogQuery.isError) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="История"
        description="Не удалось загрузить историю"
      >
        <button className={styles.retry} onClick={() => auditLogQuery.refetch()} type="button">
          Повторить
        </button>
      </PageLayout>
    );
  }

  const events = auditLogQuery.data?.pages.flatMap((page) => page.entries) ?? [];

  return (
    <PageLayout
      backTo={routes.group(groupId)}
      backLabel="К группе"
      title="История"
      description="Изменения трат, платежей и участников"
    >
      {events.length ? (
        <ul className={styles.list}>
          {events.map((event) => {
            const presentation = formatAuditEvent(event);
            const actor = event.actorDisplayName ?? event.actorUsername ?? 'Участник';
            const changes = getAuditFieldChanges(event);
            const isExpanded = expandedEventId === event.id;

            return (
              <li key={event.id}>
                <button
                  aria-expanded={isExpanded}
                  className={styles.eventButton}
                  onClick={() =>
                    setExpandedEventId((current) => (current === event.id ? undefined : event.id))
                  }
                  type="button"
                >
                  <span className={styles.eventSummary}>
                    <strong>{presentation.title}</strong>
                    {presentation.details ? <span>{presentation.details}</span> : null}
                    <small>
                      {actor} · {event.occurredAtUtc.toLocaleString('ru-RU')}
                    </small>
                  </span>
                  <span aria-hidden="true" className={styles.chevron} data-expanded={isExpanded}>
                    ⌄
                  </span>
                </button>
                {isExpanded ? (
                  <section aria-label="Подробности изменения" className={styles.details}>
                    {changes.length ? (
                      <dl className={styles.changes}>
                        {changes.map((change) => (
                          <div key={change.label}>
                            <dt>{change.label}</dt>
                            {change.value !== undefined ? <dd>{change.value}</dd> : null}
                            {change.oldValue !== undefined ? (
                              <dd>
                                <span>Было</span>
                                {change.oldValue}
                              </dd>
                            ) : null}
                            {change.newValue !== undefined ? (
                              <dd>
                                <span>Стало</span>
                                {change.newValue}
                              </dd>
                            ) : null}
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className={styles.noChanges}>В этой записи нет отдельных полей</p>
                    )}
                    <details className={styles.technical}>
                      <summary>Технический ключ записи</summary>
                      <pre>{formatEntityKey(event)}</pre>
                    </details>
                  </section>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.empty}>Пока нет записанных изменений</p>
      )}

      {auditLogQuery.hasNextPage ? (
        <button
          className={styles.more}
          disabled={auditLogQuery.isFetchingNextPage}
          onClick={() => auditLogQuery.fetchNextPage()}
          type="button"
        >
          {auditLogQuery.isFetchingNextPage ? 'Загружаем…' : 'Показать ранние события'}
        </button>
      ) : null}
    </PageLayout>
  );
}
