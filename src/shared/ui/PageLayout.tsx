import { Link, type To } from 'react-router-dom';
import styles from '@/shared/ui/PageLayout.module.scss';

interface PageLayoutProps {
  title: string;
  description: string;
  backTo?: To;
  backLabel?: string;
  children?: React.ReactNode;
}

export function PageLayout({
  title,
  description,
  backTo,
  backLabel = 'Назад',
  children,
}: PageLayoutProps) {
  return (
    <section className={styles.page}>
      {backTo ? (
        <Link className={styles.backLink} to={backTo}>
          ← {backLabel}
        </Link>
      ) : null}
      <header className={styles.header}>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
      <footer className={styles.attribution}>
        <span>Designed by </span>
        <a href="https://t.me/msloginoff" rel="noreferrer" target="_blank">
          @msloginoff
        </a>
        <span> · Support &amp; feedback</span>
      </footer>
    </section>
  );
}
