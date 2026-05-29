'use client';

import { FormEvent, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Field, SubmitButton } from '@/components/forms';
import { FormPage } from '@/components/layout';
import { CREATE_PLAN, PLANS_QUERY, SUBSCRIPTIONS_QUERY } from '@/features/billing';

export default function NewPlanPage() {
  const router = useRouter();
  const [createPlan] = useMutation(CREATE_PLAN);
  const [form, setForm] = useState({ name: '', speed: '', monthlyPrice: '49', description: '' });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createPlan({
      variables: { input: { ...form, monthlyPrice: Number(form.monthlyPrice) } },
      refetchQueries: [{ query: PLANS_QUERY }, { query: SUBSCRIPTIONS_QUERY }],
      awaitRefetchQueries: true
    });
    router.push('/plans');
  }

  return (
    <FormPage title="Add internet plan" backHref="/plans">
      <form onSubmit={submit}>
        <Field label="Plan name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Field label="Speed" value={form.speed} onChange={(speed) => setForm({ ...form, speed })} placeholder="100 Mbps" />
        <Field label="Monthly price" value={form.monthlyPrice} onChange={(monthlyPrice) => setForm({ ...form, monthlyPrice })} type="number" />
        <Field label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} />
        <SubmitButton label="Save plan" />
      </form>
    </FormPage>
  );
}
