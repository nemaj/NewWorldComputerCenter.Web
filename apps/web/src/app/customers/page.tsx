'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/layout';
import { TablePagination, TableSearch, useSearchPagination } from '@/components/tables';
import { CUSTOMERS_QUERY, Customer } from '@/features/billing';
import styles from '../dashboard.module.scss';

export default function CustomersPage() {
  const { data, loading } = useQuery<{ customers: Customer[] }>(CUSTOMERS_QUERY);
  const customers = data?.customers ?? [];
  const table = useSearchPagination(customers, (customer, search) =>
    [customer.accountNo, customer.lastName, customer.firstName, customer.middleName, customer.address, customer.contactNo, customer.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search))
  );

  return (
    <AppShell>
      <PageHeader eyebrow="Customer management" title="Customers" actionHref="/customers/new" actionLabel="Add customer" />
      <section className="mt-6 rounded-lg border border-line bg-white shadow-panel">
        <div className="border-b border-line px-5 py-4">
          <TableSearch value={table.search} onChange={table.setSearch} placeholder="Search customers" />
        </div>
        <div className={`${styles.tableWrap} overflow-x-auto`}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-slate-500">
              <tr>
                  <th className="px-5 py-3">Account No.</th>
                  <th className="px-5 py-3">Last Name</th>
                  <th className="px-5 py-3">First Name</th>
                  <th className="px-5 py-3">Middle Name</th>
                  <th className="px-5 py-3">Address</th>
                  <th className="px-5 py-3">Contact No.</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
              {loading ? (
                <tr><td className="px-5 py-5" colSpan={8}>Loading customers...</td></tr>
              ) : table.totalRows === 0 ? (
                <tr><td className="px-5 py-5" colSpan={8}>No customers yet.</td></tr>
              ) : table.pagedRows.map((customer) => (
                <tr key={customer.id} className="border-t border-line">
                  <td className="px-5 py-4 font-medium">{customer.accountNo}</td>
                  <td className="px-5 py-4">{customer.lastName}</td>
                  <td className="px-5 py-4">{customer.firstName}</td>
                  <td className="px-5 py-4">{customer.middleName || '-'}</td>
                  <td className="px-5 py-4">{customer.address}</td>
                  <td className="px-5 py-4">{customer.contactNo}</td>
                  <td className="px-5 py-4">{customer.status}</td>
                  <td className="px-5 py-4">
                    <Link
                      aria-label={`Edit ${customer.accountNo}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-slate-600 hover:border-teal hover:text-teal"
                      href={`/customers/${customer.id}/edit`}
                      title="Edit customer"
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
