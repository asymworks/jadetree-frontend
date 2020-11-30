<template>
  <div
    v-if="open"
    class="jtc-modal-container"
    @click.self="$modalEventBus.$emit('click-overlay')"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class JtModalLayout extends Vue {
  @Prop({ default: false })
  open!: boolean;
}
</script>
