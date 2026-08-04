import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/app/ui/AppShell';
import { routes } from '@/shared/config/routes';
import { GroupCreatePage } from '@/pages/group-create';
import { GroupDetailsPage } from '@/pages/group-details';
import { GroupSectionPage } from '@/pages/group-section';
import { GroupsPage } from '@/pages/groups';
import { NotFoundPage } from '@/pages/not-found';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate replace to={routes.groups} /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'groups/new', element: <GroupCreatePage /> },
      { path: 'groups/:groupId', element: <GroupDetailsPage /> },
      {
        path: 'groups/:groupId/expenses/new',
        element: (
          <GroupSectionPage
            title="Новая трата"
            description="Форма траты появится следующим коротким шагом."
          />
        ),
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
        element: (
          <GroupSectionPage
            title="Участники"
            description="Здесь будут состав группы и права доступа."
          />
        ),
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
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
