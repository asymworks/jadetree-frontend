import { Component, Prop, Vue } from 'vue-property-decorator';
import {
  addDays,
  format,
  getWeek,
  getWeeksInMonth,
  getYear,
  isSameMonth,
  setDate,
  setMonth,
  startOfWeek,
  Locale as DateLocale,
} from 'date-fns';
import { enUS } from 'date-fns/locale';

export type DisplayMode = 'day' | 'month' | 'year';

@Component
export default class JtCalendarController extends Vue {
  /** Day Picker Format */
  @Prop({ default: 'd' })
  private dayFormat!: string;

  /** Month and Year to Display */
  @Prop({ default: () => new Date() })
  private displayMonth!: Date;

  /** Date Formatting Locale */
  @Prop({ default: () => enUS })
  private locale!: DateLocale;

  /** Current Display Mode */
  @Prop({ default: 'day' })
  private mode!: DisplayMode;

  /** Month Header Format */
  @Prop({ default: 'LLLL' })
  private monthHeaderFormat!: string;

  /** Month Picker Format */
  @Prop({ default: 'LLL' })
  private monthPickerFormat!: string;

  /** Number of Years to Display in the Picker */
  @Prop({ default: 12 })
  private numYears!: number;

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

  /** Get the Week Number for a Date */
  getWeekNumber(date: Date): number {
    const { locale, weekStart } = this;
    return getWeek(date, { locale, weekStartsOn: weekStart });
  }

  /** Set Picker Mode */
  setMode(value: DisplayMode) {
    this.mode = value;
  }

  /* ------------  Render Function  ----------- */

  /**
   * Render the Component
   */
  render() {
    const {
      displayMonth,
      formatDay,
      formatWeek,
      getWeekNumber,
      headerMonth,
      headerYear,
      mode,
      monthNames,
      monthHeaderFormat,
      monthPickerFormat,
      setMode,
      weekdayFormat,
      weekdayNames,
      weekFormat,
      weekNumbers,
      weekStart,
      weeks,
      years,
    } = this;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.$scopedSlots.default!({
      displayMonth,
      formatDay,
      formatWeek,
      getWeekNumber,
      headerMonth,
      headerYear,
      mode,
      monthNames,
      monthHeaderFormat,
      monthPickerFormat,
      setMode,
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
