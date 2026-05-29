'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CheckCircle2, CircleDollarSign, CreditCard, FileText, Gauge } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/layout';
import { TablePagination, TableSearch, useSearchPagination } from '@/components/tables';
import { currency, customerName, Customer, DASHBOARD_QUERY, Invoice, RECORD_PAYMENT } from '@/features/billing';
import styles from '../dashboard.module.scss';

type DashboardData = {
  dashboardStats: {
    totalRevenue: number;
    paidInvoices: number;
    unpaidInvoices: number;
    activeSubscriptions: number;
  };
  invoices: Invoice[];
  customers: Pick<Customer, 'id' | 'accountNo' | 'lastName' | 'firstName' | 'middleName' | 'status'>[];
};

type CustomerInvoiceRow = {
  customer: DashboardData['customers'][number];
  invoice?: Invoice;
};

export default function DashboardPage() {
  const { data, loading, error, refetch } = useQuery<DashboardData>(DASHBOARD_QUERY);
  const [recordPayment] = useMutation(RECORD_PAYMENT);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState('');
  const stats = data?.dashboardStats ?? {
    totalRevenue: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    activeSubscriptions: 0
  };
  const invoices = data?.invoices ?? [];
  const customerRows = (data?.customers ?? []).map((customer) => ({
    customer,
    invoice: invoices.find((invoice) => invoice.customer.accountNo === customer.accountNo)
  }));
  const customerTable = useSearchPagination(customerRows, (row, search) =>
    [
      row.customer.accountNo,
      customerName(row.customer),
      row.customer.status,
      row.invoice?.billingMonth,
      row.invoice?.status,
      row.invoice?.plan.name,
      row.invoice?.plan.speed
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(search))
  );
  const activityTable = useSearchPagination(invoices, (invoice, search) =>
    [invoice.billingMonth, invoice.amount, invoice.status, customerName(invoice.customer), invoice.plan.name]
      .some((value) => String(value).toLowerCase().includes(search))
  );

  async function payInvoice(event: FormEvent<HTMLFormElement>, invoice: Invoice) {
    event.preventDefault();
    const balance = invoice.balance ?? Math.max(invoice.amount - (invoice.paidAmount ?? 0), 0);
    const amount = Number(paymentAmounts[invoice.id] || balance);
    setPaymentError('');

    try {
      await recordPayment({
        variables: { invoiceId: invoice.id, amount, paidAt: new Date().toISOString() }
      });
      setPaymentAmounts((current) => ({ ...current, [invoice.id]: '' }));
      await refetch();
    } catch {
      setPaymentError('Payment must be greater than zero, cannot exceed the balance, and older unpaid invoices must be paid first.');
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
      <PageHeader eyebrow="Billing operations" title="Dashboard" />
      {error ? <div className="mt-6 rounded-lg border border-coral/30 bg-white p-4 text-coral">API connection failed. Start the NestJS server and MongoDB, then refresh this dashboard.</div> : null}
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          [CircleDollarSign, 'Paid revenue', currency(stats.totalRevenue), 'Recorded invoice payments'],
          [CheckCircle2, 'Paid invoices', stats.paidInvoices, 'Completed billing records'],
          [FileText, 'Unpaid invoices', stats.unpaidInvoices, 'Awaiting customer payment'],
          [Gauge, 'Active subscriptions', stats.activeSubscriptions, 'Plans currently billing']
        ].map(([Icon, label, value, help]) => (
          <article key={label as string} className={`${styles.metricCard} rounded-lg border border-line bg-white p-5 shadow-panel`}>
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-mist text-teal"><Icon size={20} /></div>
            <p className="text-sm font-medium text-slate-500">{label as string}</p>
            <p className="mt-1 text-2xl font-bold">{value as string}</p>
            <p className="mt-2 text-xs text-slate-500">{help as string}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-line bg-white shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h3 className="text-lg font-bold">Customer invoice search</h3>
            <p className="text-sm text-slate-500">Find a customer, review the latest invoice status, and record a payment.</p>
          </div>
          <TableSearch value={customerTable.search} onChange={customerTable.setSearch} placeholder="Search customers" />
        </div>
        {paymentError ? <p className="px-5 pt-4 text-sm font-medium text-red-600">{paymentError}</p> : null}
        <div className={`${styles.tableWrap} overflow-x-auto`}>
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3">Customer status</th>
                <th className="px-5 py-3">Invoice month</th>
                <th className="px-5 py-3">Invoice status</th>
                <th className="px-5 py-3">Balance</th>
                <th className="px-5 py-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-5" colSpan={7}>Loading customers...</td></tr>
              ) : customerTable.totalRows === 0 ? (
                <tr><td className="px-5 py-5" colSpan={7}>No matching customers.</td></tr>
              ) : customerTable.pagedRows.map(({ customer, invoice }) => {
                const balance = invoice ? invoice.balance ?? Math.max(invoice.amount - (invoice.paidAmount ?? 0), 0) : 0;
                const paymentBlocked = invoice ? hasOlderUnpaidInvoice(invoice) : false;

                return (
                  <tr key={customer.id} className="border-t border-line">
                    <td className="px-5 py-4 font-medium">{customerName(customer)}</td>
                    <td className="px-5 py-4">{customer.accountNo}</td>
                    <td className="px-5 py-4">{customer.status}</td>
                    <td className="px-5 py-4">{invoice?.billingMonth ?? '-'}</td>
                    <td className="px-5 py-4">{invoice?.status ?? 'NO INVOICE'}</td>
                    <td className="px-5 py-4 font-medium">{invoice ? currency(balance) : '-'}</td>
                    <td className="px-5 py-4">
                      {!invoice || invoice.status === 'PAID' ? (
                        <span className="text-slate-500">No payment due</span>
                      ) : paymentBlocked ? (
                        <span className="text-sm font-medium text-slate-500">Pay older invoice first</span>
                      ) : (
                        <form className="flex min-w-[220px] items-center gap-2" onSubmit={(event) => payInvoice(event, invoice)}>
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
                          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-3 font-semibold hover:border-teal hover:text-teal" type="submit">
                            <CreditCard size={16} />
                            Pay
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination page={customerTable.page} totalPages={customerTable.totalPages} totalRows={customerTable.totalRows} onPageChange={customerTable.setPage} />
      </section>

      <section className="mt-6 rounded-lg border border-line bg-white shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h3 className="text-lg font-bold">Recent billing activity</h3>
            <p className="text-sm text-slate-500">Latest invoices generated across active subscriptions.</p>
          </div>
          <TableSearch value={activityTable.search} onChange={activityTable.setSearch} placeholder="Search activity" />
        </div>
        <div className={`${styles.tableWrap} overflow-x-auto`}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-slate-500">
              <tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Billing month</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-5" colSpan={4}>Loading activity...</td></tr>
              ) : activityTable.totalRows === 0 ? (
                <tr><td className="px-5 py-5" colSpan={4}>No recent invoices.</td></tr>
              ) : activityTable.pagedRows.map((invoice) => (
                <tr key={invoice.id} className="border-t border-line">
                  <td className="px-5 py-4 font-medium">{customerName(invoice.customer)}</td>
                  <td className="px-5 py-4">{invoice.billingMonth}</td>
                  <td className="px-5 py-4">{currency(invoice.amount)}</td>
                  <td className="px-5 py-4">{invoice.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination page={activityTable.page} totalPages={activityTable.totalPages} totalRows={activityTable.totalRows} onPageChange={activityTable.setPage} />
      </section>
    </AppShell>
  );
}
