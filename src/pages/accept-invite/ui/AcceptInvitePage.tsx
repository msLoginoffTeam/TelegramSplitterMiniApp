import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAcceptGroupInvite } from '@/entities/group';
import { PageLayout } from '@/shared/ui';

export function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { mutate, data, isError } = useAcceptGroupInvite();

  useEffect(() => {
    if (token) mutate(token);
  }, [mutate, token]);

  useEffect(() => {
    if (data) {
      navigate(`/groups/${data.id}`, { replace: true });
    }
  }, [data, navigate]);

  return (
    <PageLayout
      title="Приглашение в группу"
      description={isError ? 'Ссылка недействительна или уже истекла.' : 'Добавляем вас в группу…'}
    />
  );
}
