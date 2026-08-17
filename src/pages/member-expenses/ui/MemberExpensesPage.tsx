import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { type MemberExpenseInvolvement, useMemberExpensesQuery } from '@/entities/member-expense';
import { useGroupDashboardQuery } from '@/entities/group';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { formatRubles } from '@/shared/lib/money';
import { PageLayout } from '@/shared/ui';
import styles from './MemberExpensesPage.module.scss';

const involvementOptions: ReadonlyArray<{
  value: MemberExpenseInvolvement;
  label: string;
}> = [
  { value: 'all', label: 'Все' },
  { value: 'payer', label: 'Заплатил' },
  { value: 'participant', label: 'Делит' },
];

function getInvolvement(value: string | null): MemberExpenseInvolvement {
  return value === 'payer' || value === 'participant' ? value : 'all';
}

export function MemberExpensesPage() {
  const { groupId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const platform = usePlatform();
  const hasDevelopmentIdentity = Boolean(getRuntimeConfig().developmentTelegramUserId);
  const canRequest =
    platform.kind === 'telegram' ? Boolean(platform.getInitData()) : hasDevelopmentIdentity;
  const dashboardQuery = useGroupDashboardQuery(groupId ?? '', Boolean(groupId) && canRequest);
  const requestedMemberId = searchParams.get('memberId');
  const involvement = getInvolvement(searchParams.get('involvement'));
  const dashboard = dashboardQuery.data;
  const selectedMember =
    dashboard?.members.find((member) => member.userId === requestedMemberId) ??
    dashboard?.members.find((member) => member.userId === dashboard.currentUserId) ??
    dashboard?.members[0];
  const selectedMemberId = selectedMember?.userId ?? '';
  const expensesQuery = useMemberExpensesQuery(
    groupId ?? '',
    selectedMemberId,
    involvement,
    Boolean(groupId && selectedMemberId) && canRequest,
  );

  useEffect(() => {
    if (!selectedMemberId || selectedMemberId === requestedMemberId) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('memberId', selectedMemberId);
    setSearchParams(nextParams, { replace: true });
  }, [requestedMemberId, searchParams, selectedMemberId, setSearchParams]);

  if (!groupId) return null;
  if (!canRequest) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Траты участника"
        description="Откройте приложение из Telegram"
      />
    );
  }
  if (dashboardQuery.isPending || !selectedMemberId || expensesQuery.isPending) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Траты участника"
        description="Загружаем траты…"
      />
    );
  }
  if (dashboardQuery.isError || !dashboard || expensesQuery.isError || !expensesQuery.data) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Траты участника"
        description="Не удалось загрузить траты"
      >
        <button className={styles.retry} onClick={() => expensesQuery.refetch()} type="button">
          Повторить
        </button>
      </PageLayout>
    );
  }

  const expenses = expensesQuery.data;
  const paidTotal = expenses
    .filter((expense) => expense.isPayer && !expense.isDraft)
    .reduce((total, expense) => total + expense.totalAmount, 0);
  const sharesTotal = expenses
    .filter((expense) => !expense.isDraft && expense.shareAmount !== undefined)
    .reduce((total, expense) => total + (expense.shareAmount ?? 0), 0);
  const currentUrl = `${routes.memberExpenses(groupId)}?${searchParams.toString()}`;

  function updateParams(changes: Record<string, string>) {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => nextParams.set(key, value));
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <PageLayout
      backTo={routes.group(groupId)}
      backLabel="К группе"
      title="Траты участника"
      description="Быстрый обзор трат и долей выбранного участника"
    >
      <label className={styles.memberSelect}>
        <span>Участник</span>
        <select
          onChange={(event) => updateParams({ memberId: event.target.value })}
          value={selectedMemberId}
        >
          {dashboard.members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.userId === dashboard.currentUserId ? 'Вы' : member.displayName}
              {member.username ? ` · @${member.username}` : ''}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.filters} role="group" aria-label="Роль участника в трате">
        {involvementOptions.map((option) => (
          <button
            aria-pressed={involvement === option.value}
            className={styles.filter}
            key={option.value}
            onClick={() => updateParams({ involvement: option.value })}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <section className={styles.summary} aria-label="Итоги по выбранным тратам">
        <span>
          <small>Заплатил</small>
          <strong>{formatRubles(paidTotal)}</strong>
        </span>
        <span>
          <small>Сумма долей</small>
          <strong>{formatRubles(sharesTotal)}</strong>
        </span>
        {expenses.some((expense) => expense.isDraft) ? <p>Черновики не входят в итог</p> : null}
      </section>

      {expenses.length ? (
        <ul className={styles.list}>
          {expenses.map((expense) => {
            const remaining = Math.max(0, (expense.shareAmount ?? 0) - (expense.paidAmount ?? 0));
            const settlement = expense.isDraft
              ? 'Черновик'
              : expense.shareAmount === undefined
                ? undefined
                : expense.isPaidByPayments
                  ? expense.overpaymentAmount
                    ? `Оплачено · переплата ${formatRubles(expense.overpaymentAmount)}`
                    : 'Оплачено платежами'
                  : expense.isManuallySettled
                    ? 'Помечено оплаченным'
                    : `Осталось оплатить ${formatRubles(remaining)}`;

            return (
              <li key={expense.id}>
                <Link
                  className={styles.expenseLink}
                  state={{ returnTo: currentUrl }}
                  to={routes.expense(groupId, expense.id)}
                >
                  <span className={styles.expenseMain}>
                    <strong>
                      {expense.title}
                      {expense.isDraft ? <em className={styles.draftBadge}>Черновик</em> : null}
                    </strong>
                    {expense.description ? <small>{expense.description}</small> : null}
                    <small>Заплатил {expense.payerName}</small>
                  </span>
                  <span className={styles.amounts}>
                    <strong>{formatRubles(expense.totalAmount)}</strong>
                    {expense.shareAmount !== undefined ? (
                      <small>Доля {formatRubles(expense.shareAmount)}</small>
                    ) : null}
                    {settlement ? <small data-settlement={settlement}>{settlement}</small> : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.empty}>В подходящих тратах участник пока не участвует</p>
      )}
    </PageLayout>
  );
}
