import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main>
      <h1>Страница не найдена</h1>
      <Link to="/">Вернуться в приложение</Link>
    </main>
  );
}
