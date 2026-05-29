'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Field, Select, SubmitButton } from '@/components/forms';
import { FormPage } from '@/components/layout';
import { CREATE_SUBSCRIPTION, customerName, Customer, Plan, Subscription, SUBSCRIPTIONS_QUERY } from '@/features/billing';

export default function NewSubscriptionPage() {
  const router = useRouter();
  const { data } = useQuery<{ customers: Customer[]; plans: Plan[]; subscriptions: Subscription[] }>(SUBSCRIPTIONS_QUERY);
  const [createSubscription] = useMutation(CREATE_SUBSCRIPTION);
  const [form, setForm] = useState({ customerId: '', planId: '', startDate: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState('');
  const subscribedCustomerIds = new Set((data?.subscriptions ?? []).map((subscription) => subscription.customer.id));
  const availableCustomers = (data?.customers ?? []).filter((customer) => !subscribedCustomerIds.has(customer.id));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      await createSubscription({
        variables: {
          ...form,
          startDate: new Date(form.startDate).toISOString()
        },
        refetchQueries: [{ query: SUBSCRIPTIONS_QUERY }],
        awaitRefetchQueries: true
      });
      router.push('/subscriptions');
    } catch {
      setError('This customer already has a subscription.');
    }
  }

  return (
    <FormPage title="Assign subscription" backHref="/subscriptions">
      <form onSubmit={submit}>
        {error ? <p className="mb-3 text-sm font-medium text-red-600">{error}</p> : null}
        <Select label="Customer" value={form.customerId} onChange={(customerId) => setForm({ ...form, customerId })} options={availableCustomers.map((customer) => [customer.id, `${customer.accountNo} - ${customerName(customer)}`])} />
        <Select label="Plan" value={form.planId} onChange={(planId) => setForm({ ...form, planId })} options={(data?.plans ?? []).map((plan) => [plan.id, `${plan.name} - ${plan.speed}`])} />
        <Field label="Start date" value={form.startDate} onChange={(startDate) => setForm({ ...form, startDate })} type="date" />
        <SubmitButton label="Create subscription" />
      </form>
    </FormPage>
  );
}
