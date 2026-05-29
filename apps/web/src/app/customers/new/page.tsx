'use client';

import { FormEvent, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Field, SubmitButton } from '@/components/forms';
import { FormPage } from '@/components/layout';
import { CREATE_CUSTOMER, CUSTOMERS_QUERY, SUBSCRIPTIONS_QUERY } from '@/features/billing';

export default function NewCustomerPage() {
  const router = useRouter();
  const [createCustomer] = useMutation(CREATE_CUSTOMER);
  const [form, setForm] = useState({
    accountNo: '',
    lastName: '',
    firstName: '',
    middleName: '',
    address: '',
    contactNo: ''
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createCustomer({
      variables: { input: form },
      refetchQueries: [{ query: CUSTOMERS_QUERY }, { query: SUBSCRIPTIONS_QUERY }],
      awaitRefetchQueries: true
    });
    router.push('/customers');
  }

  return (
    <FormPage title="Add customer" backHref="/customers">
      <form onSubmit={submit}>
        <Field label="Account No." value={form.accountNo} onChange={(accountNo) => setForm({ ...form, accountNo })} placeholder="ACC-1001" />
        <Field label="Last Name" value={form.lastName} onChange={(lastName) => setForm({ ...form, lastName })} />
        <Field label="First Name" value={form.firstName} onChange={(firstName) => setForm({ ...form, firstName })} />
        <Field label="Middle Name" value={form.middleName} onChange={(middleName) => setForm({ ...form, middleName })} required={false} />
        <Field label="Address" value={form.address} onChange={(address) => setForm({ ...form, address })} />
        <Field label="Contact No." value={form.contactNo} onChange={(contactNo) => setForm({ ...form, contactNo })} />
        <SubmitButton label="Save customer" />
      </form>
    </FormPage>
  );
}
