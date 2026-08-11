import { useNavigate } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { CreateGroupForm } from '@/features/create-group';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { PageLayout } from '@/shared/ui';

export function GroupCreatePage() {
  const navigate = useNavigate();
  const platform = usePlatform();
  const hasDevelopmentIdentity = Boolean(getRuntimeConfig().developmentTelegramUserId);
  const canCreateGroup =
    platform.kind === 'telegram' ? Boolean(platform.getInitData()) : hasDevelopmentIdentity;

  return (
    <PageLayout
      backTo={routes.groups}
      backLabel="К группам"
      title="Новая группа"
      description="Вы автоматически станете владельцем и первым участником"
    >
      {canCreateGroup ? (
        <CreateGroupForm
          onCreated={(groupId) => {
            platform.impact('light');
            navigate(routes.group(groupId), { replace: true });
          }}
        />
      ) : (
        <p>Создание доступно в Telegram или при настроенном локальном development ID</p>
      )}
    </PageLayout>
  );
}
