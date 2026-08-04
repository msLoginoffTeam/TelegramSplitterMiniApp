import { routes } from '@/shared/config/routes';
import { PageLayout } from '@/shared/ui';

export function GroupCreatePage() {
  return (
    <PageLayout
      backTo={routes.groups}
      backLabel="К группам"
      title="Новая группа"
      description="На следующем шаге здесь появится короткая форма: название группы и первый участник — вы."
    />
  );
}
