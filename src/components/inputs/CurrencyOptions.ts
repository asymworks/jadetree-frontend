import { Component, Vue } from 'vue-property-decorator';
import { Currency } from '@jadetree/currency';
import { en } from '@jadetree/currency/locales/en';

import { compareKeys } from '@/util/sort';

@Component
export default class CurrencyChoices extends Vue {
  /**
   * Render the Component
   */
  render() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.$scopedSlots.default!(Currency.allCurrencies().map((ccy) => ({
      value: ccy,
      label: `${en.currencyName(ccy)} (${ccy})`,
    })).sort(compareKeys<string>('label')));
  }
}
