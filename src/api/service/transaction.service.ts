import { formatISO, parseISO } from 'date-fns';
import Decimal from 'decimal.js-light';
import { Money } from '@jadetree/currency';
import api from '../api';

/** Transaction Type */
export type TransactionType = 'inflow' | 'outflow' | 'transfer' | 'system';

/** Transaction Clearance Schema */
export type TransactionClearanceSchema = {
  line_id?: number;
  account_id?: number;
  cleared?: boolean;
  cleared_at?: string | Date | null;
  reconciled?: boolean;
  reconciled_at?: string | Date | null;
}

/** Transaction Line Schema */
export type TransactionLineSchema = {
  id?: number;
  account_id?: number;
  amount?: string | Decimal | Money;
  currency?: string;
  cleared?: boolean;
  cleared_at?: string | Date | null;
  reconciled?: boolean;
  reconciled_at?: string | Date | null;
}

/** Transaction Split Schema */
export type TransactionSplitSchema = {
  split_id?: number;
  category_id?: number | null;
  transfer_id?: number | null;
  left_line_id?: number | null;
  right_line_id?: number | null;
  amount?: string | Decimal | Money;
  currency?: string;
  type?: TransactionType;
  memo?: string;
  // Field Key Access
  [key: string]: string | number | Decimal | Money | TransactionType |
    null | undefined;
}

/** Transaction Schema */
export type TransactionSchema = {
  id?: number;
  account_id?: number;
  payee_id?: number | null;
  date?: string | Date;
  check?: string | null;
  memo?: string | null;
  amount?: string | Decimal | Money;
  currency?: string;
  foreign_currency?: string | null;
  foreign_exchrate?: string | Decimal | null;
  splits?: TransactionSplitSchema[];
  lines?: TransactionLineSchema[];
  // Field Key Access
  [key: string]: string | number | Money | Date | Decimal |
    TransactionSplitSchema[] | TransactionLineSchema[] | null | undefined;
}

/** Account Reconciliation Schema */
export type ReconcileSchema = {
  statement_date: string | Date;
  statement_balance: string | Money;
}

/** Load Transaction Clearance Schema */
function loadTransactionClearanceSchema(
  data: TransactionClearanceSchema,
): TransactionClearanceSchema {
  const loaded = { ...data };

  /* eslint-disable @typescript-eslint/camelcase */
  if (typeof data.cleared_at === 'string') {
    loaded.cleared_at = parseISO(data.cleared_at);
  }
  if (typeof data.reconciled_at === 'string') {
    loaded.reconciled_at = parseISO(data.reconciled_at);
  }
  /* eslint-enable @typescript-eslint/camelcase */

  return loaded;
}

/** Dump Transaction Clearance Schema */
function dumpTransactionClearanceSchema(
  data: TransactionClearanceSchema,
): TransactionClearanceSchema {
  const dumped = { ...data };

  /* eslint-disable @typescript-eslint/camelcase */
  if (data.cleared_at instanceof Date) {
    dumped.cleared_at = formatISO(data.cleared_at);
  }
  if (data.reconciled_at instanceof Date) {
    dumped.reconciled_at = formatISO(data.reconciled_at);
  }
  /* eslint-enable @typescript-eslint/camelcase */

  return dumped;
}

/** Load Transaction Line Schema */
function loadTransactionLineSchema(
  data: TransactionLineSchema,
): TransactionLineSchema {
  const loaded = { ...data };

  /* eslint-disable @typescript-eslint/camelcase */
  if (typeof data.amount === 'string') {
    loaded.amount = new Money(data.amount, data.currency);
  }
  if (typeof data.cleared_at === 'string') {
    loaded.cleared_at = parseISO(data.cleared_at);
  }
  if (typeof data.reconciled_at === 'string') {
    loaded.reconciled_at = parseISO(data.reconciled_at);
  }
  /* eslint-enable @typescript-eslint/camelcase */

  return loaded;
}

/** Dump Transaction Line Schema */
function dumpTransactionLineSchema(
  data: TransactionLineSchema,
): TransactionLineSchema {
  const dumped = { ...data };

  /* eslint-disable @typescript-eslint/camelcase */
  if (data.amount instanceof Money) {
    dumped.amount = data.amount.amount.toFixed(4).toString();
    dumped.currency = data.amount.currency.currencyCode;
  }
  if (data.cleared_at instanceof Date) {
    dumped.cleared_at = formatISO(data.cleared_at);
  }
  if (data.reconciled_at instanceof Date) {
    dumped.reconciled_at = formatISO(data.reconciled_at);
  }
  /* eslint-enable @typescript-eslint/camelcase */

  return dumped;
}

/** Load Transaction Split Schema */
export function loadTransactionSplitSchema(
  data: TransactionSplitSchema,
): TransactionSplitSchema {
  const loaded = { ...data };
  if (typeof data.amount === 'string') {
    loaded.amount = new Money(data.amount, data.currency);
  }

  return loaded;
}

/** Dump Transaction Split Schema */
export function dumpTransactionSplitSchema(
  data: TransactionSplitSchema,
): TransactionSplitSchema {
  const dumped = { ...data };
  if (data.amount instanceof Money) {
    dumped.amount = data.amount.amount.toFixed(4).toString();
    dumped.currency = data.amount.currency.currencyCode;
  }

  return dumped;
}

/** Load the Transaction Schema */
function loadTransactionSchema(data: TransactionSchema): TransactionSchema {
  const loaded = { ...data };

  /* eslint-disable @typescript-eslint/camelcase */
  if (typeof data.date === 'string') {
    loaded.date = parseISO(data.date);
  }
  if (typeof data.amount === 'string') {
    loaded.amount = new Money(data.amount, data.currency);
  }
  if (typeof data.foreign_exchrate === 'string') {
    loaded.foreign_exchrate = new Decimal(data.foreign_exchrate);
  }
  /* eslint-enable @typescript-eslint/camelcase */

  if (Array.isArray(data.splits) && data.splits.length > 0) {
    loaded.splits = data.splits.map((split) => loadTransactionSplitSchema(split));
  }

  if (Array.isArray(data.lines) && data.lines.length > 0) {
    loaded.lines = data.lines.map((split) => loadTransactionLineSchema(split));
  }

  return loaded;
}

/** Dump the Transaction Schema */
function dumpTransactionSchema(data: TransactionSchema): TransactionSchema {
  const dumped = { ...data };

  /* eslint-disable @typescript-eslint/camelcase */
  if (data.date instanceof Date) {
    dumped.date = formatISO(data.date);
  }
  if (data.amount instanceof Money) {
    dumped.amount = data.amount.amount.toFixed(4).toString();
    dumped.currency = data.amount.currency.currencyCode;
  }
  if (data.foreign_exchrate instanceof Decimal) {
    dumped.foreign_exchrate = data.foreign_exchrate.toFixed(4).toString();
  }
  /* eslint-enable @typescript-eslint/camelcase */

  if (Array.isArray(data.splits) && data.splits.length > 0) {
    dumped.splits = data.splits.map((split) => dumpTransactionSplitSchema(split));
  }

  if (Array.isArray(data.lines) && data.lines.length > 0) {
    dumped.lines = data.lines.map((split) => dumpTransactionLineSchema(split));
  }

  return dumped;
}

/** Dump the Reconciliation Schema */
function dumpReconcileSchema(data: ReconcileSchema): ReconcileSchema {
  const dumped = { ...data };

  /* eslint-disable @typescript-eslint/camelcase */
  if (data.statement_date instanceof Date) {
    dumped.statement_date = formatISO(data.statement_date);
  }
  if (data.statement_balance instanceof Money) {
    dumped.statement_balance = data.statement_balance.amount.toFixed(4).toString();
  }
  /* eslint-enable @typescript-eslint/camelcase */

  return dumped;
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
  data: TransactionClearanceSchema,
): Promise<TransactionClearanceSchema[]> {
  return api.put<TransactionClearanceSchema[]>(
    `/transactions/${id}/clear`,
    dumpTransactionClearanceSchema(data),
  ).then((response) => response.map((line) => loadTransactionClearanceSchema(line)));
}

/** Reconcile an Account */
function reconcileAccount(
  accountId: number,
  data: ReconcileSchema,
): Promise<TransactionSchema[]> {
  return api.post<TransactionSchema[]>(`/reconcile/${accountId}`, dumpReconcileSchema(data))
    .then((response) => response.map((t) => loadTransactionSchema(t)));
}

export default {
  getTransaction,
  createTransaction,
  deleteTransaction,
  updateTransaction,
  clearTransaction,
  reconcileAccount,
};
