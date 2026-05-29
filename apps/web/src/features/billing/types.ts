export type Customer = {
  id: string;
  accountNo: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  address: string;
  contactNo: string;
  status: string;
};

export type Plan = {
  id: string;
  name: string;
  speed: string;
  monthlyPrice: number;
  description: string;
  isActive: boolean;
};

export type Payment = {
  id: string;
  amount: number;
  paidAt: string;
  createdAt: string;
  customer: Pick<Customer, 'id' | 'accountNo' | 'lastName' | 'firstName' | 'middleName'>;
  invoice: Pick<Invoice, 'id' | 'billingMonth' | 'amount' | 'paidAmount' | 'balance' | 'status'>;
};

export type Subscription = {
  id: string;
  startDate: string;
  status: string;
  customer: Pick<Customer, 'id' | 'accountNo' | 'lastName' | 'firstName' | 'middleName'>;
  plan: Pick<Plan, 'id' | 'name' | 'speed'>;
};

export type Invoice = {
  id: string;
  billingMonth: string;
  dueDate: string;
  amount: number;
  paidAmount?: number;
  balance?: number;
  status: 'PAID' | 'UNPAID' | 'VOID';
  paidAt?: string;
  customer: Pick<Customer, 'id' | 'accountNo' | 'lastName' | 'firstName' | 'middleName'>;
  plan: Pick<Plan, 'name' | 'speed'>;
};
