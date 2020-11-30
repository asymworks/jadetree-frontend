<template>
  <jt-form-field v-bind="$attrs" v-on="$listeners">
    <template v-slot:field="slotProps">
      <div class="flex items-center">
        <input
          type="checkbox"
          :id="slotProps.id"
          :disabled="slotProps.disabled"
          :readonly="slotProps.readonly"
          :class="slotProps.inputClasses"
          v-bind="slotProps.attrs"
          v-on="slotProps.listeners"
        />
        <div
          class="jtc-field-label__checkbox"
          :class="{
              'jtc-field-label__danger': slotProps.isDanger,
              'jtc-field-label__success': slotProps.isSuccess,
              'jtc-field-label__warning': slotProps.isWarning,
            }"
        >
          <label :for="slotProps.id">{{ slotProps.label }}</label>
        </div>
      </div>
    </template>
  </jt-form-field>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({ inheritAttrs: false })
export default class JtCheckField extends Vue {
}
</script>
