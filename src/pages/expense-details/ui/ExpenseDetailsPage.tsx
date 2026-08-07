import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { useExpenseQuery } from '@/entities/expense';
import { groupPermissions, useGroupDashboardQuery } from '@/entities/group';
import { useGroupPaymentsQuery } from '@/entities/payment';
import { useDeleteExpense } from '@/features/delete-expense';
import { ExpenseEditorForm, type ExpenseEditorInitialValues } from '@/features/expense-editor';
import { useUpdateExpense } from '@/features/update-expense';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { formatRubles } from '@/shared/lib/money';
import { PageLayout } from '@/shared/ui';
import styles from './ExpenseDetailsPage.module.scss';

export function ExpenseDetailsPage() {
  const { groupId, expenseId } = useParams();
  const navigate = useNavigate();
  const platform = usePlatform();
  const canRequest =
    platform.kind === 'telegram'
      ? Boolean(platform.getInitData())
      : Boolean(getRuntimeConfig().developmentTelegramUserId);

  const dashboardQuery = useGroupDashboardQuery(groupId ?? '', Boolean(groupId) && canRequest);
  const expenseQuery = useExpenseQuery(
    groupId ?? '',
    expenseId ?? '',
    Boolean(groupId && expenseId) && canRequest,
  );
  const paymentsQuery = useGroupPaymentsQuery(
    groupId ?? '',
    Boolean(groupId && expenseId) && canRequest,
  );
  const updateExpense = useUpdateExpense(groupId ?? '', expenseId ?? '');
  const deleteExpense = useDeleteExpense(groupId ?? '', expenseId ?? '');

  if (!groupId || !expenseId) return null;
  if (!canRequest) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Трата"
        description="Откройте приложение из Telegram или настройте local development ID."
      />
    );
  }
  if (expenseQuery.isPending || dashboardQuery.isPending || paymentsQuery.isPending) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Трата"
        description="Загружаем данные…"
      />
    );
  }
  if (
    expenseQuery.isError ||
    paymentsQuery.isError ||
    !expenseQuery.data ||
    dashboardQuery.isError ||
    !dashboardQuery.data
  ) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Трата"
        description="Не удалось загрузить трату."
      >
        <button className={styles.action} onClick={() => expenseQuery.refetch()} type="button">
          Повторить
        </button>
      </PageLayout>
    );
  }

  const expense = expenseQuery.data;
  const dashboard = dashboardQuery.data;
  const currentMember = dashboard.members.find(
    (member) => member.userId === dashboard.currentUserId,
  );
  const isAuthor = expense.createdByUserId === dashboard.currentUserId;
  const canEdit = currentMember?.permissions.includes(
    isAuthor ? groupPermissions.updateOwnExpense : groupPermissions.updateAnyExpense,
  );
  const canDelete = currentMember?.permissions.includes(
    isAuthor ? groupPermissions.deleteOwnExpense : groupPermissions.deleteAnyExpense,
  );
  const canCreatePayment =
    currentMember?.permissions.includes(groupPermissions.createPayment) ?? false;
  const initialValues: ExpenseEditorInitialValues = {
    title: expense.title,
    totalAmount: expense.totalAmount,
    payerId: expense.payerId,
    participantIds: expense.shares.map((share) => share.userId),
    allocations: Object.fromEntries(
      expense.shares.map((share) => [share.userId, Math.round(share.amount * 100)]),
    ),
  };
  const payments = (paymentsQuery.data ?? [])
    .filter((payment) => payment.expenseId === expenseId)
    .sort((first, second) => second.timestamp.getTime() - first.timestamp.getTime());

  return (
    <PageLayout
      backTo={routes.group(groupId)}
      backLabel="К группе"
      title={expense.title}
      description={`${formatRubles(expense.totalAmount)} · заплатил ${expense.payerName}`}
    >
      {canEdit ? (
        <details className={styles.editor}>
          <summary>Редактировать трату</summary>
          <ExpenseEditorForm
            currentUserId={dashboard.currentUserId}
            initialValues={initialValues}
            members={dashboard.members}
            onSave={async (input) => {
              await updateExpense.mutateAsync(input);
              platform.impact('light');
            }}
            submitLabel="Сохранить изменения"
          />
        </details>
      ) : null}

      <section className={styles.section}>
        <h2>Распределение</h2>
        <ul className={styles.shareList}>
          {expense.shares.map((share) => (
            <li key={share.userId}>
              <span>
                <strong>
                  {share.userId === expense.payerId ? 'Плательщик' : share.displayName}
                </strong>
                {share.username ? <small>@{share.username}</small> : null}
              </span>
              <span>
                {formatRubles(share.amount)}
                <small>{share.isPaid ? 'Оплачено' : 'Не оплачено'}</small>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Платежи по трате</h2>
        {payments.length ? (
          <ul className={styles.paymentList}>
            {payments.map((payment) => (
              <li key={payment.id}>
                <span>
                  <strong>
                    {payment.fromUserId === dashboard.currentUserId
                      ? 'Вы'
                      : payment.fromDisplayName}{' '}
                    → {payment.toUserId === dashboard.currentUserId ? 'вы' : payment.toDisplayName}
                  </strong>
                  <small>{payment.timestamp.toLocaleString('ru-RU')}</small>
                </span>
                <b>{formatRubles(payment.amount)}</b>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>Платежей по этой трате пока нет.</p>
        )}
      </section>

      {canCreatePayment ? (
        <Link className={styles.action} to={routes.createExpensePayment(groupId, expenseId)}>
          Добавить платёж к трате
        </Link>
      ) : null}

      {canDelete ? (
        <button
          className={styles.dangerAction}
          disabled={deleteExpense.isPending}
          onClick={async () => {
            if (!window.confirm('Удалить эту трату?')) return;
            await deleteExpense.mutateAsync();
            navigate(routes.group(groupId), { replace: true });
          }}
          type="button"
        >
          {deleteExpense.isPending ? 'Удаляем…' : 'Удалить трату'}
        </button>
      ) : null}
      <Link className={styles.backLink} to={routes.group(groupId)}>
        Вернуться к группе
      </Link>
    </PageLayout>
  );
}
