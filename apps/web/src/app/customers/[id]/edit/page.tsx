'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { Field, Select, SubmitButton } from '@/components/forms';
import { FormPage } from '@/components/layout';
import { CUSTOMER_QUERY, CUSTOMERS_QUERY, Customer, SUBSCRIPTIONS_QUERY, UPDATE_CUSTOMER } from '@/features/billing';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const customerId = params.id;
  const { data, loading } = useQuery<{ customer: Customer }>(CUSTOMER_QUERY, {
    variables: { id: customerId },
    skip: !customerId
  });
  const [updateCustomer] = useMutation(UPDATE_CUSTOMER);
  const [form, setForm] = useState({
    accountNo: '',
    lastName: '',
    firstName: '',
    middleName: '',
    address: '',
    contactNo: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (!data?.customer) {
      return;
    }

    setForm({
      accountNo: data.customer.accountNo,
      lastName: data.customer.lastName,
      firstName: data.customer.firstName,
      middleName: data.customer.middleName ?? '',
      address: data.customer.address,
      contactNo: data.customer.contactNo,
      status: data.customer.status
    });
  }, [data]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateCustomer({
      variables: { id: customerId, input: form },
      refetchQueries: [{ query: CUSTOMERS_QUERY }, { query: SUBSCRIPTIONS_QUERY }],
      awaitRefetchQueries: true
    });
    router.push('/customers');
  }

  return (
    <FormPage title="Update customer" backHref="/customers">
      {loading ? (
        <p className="text-sm text-slate-500">Loading customer...</p>
      ) : (
        <form onSubmit={submit}>
          <Field label="Account No." value={form.accountNo} onChange={(accountNo) => setForm({ ...form, accountNo })} placeholder="ACC-1001" />
          <Field label="Last Name" value={form.lastName} onChange={(lastName) => setForm({ ...form, lastName })} />
          <Field label="First Name" value={form.firstName} onChange={(firstName) => setForm({ ...form, firstName })} />
          <Field label="Middle Name" value={form.middleName} onChange={(middleName) => setForm({ ...form, middleName })} required={false} />
          <Field label="Address" value={form.address} onChange={(address) => setForm({ ...form, address })} />
          <Field label="Contact No." value={form.contactNo} onChange={(contactNo) => setForm({ ...form, contactNo })} />
          <Select label="Status" value={form.status} onChange={(status) => setForm({ ...form, status })} options={[['ACTIVE', 'Active'], ['INACTIVE', 'Inactive']]} />
          <SubmitButton label="Update customer" />
        </form>
      )}
    </FormPage>
  );
}
