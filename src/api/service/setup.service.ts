import api from '../api';
import { ServerMode } from './version.service';

/** Jade Tree Setup Information */
export type SetupSchema = {
  mode?: ServerMode;
  email?: string;
  password?: string;
  name?: string;
  language?: string;
  locale?: string;
  currency?: string;
  fmt_date_short?: string;
  fmt_date_long?: string;
  fmt_decimal?: string;
  fmt_currency?: string;
  fmt_accounting?: string;
}

/** Return the Jade Tree Server Information */
function getDefaults(): Promise<SetupSchema> {
  return api.get<SetupSchema>('/setup');
}

/** Setup the Jade Tree Server */
function setupServer(payload: SetupSchema): Promise<void> {
  return api.post<void>('/setup', payload);
}

export default {
  getDefaults,
  setupServer,
};
