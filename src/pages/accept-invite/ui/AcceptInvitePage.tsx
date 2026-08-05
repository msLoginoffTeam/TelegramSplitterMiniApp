import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAcceptGroupInvite } from '@/entities/group';
import { PageLayout } from '@/shared/ui';

export function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { mutateAsync, isError } = useAcceptGroupInvite();
  const acceptanceStarted = useRef(false);

  useEffect(() => {
    if (!token || acceptanceStarted.current) return;

    acceptanceStarted.current = true;
    void mutateAsync(token)
      .then((group) => {
        navigate(`/groups/${group.id}`, { replace: true });
      })
      .catch(() => undefined);
  }, [mutateAsync, navigate, token]);

  return (
    <PageLayout
      title="Приглашение в группу"
      description={isError ? 'Ссылка недействительна или уже истекла.' : 'Добавляем вас в группу…'}
    />
  );
}
