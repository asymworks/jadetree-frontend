import api from '../api';

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
  getPayees,
  getPayeeDetails,
  createPayee,
};
