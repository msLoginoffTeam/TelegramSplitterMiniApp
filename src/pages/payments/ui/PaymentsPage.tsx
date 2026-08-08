import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { groupPermissions, useGroupDashboardQuery } from '@/entities/group';
import { useGroupPaymentsQuery } from '@/entities/payment';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { formatRubles } from '@/shared/lib/money';
import { PageLayout } from '@/shared/ui';
import styles from './PaymentsPage.module.scss';

export function PaymentsPage() {
  const { groupId } = useParams();
  const platform = usePlatform();
  const hasDevelopmentIdentity = Boolean(getRuntimeConfig().developmentTelegramUserId);
  const canRequest =
    platform.kind === 'telegram' ? Boolean(platform.getInitData()) : hasDevelopmentIdentity;
  const dashboardQuery = useGroupDashboardQuery(groupId ?? '', Boolean(groupId) && canRequest);
  const paymentsQuery = useGroupPaymentsQuery(groupId ?? '', Boolean(groupId) && canRequest);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  if (!groupId) return null;
  if (!canRequest || dashboardQuery.isPending || paymentsQuery.isPending) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Платежи"
        description={canRequest ? 'Загружаем платежи…' : 'Откройте приложение из Telegram.'}
      />
    );
  }
  if (
    dashboardQuery.isError ||
    paymentsQuery.isError ||
    !dashboardQuery.data ||
    !paymentsQuery.data
  ) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Платежи"
        description="Не удалось загрузить платежи."
      >
        <button className={styles.retry} onClick={() => paymentsQuery.refetch()} type="button">
          Повторить
        </button>
      </PageLayout>
    );
  }

  const dashboard = dashboardQuery.data;
  const canCreate =
    dashboard.members
      .find((member) => member.userId === dashboard.currentUserId)
      ?.permissions.includes(groupPermissions.createPayment) ?? false;
  const expenseTitles = new Map(dashboard.expenses.map((expense) => [expense.id, expense.title]));
  const visiblePayments = paymentsQuery.data
    .filter((payment) => {
      if (filter === 'all') return true;
      if (filter === 'direct') return !payment.expenseId;
      return payment.expenseId === filter;
    })
    .sort((first, second) => {
      const difference = first.timestamp.getTime() - second.timestamp.getTime();
      return sortOrder === 'newest' ? -difference : difference;
    });

  return (
    <PageLayout
      backTo={routes.group(groupId)}
      backLabel="К группе"
      title="Платежи"
      description="Переводы между участниками и погашения трат."
    >
      {canCreate ? (
        <Link className={styles.primaryAction} to={routes.createPayment(groupId)}>
          Добавить платёж
        </Link>
      ) : null}

      {paymentsQuery.data.length ? (
        <section className={styles.filters}>
          <label>
            <span>Показать</span>
            <select onChange={(event) => setFilter(event.target.value)} value={filter}>
              <option value="all">Все платежи</option>
              <option value="direct">Только переводы</option>
              {dashboard.expenses.map((expense) => (
                <option key={expense.id} value={expense.id}>
                  Трата: {expense.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Сортировка</span>
            <select
              onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)}
              value={sortOrder}
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
            </select>
          </label>
        </section>
      ) : null}

      {visiblePayments.length ? (
        <ul className={styles.list}>
          {visiblePayments.map((payment) => (
            <li key={payment.id}>
              <Link className={styles.paymentLink} to={routes.payment(groupId, payment.id)}>
                <strong>
                  {payment.fromUserId === dashboard.currentUserId ? 'Вы' : payment.fromDisplayName}{' '}
                  → {payment.toUserId === dashboard.currentUserId ? 'вы' : payment.toDisplayName}
                </strong>
                {payment.expenseId ? (
                  <small>
                    Погашение: {expenseTitles.get(payment.expenseId) ?? 'удалённая трата'}
                  </small>
                ) : (
                  <small>Просто перевод</small>
                )}
                {payment.description ? <small>{payment.description}</small> : null}
                <small>{payment.timestamp.toLocaleString('ru-RU')}</small>
              </Link>
              <b>{formatRubles(payment.amount)}</b>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          {paymentsQuery.data.length ? 'По выбранному фильтру платежей нет.' : 'Платежей пока нет.'}
        </p>
      )}
    </PageLayout>
  );
}
