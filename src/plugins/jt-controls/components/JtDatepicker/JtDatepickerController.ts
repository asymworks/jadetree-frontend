// eslint-disable-next-line object-curly-newline
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  addDays,
  addMonths,
  addYears,
  format,
  getWeek,
  getWeeksInMonth,
  getYear,
  isSameDay,
  isSameMonth,
  isSameYear,
  isThisMonth,
  isThisYear,
  isToday,
  isValid,
  setDate,
  setMonth,
  setYear,
  startOfWeek,
  Locale as DateLocale,
} from 'date-fns';
import { enUS } from 'date-fns/locale';

export type DisplayMode = 'day' | 'month' | 'year';

@Component
export default class JtDatepickerController extends Vue {
  /** Day Picker Format */
  @Prop({ default: 'd' })
  private dayFormat!: string;

  /** Date Formatting Locale */
  @Prop({ default: () => enUS })
  private locale!: DateLocale;

  /** Month Header Format */
  @Prop({ default: 'LLLL' })
  private monthHeaderFormat!: string;

  /** Month Picker Format */
  @Prop({ default: 'LLL' })
  private monthPickerFormat!: string;

  /** Number of Years to Display in the Picker */
  @Prop({ default: 12 })
  private numYears!: number;

  /** Display Picker Type */
  @Prop({ default: 'day' })
  private type!: DisplayMode;

  /** Current Picker Date */
  @Prop({ default: () => new Date() })
  private value!: Date;

  /**
   * The formatting string used for weekday headers. Uses date-fns format
   * tokens. Default is `cccccc` (Su, Mo, Tu...); for minimal (S, M, T...)
   * use `ccccc`, and for regular short headers use `ccc` (Sun, Mon, Tue...)
   */
  @Prop({ default: 'cccccc' })
  private weekdayFormat!: string;

  /** Week Number Format */
  @Prop({ default: 'w' })
  private weekFormat!: string;

  /** Show week numbers in the calendar view */
  @Prop({ default: false })
  private weekNumbers!: boolean;

  /**
   * Override the first day of the week, which defaults to the value in the
   * provided locale, or Sunday as the en-US fallback (`0` is Sunday).
   */
  @Prop({ default: 0 })
  private weekStart!: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  /** Year Header Format */
  @Prop({ default: 'y' })
  private yearHeaderFormat!: string;

  /** Year Picker Format */
  @Prop({ default: 'y' })
  private yearPickerFormat!: string;

  /**
   * Number of years by which to offset the list of years presented in the
   * Year Picker. This is used to center the active year in the list, and
   * should be set in conjunction with `numYears`.  The default `numYears` is
   * 12, and the offset is set to -4 to put the active year in the second row,
   * middle column position when displayed in a 4 row x 3 column grid.
   */
  @Prop({ default: -4 })
  private yearPickerOffset!: number;

  /* ---------------  Data  ------------------- */

  /** Current Picker Mode */
  private displayMode: DisplayMode = this.type;

  /** Current Picker Month */
  private displayMonth = isValid(this.value) ? this.value : new Date();

  /** Previous Picker Mode */
  private lastMode: DisplayMode = this.type;

  /** Year Picker Page Offset */
  private yearPageOffset = 0;

  /* -------------  Computed  ----------------- */

  /** Current Formatted Month Name */
  get headerMonth(): string {
    const { locale } = this;
    return format(this.displayMonth, this.monthHeaderFormat, { locale });
  }

  /** Current Formatted Year */
  get headerYear(): string {
    const { locale } = this;
    return format(this.displayMonth, this.yearHeaderFormat, { locale });
  }

  /** Formatted Month Names */
  get monthNames(): string[] {
    const { locale } = this;
    return Array.from({ length: 12 })
      .map((_, idx) => format(setMonth(new Date(), idx), this.monthPickerFormat, { locale }));
  }

  /** Formatted Weekday Names */
  get weekdayNames(): string[] {
    const { locale } = this;
    const sunday = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => {
      const weekDay = this.weekStart + i;
      if (weekDay >= 7) {
        return weekDay - 7;
      }
      return weekDay;
    }).map((i) => format(addDays(sunday, i), this.weekdayFormat, { locale }));
  }

  /** List of weeks to display */
  get weeks(): Date[][] {
    const firstWeek = startOfWeek(setDate(this.displayMonth, 1), {
      weekStartsOn: this.weekStart,
    });
    let nWeeks = getWeeksInMonth(this.displayMonth, {
      weekStartsOn: this.weekStart,
    });

    // getWeeksInMonth sometimes has issues when the last day of the month
    // is the first day of a week
    if (isSameMonth(this.displayMonth, addDays(firstWeek, nWeeks * 7))) {
      nWeeks += 1;
    }

    return Array.from(
      { length: nWeeks },
      (_, i) => Array.from(
        { length: 7 },
        (__, w) => addDays(firstWeek, i * 7 + w),
      ),
    );
  }

  /** List of years to display */
  get years(): number[] {
    const { numYears, yearPageOffset, yearPickerOffset } = this;
    const startYear = getYear(this.displayMonth)
      + yearPickerOffset
      + yearPageOffset * numYears;

    return Array.from({ length: numYears }).map(
      (_, i) => startYear + i,
    );
  }

  /* --------------  Watchers  ---------------- */
  @Watch('type', { immediate: true })
  onTypeChange(newValue: DisplayMode) {
    this.displayMode = newValue;
    this.lastMode = newValue;
  }

  /* --------------  Methods  ----------------- */

  /** Format the Day Number */
  formatDay(date: Date): string {
    const { dayFormat, locale } = this;
    return format(date, dayFormat, { locale });
  }

  /** Format the Week Number */
  formatWeek(date: Date): string {
    const { locale, weekFormat, weekStart } = this;
    return format(date, weekFormat, { locale, weekStartsOn: weekStart });
  }

  /** Format a Year */
  formatYear(year: number): string {
    const { locale, yearPickerFormat } = this;
    const date = new Date(year, 0, 1);
    return format(date, yearPickerFormat, { locale });
  }

  /** Get the Week Number for a Date */
  getWeekNumber(date: Date): number {
    const { locale, weekStart } = this;
    return getWeek(date, { locale, weekStartsOn: weekStart });
  }

  /** Check if the Date is Disabled */
  isDisabled(date: Date): boolean {
    return !isSameMonth(date, this.displayMonth);
  }

  /** Check if the Date is Selectable */
  isSelectable(date: Date): boolean {
    return !this.isDisabled(date);
  }

  /** Check if the Date is the current Selected Day */
  isSelectedDay(date: Date): boolean {
    return isSameDay(date, this.value);
  }

  /** Check if the Month is the current Selected Month */
  isSelectedMonth(month: number): boolean {
    const date = new Date(getYear(this.displayMonth), month, 1);
    return isSameMonth(date, this.value);
  }

  /** Check if the Year is the current Selected Year */
  isSelectedYear(year: number): boolean {
    const date = new Date(year, 0, 1);
    return isSameYear(date, this.value);
  }

  /** Check if the Month is This Month */
  isThisMonth(month: number): boolean {
    const date = new Date(getYear(this.displayMonth), month, 1);
    return isThisMonth(date);
  }

  /** Check if the Year is This Year */
  isThisYear(year: number): boolean {
    const date = new Date(year, 0, 1);
    return isThisYear(date);
  }

  /** Check if the Date is Today */
  isToday(date: Date): boolean {
    return isToday(date);
  }

  /** Go to the Next View in the Picker */
  nextView() {
    const { displayMode } = this;
    if (displayMode === 'day') {
      // Increment Month
      this.displayMonth = addMonths(this.displayMonth, 1);
    } else if (displayMode === 'month') {
      // Increment Year
      this.displayMonth = addYears(this.displayMonth, 1);
    } else if (displayMode === 'year') {
      // Increment Year Page
      this.yearPageOffset += 1;
    }
  }

  /** Go to the Previous View in the Picker */
  prevView() {
    const { displayMode } = this;
    if (displayMode === 'day') {
      // Decrement Month
      this.displayMonth = addMonths(this.displayMonth, -1);
    } else if (displayMode === 'month') {
      // Decrement Year
      this.displayMonth = addYears(this.displayMonth, -1);
    } else if (displayMode === 'year') {
      // Decrement Year Page
      this.yearPageOffset -= 1;
    }
  }

  /** Enter the Month Picker */
  pickMonth() {
    this.lastMode = this.displayMode;
    this.displayMode = 'month';
  }

  /** Enter the Year Picker */
  pickYear() {
    this.lastMode = this.displayMode;
    this.displayMode = 'year';
  }

  /** Select the Day */
  selectDay(date: Date) {
    this.$emit('input', date);
  }

  /** Select the Display Month */
  selectMonth(month: number) {
    if (this.type === 'month') {
      this.$emit('input', setMonth(this.displayMonth || new Date(), month));
    } else {
      this.displayMonth = setMonth(this.displayMonth, month);
      this.displayMode = this.lastMode;
    }
  }

  /** Select the Display Year */
  selectYear(year: number) {
    if (this.type === 'year') {
      this.$emit('input', setYear(this.displayMonth || new Date(), year));
    } else {
      this.displayMonth = setYear(this.displayMonth, year);
      this.displayMode = this.lastMode;
    }
  }

  /* ------------  Render Function  ----------- */

  /**
   * Render the Component
   */
  render() {
    const {
      displayMode,
      displayMonth,
      formatDay,
      formatWeek,
      formatYear,
      getWeekNumber,
      headerMonth,
      headerYear,
      isDisabled,
      isSelectable,
      isSelectedDay,
      isSelectedMonth,
      isSelectedYear,
      /* isThisMonth, */
      /* isThisYear, */
      /* isToday, */
      monthNames,
      monthHeaderFormat,
      monthPickerFormat,
      nextView,
      pickMonth,
      pickYear,
      prevView,
      selectDay,
      selectMonth,
      selectYear,
      type,
      weekdayFormat,
      weekdayNames,
      weekFormat,
      weekNumbers,
      weekStart,
      weeks,
      years,
    } = this;

    const picker = {
      displayMode,
      displayMonth,
      nextView,
      pickMonth,
      pickYear,
      prevView,
      selectDay,
      selectMonth,
      selectYear,
    };

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.$scopedSlots.default!({
      formatDay,
      formatWeek,
      formatYear,
      getWeekNumber,
      headerMonth,
      headerYear,
      isDisabled,
      isSelectable,
      isSelectedDay,
      isSelectedMonth,
      isSelectedYear,
      isThisMonth: this.isThisMonth,
      isThisYear: this.isThisYear,
      isToday: this.isToday,
      monthNames,
      monthHeaderFormat,
      monthPickerFormat,
      picker,
      type,
      weekdayFormat,
      weekdayNames,
      weekFormat,
      weekNumbers,
      weekStart,
      weeks,
      years,
    });
  }
}
