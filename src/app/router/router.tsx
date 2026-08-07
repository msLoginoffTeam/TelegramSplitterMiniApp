import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/app/ui/AppShell';
import { routes } from '@/shared/config/routes';
import { ExpenseCreatePage } from '@/pages/expense-create';
import { ExpenseDetailsPage } from '@/pages/expense-details';
import { GroupCreatePage } from '@/pages/group-create';
import { GroupDetailsPage } from '@/pages/group-details';
import { GroupSectionPage } from '@/pages/group-section';
import { MembersPage } from '@/pages/members';
import { GroupsPage } from '@/pages/groups';
import { NotFoundPage } from '@/pages/not-found';
import { GroupInvitePage } from '@/pages/group-invite';
import { AcceptInvitePage } from '@/pages/accept-invite';
import { usePlatform } from '@/app/providers/PlatformProvider';

function IndexRedirect() {
  const platform = usePlatform();
  const startParam = platform.getStartParam();

  if (startParam?.startsWith('invite_')) {
    return (
      <Navigate replace to={`/invite/${encodeURIComponent(startParam.slice('invite_'.length))}`} />
    );
  }

  return <Navigate replace to={routes.groups} />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <IndexRedirect /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'groups/new', element: <GroupCreatePage /> },
      { path: 'groups/:groupId', element: <GroupDetailsPage /> },
      {
        path: 'groups/:groupId/expenses/new',
        element: <ExpenseCreatePage />,
      },
      {
        path: 'groups/:groupId/expenses/:expenseId',
        element: <ExpenseDetailsPage />,
      },
      {
        path: 'groups/:groupId/payments/new',
        element: (
          <GroupSectionPage
            title="Новый платёж"
            description="Здесь будет фиксация перевода между участниками."
          />
        ),
      },
      {
        path: 'groups/:groupId/transfers',
        element: (
          <GroupSectionPage
            title="Итоговые переводы"
            description="Здесь появится список оптимальных расчётов."
          />
        ),
      },
      {
        path: 'groups/:groupId/members',
        element: <MembersPage />,
      },
      {
        path: 'groups/:groupId/settings',
        element: (
          <GroupSectionPage
            title="Настройки группы"
            description="Здесь будут редкие настройки группы."
          />
        ),
      },
      {
        path: 'groups/:groupId/invite',
        element: <GroupInvitePage />,
      },
      {
        path: 'invite/:token',
        element: <AcceptInvitePage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
