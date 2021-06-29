import { parseISO } from 'date-fns';
import { Money } from '@jadetree/currency';
import api from '../api';

/** Net Worth Report Schema */
export type NetWorthReportSchema = {
    month: string | Date;
    assets: string | Money;
    liabilities: string | Money;
    currency: string;
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

/** Get Net Worth Report */
function netWorth(): Promise<NetWorthReportSchema[]> {
  return api.get<NetWorthReportSchema[]>('/report/networth')
    .then((data) => data.map((p) => loadNetWorthSchema(p)));
}

export default {
  netWorth,
};
