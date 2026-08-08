import { Link, useParams } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { groupPermissions, useGroupDashboardQuery } from '@/entities/group';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { formatRubles } from '@/shared/lib/money';
import { PageLayout } from '@/shared/ui';
import styles from '@/pages/group-details/ui/GroupDetailsPage.module.scss';

export function GroupDetailsPage() {
  const { groupId } = useParams();

  if (!groupId) {
    return null;
  }

  const platform = usePlatform();
  const hasDevelopmentIdentity = Boolean(getRuntimeConfig().developmentTelegramUserId);
  const canRequestGroup =
    platform.kind === 'telegram' ? Boolean(platform.getInitData()) : hasDevelopmentIdentity;
  const dashboardQuery = useGroupDashboardQuery(groupId, canRequestGroup);

  if (!canRequestGroup) {
    return (
      <PageLayout
        backTo={routes.groups}
        backLabel="К группам"
        title="Группа"
        description="Откройте приложение из Telegram или настройте local development ID."
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
        description="Не удалось загрузить данные группы."
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

  const navigationItems = [
    {
      to: routes.createExpense(groupId),
      label: 'Новая трата',
      description: 'Кто заплатил и как разделить сумму.',
    },
    {
      to: routes.payments(groupId),
      label: 'Платежи',
      description: 'Переводы и погашения трат.',
    },
    {
      to: routes.transfers(groupId),
      label: 'Итоговые переводы',
      description: 'Посмотреть, кто кому должен.',
    },
    {
      to: routes.auditLog(groupId),
      label: 'История',
      description: 'Посмотреть изменения в группе.',
    },
    { to: routes.members(groupId), label: 'Участники', description: 'Состав группы и доступы.' },
    { to: routes.settings(groupId), label: 'Настройки', description: 'Параметры группы.' },
  ];

  return (
    <PageLayout
      backTo={routes.groups}
      backLabel="К группам"
      title={dashboard.title}
      description={`${dashboard.members.length} ${dashboard.members.length === 1 ? 'участник' : 'участника'}`}
    >
      {canCreateExpense ? (
        <Link className={styles.primaryAction} to={routes.createExpense(groupId)}>
          Добавить трату
        </Link>
      ) : null}
      {canCreatePayment ? (
        <Link className={styles.secondaryAction} to={routes.createPayment(groupId)}>
          Добавить платёж
        </Link>
      ) : null}
      {canManageMembers ? (
        <Link className={styles.secondaryAction} to={routes.invite(groupId)}>
          Пригласить участника
        </Link>
      ) : null}

      <section aria-labelledby="balances-heading" className={styles.section}>
        <h2 id="balances-heading">Баланс</h2>
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
          <p className={styles.muted}>Пока никто никому не должен.</p>
        )}
      </section>

      <section aria-labelledby="expenses-heading" className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2 id="expenses-heading">Траты</h2>
          <span>{dashboard.expenses.length}</span>
        </div>
        {dashboard.expenses.length ? (
          <ul className={styles.expenseList}>
            {dashboard.expenses.map((expense) => (
              <li key={expense.id}>
                <Link className={styles.expenseLink} to={routes.expense(groupId, expense.id)}>
                  <div>
                    <strong className={styles.expenseTitle}>
                      {expense.title}
                      {expense.isSettled ? (
                        <span className={styles.settledBadge}>✓ Закрыта</span>
                      ) : null}
                    </strong>
                    <span>Заплатил {expense.payerName}</span>
                    {expense.payerUsername ? <small>@{expense.payerUsername}</small> : null}
                  </div>
                  <b>{formatRubles(expense.totalAmount)}</b>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>Трат пока нет.</p>
        )}
      </section>

      <nav aria-label="Разделы группы" className={styles.navigation}>
        {navigationItems.map((item) => (
          <Link className={styles.navigationItem} key={item.to} to={item.to}>
            <span>{item.label}</span>
            <small>{item.description}</small>
          </Link>
        ))}
      </nav>
    </PageLayout>
  );
}
