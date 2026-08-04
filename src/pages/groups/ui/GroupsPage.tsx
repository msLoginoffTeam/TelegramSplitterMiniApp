import { Link } from 'react-router-dom';
import { routes } from '@/shared/config/routes';
import { PageLayout } from '@/shared/ui';
import styles from '@/pages/groups/ui/GroupsPage.module.scss';

export function GroupsPage() {
  return (
    <PageLayout
      title="Ваши группы"
      description="Здесь появятся совместные поездки, квартиры и другие общие траты."
    >
      <Link className={styles.primaryAction} to={routes.createGroup}>
        Создать группу
      </Link>
      <div className={styles.emptyState}>
        Пока групп нет. Создайте первую — затем добавите участников и траты.
      </div>
    </PageLayout>
  );
}
