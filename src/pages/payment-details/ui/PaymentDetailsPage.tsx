import { useNavigate, useParams } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { groupPermissions, useGroupDashboardQuery } from '@/entities/group';
import { useGroupPaymentsQuery } from '@/entities/payment';
import { useDeletePayment } from '@/features/delete-payment';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { formatRubles } from '@/shared/lib/money';
import { PageLayout } from '@/shared/ui';
import styles from './PaymentDetailsPage.module.scss';

export function PaymentDetailsPage() {
  const { groupId, paymentId } = useParams();
  const platform = usePlatform();
  const hasDevelopmentIdentity = Boolean(getRuntimeConfig().developmentTelegramUserId);
  const canRequest =
    platform.kind === 'telegram' ? Boolean(platform.getInitData()) : hasDevelopmentIdentity;
  const dashboardQuery = useGroupDashboardQuery(groupId ?? '', Boolean(groupId) && canRequest);
  const paymentsQuery = useGroupPaymentsQuery(groupId ?? '', Boolean(groupId) && canRequest);

  if (!groupId || !paymentId) return null;
  if (!canRequest || dashboardQuery.isPending || paymentsQuery.isPending) {
    return (
      <PageLayout
        backTo={routes.payments(groupId)}
        backLabel="К платежам"
        title="Платёж"
        description={canRequest ? 'Загружаем платёж…' : 'Откройте приложение из Telegram'}
      />
    );
  }

  const dashboard = dashboardQuery.data;
  const payment = paymentsQuery.data?.find((candidate) => candidate.id === paymentId);
  if (dashboardQuery.isError || paymentsQuery.isError || !dashboard || !payment) {
    return (
      <PageLayout
        backTo={routes.payments(groupId)}
        backLabel="К платежам"
        title="Платёж"
        description="Платёж не найден или больше недоступен"
      />
    );
  }

  return <PaymentDetailsContent dashboard={dashboard} groupId={groupId} paymentId={paymentId} />;
}

function PaymentDetailsContent({
  dashboard,
  groupId,
  paymentId,
}: {
  dashboard: NonNullable<ReturnType<typeof useGroupDashboardQuery>['data']>;
  groupId: string;
  paymentId: string;
}) {
  const navigate = useNavigate();
  const paymentsQuery = useGroupPaymentsQuery(groupId, true);
  const payment = paymentsQuery.data?.find((candidate) => candidate.id === paymentId);

  if (!payment) return null;

  const currentMember = dashboard.members.find(
    (member) => member.userId === dashboard.currentUserId,
  );
  const isAuthor = payment.createdByUserId === dashboard.currentUserId;
  const canDelete = currentMember?.permissions.includes(
    isAuthor ? groupPermissions.deleteOwnPayment : groupPermissions.deleteAnyPayment,
  );
  const deletePayment = useDeletePayment(groupId, payment);
  const expenseTitle = payment.expenseId
    ? dashboard.expenses.find((expense) => expense.id === payment.expenseId)?.title
    : undefined;

  return (
    <PageLayout
      backTo={routes.payments(groupId)}
      backLabel="К платежам"
      title="Платёж"
      description={`${payment.fromDisplayName} → ${payment.toDisplayName} · ${formatRubles(payment.amount)}`}
    >
      <section className={styles.details}>
        <p>{expenseTitle ? `Погашение: ${expenseTitle}` : 'Просто перевод'}</p>
        {payment.description ? <p className={styles.description}>{payment.description}</p> : null}
        <small>Платёж создан {payment.timestamp.toLocaleString('ru-RU')}</small>
      </section>

      {canDelete ? (
        <button
          className={styles.danger}
          disabled={deletePayment.isPending}
          onClick={async () => {
            if (!window.confirm('Удалить этот платёж?')) return;
            await deletePayment.mutateAsync();
            navigate(routes.payments(groupId), { replace: true });
          }}
          type="button"
        >
          {deletePayment.isPending ? 'Удаляем…' : 'Удалить платёж'}
        </button>
      ) : null}
    </PageLayout>
  );
}
