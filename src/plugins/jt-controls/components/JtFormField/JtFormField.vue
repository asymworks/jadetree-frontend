<template>
  <div class="jtc-field-wrapper">
    <div class="jtc-field-wrapper__before">
      <slot name="before" v-bind="slotScope"></slot>
    </div>
    <div class="jtc-field-container">
      <slot name="field" v-bind="slotScope">
        <div v-if="!floatLabel" class="jtc-field-container__top">
          <div
            class="jtc-field-label"
            :class="{
                'jtc-field-label__danger': isDanger,
                'jtc-field-label__success': isSuccess,
                'jtc-field-label__warning': isWarning,
              }"
          >
            <label :for="id">{{ label }}</label>
          </div>
          <div
            class="jtc-field-hint"
            :class="{
                'jtc-field-hint__danger': isDanger,
                'jtc-field-hint__success': isSuccess,
                'jtc-field-hint__warning': isWarning,
              }"
          >{{ hint }}</div>
        </div>
        <div :class="{
            'jtc-float-label': floatLabel,
            'jtc-float-label__danger': floatLabel && isDanger,
            'jtc-float-label__success': floatLabel && isSuccess,
            'jtc-float-label__warning': floatLabel && isWarning,
          }"
        >
          <div
            v-if="floatLabel"
            class="jtc-float-hint jtc-field-hint"
            :class="{
                'jtc-field-hint__danger': isDanger,
                'jtc-field-hint__success': isSuccess,
                'jtc-field-hint__warning': isWarning,
              }"
            :data-content="hint"
          ><span>{{ hint }}</span></div>
          <slot name="default" v-bind="slotScope"></slot>
        </div>
      </slot>
      <div class="jtc-field-messages">
        <p
          v-for="(msg, index) in messageList"
          :key="index"
          class="jtc-field-message"
          :class="{
              'jtc-field-message__danger': isDanger,
              'jtc-field-message__success': isSuccess,
              'jtc-field-message__warning': isWarning,
            }"
        >
          {{ msg }}
        </p>
      </div>
      <div class="jtc-field-description">{{ description }}</div>
    </div>
    <div class="jtc-field-wrapper__after">
      <slot name="after" v-bind="slotScope"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

export type JtFieldSlotScope = {
  attrs?: object;
  disabled: boolean;
  floatLabel: boolean;
  id: string;
  inputClasses: string[];
  isDanger: boolean;
  isSuccess: boolean;
  isWarning: boolean;
  label: string;
  labelClasses: string[];
  listeners: object;
  placeholder?: string;
  readonly: boolean;
  state: string;
};

export type JtControlState = 'danger' | 'default' | 'success' | 'warning';

@Component({ inheritAttrs: false })
export default class JtFormField extends Vue {
  /** Classes for the Form Control */
  @Prop({ default: () => [] })
  private controlClasses!: string | string[];

  /** Description of the Field */
  @Prop()
  private description!: string | undefined;

  /** Disable the Field */
  @Prop({ default: false })
  private disabled!: boolean;

  /** Render the field with a Material Design floating label */
  @Prop({ default: false })
  private floatLabel!: boolean;

  /** Hint for the Field */
  @Prop()
  private hint!: string | undefined;

  /** Identifier for the Field */
  @Prop({ required: true })
  private id!: string;

  /** Label for the Field */
  @Prop({ required: true })
  private label!: string;

  /** Messages for the Field */
  @Prop()
  private messages!: string | string[] | undefined;

  /** Placeholder Text */
  @Prop()
  private placeholder!: string | undefined;

  /** Make the Field read-only */
  @Prop({ default: false })
  private readonly!: boolean;

  /** Field State */
  @Prop({ default: 'default' })
  private state!: string;

  /** Input field classes */
  get inputClasses(): string[] {
    return [
      ...(Array.isArray(this.controlClasses)
        ? this.controlClasses
        : [this.controlClasses]
      ),
      ...(this.floatLabel ? ['jtc-float-label__input'] : []),
    ];
  }

  /** Helper to check if the field is in a Danger state */
  get isDanger(): boolean {
    return this.state === 'danger';
  }

  /** Helper to check if the field is in a Success state */
  get isSuccess(): boolean {
    return this.state === 'success';
  }

  /** Helper to check if the field is in a Warning state */
  get isWarning(): boolean {
    return this.state === 'warning';
  }

  /** Label classes */
  get labelClasses(): string[] {
    return [
      ...(this.floatLabel ? ['jtc-float-label__label'] : []),
    ];
  }

  /** List of messages to display below the field */
  get messageList(): string[] {
    if (!this.messages) return [];
    if (typeof this.messages === 'string') {
      return [this.messages];
    }
    return this.messages;
  }

  /** Default slot scope */
  get slotScope(): JtFieldSlotScope {
    const {
      disabled,
      floatLabel,
      id,
      inputClasses,
      isDanger,
      isSuccess,
      isWarning,
      label,
      labelClasses,
      placeholder,
      readonly,
      state,
    } = this;

    return {
      attrs: this.$attrs,
      disabled,
      floatLabel,
      id,
      inputClasses,
      isDanger,
      isSuccess,
      isWarning,
      label,
      labelClasses,
      listeners: this.$listeners,
      placeholder: floatLabel ? label : placeholder,
      readonly,
      state,
    };
  }
}
</script>
