// eslint-disable-next-line object-curly-newline
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapState } from 'vuex';
import { Locale as DateFnsLocale, format as dfFormat } from 'date-fns';
import iso31661 from 'iso-3166';
import {
  Currency,
  Locale as JadeTreeLocale,
  format as jtFormat,
  negotiateLocale,
  parseLocale,
} from '@jadetree/currency';
import { en } from '@jadetree/currency/locales/en';
import { Available, TerritoryLanguages, tagName } from '@/l10n';
import { compareKeys } from '@/util/sort';

type Option = {
  value: string;
  label: string;
}

/** Available Country Codes */
const COUNTRIES_AVAILABLE: string[] = [
  ...new Set(Available.map((tag) => parseLocale(tag).territory)),
];

/** Available Currency Codes */
const CURRENCIES_AVAILABLE: string[] = Currency.allCurrencies();

/** Available Languages */
const LANGUAGES_AVAILABLE: string[] = [
  ...new Set(Available.map((tag) => parseLocale(tag).language)),
];

/** Get the default Locale for a Country */
function getDefaultLocale(code: string): string {
  if (!Object.prototype.hasOwnProperty.call(TerritoryLanguages, code)) {
    return 'en_US';
  }
  const lang = TerritoryLanguages[code];
  return negotiateLocale([`${lang}_${code}`, lang], Available) || 'en';
}

@Component({
  name: 'ProfileEditorController',
  computed: mapState('l10n', {
    dateFnsError: 'dateFnsStatus.error',
    dateFnsLoading: 'dateFnsStatus.loading',
    dateFnsLocale: 'dateFnsLocale',
    jadetreeError: 'jadetreeStatus.error',
    jadetreeLoading: 'jadetreeStatus.loading',
    jadetreeLocale: 'jadetreeLocale',
    vuexTag: 'tag',
  }),
})
export default class ProfileEditorController extends Vue {
  /* eslint-disable lines-between-class-members */
  private dateFnsError!: string | undefined;
  private dateFnsLoading!: boolean | undefined;
  private dateFnsLocale!: DateFnsLocale;
  private jadetreeError!: string | undefined;
  private jadetreeLoading!: boolean | undefined;
  private jadetreeLocale!: JadeTreeLocale;
  private vuexTag!: string;
  /* eslint-enable lines-between-class-members */

  /** Profile Country */
  @Prop({ default: '' })
  private country!: string | undefined;

  /** Profile Currency */
  @Prop({ default: '' })
  private currency!: string | undefined;

  /** Profile Language */
  @Prop({ default: '' })
  private language!: string | undefined;

  /** Profile Locale */
  @Prop({ default: '' })
  private locale!: string | undefined;

  /** Use negative numbers for preview */
  @Prop({ default: false })
  private previewNegative!: boolean;

  /** Restrict list of Locales to match Country */
  @Prop({ default: true })
  private restrictLocales!: boolean;

  /* ---------------  Data  ------------------- */

  /** If the Currency field has been modified by the user */
  currencyDirty = false;

  /** If the Currency/Locale data is currently being updated */
  isUpdatingData = false;

  /** If the Locale field has been modified by the user */
  localeDirty = false;

  /* -------------  Computed  ----------------- */

  /** Slot Context */
  get context() {
    const {
      countryOptions,
      currencyOptions,
      dateFnsError,
      dateFnsLoading,
      jadetreeError,
      jadetreeLoading,
      languageOptions,
      localeOptions,
      previewAccounting,
      previewCurrency,
      previewDecimal,
      previewLongDate,
      previewShortDate,
    } = this;

    const patterns = {
      accounting: this.jadetreeLocale?.accountingPattern?.pattern,
      currency: this.jadetreeLocale?.currencyPattern?.pattern,
      decimal: this.jadetreeLocale?.decimalPattern?.pattern,
      longDate: this.dateFnsLocale?.formatLong?.date({ width: 'long' }),
      shortDate: this.dateFnsLocale?.formatLong?.date({ width: 'short' }),
    };

    const localeStatus = {
      dateFnsError,
      dateFnsLoading,
      jadetreeError,
      jadetreeLoading,
    };

    return {
      countryOptions,
      currencyOptions,
      languageOptions,
      localeOptions,
      localeStatus,
      patterns,
      previewAccounting,
      previewCurrency,
      previewDecimal,
      previewLongDate,
      previewShortDate,
      setCurrencyDirty: (value: boolean) => {
        this.currencyDirty = this.isUpdatingData ? this.currencyDirty : value;
      },
      setLocaleDirty: (value: boolean) => {
        this.localeDirty = this.isUpdatingData ? this.localeDirty : value;
      },
    };
  }

  /** List of Country Options */
  get countryOptions() {
    return iso31661
      .filter((c) => COUNTRIES_AVAILABLE.includes(c.alpha2))
      .map((c) => ({
        value: c.alpha2,
        label: c.name,
      }))
      .sort(compareKeys<string>('label'));
  }

  /** List of Currency Options */
  get currencyOptions() {
    return CURRENCIES_AVAILABLE.map((ccy) => ({
      value: ccy,
      label: `${en.currencyName(ccy)} (${ccy})`,
    })).sort(compareKeys<string>('label'));
  }

  /** List of Language Options */
  get languageOptions() {
    return LANGUAGES_AVAILABLE
      .map((l) => ({
        value: l,
        label: tagName(l) as string,
      }))
      .sort(compareKeys<string>('label'));
  }

  /** List of Locale Options */
  get localeOptions() {
    return Available
      .filter(
        (tag) => !this.restrictLocales
          || parseLocale(tag).territory === this.country,
      )
      .map((tag) => ({
        value: tag,
        label: tagName(tag),
      } as Option))
      .sort(compareKeys<string>('label'));
  }

  /** Formatted Accounting String */
  get previewAccounting() {
    if (!this.jadetreeLocale) return '';
    return jtFormat(
      `${this.previewNegative ? '-' : ''}1234567.8901`,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.jadetreeLocale.accountingPattern!,
      {
        currency: this.currency || 'XXX',
        locale: this.jadetreeLocale,
      },
    );
  }

  /** Formatted Currency String */
  get previewCurrency() {
    if (!this.jadetreeLocale) return '';
    return jtFormat(
      `${this.previewNegative ? '-' : ''}1234567.8901`,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.jadetreeLocale.currencyPattern!,
      {
        currency: this.currency || 'XXX',
        locale: this.jadetreeLocale,
      },
    );
  }

  /** Formatted Decimal Number String */
  get previewDecimal() {
    if (!this.jadetreeLocale) return '';
    return jtFormat(
      `${this.previewNegative ? '-' : ''}1234567.8901`,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.jadetreeLocale.decimalPattern!,
      { locale: this.jadetreeLocale },
    );
  }

  /** Format a Long Date */
  get previewLongDate() {
    if (!this.dateFnsLocale) return '';
    return dfFormat(new Date(2020, 4, 29), 'PP', { locale: this.dateFnsLocale });
  }

  /** Format a Short Date */
  get previewShortDate() {
    if (!this.dateFnsLocale) return '';
    return dfFormat(new Date(2020, 4, 29), 'P', { locale: this.dateFnsLocale });
  }

  /** Update Default Currency and Locale when Country changes */
  @Watch('country', { immediate: true })
  countryChanged(newValue: string) {
    this.isUpdatingData = true;
    if (!newValue) {
      if (this.localeDirty) {
        this.$emit('update:restrictLocales', false);
      } else {
        this.$emit('update:locale', '');
      }
      if (!this.currencyDirty) {
        this.$emit('update:currency', '');
      }
    } else {
      let newLocale = this.locale;
      if (!this.localeDirty) {
        newLocale = getDefaultLocale(newValue);
      }

      const hasLocale = this.localeOptions.some((option) => option.value === newLocale);
      if (this.localeDirty && !hasLocale) {
        // Turn off locale restrictions so the locale isn't reset
        this.$emit('update:restrictLocales', false);
      } else if (!hasLocale) {
        // Reset the locale to first entry
        this.$emit('update:locale', this.localeOptions[0].value);
      } else {
        // Reset the locale to default locale
        this.$emit('update:locale', newLocale);
      }

      if (!this.currencyDirty) {
        this.$emit('update:currency', Currency.localCurrency(newValue) || 'XXX');
      }
    }
    this.$nextTick(() => { this.isUpdatingData = false; });
  }

  /** Update Jade Tree Locales */
  @Watch('locale')
  localeChanged(newValue: string) {
    const { dispatch } = this.$store;
    dispatch('l10n/loadLocale', newValue);
  }

  /* --------------  Methods  ----------------- */

  /* ------------  Render Function  ----------- */

  /**
   * Render the Component
   */
  render() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.$scopedSlots.default!(this.context);
  }
}
