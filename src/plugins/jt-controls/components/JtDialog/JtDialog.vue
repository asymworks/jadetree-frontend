<!-- eslint-disable max-len -->
<template>
  <div class="jtc-dialog-container">
    <div :class="wrapperClass" @click.self="closeModal">
      <div class="jtc-dialog">
        <slot name="header">
          <div class="jtc-dialog-header">
            <div class="jtc-dialog-title">{{ title }}</div>
            <button
              class="jtc-dialog-close-btn"
              type="button"
              @click="close"
            >
              <svg
                class="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </slot>
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class JtDialog extends Vue {
  /** Dialog Title */
  @Prop({ required: true })
  title!: string;

  /** Dialog Wrapper Class */
  @Prop({ default: 'jtc-dialog-wrapper' })
  wrapperClass!: string;

  /** Close the Dialog */
  close() {
    this.$emit('dialog:close');
    this.closeModal();
  }

  /** Close the Modal Dialog */
  closeModal() {
    this.$modalEventBus.$emit('close');
  }
}
</script>
