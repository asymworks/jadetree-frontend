<template>
  <jt-form-field v-bind="$attrs" v-on="$listeners">
    <template v-slot:default="slotProps">
      <jt-date-control
        :id="slotProps.id"
        :disabled="slotProps.disabled"
        :readonly="slotProps.readonly"
        :placeholder="slotProps.placeholder"
        :class="slotProps.inputClasses"
        v-bind="slotProps.attrs"
        v-on="slotProps.listeners"
      />
      <label
        v-if="slotProps.floatLabel"
        :for="slotProps.id"
        :data-content="slotProps.label"
        class="jtc-float-label__label"
      >
        <span>{{ slotProps.label }}</span>
      </label>
    </template>
  </jt-form-field>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({ inheritAttrs: false })
export default class JtDateField extends Vue {
}
</script>
