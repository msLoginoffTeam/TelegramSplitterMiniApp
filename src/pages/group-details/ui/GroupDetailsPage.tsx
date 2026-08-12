import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { groupPermissions, useGroupDashboardQuery } from '@/entities/group';
import { useGroupPaymentsQuery } from '@/entities/payment';
import { useGroupOverviewState } from '../model/useGroupOverviewState';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { formatRubles } from '@/shared/lib/money';
import { PageLayout } from '@/shared/ui';
import styles from '@/pages/group-details/ui/GroupDetailsPage.module.scss';

type ExpenseSort =
  | 'created-desc'
  | 'created-asc'
  | 'title-asc'
  | 'title-desc'
  | 'amount-desc'
  | 'amount-asc';

const expenseSortOptions: ReadonlyArray<{ value: ExpenseSort; label: string }> = [
  { value: 'created-desc', label: 'По дате: сначала новые' },
  { value: 'created-asc', label: 'По дате: сначала старые' },
  { value: 'title-asc', label: 'По названию: А → Я' },
  { value: 'title-desc', label: 'По названию: Я → А' },
  { value: 'amount-desc', label: 'По сумме: сначала больше' },
  { value: 'amount-asc', label: 'По сумме: сначала меньше' },
];

export function GroupDetailsPage() {
  const { groupId } = useParams();
  const [expenseSort, setExpenseSort] = useState<ExpenseSort>('created-desc');

  if (!groupId) {
    return null;
  }

  const platform = usePlatform();
  const hasDevelopmentIdentity = Boolean(getRuntimeConfig().developmentTelegramUserId);
  const canRequestGroup =
    platform.kind === 'telegram' ? Boolean(platform.getInitData()) : hasDevelopmentIdentity;
  const dashboardQuery = useGroupDashboardQuery(groupId, canRequestGroup);
  const paymentsQuery = useGroupPaymentsQuery(groupId, canRequestGroup);
  const overview = useGroupOverviewState(groupId);

  if (!canRequestGroup) {
    return (
      <PageLayout
        backTo={routes.groups}
        backLabel="К группам"
        title="Группа"
        description="Откройте приложение из Telegram или настройте local development ID"
      />
    );
  }

  if (dashboardQuery.isPending) {
    return (
      <PageLayout
        backTo={routes.groups}
        backLabel="К группам"
        title="Группа"
        description="Загружаем данные…"
      />
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <PageLayout
        backTo={routes.groups}
        backLabel="К группам"
        title="Группа"
        description="Не удалось загрузить данные группы"
      >
        <button className={styles.retry} onClick={() => dashboardQuery.refetch()} type="button">
          Повторить
        </button>
      </PageLayout>
    );
  }

  const dashboard = dashboardQuery.data;
  const currentMember = dashboard.members.find(
    (member) => member.userId === dashboard.currentUserId,
  );
  const canCreateExpense =
    currentMember?.permissions.includes(groupPermissions.createExpense) ?? false;
  const canCreatePayment =
    currentMember?.permissions.includes(groupPermissions.createPayment) ?? false;
  const canManageMembers =
    currentMember?.permissions.includes(groupPermissions.manageMembers) ?? false;

  const recentPayments = [...(paymentsQuery.data ?? [])]
    .sort((first, second) => second.timestamp.getTime() - first.timestamp.getTime())
    .slice(0, 3);
  const sortedExpenses = [...dashboard.expenses].sort((first, second) => {
    switch (expenseSort) {
      case 'created-asc':
        return first.createdAt.getTime() - second.createdAt.getTime();
      case 'title-asc':
        return first.title.localeCompare(second.title, 'ru');
      case 'title-desc':
        return second.title.localeCompare(first.title, 'ru');
      case 'amount-desc':
        return second.totalAmount - first.totalAmount;
      case 'amount-asc':
        return first.totalAmount - second.totalAmount;
      case 'created-desc':
        return second.createdAt.getTime() - first.createdAt.getTime();
    }
  });

  return (
    <PageLayout
      backTo={routes.groups}
      backLabel="К группам"
      title={dashboard.title}
      description={`${dashboard.members.length} ${dashboard.members.length === 1 ? 'участник' : 'участника'}`}
    >
      <details
        className={styles.overview}
        onToggle={overview.onToggle('balance')}
        open={overview.state.balance}
      >
        <summary>
          <span>
            <strong>Баланс</strong>
            <small>Общий итог расчётов по каждому участнику</small>
          </span>
          <span aria-hidden="true">⌄</span>
        </summary>
        <div className={styles.overviewBody}>
          {dashboard.balances.length ? (
            <ul className={styles.balanceList}>
              {dashboard.balances.map((balance) => (
                <li key={balance.userId}>
                  <span className={styles.person}>
                    <strong>
                      {balance.userId === dashboard.currentUserId ? 'Вы' : balance.displayName}
                    </strong>
                    {balance.username ? <small>@{balance.username}</small> : null}
                  </span>
                  <strong data-positive={balance.amount > 0} data-negative={balance.amount < 0}>
                    {balance.amount > 0 ? '+' : ''}
                    {formatRubles(balance.amount)}
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>По группе пока нет взаиморасчётов</p>
          )}
        </div>
      </details>

      <details
        className={styles.overview}
        onToggle={overview.onToggle('expenses')}
        open={overview.state.expenses}
      >
        <summary>
          <span>
            <strong>Траты</strong>
            <small>{dashboard.expenses.length} в группе</small>
          </span>
          <span aria-hidden="true">⌄</span>
        </summary>
        <div className={styles.overviewBody}>
          {dashboard.expenses.length ? (
            <>
              <label className={styles.expenseSort}>
                <span>Сортировка</span>
                <select
                  onChange={(event) => setExpenseSort(event.target.value as ExpenseSort)}
                  value={expenseSort}
                >
                  {expenseSortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <ul className={styles.expenseList}>
                {sortedExpenses.map((expense) => (
                  <li key={expense.id}>
                    <Link className={styles.expenseLink} to={routes.expense(groupId, expense.id)}>
                      <div>
                        <strong className={styles.expenseTitle}>
                          {expense.title}
                          {expense.isDraft ? (
                            <span
                              className={styles.draftBadge}
                              title="Черновик не учитывается в балансах и итоговых переводах"
                            >
                              Черновик
                            </span>
                          ) : expense.isSettled ? (
                            <span className={styles.settledBadge}>✓ Закрыта</span>
                          ) : null}
                        </strong>
                        {expense.description ? <span>{expense.description}</span> : null}
                        <span>Заплатил {expense.payerName}</span>
                      </div>
                      <b>{formatRubles(expense.totalAmount)}</b>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className={styles.muted}>Трат пока нет</p>
          )}
        </div>
      </details>

      <details
        className={styles.overview}
        onToggle={overview.onToggle('payments')}
        open={overview.state.payments}
      >
        <summary>
          <span>
            <strong>Платежи</strong>
            <small>{paymentsQuery.data?.length ?? 0} в группе</small>
          </span>
          <span aria-hidden="true">⌄</span>
        </summary>
        <div className={styles.overviewBody}>
          {recentPayments.length ? (
            <ul className={styles.paymentList}>
              {recentPayments.map((payment) => (
                <li key={payment.id}>
                  <Link className={styles.expenseLink} to={routes.payment(groupId, payment.id)}>
                    <div>
                      <strong>
                        {payment.fromUserId === dashboard.currentUserId
                          ? 'Вы'
                          : payment.fromDisplayName}{' '}
                        →{' '}
                        {payment.toUserId === dashboard.currentUserId
                          ? 'вы'
                          : payment.toDisplayName}
                      </strong>
                      <span>{payment.description ?? 'Без комментария'}</span>
                      <small>{payment.timestamp.toLocaleString('ru-RU')}</small>
                    </div>
                    <b>{formatRubles(payment.amount)}</b>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>
              {paymentsQuery.isPending ? 'Загружаем платежи…' : 'Платежей пока нет.'}
            </p>
          )}
          {paymentsQuery.data?.length ? (
            <Link className={styles.allLink} to={routes.payments(groupId)}>
              Все платежи
            </Link>
          ) : null}
        </div>
      </details>

      <section aria-labelledby="actions-heading" className={styles.actions}>
        <div className={styles.actionsHeading}>
          <h2 id="actions-heading">Действия</h2>
          <p>Добавляйте операции и управляйте группой</p>
        </div>
        <nav aria-label="Действия с группой" className={styles.actionList}>
          {canCreateExpense ? (
            <Link className={styles.actionPrimary} to={routes.createExpense(groupId)}>
              <span>
                <strong>Новая трата</strong>
                <small>Кто заплатил и как разделить сумму</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
          {canCreatePayment ? (
            <Link className={styles.actionItem} to={routes.createPayment(groupId)}>
              <span>
                <strong>Новый платёж</strong>
                <small>Обычный перевод или погашение траты</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
          {canManageMembers ? (
            <Link className={styles.actionItem} to={routes.invite(groupId)}>
              <span>
                <strong>Пригласить участника</strong>
                <small>Создать ссылку для вступления в группу</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </nav>
      </section>

      <section aria-labelledby="sections-heading" className={styles.sections}>
        <div className={styles.actionsHeading}>
          <h2 id="sections-heading">Разделы группы</h2>
          <p>Сводные результаты и настройки</p>
        </div>
        <nav aria-label="Разделы группы" className={styles.navigation}>
          <Link className={styles.navigationItem} to={routes.transfers(groupId)}>
            <span>
              <strong>Итоговые переводы</strong>
              <small>Кто кому и сколько нужно перевести по итогам</small>
            </span>
            <span aria-hidden="true">›</span>
          </Link>
          <Link className={styles.navigationItem} to={routes.members(groupId)}>
            <span>
              <strong>Участники</strong>
              <small>Состав группы и доступы</small>
            </span>
            <span aria-hidden="true">›</span>
          </Link>
          <Link className={styles.navigationItem} to={routes.auditLog(groupId)}>
            <span>
              <strong>История</strong>
              <small>Все изменения трат, платежей и участников</small>
            </span>
            <span aria-hidden="true">›</span>
          </Link>
          <Link className={styles.navigationItem} to={routes.settings(groupId)}>
            <span>
              <strong>Настройки</strong>
              <small>Параметры текущей группы</small>
            </span>
            <span aria-hidden="true">›</span>
          </Link>
        </nav>
      </section>
    </PageLayout>
  );
}
