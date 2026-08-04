import { useNavigate, useParams } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { useGroupDashboardQuery } from '@/entities/group';
import { useCreateExpense } from '@/features/create-expense';
import { ExpenseEditorForm } from '@/features/expense-editor';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { PageLayout } from '@/shared/ui';

export function ExpenseCreatePage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const platform = usePlatform();
  const hasDevelopmentIdentity = Boolean(getRuntimeConfig().developmentTelegramUserId);
  const canRequestGroup =
    platform.kind === 'telegram' ? Boolean(platform.getInitData()) : hasDevelopmentIdentity;
  const dashboardQuery = useGroupDashboardQuery(groupId ?? '', Boolean(groupId) && canRequestGroup);
  const createExpense = useCreateExpense(groupId ?? '');

  if (!groupId) return null;
  if (dashboardQuery.isPending)
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Новая трата"
        description="Загружаем участников…"
      />
    );
  if (dashboardQuery.isError || !dashboardQuery.data)
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Новая трата"
        description="Не удалось загрузить участников группы."
      />
    );

  const dashboard = dashboardQuery.data;
  return (
    <PageLayout
      backTo={routes.group(groupId)}
      backLabel="К группе"
      title="Новая трата"
      description="Заполните сумму и распределите её между участниками."
    >
      <ExpenseEditorForm
        currentUserId={dashboard.currentUserId}
        members={dashboard.members}
        onSave={async (input) => {
          await createExpense.mutateAsync(input);
          platform.impact('light');
          navigate(routes.group(groupId), { replace: true });
        }}
        submitLabel="Сохранить трату"
      />
    </PageLayout>
  );
}
