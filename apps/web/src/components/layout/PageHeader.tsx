import Link from 'next/link';
import { Plus } from 'lucide-react';
import styles from './PageHeader.module.scss';

export function PageHeader({
  eyebrow,
  title,
  actionHref,
  actionLabel
}: {
  eyebrow: string;
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.title}>{title}</h2>
      </div>
      {actionHref && actionLabel ? (
        <Link className={styles.action} href={actionHref}>
          <Plus size={18} />
          {actionLabel}
        </Link>
      ) : null}
    </header>
  );
}
