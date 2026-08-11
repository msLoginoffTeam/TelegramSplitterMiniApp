import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { routes } from '@/shared/config/routes';
import styles from './AppErrorPage.module.scss';

export function AppErrorPage() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.brand}>Splitter</span>
        <h1>{isNotFound ? 'Экран не найден' : 'Не удалось открыть экран'}</h1>
        <p>
          {isNotFound
            ? 'Возможно, ссылка устарела или страница была удалена.'
            : 'Данные не изменились. Попробуйте обновить приложение или вернуться к списку групп.'}
        </p>
        <div className={styles.actions}>
          <button onClick={() => window.location.reload()} type="button">
            Обновить
          </button>
          <Link to={routes.groups}>К группам</Link>
        </div>
      </section>
    </main>
  );
}
