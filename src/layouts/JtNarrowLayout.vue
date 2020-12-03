<template>
  <div class="flex-grow flex flex-col items-stretch sm:items-center">
    <div class="sm:w-full sm:max-w-xl m-4 p-4 border rounded-lg bg-white shadow">
      <slot name="default"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class JtNarrowLayout extends Vue {
}
</script>
