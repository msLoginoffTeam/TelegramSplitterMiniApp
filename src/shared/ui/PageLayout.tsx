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
    </section>
  );
}
