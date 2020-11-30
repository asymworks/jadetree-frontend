<!-- eslint-disable max-len -->
<template>
  <jt-popup
    mobileMode="modal"
    position="bottom-left"
    :open="pickerOpen"
    @popup-hide="closePicker"
  >
    <template v-slot:control>
      <div
        class="jtc-control jtc-date-control"
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
          class="jtc-control-button jtc-date-button__clear"
          :disabled="disabled"
          @click.stop="clearSelection"
        >
          <svg
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
        <button
          ref="toggleBtn"
          tabindex="-1"
          type="button"
          class="jtc-control-button jtc-date-button__open"
          @click.stop="togglePicker"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
        </button>
      </div>
      <slot name="label"></slot>
    </template>
    <template v-slot:popup>
      <jt-datepicker-controller
        v-bind="pickerOptions"
        v-slot="context"
        type="day"
        :value="dateValue"
        @input="setValue($event)"
      >
        <jt-datepicker-calendar class="jtc-date-picker" ref="picker" :context="context" />
      </jt-datepicker-controller>
    </template>
  </jt-popup>
</template>

<script lang="ts">
// eslint-disable-next-line object-curly-newline
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  format,
  isValid,
  parse,
  parseISO,
  setYear,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import qinu from 'qinu';

export type DateFormatter = (date: Date) => string;

@Component({
  /* components: { JtDatepickerCalendar, JtDatepickerController }, */
  inheritAttrs: false,
})
export default class JtDateControl extends Vue {
  /** Disable the Control */
  @Prop({ default: false })
  private disabled!: boolean;

  /**
   * Formatting string to display the selected date. Uses date-fns format
   * tokens. Default is 'P' for locale-dependent short date format.
   */
  @Prop({ default: 'P' })
  private displayFormat!: string | DateFormatter;

  /** Control `id` Attribute */
  @Prop()
  private id?: string;

  /** Date-Fns Locale */
  @Prop({ default: () => enUS })
  private locale!: Locale;

  /** Open the Date Picker when the input receives focus */
  @Prop({ default: false })
  private openPickerOnFocus!: boolean;

  /**
   * Test for the 'P' and 'PP' (locale-aware short and medium date strings)
   * before the rest of the input patterns.
   */
  @Prop({ default: true })
  private parseLocaleFormats!: boolean;

  /**
   * Force testing for two-digit years ahead of full years (means that the
   * date string 12/13/14 gets parsed as December 13, 2014 instead of
   * December 13, 0014).
   */
  @Prop({ default: true })
  private parseShortYears!: boolean;

  /**
   * List of patterns to try, in order, to parse a user-input date string.
   *
   * If `parseLocaleFormats` is set to true, the locale-aware 'P' and 'PP'
   * formats will be prepended to this list automatically.
   *
   * If `parseShortYears` is set to true, all patterns which use the four
   * digit year token `yyyy` or the single digit year token `y` will first
   * be tried with a two-digit `yy` token so that two-digit years are
   * translated to be within 50 years of the current date. If a pattern
   * string does not contain any year charater (`y`, `Y`, `R`, `u`), the
   * current year will be assumed.
   *
   * ISO-formatted 'yyyy-MM-dd' dates are always accepted and are tried as
   * a fallback if no other patterns match.  ISO dates always require four
   * digit years.
   *
   * The default list is US-centric and tries M/d/y and M-d-y.
   *
   * @type {Array}
   */
  @Prop({ default: () => ['M/d/y', 'M-d-y', 'M/d'] })
  private patterns!: string[];

  /** Picker Options */
  @Prop({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    default: () => {},
  })
  private pickerOptions!: object;

  /** Placeholder text */
  @Prop()
  private placeholder?: string;

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
  @Prop({
    default: '',
    validator: (value) => !value || isValid(Date.parse(value)),
  })
  private value!: string;

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

  /** Picker Status */
  private pickerOpen = false;

  /** Unique string for id and ARIA attributes */
  private uid = '';

  /** Flag Indicating the value was updated by the picker */
  private updatedByPicker = false;

  /* -------------  Computed  ----------------- */

  /** Input Field Bindings */
  get bindInput() {
    const {
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

  /** Current Date Value */
  get dateValue(): Date {
    return parseISO(this.value);
  }

  /** Control Empty State */
  get empty(): boolean {
    return !this.value;
  }

  /** Formatted Value */
  get fmtValue(): string {
    const { locale, displayFormat, value } = this;
    if (!value || value === '') return '';
    if (typeof displayFormat === 'function') {
      return displayFormat(parseISO(value));
    }
    return format(parseISO(value), displayFormat, { locale });
  }

  /** Current Input Value */
  get inputValue(): string {
    return this.editing
      ? this.internalValue
      : this.fmtValue;
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
    this.setValue(new Date(''));
    if (this.hasFocus) {
      (this.$refs.input as HTMLInputElement).blur();
    }
  }

  /** Close the Picker */
  closePicker() {
    this.pickerOpen = false;
    this.$nextTick(() => {
      if (document.activeElement !== this.$refs.input) {
        this.hasFocus = false;
      }
    });
  }

  /** Update value when input field blurs */
  inputBlur() {
    // @typescript-eslint/no-empty-function
  }

  /** Start editing when input field focuses */
  inputFocus() {
    this.internalValue = this.fmtValue;
    this.editing = true;
    this.hasFocus = true;

    this.$nextTick(() => (this.$refs.input as HTMLInputElement).select());
  }

  /** Keep focus on input when control buttons are clicked */
  inputFocusOut(e: FocusEvent) {
    const buttons = [
      this.$refs.clearBtn,
      this.$refs.toggleBtn,
    ];

    if (buttons.some((b) => b === e.relatedTarget)) {
      e.stopPropagation();
      e.preventDefault();
      this.$nextTick(() => (this.$refs.input as HTMLInputElement).focus());
    } else if (
      !this.$refs.picker
      || !(this.$refs.picker as Vue).$el.contains(e.relatedTarget as Node)
    ) {
      if (this.editing) {
        const newValue = this.parseInput();
        if (isValid(newValue)) {
          this.setValue(newValue);
        }
      }

      this.editing = false;
      this.hasFocus = false;
      this.closePicker();
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

  /** Open the Picker */
  openPicker() {
    this.pickerOpen = true;
    this.hasFocus = true;
  }

  /** Parse the current input value and set the selected date */
  parseInput(): Date {
    if (!this.dirty || this.internalValue === '') {
      return new Date('');
    }

    const { locale } = this;
    const reference = new Date();
    const { patterns } = this;

    // Add locale-aware formats if configured
    if (locale && this.parseLocaleFormats) {
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      patterns.unshift(locale.formatLong!.date({ width: 'medium' }));
      patterns.unshift(locale.formatLong!.date({ width: 'short' }));
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
    }

    // Try parsing with all provided patterns
    for (let i = 0; i < patterns.length; i += 1) {
      const result = this.parsePattern(
        this.internalValue,
        patterns[i],
        locale,
        reference,
      );

      if (result instanceof Date && isValid(result)) {
        return result;
      }
    }

    // Parse ISO as a fallback
    return parseISO(this.internalValue);
  }

  /**
   * Parse a date string against a pattern, optionally testing short years
   * with a `yy` relative format before testing year patterns that capture
   * short years in absolute form.
   * @param value Date string to parse
   * @param format Parser format string
   * @param locale date-fns `Locale` object
   * @param reference Reference date for relative years
   */
  parsePattern(
    value: string,
    pattern: string,
    locale: Locale,
    reference: Date,
  ): Date {
    if (this.parseShortYears) {
      const sYear = pattern.replace(/(?<!y)y(?!y)/, 'yy');
      const lYear = pattern.replace(/yyyy/, 'yy');

      // If we replaced a single 'y' pattern, try the 'yy' version first
      if (sYear !== pattern) {
        const result = parse(value, sYear, reference, { locale });
        if (result instanceof Date && isValid(result)) {
          return result;
        }
      }

      // If we replaced a 'yyyy' pattern, try the 'yy' version first
      if (lYear !== pattern) {
        const result = parse(value, lYear, reference, { locale });
        if (result instanceof Date && isValid(result)) {
          return result;
        }
      }
    }

    // Parse the as-is pattern and check if the year needs to be assigned
    const parsed = parse(value, pattern, reference, { locale });
    if (parsed instanceof Date && isValid(parsed) && !pattern.match(/[yYRu]/)) {
      return setYear(parsed, (new Date()).getFullYear());
    }

    return parsed;
  }

  /** Set the current value */
  setValue(value: Date) {
    if (!this.readonly) {
      this.$emit('input', isValid(value) ? format(value, 'yyyy-MM-dd') : '');
    }

    this.editing = false;
    this.closePicker();
  }

  /** Toggle the Date Picker */
  togglePicker() {
    if (this.pickerOpen) {
      this.closePicker();
    } else {
      this.openPicker();
    }
  }
}
</script>
