'use client';

import { useQuery } from '@apollo/client';
import { AppShell, PageHeader } from '@/components/layout';
import { TablePagination, TableSearch, useSearchPagination } from '@/components/tables';
import { customerName, shortDate, SUBSCRIPTIONS_QUERY, Subscription } from '@/features/billing';
import styles from '../dashboard.module.scss';

export default function SubscriptionsPage() {
  const { data, loading } = useQuery<{ subscriptions: Subscription[] }>(SUBSCRIPTIONS_QUERY);
  const subscriptions = data?.subscriptions ?? [];
  const table = useSearchPagination(subscriptions, (subscription, search) =>
    [
      customerName(subscription.customer),
      subscription.customer.accountNo,
      subscription.plan.name,
      subscription.plan.speed,
      subscription.startDate,
      subscription.status
    ].some((value) => String(value).toLowerCase().includes(search))
  );

  return (
    <AppShell>
      <PageHeader eyebrow="Customer plans" title="Subscriptions" actionHref="/subscriptions/new" actionLabel="Assign plan" />
      <section className="mt-6 rounded-lg border border-line bg-white shadow-panel">
        <div className="border-b border-line px-5 py-4">
          <TableSearch value={table.search} onChange={table.setSearch} placeholder="Search subscriptions" />
        </div>
        <div className={`${styles.tableWrap} overflow-x-auto`}>
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Speed</th>
                <th className="px-5 py-3">Start date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-5" colSpan={5}>Loading subscriptions...</td></tr>
              ) : table.totalRows === 0 ? (
                <tr><td className="px-5 py-5" colSpan={5}>No subscriptions yet.</td></tr>
              ) : table.pagedRows.map((subscription) => (
                <tr key={subscription.id} className="border-t border-line">
                  <td className="px-5 py-4 font-medium">{customerName(subscription.customer)}</td>
                  <td className="px-5 py-4">{subscription.plan.name}</td>
                  <td className="px-5 py-4">{subscription.plan.speed}</td>
                  <td className="px-5 py-4">{shortDate(subscription.startDate)}</td>
                  <td className="px-5 py-4">{subscription.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination page={table.page} totalPages={table.totalPages} totalRows={table.totalRows} onPageChange={table.setPage} />
      </section>
    </AppShell>
  );
}
