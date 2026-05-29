# Frontend Structure

The frontend follows a standard Next.js App Router layout:

```text
src/
  app/                    Route segments, layouts, and pages only
  components/
    layout/               App shell, page header, form-page wrappers
    forms/                Reusable form controls
  features/
    billing/
      api/                Billing GraphQL operations
      utils/              Billing formatting helpers
      types.ts            Billing domain types
  lib/                    Low-level clients and shared utilities
  store/                  Redux store and slices
```

Route files should stay thin and compose feature APIs, domain types, and shared components.
