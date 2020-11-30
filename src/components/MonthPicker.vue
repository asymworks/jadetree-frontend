<!-- eslint-disable max-len -->
<template>
  <div class="w-full select-none">
    <jt-popup
      mobileMode="modal"
      position="bottom-left"
      :open="pickerOpen"
      @popup-hide="closePicker"
    >
      <template v-slot:control>
        <div class="w-full flex items-center justify-between">
          <div class="cursor-pointer" @click.stop="decMonth">
            <svg viewBox="0 0 20 20" fill="currentColor" class="chevron-left w-6 h-6">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="cursor-pointer flex items-center space-x-2" @click="pickerOpen=true">
            <span class="inline-block px-2 space-x-1 text-lg">
              <span class="font-medium">{{ formattedMonth }}</span>
              <span class="font-light">{{ formattedYear }}</span>
            </span>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="calendar w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div class="cursor-pointer" @click.stop="incMonth">
            <svg viewBox="0 0 20 20" fill="currentColor" class="chevron-right w-6 h-6">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
      </template>
      <template v-slot:popup>
        <jt-datepicker-controller type="month" v-slot="context" @input="updateValue">
          <jt-datepicker-calendar class="jtc-date-picker" ref="picker" :context="context" />
        </jt-datepicker-controller>
      </template>
    </jt-popup>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
  Locale,
  addMonths,
  format,
  formatISO,
  isValid,
  parseISO,
} from 'date-fns';
import { enUS } from 'date-fns/locale';

@Component
export default class MonthPicker extends Vue {
  /** Date Formatting Locale */
  @Prop({ default: () => enUS })
  private locale!: Locale;

  /** Month Header Format */
  @Prop({ default: 'LLLL' })
  private monthFormat!: string;

  /** Control Value */
  @Prop({
    default: () => formatISO(new Date()),
    validator: (value) => !value || isValid(Date.parse(value)),
  })
  private value!: string;

  /** Year Header Format */
  @Prop({ default: 'y' })
  private yearFormat!: string;

  /** Picker Popup State */
  private pickerOpen = false;

  /** Date Value */
  get dateValue(): Date {
    return parseISO(this.value);
  }

  /** Formatted Month */
  get formattedMonth(): string {
    const { dateValue, locale, monthFormat } = this;
    return format(dateValue, monthFormat, { locale });
  }

  /** Formatted Year */
  get formattedYear(): string {
    const { dateValue, locale, yearFormat } = this;
    return format(dateValue, yearFormat, { locale });
  }

  /** Close the Month Picker */
  closePicker() {
    this.pickerOpen = false;
  }

  /** Decrement the Month */
  decMonth() {
    this.updateValue(addMonths(this.dateValue, -1));
  }

  /** Increment the Month */
  incMonth() {
    this.updateValue(addMonths(this.dateValue, +1));
  }

  /** Update Value */
  updateValue(date: Date) {
    this.$emit('input', format(date, 'yyyy-MM-dd'));
    this.$nextTick(() => { this.closePicker(); });
  }
}
</script>
