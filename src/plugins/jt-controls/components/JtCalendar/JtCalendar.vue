<template>
  <jt-calendar-controller v-bind="$attrs" v-on="$listeners" v-slot="controller">
    <h1>Calendar</h1>
    <pre class="text-xs">{{ controller }}</pre>
  </jt-calendar-controller>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import JtCalendarController from './JtCalendarController';

@Component({
  name: 'JtCalendar',
  components: { JtCalendarController },
  inheritAttrs: false,
})
export default class JtCalendar extends Vue {
}
</script>
