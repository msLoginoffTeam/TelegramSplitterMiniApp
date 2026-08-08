import { Link, useParams } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { useGroupTransfersQuery } from '@/entities/transfer';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { formatRubles } from '@/shared/lib/money';
import { PageLayout } from '@/shared/ui';
import styles from './TransfersPage.module.scss';

export function TransfersPage() {
  const { groupId } = useParams();
  const platform = usePlatform();
  const hasDevelopmentIdentity = Boolean(getRuntimeConfig().developmentTelegramUserId);
  const canRequest =
    platform.kind === 'telegram' ? Boolean(platform.getInitData()) : hasDevelopmentIdentity;
  const transfersQuery = useGroupTransfersQuery(groupId ?? '', Boolean(groupId) && canRequest);

  if (!groupId) return null;

  if (!canRequest || transfersQuery.isPending) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Итоговые переводы"
        description={canRequest ? 'Считаем итоговые переводы…' : 'Откройте приложение из Telegram.'}
      />
    );
  }

  if (transfersQuery.isError || !transfersQuery.data) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Итоговые переводы"
        description="Не удалось рассчитать переводы."
      >
        <button className={styles.retry} onClick={() => transfersQuery.refetch()} type="button">
          Повторить
        </button>
      </PageLayout>
    );
  }

  const transfers = transfersQuery.data;

  return (
    <PageLayout
      backTo={routes.group(groupId)}
      backLabel="К группе"
      title="Итоговые переводы"
      description="Минимальный набор переводов, чтобы закрыть все долги."
    >
      {transfers.length ? (
        <>
          <p className={styles.hint}>
            После реального перевода отметьте его здесь — баланс группы обновится.
          </p>
          <ul className={styles.list}>
            {transfers.map((transfer) => (
              <li key={`${transfer.fromUserId}-${transfer.toUserId}`}>
                <div className={styles.transfer}>
                  <div className={styles.people}>
                    <span>
                      <strong>{transfer.fromDisplayName}</strong>
                      {transfer.fromUsername ? <small>@{transfer.fromUsername}</small> : null}
                    </span>
                    <b aria-hidden="true">→</b>
                    <span>
                      <strong>{transfer.toDisplayName}</strong>
                      {transfer.toUsername ? <small>@{transfer.toUsername}</small> : null}
                    </span>
                  </div>
                  <strong className={styles.amount}>{formatRubles(transfer.amount)}</strong>
                </div>
                <Link
                  className={styles.action}
                  to={routes.createSuggestedTransferPayment(groupId, transfer)}
                >
                  Отметить платёж
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <section className={styles.settled}>
          <h2>Все рассчитались</h2>
          <p>Сейчас в группе нет долгов и дополнительных переводов не нужно.</p>
          <Link className={styles.action} to={routes.createPayment(groupId)}>
            Добавить платёж
          </Link>
        </section>
      )}
    </PageLayout>
  );
}
