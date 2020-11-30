<template>
  <span v-if="option.search">
    Create &ldquo;<span class="font-medium">{{ option.label }}</span>&rdquo;
  </span>
  <span v-else>
    {{ option.label }}
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({ name: 'JtSelectItem' })
export default class JtSelectItem extends Vue {
  @Prop({ required: true })
  private option!: object;
}
</script>
