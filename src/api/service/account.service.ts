import { Money } from '@jadetree/currency';
import api from '../api';

/** Account Type */
export type AccountType = 'A' | 'L' | 'I' | 'E' | 'C' | 'T';

/** Account Subtype */
export type AccountSubtype = 'checking'
  | 'savings'
  | 'cash'
  | 'paypal'
  | 'merchant'
  | 'credit_card'
  | 'loc'
  | 'investment'
  | 'mortgage'
  | 'other';

/** Account Subtype Entry */
export type AccountSubtypeOption = {
  value: string;
  label: string;
  type: AccountType;
  subtype: AccountSubtype;
  budget: boolean;
}

/** Account Subtype Options */
export const AccountSubtypeOptions: AccountSubtypeOption[] = [
  /* eslint-disable object-curly-newline */
  /* On-Budget Accounts */
  {
    value: 'checking',
    label: 'Checking',
    type: 'A',
    subtype: 'checking',
    budget: true,
  },
  {
    value: 'savings',
    label: 'Savings',
    type: 'A',
    subtype: 'savings',
    budget: true,
  },
  {
    value: 'credit_card',
    label: 'Credit Card',
    type: 'L',
    subtype: 'credit_card',
    budget: true,
  },
  {
    value: 'paypal',
    label: 'PayPal or Venmo',
    type: 'A',
    subtype: 'paypal',
    budget: false,
  },
  /* Off-Budget Accounts */
  {
    value: 'investment',
    label: 'Investment',
    type: 'A',
    subtype: 'investment',
    budget: false,
  },
  {
    value: 'mortgage',
    label: 'Mortgage',
    type: 'A',
    subtype: 'checking',
    budget: false,
  },
  {
    value: 'other_asset',
    label: 'Other Asset (Car, Home, etc)',
    type: 'A',
    subtype: 'other',
    budget: false,
  },
  {
    value: 'other_liability',
    label: 'Other Loan or Liability',
    type: 'L',
    subtype: 'other',
    budget: false,
  },
  /* eslint-enable object-curly-newline */
];

/** Account Creation Schema */
export interface AccountCreateSchema {
  name?: string;
  type?: AccountType;
  currency?: string;
  subtype?: AccountSubtype;
  balance?: string | Money;
  balance_date?: string;
  budget_id?: number;
}

/** Account Schema */
export interface AccountSchema {
  id?: number;
  name?: string;
  type?: AccountType;
  subtype?: AccountSubtype;
  budget_id?: number;
  currency?: string;
  balance?: string | Money;
  display_order?: number;
}

/** Dump Account Creation Schema Data */
function dumpAccountCreateSchema(schema: AccountCreateSchema): AccountCreateSchema {
  const dumped = { ...schema };
  if (schema.balance instanceof Money) {
    dumped.balance = schema.balance.amount.todp(4).toString();
  }
  return dumped;
}

/** Load Account Schema Data */
function loadAccountSchema(schema: AccountSchema): AccountSchema {
  const loaded = schema;
  if (typeof schema.balance === 'string') {
    if (schema.balance === '') {
      loaded.balance = new Money(0, schema.currency);
    } else {
      loaded.balance = new Money(schema.balance, schema.currency);
    }
  }
  return loaded;
}

/** Get a list of Accounts */
function getAccounts(): Promise<AccountSchema[]> {
  return api.get<AccountSchema[]>('/accounts')
    .then((response) => response.map((s) => loadAccountSchema(s)));
}

/** Create a new Account */
function createAccount(data: AccountCreateSchema): Promise<AccountSchema> {
  return api.post<AccountSchema>('/accounts', dumpAccountCreateSchema(data))
    .then((response) => loadAccountSchema(response))
    .catch((error) => { throw error; });
}

/** Get a single Account */
function getAccount(id: number): Promise<AccountSchema> {
  return api.get<AccountSchema>(`/accounts/${id}`)
    .then((response) => loadAccountSchema(response));
}

/** Delete an Account */
function deleteAccount(id: number): Promise<void> {
  return api.delete<void>(`/accounts/${id}`);
}

export default {
  createAccount,
  deleteAccount,
  getAccount,
  getAccounts,
};
