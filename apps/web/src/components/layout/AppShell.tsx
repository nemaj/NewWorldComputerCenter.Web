"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Gauge,
  Package,
  LayoutDashboard,
  ReceiptText,
  Router,
  UsersRound,
  Wifi,
} from "lucide-react";
import styles from "./AppShell.module.scss";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: UsersRound },
  { href: "/plans", label: "Plans", icon: Router },
  { href: "/subscriptions", label: "Subscriptions", icon: Gauge },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/payments", label: "Payments", icon: ReceiptText },
  { href: "/inventory", label: "Inventory", icon: Package },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <Brand />
        <DesktopNav pathname={pathname} />
      </aside>
      <header className={styles.mobileHeader}>
        <Brand compact />
      </header>
      <section className={styles.content}>{children}</section>
      <nav className={styles.mobileNav}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${active ? styles.active : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </main>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={`${styles.brand} ${compact ? styles.brandCompact : ""}`}
    >
      <div className={styles.brandIcon}>
        <Wifi size={compact ? 21 : 23} />
      </div>
      <div className={styles.brandText}>
        <p className={styles.brandEyebrow}>New World</p>
        <h1 className={styles.brandName}>Subscription Admin</h1>
      </div>
    </Link>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <nav className={styles.desktopNav}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.desktopNavItem} ${active ? styles.active : ""}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
