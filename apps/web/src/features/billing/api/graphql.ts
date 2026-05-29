import { gql } from '@apollo/client';

export const DASHBOARD_QUERY = gql`
  query Dashboard {
    dashboardStats {
      totalRevenue
      paidInvoices
      unpaidInvoices
      activeSubscriptions
    }
    invoices {
      id
      billingMonth
      amount
      paidAmount
      balance
      status
      paidAt
      customer {
        id
        accountNo
        lastName
        firstName
        middleName
      }
      plan {
        name
        speed
      }
    }
    customers {
      id
      accountNo
      lastName
      firstName
      middleName
      status
    }
  }
`;

export const CUSTOMERS_QUERY = gql`
  query Customers {
    customers {
      id
      accountNo
      lastName
      firstName
      middleName
      address
      contactNo
      status
    }
  }
`;

export const CUSTOMER_QUERY = gql`
  query Customer($id: String!) {
    customer(id: $id) {
      id
      accountNo
      lastName
      firstName
      middleName
      address
      contactNo
      status
    }
  }
`;

export const PLANS_QUERY = gql`
  query Plans {
    plans {
      id
      name
      speed
      monthlyPrice
      description
      isActive
    }
  }
`;

export const PLAN_QUERY = gql`
  query Plan($id: String!) {
    plan(id: $id) {
      id
      name
      speed
      monthlyPrice
      description
      isActive
    }
  }
`;

export const SUBSCRIPTIONS_QUERY = gql`
  query Subscriptions {
    customers {
      id
      accountNo
      lastName
      firstName
      middleName
    }
    plans {
      id
      name
      speed
    }
    subscriptions {
      id
      startDate
      status
      customer {
        id
        accountNo
        lastName
        firstName
        middleName
      }
      plan {
        id
        name
        speed
      }
    }
  }
`;

export const INVOICES_QUERY = gql`
  query Invoices {
    invoices {
      id
      billingMonth
      dueDate
      amount
      paidAmount
      balance
      status
      paidAt
      customer {
        id
        accountNo
        lastName
        firstName
        middleName
      }
      plan {
        name
        speed
      }
    }
  }
`;

export const PAYMENTS_QUERY = gql`
  query Payments {
    payments {
      id
      amount
      paidAt
      createdAt
      customer {
        id
        accountNo
        lastName
        firstName
        middleName
      }
      invoice {
        id
        billingMonth
        amount
        paidAmount
        balance
        status
      }
    }
  }
`;

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      id
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: String!, $input: UpdateCustomerInput!) {
    updateCustomer(id: $id, input: $input) {
      id
      accountNo
      lastName
      firstName
      middleName
      address
      contactNo
      status
    }
  }
`;

export const CREATE_PLAN = gql`
  mutation CreatePlan($input: CreatePlanInput!) {
    createPlan(input: $input) {
      id
    }
  }
`;

export const UPDATE_PLAN = gql`
  mutation UpdatePlan($id: String!, $input: UpdatePlanInput!) {
    updatePlan(id: $id, input: $input) {
      id
      name
      speed
      monthlyPrice
      description
      isActive
    }
  }
`;

export const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($customerId: String!, $planId: String!, $startDate: DateTime!) {
    createSubscription(customerId: $customerId, planId: $planId, startDate: $startDate) {
      id
    }
  }
`;

export const GENERATE_INVOICES = gql`
  mutation GenerateMonthlyInvoices($billingMonth: String!) {
    generateMonthlyInvoices(billingMonth: $billingMonth) {
      id
    }
  }
`;

export const RECORD_PAYMENT = gql`
  mutation RecordPayment($invoiceId: String!, $amount: Float!, $paidAt: DateTime!) {
    recordPayment(invoiceId: $invoiceId, amount: $amount, paidAt: $paidAt) {
      id
      paidAmount
      balance
      status
      paidAt
    }
  }
`;
