'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/layout';
import { TablePagination, TableSearch, useSearchPagination } from '@/components/tables';
import { currency, PLANS_QUERY, Plan } from '@/features/billing';
import styles from '../dashboard.module.scss';

export default function PlansPage() {
  const { data, loading } = useQuery<{ plans: Plan[] }>(PLANS_QUERY);
  const plans = data?.plans ?? [];
  const table = useSearchPagination(plans, (plan, search) =>
    [plan.name, plan.speed, plan.monthlyPrice, plan.description, plan.isActive ? 'active yes' : 'inactive no']
      .some((value) => String(value).toLowerCase().includes(search))
  );

  return (
    <AppShell>
      <PageHeader eyebrow="Plan catalog" title="Internet plans" actionHref="/plans/new" actionLabel="Add plan" />
      <section className="mt-6 rounded-lg border border-line bg-white shadow-panel">
        <div className="border-b border-line px-5 py-4">
          <TableSearch value={table.search} onChange={table.setSearch} placeholder="Search plans" />
        </div>
        <div className={`${styles.tableWrap} overflow-x-auto`}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Speed</th>
                <th className="px-5 py-3">Monthly price</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-5" colSpan={6}>Loading plans...</td></tr>
              ) : table.totalRows === 0 ? (
                <tr><td className="px-5 py-5" colSpan={6}>No plans yet.</td></tr>
              ) : table.pagedRows.map((plan) => (
                <tr key={plan.id} className="border-t border-line">
                  <td className="px-5 py-4 font-medium">{plan.name}</td>
                  <td className="px-5 py-4">{plan.speed}</td>
                  <td className="px-5 py-4">{currency(plan.monthlyPrice)}</td>
                  <td className="px-5 py-4">{plan.description}</td>
                  <td className="px-5 py-4">{plan.isActive ? 'Yes' : 'No'}</td>
                  <td className="px-5 py-4">
                    <Link
                      aria-label={`Edit ${plan.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-slate-600 hover:border-teal hover:text-teal"
                      href={`/plans/${plan.id}/edit`}
                      title="Edit plan"
                    >
                      <Pencil size={16} />
                    </Link>
                  </td>
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
