'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CalendarPlus, CreditCard } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/layout';
import { TablePagination, TableSearch, useSearchPagination } from '@/components/tables';
import { currency, customerName, GENERATE_INVOICES, Invoice, INVOICES_QUERY, monthNow, RECORD_PAYMENT, shortDate } from '@/features/billing';
import styles from '../dashboard.module.scss';

export default function InvoicesPage() {
  const { data, loading, refetch } = useQuery<{ invoices: Invoice[] }>(INVOICES_QUERY);
  const [generateInvoices] = useMutation(GENERATE_INVOICES);
  const [recordPayment] = useMutation(RECORD_PAYMENT);
  const [billingMonth, setBillingMonth] = useState(monthNow());
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const invoices = data?.invoices ?? [];
  const table = useSearchPagination(invoices, (invoice, search) =>
    [
      customerName(invoice.customer),
      invoice.plan.name,
      invoice.plan.speed,
      invoice.billingMonth,
      invoice.amount,
      invoice.paidAmount ?? 0,
      invoice.balance ?? invoice.amount,
      invoice.status
    ].some((value) => String(value).toLowerCase().includes(search))
  );

  async function submitInvoiceGeneration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await generateInvoices({ variables: { billingMonth } });
    await refetch();
  }

  async function payInvoice(invoice: Invoice) {
    const balance = invoice.balance ?? Math.max(invoice.amount - (invoice.paidAmount ?? 0), 0);
    const amount = Number(paymentAmounts[invoice.id] || balance);
    setError('');

    try {
      await recordPayment({
        variables: { invoiceId: invoice.id, amount, paidAt: new Date().toISOString() }
      });
      setPaymentAmounts((current) => ({ ...current, [invoice.id]: '' }));
      await refetch();
    } catch {
      setError('Payment must be greater than zero, cannot exceed the balance, and older unpaid invoices must be paid first.');
    }
  }

  function hasOlderUnpaidInvoice(invoice: Invoice) {
    return invoices.some((candidate) => {
      const candidateBalance = candidate.balance ?? Math.max(candidate.amount - (candidate.paidAmount ?? 0), 0);
      const sameCustomer = candidate.customer.id === invoice.customer.id;
      const olderMonth = candidate.billingMonth < invoice.billingMonth;
      const olderSameMonth = candidate.billingMonth === invoice.billingMonth && candidate.dueDate < invoice.dueDate;

      return sameCustomer && candidate.id !== invoice.id && candidate.status === 'UNPAID' && candidateBalance > 0 && (olderMonth || olderSameMonth);
    });
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Monthly billing" title="Invoices" />
      <form onSubmit={submitInvoiceGeneration} className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white p-4 shadow-panel">
        <input className="h-11 rounded-lg border border-line bg-white px-3" type="month" value={billingMonth} onChange={(event) => setBillingMonth(event.target.value)} />
        <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-4 font-semibold text-white shadow-panel" type="submit">
          <CalendarPlus size={18} />
          Generate monthly invoices
        </button>
      </form>
      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

      <section className="mt-6 rounded-lg border border-line bg-white shadow-panel">
        <div className="border-b border-line px-5 py-4">
          <TableSearch value={table.search} onChange={table.setSearch} placeholder="Search invoices" />
        </div>
        <div className={`${styles.tableWrap} overflow-x-auto`}>
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Month</th>
                <th className="px-5 py-3">Due date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Paid</th>
                <th className="px-5 py-3">Balance</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-5" colSpan={9}>Loading invoices...</td></tr>
              ) : table.totalRows === 0 ? (
                <tr><td className="px-5 py-5" colSpan={9}>No invoices yet.</td></tr>
              ) : table.pagedRows.map((invoice) => {
                const paidAmount = invoice.paidAmount ?? 0;
                const balance = invoice.balance ?? Math.max(invoice.amount - paidAmount, 0);
                const paymentBlocked = hasOlderUnpaidInvoice(invoice);

                return (
                  <tr key={invoice.id} className="border-t border-line">
                    <td className="px-5 py-4 font-medium">{customerName(invoice.customer)}</td>
                    <td className="px-5 py-4">{invoice.plan.name} - {invoice.plan.speed}</td>
                    <td className="px-5 py-4">{invoice.billingMonth}</td>
                    <td className="px-5 py-4">{shortDate(invoice.dueDate)}</td>
                    <td className="px-5 py-4">{currency(invoice.amount)}</td>
                    <td className="px-5 py-4">{currency(paidAmount)}</td>
                    <td className="px-5 py-4 font-medium">{currency(balance)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${invoice.status === 'PAID' ? 'bg-teal/10 text-teal' : 'bg-amber/20 text-amber'}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {invoice.status === 'PAID' ? (
                        <span className="text-slate-500">{shortDate(invoice.paidAt)}</span>
                      ) : paymentBlocked ? (
                        <span className="text-sm font-medium text-slate-500">Pay older invoice first</span>
                      ) : (
                        <div className="flex min-w-[220px] items-center gap-2">
                          <input
                            className="h-10 w-28 rounded-lg border border-line bg-white px-3"
                            min="0.01"
                            max={balance}
                            step="0.01"
                            type="number"
                            value={paymentAmounts[invoice.id] ?? ''}
                            onChange={(event) => setPaymentAmounts({ ...paymentAmounts, [invoice.id]: event.target.value })}
                            placeholder={String(balance)}
                          />
                          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-3 font-semibold hover:border-teal hover:text-teal" onClick={() => payInvoice(invoice)} type="button">
                            <CreditCard size={16} />
                            Pay
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination page={table.page} totalPages={table.totalPages} totalRows={table.totalRows} onPageChange={table.setPage} />
      </section>
    </AppShell>
  );
}
