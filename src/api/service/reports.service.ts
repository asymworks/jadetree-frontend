import { format, parseISO } from 'date-fns';
import { Money } from '@jadetree/currency';
import api from '../api';

/** Report Filter Schema */
export type ReportFilterSchema = {
  start_date?: Date;
  end_date?: Date;
  categories?: number[];
  payees?: number[];
  accounts?: number[];
}

/** Net Worth Report Schema */
export type NetWorthReportSchema = {
  month: string | Date;
  assets: string | Money;
  liabilities: string | Money;
  currency: string;
}

/** Category Spending Report Schema */
export type SpendingReportSchema = {
  category_id?: number;
  payee_id?: number;
  amount: string | Money;
  currency: string;
}

/** Income Allocation Report Schema */
export type IncomeAllocationReportSchema = {
  income: string | Money;
  spent: string | Money;
  unspent: string | Money;
  currency: string;
  categories: SpendingReportSchema[];
}

/** Load Net Worth Report Schema */
function loadNetWorthSchema(data: NetWorthReportSchema): NetWorthReportSchema {
  const loaded = { ...data };

  if (typeof data.assets === 'string') {
    loaded.assets = new Money(data.assets, data.currency);
  }
  if (typeof data.liabilities === 'string') {
    loaded.liabilities = new Money(data.liabilities, data.currency);
  }

  /* eslint-disable @typescript-eslint/camelcase */
  if (typeof data.month === 'string') {
    loaded.month = parseISO(data.month);
  }

  return loaded;
}

/** Load Spending Report Schema */
function loadSpendingSchema(data: SpendingReportSchema): SpendingReportSchema {
  const loaded = { ...data };

  if (typeof data.amount === 'string') {
    loaded.amount = new Money(data.amount, data.currency);
  }

  return loaded;
}

/** Load Income Allocation Report Schema */
function loadIncomeAllocationSchema(
  data: IncomeAllocationReportSchema,
): IncomeAllocationReportSchema {
  const loaded = { ...data };

  if (typeof data.income === 'string') {
    loaded.income = new Money(data.income, data.currency);
  }
  if (typeof data.spent === 'string') {
    loaded.spent = new Money(data.spent, data.currency);
  }
  if (typeof data.unspent === 'string') {
    loaded.unspent = new Money(data.unspent, data.currency);
  }

  loaded.categories = data.categories.map((e) => loadSpendingSchema(e));

  return loaded;
}

/** Get Net Worth Report */
async function netWorth(filters?: ReportFilterSchema): Promise<NetWorthReportSchema[]> {
  let endpoint = '/report/networth';

  const query: string[] = [];
  const params = new URLSearchParams();

  if (filters && filters.start_date !== undefined) {
    params.append('start_date', format(filters.start_date, 'yyyy-MM'));
  }
  if (filters && filters.end_date !== undefined) {
    params.append('end_date', format(filters.end_date, 'yyyy-MM'));
  }
  if (filters && filters.accounts !== undefined) {
    params.append('accounts', filters.accounts.join(','));
  }

  // Build the full query string
  params.forEach((value, key) => query.push(`${key}=${value}`));
  if (query.length) {
    endpoint = `${endpoint}?${query.join('&')}`;
  }

  return api.get<NetWorthReportSchema[]>(endpoint)
    .then((data) => data.map((p) => loadNetWorthSchema(p)));
}

/** Get Spending by Category Report */
async function spendingByCategory(
  budget_id: number,
  filters?: ReportFilterSchema,
): Promise<SpendingReportSchema[]> {
  let endpoint = `/report/${budget_id}/category`;

  const query: string[] = [];
  const params = new URLSearchParams();

  if (filters && filters.start_date !== undefined) {
    params.append('start_date', format(filters.start_date, 'yyyy-MM'));
  }
  if (filters && filters.end_date !== undefined) {
    params.append('end_date', format(filters.end_date, 'yyyy-MM'));
  }
  if (filters && filters.accounts !== undefined) {
    params.append('accounts', filters.accounts.join(','));
  }
  if (filters && filters.categories !== undefined) {
    params.append('categories', filters.categories.join(','));
  }
  if (filters && filters.payees !== undefined) {
    params.append('payees', filters.payees.join(','));
  }

  // Build the full query string
  params.forEach((value, key) => query.push(`${key}=${value}`));
  if (query.length) {
    endpoint = `${endpoint}?${query.join('&')}`;
  }

  return api.get<SpendingReportSchema[]>(endpoint)
    .then((data) => data.map((p) => loadSpendingSchema(p)));
}

/** Get Spending by Payee Report */
async function spendingByPayee(
  budget_id: number,
  filters?: ReportFilterSchema,
): Promise<SpendingReportSchema[]> {
  let endpoint = `/report/${budget_id}/payee`;

  const query: string[] = [];
  const params = new URLSearchParams();

  if (filters && filters.start_date !== undefined) {
    params.append('start_date', format(filters.start_date, 'yyyy-MM'));
  }
  if (filters && filters.end_date !== undefined) {
    params.append('end_date', format(filters.end_date, 'yyyy-MM'));
  }
  if (filters && filters.accounts !== undefined) {
    params.append('accounts', filters.accounts.join(','));
  }
  if (filters && filters.categories !== undefined) {
    params.append('categories', filters.categories.join(','));
  }
  if (filters && filters.payees !== undefined) {
    params.append('payees', filters.payees.join(','));
  }

  // Build the full query string
  params.forEach((value, key) => query.push(`${key}=${value}`));
  if (query.length) {
    endpoint = `${endpoint}?${query.join('&')}`;
  }

  return api.get<SpendingReportSchema[]>(endpoint)
    .then((data) => data.map((p) => loadSpendingSchema(p)));
}

/** Get Income Allocation Report */
function incomeAllocation(
  budget_id: number,
  filters?: ReportFilterSchema,
): Promise<IncomeAllocationReportSchema> {
  let endpoint = `/report/${budget_id}/incomeAlloc`;

  const query: string[] = [];
  const params = new URLSearchParams();

  if (filters && filters.start_date !== undefined) {
    params.append('start_date', format(filters.start_date, 'yyyy-MM'));
  }
  if (filters && filters.end_date !== undefined) {
    params.append('end_date', format(filters.end_date, 'yyyy-MM'));
  }

  // Build the full query string
  params.forEach((value, key) => query.push(`${key}=${value}`));
  if (query.length) {
    endpoint = `${endpoint}?${query.join('&')}`;
  }

  return api.get<IncomeAllocationReportSchema>(endpoint)
    .then((data) => loadIncomeAllocationSchema(data));
}

export default {
  incomeAllocation,
  netWorth,
  spendingByCategory,
  spendingByPayee,
};
