import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { monthNow } from '@/features/billing';

type DashboardState = {
  billingMonth: string;
  selectedInvoiceId: string | null;
  notice: string | null;
};

const initialState: DashboardState = {
  billingMonth: monthNow(),
  selectedInvoiceId: null,
  notice: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setBillingMonth(state, action: PayloadAction<string>) {
      state.billingMonth = action.payload;
    },
    setSelectedInvoiceId(state, action: PayloadAction<string | null>) {
      state.selectedInvoiceId = action.payload;
    },
    setNotice(state, action: PayloadAction<string | null>) {
      state.notice = action.payload;
    }
  }
});

export const { setBillingMonth, setNotice, setSelectedInvoiceId } = dashboardSlice.actions;
export default dashboardSlice.reducer;
