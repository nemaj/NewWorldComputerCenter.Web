'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { Field, Select, SubmitButton } from '@/components/forms';
import { FormPage } from '@/components/layout';
import { PLAN_QUERY, PLANS_QUERY, Plan, SUBSCRIPTIONS_QUERY, UPDATE_PLAN } from '@/features/billing';

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const planId = params.id;
  const { data, loading } = useQuery<{ plan: Plan }>(PLAN_QUERY, {
    variables: { id: planId },
    skip: !planId
  });
  const [updatePlan] = useMutation(UPDATE_PLAN);
  const [form, setForm] = useState({
    name: '',
    speed: '',
    monthlyPrice: '',
    description: '',
    isActive: 'true'
  });

  useEffect(() => {
    if (!data?.plan) {
      return;
    }

    setForm({
      name: data.plan.name,
      speed: data.plan.speed,
      monthlyPrice: String(data.plan.monthlyPrice),
      description: data.plan.description,
      isActive: String(data.plan.isActive)
    });
  }, [data]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updatePlan({
      variables: {
        id: planId,
        input: {
          name: form.name,
          speed: form.speed,
          monthlyPrice: Number(form.monthlyPrice),
          description: form.description,
          isActive: form.isActive === 'true'
        }
      },
      refetchQueries: [{ query: PLANS_QUERY }, { query: SUBSCRIPTIONS_QUERY }],
      awaitRefetchQueries: true
    });
    router.push('/plans');
  }

  return (
    <FormPage title="Update internet plan" backHref="/plans">
      {loading ? (
        <p className="text-sm text-slate-500">Loading plan...</p>
      ) : (
        <form onSubmit={submit}>
          <Field label="Plan name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <Field label="Speed" value={form.speed} onChange={(speed) => setForm({ ...form, speed })} placeholder="100 Mbps" />
          <Field label="Monthly price" value={form.monthlyPrice} onChange={(monthlyPrice) => setForm({ ...form, monthlyPrice })} type="number" />
          <Field label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} />
          <Select label="Active" value={form.isActive} onChange={(isActive) => setForm({ ...form, isActive })} options={[['true', 'Yes'], ['false', 'No']]} />
          <SubmitButton label="Update plan" />
        </form>
      )}
    </FormPage>
  );
}
