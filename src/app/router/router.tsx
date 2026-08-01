import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/app/ui/AppShell';
import { NotFoundPage } from '@/pages/not-found';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
