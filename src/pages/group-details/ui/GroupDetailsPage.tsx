import { Link, useParams } from 'react-router-dom';
import { routes } from '@/shared/config/routes';
import { PageLayout } from '@/shared/ui';
import styles from '@/pages/group-details/ui/GroupDetailsPage.module.scss';

export function GroupDetailsPage() {
  const { groupId } = useParams();

  if (!groupId) {
    return null;
  }

  const navigationItems = [
    {
      to: routes.createExpense(groupId),
      label: 'Добавить трату',
      description: 'Кто заплатил и как разделить сумму.',
    },
    {
      to: routes.createPayment(groupId),
      label: 'Добавить платёж',
      description: 'Зафиксировать перевод между участниками.',
    },
    {
      to: routes.transfers(groupId),
      label: 'Итоговые переводы',
      description: 'Посмотреть, кто кому должен.',
    },
    { to: routes.members(groupId), label: 'Участники', description: 'Состав группы и доступы.' },
    { to: routes.settings(groupId), label: 'Настройки', description: 'Параметры группы.' },
  ];

  return (
    <PageLayout
      backTo={routes.groups}
      backLabel="К группам"
      title="Группа"
      description="Дашборд с балансами и историей появится после подключения API. Навигация уже готова."
    >
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
