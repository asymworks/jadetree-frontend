<template>
  <div
    class="jtc-control jtc-currency-control"
    :class="{
        'jtc-placeholder-shown': empty,
        'jtc-control__focused': hasFocus,
        'jtc-control__disabled': disabled,
        'jtc-control__readonly': readonly,
      }"
  >
    <input
      class="jtc-control-input"
      v-bind="bindInput.attributes"
      v-on="bindInput.events"
    />
    <button
      v-if="showClearButton && !empty"
      ref="clearBtn"
      tabindex="-1"
      type="button"
      class="jtc-control-button jtc-currency-button__clear"
      :disabled="disabled"
      @click="clearSelection"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>
    </button>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line object-curly-newline
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  Currency,
  Locale,
  Money,
  format as jtFormat,
  parse as jtParse,
} from '@jadetree/currency';
import { en } from '@jadetree/currency/locales/en';
import Decimal from 'decimal.js-light';
import qinu from 'qinu';

/** Format Type */
export type JtCurrencyFormat = 'standard' | 'accounting';

/** Formatter Type */
export type CurrencyFormatter = (value: Money) => string;

@Component
export default class JtCurrencyControl extends Vue {
  /** Align Text Right */
  @Prop({ default: false })
  private alignRight!: boolean;

  /** Use String Values */
  @Prop({ default: true })
  private asString!: boolean;

  /** ISO-4166 Currency Code */
  @Prop({
    default: 'USD',
    validator: (value: string) => Currency.allCurrencies().includes(value),
  })
  private currency!: string;

  /**
   * Whether to use the currency's precision. If false, the pattern's
   * precision will be used.
   */
  @Prop({ default: true })
  private currencyDigits!: boolean;

  /** Disable the Control */
  @Prop({ default: false })
  private disabled!: boolean;

  /** Formatting type ('standard' or 'accounting') */
  @Prop({ default: 'standard' })
  private format!: JtCurrencyFormat | CurrencyFormatter;

  /** Control `id` Attribute */
  @Prop()
  private id?: string;

  /** Jade Tree Currency Locale */
  @Prop({ default: () => en })
  private locale!: Locale;

  /** Placeholder text */
  @Prop()
  private placeholder?: string;

  /** Precision for String Values */
  @Prop({ default: 4 })
  private precision!: number;

  /**
   * Whether decimal numbers should be forcibly quantized to produce a
   * formatted output strictly matching the CLDR definition for the locale
   */
  @Prop({ default: true })
  private quantize!: boolean;

  /** Make the Control Read-Only */
  @Prop({ default: false })
  private readonly!: boolean;

  /** Show a clear button */
  @Prop({ default: true })
  private showClearButton!: boolean;

  /** Tab index of the control */
  @Prop({ default: 0 })
  private tabindex!: number;

  /** Control Value */
  @Prop()
  private value?: Decimal | Money | string | null;

  /* ---------------  Data  ------------------- */

  /** If the input box is composing */
  private composing = false;

  /** Control Dirty State */
  private dirty = false;

  /** Control Editing State */
  private editing = false;

  /** Control Focus State */
  private hasFocus = false;

  /** Current Input Value */
  private internalValue = '';

  /** Unique string for id and ARIA attributes */
  private uid = '';

  /* -------------  Computed  ----------------- */

  /** Input Field Bindings */
  get bindInput() {
    const {
      alignRight,
      disabled,
      id,
      inputValue,
      placeholder,
      readonly,
      tabindex,
    } = this;

    return {
      attributes: {
        disabled,
        placeholder,
        tabindex,
        readonly,
        id: id || `jtc-${this.uid}__input`,
        ref: 'input',
        type: 'tel',
        autocomplete: 'off',
        value: inputValue,
        class: {
          'text-right': alignRight,
        },
      },
      events: {
        compositionstart: () => { this.composing = true; },
        compositionend: () => { this.composing = false; },
        keydown: this.inputKeyDown,
        blur: this.inputBlur,
        focus: this.inputFocus,
        focusout: this.inputFocusOut,
        input: this.inputUpdate,
      },
    };
  }

  /** Control Empty State */
  get empty(): boolean {
    return !this.value;
  }

  /** Formatted Currency Value */
  get fmtCurrency(): string {
    if (!this.value) return '';
    if (typeof this.format === 'function') {
      return this.format(new Money(this.value, this.currency));
    }
    return new Money(this.value, this.currency).format(this.locale, this.format);
  }

  /** Current Input Value */
  get inputValue(): string {
    return this.editing
      ? this.internalValue
      : this.fmtCurrency;
  }

  /* --------------- Watchers ----------------- */

  @Watch('hasFocus')
  onFocusChanged(value: boolean) {
    if (value) {
      this.$emit('focus');
    } else {
      this.$emit('blur');
    }
  }

  /* ---------------  Hooks  ------------------ */

  mounted() {
    this.uid = qinu({ length: 16 });
  }

  /* --------------  Methods  ----------------- */

  /** Clear the Control Value */
  clearSelection() {
    this.setValue(null);
    if (this.hasFocus) {
      (this.$refs.input as HTMLInputElement).blur();
    }
  }

  /** Update value when input field blurs */
  inputBlur() {
    this.parseInput();
    this.editing = false;
  }

  /** Start editing when input field focuses */
  inputFocus() {
    const { locale, value } = this;

    if (!value) {
      this.internalValue = '';
    } else {
      let fmtValue: Decimal;
      if (value instanceof Money) {
        fmtValue = value.amount;
      } else {
        fmtValue = new Decimal(value);
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.internalValue = jtFormat(fmtValue, locale.decimalPattern!, { locale });
    }

    this.editing = true;
    this.hasFocus = true;

    this.$nextTick(() => (this.$refs.input as HTMLInputElement).select());
  }

  /** Keep focus on input when control buttons are clicked */
  inputFocusOut(e: FocusEvent) {
    const buttons = [
      this.$refs.clearBtn,
    ];

    if (buttons.some((b) => b === e.relatedTarget)) {
      e.stopPropagation();
      e.preventDefault();
      this.$nextTick(() => (this.$refs.input as HTMLInputElement).focus());
    } else {
      this.hasFocus = false;
    }
  }

  /** Input field keydown handler */
  inputKeyDown(e: KeyboardEvent) {
    const handlers: { [key: number]: (e?: KeyboardEvent) => void } = {
      13: () => {
        e.stopPropagation();
        e.preventDefault();
        (e.target as HTMLInputElement).blur();
      },
    };

    if (typeof handlers[e.keyCode] === 'function') {
      handlers[e.keyCode](e);
    }
  }

  /** Update the Editor State */
  inputUpdate(e: InputEvent) {
    this.dirty = true;
    this.internalValue = (e.target as HTMLInputElement).value;
  }

  /** Parse the current input value and set the selected decimal value */
  parseInput() {
    if (!this.dirty) return;
    if (this.internalValue === '') {
      this.setValue(null);
      return;
    }

    try {
      const result = jtParse(this.internalValue, { locale: this.locale });
      this.setValue(new Money(result, this.currency));
      this.dirty = false;
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.error(ex);
      this.dirty = false;
    }
  }

  /** Set the current value */
  setValue(value: Money | null) {
    if (!this.readonly) {
      if (this.asString) {
        this.$emit(
          'input',
          value
            ? value.amount.toFixed(this.precision).toString()
            : '',
        );
      } else {
        this.$emit('input', value);
      }
    }
  }
}
</script>
