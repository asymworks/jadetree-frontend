import { format, parseISO } from 'date-fns';
import Decimal from 'decimal.js-light';
import { Money } from '@jadetree/currency';
import api from '../api';

/** Transaction Type */
export type TransactionType = 'inflow' | 'outflow' | 'transfer' | 'system';

/** Transaction Line Schema */
export type TransactionLineSchema = {
  line_id?: number;
  account_id?: number;
  cleared?: boolean;
  cleared_on?: string | Date | null;
  reconciled?: boolean;
  reconciled_on?: string | Date | null;
}

/** Transaction Split Schema */
export type TransactionSplitSchema = {
  split_id?: number;
  category_id?: number | null;
  transfer_id?: number | null;
  amount?: string | Money;
  currency?: string;
  type?: TransactionType;
  memo?: string;
  // Field Key Access
  [key: string]: string | number | Money | TransactionType | null | undefined;
}

/** Transaction Schema */
export type TransactionSchema = {
  transaction_id?: number;
  account_id?: number;
  line_id?: number;
  line_account_id?: number;
  date?: string | Date;
  payee_id?: number | null;
  check?: string | null;
  memo?: string | null;
  amount?: string | Money;
  balance?: string | Money;
  currency?: string;
  account_currency?: string;
  foreign_currency?: string | null;
  foreign_exchrate?: string | Decimal | null;
  splits?: TransactionSplitSchema[];
  cleared?: boolean;
  cleared_on?: string | Date | null;
  reconciled?: boolean;
  reconciled_on?: string | Date | null;
  // Field Key Access
  [key: string]: string | number | boolean | Money | Date | Decimal |
    TransactionSplitSchema[] | null | undefined;
}

/** Payee Role */
export type PayeeRole = 'initial' | 'transfer' | 'expense';

/** Payee Schema */
export type PayeeSchema = {
  id?: number;
  name?: string;
  role?: PayeeRole;
  system?: boolean;
  hidden?: boolean;
  category_id?: number | null;
  account_id?: number | null;
  memo?: string;
}

/** Payee Detail Schema */
export type PayeeDetailSchema = {
  id?: number;
  name?: string;
  role?: PayeeRole;
  system?: boolean;
  hidden?: boolean;
  category_id?: number | null;
  account_id?: number | null;
  memo?: string;
  last_category_id: number | null;
  last_account_id: number | null;
}

/** Load Transaction Line Schema */
function loadTransactionLineSchema(data: TransactionLineSchema): TransactionLineSchema {
  const loaded = { ...data };

  /* eslint-disable @typescript-eslint/camelcase */
  if (typeof data.cleared_on === 'string') {
    loaded.cleared_on = parseISO(data.cleared_on);
  }
  if (typeof data.reconciled_on === 'string') {
    loaded.reconciled_on = parseISO(data.reconciled_on);
  }
  /* eslint-enable @typescript-eslint/camelcase */

  return loaded;
}

/** Load Transaction Split Schema */
function loadTransactionSplitSchema(
  data: TransactionSplitSchema,
): TransactionSplitSchema {
  const loaded = { ...data };
  if (typeof data.amount === 'string') {
    loaded.amount = new Money(data.amount, data.currency);
  }

  return loaded;
}

/** Dump Transaction Split Schema */
function dumpTransactionSplitSchema(
  data: TransactionSplitSchema,
): TransactionSplitSchema {
  const dumped = { ...data };
  if (data.amount instanceof Money) {
    dumped.amount = data.amount.amount.toFixed(4).toString();
    dumped.currency = data.amount.currency.currencyCode;
  }

  return dumped;
}

/** Load Transaction Schema */
function loadTransactionSchema(data: TransactionSchema): TransactionSchema {
  const loaded = { ...data };

  if (typeof data.amount === 'string') {
    loaded.amount = new Money(data.amount, data.currency);
  }
  if (typeof data.balance === 'string') {
    loaded.balance = new Money(data.balance, data.account_currency);
  }

  /* eslint-disable @typescript-eslint/camelcase */
  if (typeof data.date === 'string') {
    loaded.date = parseISO(data.date);
  }
  if (typeof data.cleared_on === 'string') {
    loaded.cleared_on = parseISO(data.cleared_on);
  }
  if (typeof data.reconciled_on === 'string') {
    loaded.reconciled_on = parseISO(data.reconciled_on);
  }

  if (typeof data.foreign_exchrate === 'string') {
    loaded.foreign_exchrate = new Decimal(data.foreign_exchrate);
  }
  /* eslint-enable @typescript-eslint/camelcase */

  if (Array.isArray(data.splits) && data.splits.length > 0) {
    loaded.splits = data.splits.map((split) => loadTransactionSplitSchema(split));
  }

  return loaded;
}

/** Load Transaction Schema */
function dumpTransactionSchema(data: TransactionSchema): TransactionSchema {
  const dumped = { ...data };

  if (data.amount instanceof Money) {
    dumped.amount = data.amount.amount.toFixed(4).toString();
  }
  if (data.balance instanceof Money) {
    dumped.balance = data.balance.amount.toFixed(4).toString();
  }

  /* eslint-disable @typescript-eslint/camelcase */
  if (data.date instanceof Date) {
    dumped.date = format(data.date, 'yyyy-MM-dd');
  }
  if (data.cleared_on instanceof Date) {
    dumped.cleared_on = format(data.cleared_on, 'yyyy-MM-dd');
  }
  if (data.reconciled_on instanceof Date) {
    dumped.reconciled_on = format(data.reconciled_on, 'yyyy-MM-dd');
  }

  if (data.foreign_exchrate instanceof Decimal) {
    dumped.foreign_exchrate = data.foreign_exchrate.toFixed(4).toString();
  }
  /* eslint-enable @typescript-eslint/camelcase */

  if (Array.isArray(data.splits) && data.splits.length > 0) {
    dumped.splits = data.splits.map((split) => dumpTransactionSplitSchema(split));
  }

  return dumped;
}

/** Get All Transactions */
function getAllTransactions(): Promise<TransactionSchema[]> {
  return api.get<TransactionSchema[]>('/transactions')
    .then((data) => data.map((t) => loadTransactionSchema(t)));
}

/** Get Account Transactions */
function getAccountTransactions(id: number): Promise<TransactionSchema[]> {
  return api.get<TransactionSchema[]>(`/transactions/account/${id}`)
    .then((data) => data.map((t) => loadTransactionSchema(t)));
}

/** Get Category Transactions */
function getCategoryTransactions(id: number): Promise<TransactionSchema[]> {
  return api.get<TransactionSchema[]>(`/transactions/category/${id}`)
    .then((data) => data.map((t) => loadTransactionSchema(t)));
}

/** Get Single Transaction */
function getTransaction(id: number): Promise<TransactionSchema> {
  return api.get<TransactionSchema>(`/transactions/${id}`)
    .then((data) => loadTransactionSchema(data));
}

/** Create a Transaction */
function createTransaction(data: TransactionSchema): Promise<TransactionSchema> {
  return api.post<TransactionSchema>('/transactions', dumpTransactionSchema(data))
    .then((response) => loadTransactionSchema(response));
}

/** Update a Transaction */
function updateTransaction(id: number, data: TransactionSchema): Promise<TransactionSchema> {
  return api.put<TransactionSchema>(`/transactions/${id}`, dumpTransactionSchema(data))
    .then((response) => loadTransactionSchema(response));
}

/** Delete a Transaction */
function deleteTransaction(id: number): Promise<void> {
  return api.delete(`/transactions/${id}`);
}

/** Mark a Transaction as Cleared or Reconciled */
function clearTransaction(
  id: number,
  data: TransactionLineSchema,
): Promise<TransactionLineSchema[]> {
  return api.put<TransactionLineSchema[]>(`/transactions/${id}/clear`, data)
    .then((response) => response.map((line) => loadTransactionLineSchema(line)));
}

/** Get Payee List */
function getPayees(): Promise<PayeeSchema[]> {
  return api.get<PayeeSchema[]>('/payees');
}

/** Get Payee Details */
function getPayeeDetails(id: number): Promise<PayeeDetailSchema> {
  return api.get<PayeeDetailSchema>(`/payees/${id}`);
}

/** Create a Payee */
function createPayee(data: PayeeSchema): Promise<PayeeSchema> {
  return api.post<PayeeSchema>('/payees', data);
}

export default {
  getAllTransactions,
  getAccountTransactions,
  getCategoryTransactions,
  getTransaction,
  createTransaction,
  deleteTransaction,
  updateTransaction,
  clearTransaction,
  getPayees,
  getPayeeDetails,
  createPayee,
};
