<template>
  <div class="jtc-calendar-wrapper" :class="[`jtc-calendar-wrapper__${context.type}`]">
    <div class="jtc-calendar-header">
      <button
        class="jtc-control-button jtc-picker-button__prev"
        type="button"
        @click.stop="context.picker.prevView"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
      </button>
      <div class="jtc-picker-control__container">
        <div class="jtc-picker-control">
          <button
            v-if="context.picker.displayMode === 'day'"
            type="button"
            class="jtc-control-button jtc-picker-control__month"
            @click.stop="context.picker.pickMonth"
          >
            {{ context.headerMonth }}
          </button>
          <button
            v-if="context.picker.displayMode !== 'year'"
            type="button"
            class="jtc-control-button jtc-picker-control__year"
            @click.stop="context.picker.pickYear"
          >
            {{ context.headerYear }}
            <div class="inline-block">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </div>
          </button>
        </div>
      </div>
      <button
        class="jtc-control-button jtc-picker-button__next"
        type="button"
        @click.stop="context.picker.nextView"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </button>
    </div>
    <div
      v-if="context.picker.displayMode === 'day'"
      class="jtc-picker-day"
      :class="{
          'jtc-picker-day__no-weeks': !context.weekNumbers,
          'jtc-picker-day__with-weeks': context.weekNumbers,
        }"
    >
      <div
        v-if="context.weekNumbers"
        class="jtc-picker-week-header"
      >
        <slot name="weekNumberHeader" v-bind="context" />
      </div>
      <div
        class="jtc-picker-day-header"
        v-for="wd in context.weekdayNames"
        v-text="wd"
        :key="wd"
      />
      <template v-for="days in context.weeks">
        <div
          class="jtc-picker-week-item"
          v-if="context.weekNumbers"
          v-text="context.formatWeek(days[0])"
          :key="`week-${context.getWeekNumber(days[0])}`"
        />
        <button
          v-for="day in days"
          v-text="context.formatDay(day)"
          type="button"
          class="jtc-picker-day-item"
          :class="{
              'jtc-picker-day-item__disabled': context.isDisabled(day),
              'jtc-picker-day-item__selectable': context.isSelectable(day),
              'jtc-picker-day-item__selected': context.isSelectedDay(day),
              'jtc-picker-day-item__today': context.isToday(day),
            }"
          :disabled="context.isDisabled(day)"
          :key="day.toISOString()"
          @click.stop="context.picker.selectDay(day)"
        />
      </template>
    </div>
    <div
      v-if="context.picker.displayMode === 'month'"
      class="jtc-picker-month"
    >
      <button
        v-for="(month, idx) in context.monthNames"
        v-text="month"
        type="button"
        class="jtc-picker-month-item jtc-picker-month-item__selectable"
        :class="{
            'jtc-picker-month-item__selected': context.isSelectedMonth(idx),
            'jtc-picker-month-item__today': context.isThisMonth(idx),
          }"
        :key="idx"
        @click.stop="context.picker.selectMonth(idx)"
      />
    </div>
    <div
      v-if="context.picker.displayMode === 'year'"
      class="jtc-picker-year"
    >
      <button
        v-for="year in context.years"
        v-text="context.formatYear(year)"
        type="button"
        class="jtc-picker-month-item jtc-picker-month-item__selectable"
        :class="{
            'jtc-picker-month-item__selected': context.isSelectedYear(year),
            'jtc-picker-month-item__today': context.isThisYear(year),
          }"
        :key="year"
        @click.stop="context.picker.selectYear(year)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import JtDatepickerController from './JtDatepickerController';

@Component({ components: { JtDatepickerController } })
export default class JtDatepickerCalendar extends Vue {
  @Prop({ required: true })
  context!: unknown;
}
</script>
