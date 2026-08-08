import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { useGroupDashboardQuery } from '@/entities/group';
import { useCreatePayment } from '@/features/create-payment';
import { PaymentEditorForm } from '@/features/payment-editor';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { PageLayout } from '@/shared/ui';

export function PaymentCreatePage() {
  const { groupId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const platform = usePlatform();
  const hasDevelopmentIdentity = Boolean(getRuntimeConfig().developmentTelegramUserId);
  const canRequestGroup =
    platform.kind === 'telegram' ? Boolean(platform.getInitData()) : hasDevelopmentIdentity;
  const dashboardQuery = useGroupDashboardQuery(groupId ?? '', Boolean(groupId) && canRequestGroup);
  const createPayment = useCreatePayment(groupId ?? '');
  const initialExpenseId = searchParams.get('expenseId') ?? undefined;
  const initialFromUserId = searchParams.get('fromUserId') ?? undefined;
  const initialToUserId = searchParams.get('toUserId') ?? undefined;
  const initialAmount = parseInitialAmount(searchParams.get('amount'));

  if (!groupId) return null;
  if (!canRequestGroup) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Новый платёж"
        description="Откройте приложение из Telegram или настройте local development ID."
      />
    );
  }
  if (dashboardQuery.isPending) {
    return (
      <PageLayout
        backTo={routes.payments(groupId)}
        backLabel="К платежам"
        title="Новый платёж"
        description="Загружаем участников…"
      />
    );
  }
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Новый платёж"
        description="Не удалось загрузить данные группы."
      />
    );
  }

  const dashboard = dashboardQuery.data;
  const selectedExpense = initialExpenseId
    ? dashboard.expenses.find((expense) => expense.id === initialExpenseId)
    : undefined;
  if (initialExpenseId && !selectedExpense) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Платёж к трате"
        description="Трата не найдена или больше недоступна."
      />
    );
  }

  return (
    <PageLayout
      backTo={
        initialExpenseId ? routes.expense(groupId, initialExpenseId) : routes.payments(groupId)
      }
      backLabel={initialExpenseId ? 'К трате' : 'К платежам'}
      title={initialExpenseId ? 'Погасить трату' : 'Новый платёж'}
      description={
        initialExpenseId
          ? 'Укажите, кто и сколько вернул по этой трате.'
          : 'Зафиксируйте перевод между участниками или погашение траты.'
      }
    >
      <PaymentEditorForm
        currentUserId={dashboard.currentUserId}
        expenses={dashboard.expenses.map((expense) => ({
          id: expense.id,
          title: expense.title,
          payerId: expense.payerId,
          payerName: expense.payerName,
        }))}
        initialExpenseId={initialExpenseId}
        initialFromUserId={initialFromUserId}
        initialToUserId={initialToUserId}
        initialAmount={initialAmount}
        members={dashboard.members}
        onSave={async (input) => {
          await createPayment.mutateAsync(input);
          platform.impact('light');
          navigate(routes.payments(groupId), { replace: true });
        }}
      />
    </PageLayout>
  );
}

function parseInitialAmount(value: string | null): number | undefined {
  if (!value) return undefined;

  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}
