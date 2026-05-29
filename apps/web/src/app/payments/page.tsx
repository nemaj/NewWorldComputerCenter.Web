'use client';

import { useQuery } from '@apollo/client';
import { AppShell, PageHeader } from '@/components/layout';
import { TablePagination, TableSearch, useSearchPagination } from '@/components/tables';
import { currency, customerName, Payment, PAYMENTS_QUERY, shortDate } from '@/features/billing';
import styles from '../dashboard.module.scss';

export default function PaymentsPage() {
  const { data, loading } = useQuery<{ payments: Payment[] }>(PAYMENTS_QUERY);
  const payments = data?.payments ?? [];
  const table = useSearchPagination(payments, (payment, search) =>
    [
      payment.customer.accountNo,
      customerName(payment.customer),
      payment.invoice.billingMonth,
      payment.invoice.status,
      payment.amount,
      payment.paidAt
    ].some((value) => String(value).toLowerCase().includes(search))
  );

  return (
    <AppShell>
      <PageHeader eyebrow="Payment records" title="Payment history" />
      <section className="mt-6 rounded-lg border border-line bg-white shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h3 className="text-lg font-bold">Payments</h3>
            <p className="text-sm text-slate-500">Recorded customer payments across invoices.</p>
          </div>
          <TableSearch value={table.search} onChange={table.setSearch} placeholder="Search payments" />
        </div>
        <div className={`${styles.tableWrap} overflow-x-auto`}>
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Paid date</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3">Invoice month</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Invoice amount</th>
                <th className="px-5 py-3">Balance</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-5" colSpan={8}>Loading payments...</td></tr>
              ) : table.totalRows === 0 ? (
                <tr><td className="px-5 py-5" colSpan={8}>No payment history yet.</td></tr>
              ) : table.pagedRows.map((payment) => (
                <tr key={payment.id} className="border-t border-line">
                  <td className="px-5 py-4">{shortDate(payment.paidAt)}</td>
                  <td className="px-5 py-4 font-medium">{customerName(payment.customer)}</td>
                  <td className="px-5 py-4">{payment.customer.accountNo}</td>
                  <td className="px-5 py-4">{payment.invoice.billingMonth}</td>
                  <td className="px-5 py-4 font-bold">{currency(payment.amount)}</td>
                  <td className="px-5 py-4">{currency(payment.invoice.amount)}</td>
                  <td className="px-5 py-4">{currency(payment.invoice.balance ?? 0)}</td>
                  <td className="px-5 py-4">{payment.invoice.status}</td>
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
