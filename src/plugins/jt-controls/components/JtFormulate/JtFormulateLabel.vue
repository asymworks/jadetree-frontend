<template>
  <label
    :class="context.classes.label"
    :for="context.id"
    :data-content="context.label"
  >
    <span v-text="context.label" />
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class JtFormulateLabel extends Vue {
  @Prop({ required: true })
  private context!: object;
}
</script>
