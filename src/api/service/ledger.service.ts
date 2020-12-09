import { parseISO } from 'date-fns';
import Decimal from 'decimal.js-light';
import { Money } from '@jadetree/currency';
import api from '../api';
import {
  TransactionSplitSchema,
  loadTransactionSplitSchema,
} from './transaction.service';

/** Ledger Entry Schema */
export type LedgerEntrySchema = {
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
  transaction_currency?: string;
  foreign_currency?: string | null;
  foreign_exchrate?: string | Decimal | null;
  splits?: TransactionSplitSchema[];
  cleared?: boolean;
  cleared_at?: string | Date | null;
  reconciled?: boolean;
  reconciled_at?: string | Date | null;
  // Field Key Access
  [key: string]: string | number | boolean | Money | Date | Decimal |
    TransactionSplitSchema[] | null | undefined;
}

/** Load Ledger Line Schema */
function loadLedgerLineSchema(data: LedgerEntrySchema): LedgerEntrySchema {
  const loaded = { ...data };

  if (typeof data.amount === 'string') {
    loaded.amount = new Money(data.amount, data.currency);
  }
  if (typeof data.balance === 'string') {
    loaded.balance = new Money(data.balance, data.currency);
  }

  /* eslint-disable @typescript-eslint/camelcase */
  if (typeof data.date === 'string') {
    loaded.date = parseISO(data.date);
  }
  if (typeof data.cleared_at === 'string') {
    loaded.cleared_at = parseISO(data.cleared_at);
  }
  if (typeof data.reconciled_at === 'string') {
    loaded.reconciled_at = parseISO(data.reconciled_at);
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

/** Get All Transactions */
function getAllTransactions(): Promise<LedgerEntrySchema[]> {
  return api.get<LedgerEntrySchema[]>('/ledger')
    .then((data) => data.map((t) => loadLedgerLineSchema(t)));
}

/** Get Account Transactions */
function getAccountTransactions(id: number): Promise<LedgerEntrySchema[]> {
  return api.get<LedgerEntrySchema[]>(`/ledger/${id}`)
    .then((data) => data.map((t) => loadLedgerLineSchema(t)));
}

export default {
  getAllTransactions,
  getAccountTransactions,
};
