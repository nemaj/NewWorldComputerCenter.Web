export function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

export function monthNow() {
  return new Date().toISOString().slice(0, 7);
}

export function shortDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

export function customerName(customer: {
  firstName: string;
  middleName?: string;
  lastName: string;
}) {
  return [customer.firstName, customer.middleName, customer.lastName]
    .filter(Boolean)
    .join(" ");
}
