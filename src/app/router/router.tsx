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
import { PaymentCreatePage } from '@/pages/payment-create';
import { PaymentDetailsPage } from '@/pages/payment-details';
import { PaymentsPage } from '@/pages/payments';
import { AuditLogPage } from '@/pages/audit-log';
import { TransfersPage } from '@/pages/transfers';
import { AppErrorPage } from '@/pages/app-error';
import { MemberExpensesPage } from '@/pages/member-expenses';

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
    errorElement: <AppErrorPage />,
    children: [
      { index: true, element: <IndexRedirect /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'groups/new', element: <GroupCreatePage /> },
      { path: 'groups/:groupId', element: <GroupDetailsPage /> },
      {
        path: 'groups/:groupId/member-expenses',
        element: <MemberExpensesPage />,
      },
      {
        path: 'groups/:groupId/expenses/new',
        element: <ExpenseCreatePage />,
      },
      {
        path: 'groups/:groupId/expenses/:expenseId',
        element: <ExpenseDetailsPage />,
      },
      {
        path: 'groups/:groupId/payments',
        element: <PaymentsPage />,
      },
      {
        path: 'groups/:groupId/payments/new',
        element: <PaymentCreatePage />,
      },
      {
        path: 'groups/:groupId/payments/:paymentId',
        element: <PaymentDetailsPage />,
      },
      {
        path: 'groups/:groupId/transfers',
        element: <TransfersPage />,
      },
      {
        path: 'groups/:groupId/history',
        element: <AuditLogPage />,
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
            description="Здесь будут редкие настройки группы"
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
