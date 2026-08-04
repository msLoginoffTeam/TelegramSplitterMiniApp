import { useParams } from 'react-router-dom';
import { routes } from '@/shared/config/routes';
import { PageLayout } from '@/shared/ui';

interface GroupSectionPageProps {
  title: string;
  description: string;
}

export function GroupSectionPage({ title, description }: GroupSectionPageProps) {
  const { groupId } = useParams();

  if (!groupId) {
    return null;
  }

  return (
    <PageLayout
      backTo={routes.group(groupId)}
      backLabel="К группе"
      title={title}
      description={description}
    />
  );
}
