<template>
  <ul
    class="jtc-select-listbox"
    role="listbox"
    :id="controller.bindList.attrs.id"
    @mousedown.prevent="controller.listboxMouseDown"
    @mouseup="controller.listboxMouseUp"
  >
    <li
      v-for="(option, index) in controller.filteredOptions"
      :class="{
          'jtc-select-list-item': !option.divider,
          'jtc-select-list-divider': option.divider,
          'jtc-select-list-item__active': index === controller.activeIndex,
          'jtc-select-list-item__disabled': option.disabled,
          'jtc-select-list-item__selectable': option.selectable && !controller.readonly,
          'jtc-select-list-item__selected': option.selected,
          'jtc-select-list-item__header': option.header,
          'jtc-select-list-item__child': !!option.parent,
        }"
      :key="option.id"
      @click="controller.itemClick(option)"
      @mouseenter.stop="controller.itemMouseEnter(option, index)"
      @mouseleave.stop="controller.itemMouseLeave(option, index)"
    >
      <component :is="controller.itemComponent" :option="option" />
    </li>
    <li
      v-if="!controller.hasSelectable && !controller.disabled && !controller.readonly"
      class="jtc-select-list-item jtc-select-list-item__empty"
    >
      Sorry, no matching options
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { JtSelectSlotScope } from './JtSelectController';

@Component({ name: 'JtSelectList' })
export default class JtSelectList extends Vue {
  @Prop()
  private controller!: JtSelectSlotScope;
}
</script>
