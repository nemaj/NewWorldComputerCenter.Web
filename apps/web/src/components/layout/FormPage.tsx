import Link from 'next/link';
import { X } from 'lucide-react';
import { AppShell } from './AppShell';
import styles from './FormPage.module.scss';

export function FormPage({
  title,
  backHref,
  children
}: {
  title: string;
  backHref: string;
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className={styles.wrap}>
        <section className={styles.panel}>
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <Link className={styles.close} href={backHref}>
              <X size={18} />
            </Link>
          </div>
          {children}
        </section>
      </div>
    </AppShell>
  );
}
