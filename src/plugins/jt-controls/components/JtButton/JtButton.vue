<template>
  <button class="jtc-button" v-bind="attributes" v-on="$listeners">
    <jt-spinner v-if="loading" class="jtc-button-spinner" />
    <slot name="default"></slot>
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({ inheritAttrs: false, name: 'JtButton' })
export default class JtButton extends Vue {
  /**
   * Button color. Must have a corresponding `jtc-button--{color}` CSS class
   * defined. If the color string starts with `light`, the `jtc-button--light`
   * class will also be included to hint text color.
   */
  @Prop({ default: 'green' })
  private color!: string;

  /** Disable the button */
  @Prop({ default: false })
  private disabled!: boolean;

  /** Show the loading indicator and disable the button */
  @Prop({ default: false })
  private loading!: boolean;

  /** Button Attributes */
  get attributes(): object {
    const { color, disabled, loading } = this;
    const classes = {
      'jtc-button--disabled': disabled,
      'jtc-button--loading': loading,
      'jtc-button--light': color.startsWith('light'),
    };

    return {
      class: [
        {
          'jtc-button--gray': color === 'gray',
          'jtc-button--red': color === 'red',
          'jtc-button--orange': color === 'orange',
          'jtc-button--yellow': color === 'yellow',
          'jtc-button--green': color === 'green',
          'jtc-button--blue': color === 'blue',
          'jtc-button--indigo': color === 'indigo',
          'jtc-button--purple': color === 'purple',
          'jtc-button--teal': color === 'teal',
          'jtc-button--pink': color === 'pink',
          'jtc-button--light-gray': color === 'light-gray',
          'jtc-button--light-red': color === 'light-red',
          'jtc-button--light-orange': color === 'light-orange',
          'jtc-button--light-yellow': color === 'light-yellow',
          'jtc-button--light-green': color === 'light-green',
          'jtc-button--light-blue': color === 'light-blue',
          'jtc-button--light-indigo': color === 'light-indigo',
          'jtc-button--light-purple': color === 'light-purple',
          'jtc-button--light-teal': color === 'light-teal',
          'jtc-button--light-pink': color === 'light-pink',
        },
        classes,
      ],
      disabled: disabled || loading,
      ...this.$attrs,
    };
  }
}
</script>
