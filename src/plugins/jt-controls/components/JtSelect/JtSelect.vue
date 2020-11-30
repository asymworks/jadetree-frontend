<template>
  <jt-select-controller v-bind="$attrs" v-on="$listeners" v-slot="controller">
    <jt-popup
      mobileMode="fullscreen"
      position="bottom-both"
      :open="controller.listOpen"
      @popup-hide="controller.closeList"
    >
      <template v-slot:control>
        <div
          class="jtc-select-panel"
          :class="{'jtc-select-panel__open': controller.listOpen}"
          @mousedown.self.prevent="controller.listboxMouseDown"
          @mouseup="controller.listboxMouseUp"
        >
          <button
            v-if="controller.listOpen"
            class="jtc-select-button jtc-select-button__back"
            type="button"
            @click.stop="controller.closeList"
          >
            <slot name="button-cancel">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
            </slot>
          </button>
          <div
            class="jtc-control jtc-select-control"
            :class="{
                'jtc-placeholder-shown': controller.empty,
                'jtc-control__focused': controller.hasFocus,
                'jtc-control__disabled': controller.disabled,
                'jtc-control__readonly': controller.readonly,
                'jtc-select-control__open': controller.listOpen,
              }"
          >
            <input
              class="jtc-control-input"
              v-bind="controller.bindInput.attrs"
              v-on="controller.bindInput.events"
            />
            <button
              v-if="controller.clearButton && !controller.empty && !controller.readonly"
              tabindex="-1"
              type="button"
              class="jtc-control-button jtc-select-button__clear"
              :disabled="controller.disabled"
              @click.stop="controller.clearSelection"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>
            </button>
            <button
              tabindex="-1"
              type="button"
              class="jtc-control-button jtc-select-button__toggle"
              :class="{
                  'jtc-select-button__toggle-open': controller.listOpen,
                }"
              :disabled="controller.disabled"
              @click.stop="controller.toggleList"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </button>
          </div>
          <slot name="label"></slot>
        </div>
      </template>
      <template v-slot:popup>
        <div class="jtc-select-list-container">
          <jt-select-list :controller="controller" v-bind="controller.bindList.attrs" />
        </div>
      </template>
    </jt-popup>
  </jt-select-controller>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import JtSelectList from './JtSelectList.vue';
import { JtSelectController } from './JtSelectController';

@Component({
  name: 'JtSelect',
  components: { JtSelectController, JtSelectList },
  inheritAttrs: false,
})
export default class JtSelect extends Vue {
}
</script>
