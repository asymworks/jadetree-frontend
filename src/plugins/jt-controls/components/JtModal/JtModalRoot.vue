<template>
  <div>
    <Lock :disabled="!modalOptions.lockFocus">
      <jt-modal-container v-bind="modalOptions" @modal:close="handleClose">
        <component
          :is="component"
          v-bind="props"
          v-on="events"
          v-if="modalOptions.open"
        />
      </jt-modal-container>
    </Lock>
    <div
      v-if="modalOptions.open && modalOptions.showOverlay"
      class="jtc-modal-overlay"
      :class="modalOptions.overlayClasses"
      @click.self="$modalEventBus.$emit('click-overlay')"
    ></div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, Vue } from 'vue-property-decorator';
import { AsyncComponent, Component as VueComponent } from 'vue';
import Lock from 'vue-focus-lock';
import JtModalContainer from './JtModalContainer.vue';

type ModalComponent = VueComponent<any, any, any, any> | AsyncComponent<any, any, any, any>;
type ModalEvents = { [key: string]: Function | Function[] };
type ModalProps = Record<string, any>;
type ModalOptions = {
  lockFocus?: boolean;
  open?: boolean;
  overlayClasses?: string[];
  showOverlay?: boolean;
};

type ModalOpenOptions = {
  component: ModalComponent;
  options?: ModalOptions;
  props?: ModalProps;
  events?: ModalEvents;
}

@Component({
  name: 'JtModalRoot',
  components: { JtModalContainer, Lock },
})
export default class JtModalRoot extends Vue {
  /** Component to show as a modal */
  private component?: ModalComponent | null = null;

  /** Event listeners to connect to the modal component */
  private events: ModalEvents = {};

  /** Property bindings for the modal component */
  private props: ModalProps = {};

  /** Modal State */
  private modalOptions: ModalOptions = { open: false };

  /**
   * Register DOM event listeners for escape key and register event bus listeners to
   * show and hide modal components
   */
  mounted() {
    this.$modalEventBus.$on('click-overlay', this.handleOverlay);
    this.$modalEventBus.$on('close', this.handleClose);
    // eslint-disable-next-line object-curly-newline
    this.$modalEventBus.$on('open', (modal: ModalOpenOptions) => {
      // eslint-disable-next-line object-curly-newline
      const { component, options, props, events } = modal;
      this.component = component;
      this.props = props || {};
      this.events = events || {};

      this.modalOptions = {
        lockFocus: true,
        overlayClasses: ['jtc-modal-overlay__defaults'],
        showOverlay: true,
        ...options,
      };
      this.modalOptions.open = !!component;
    });
    document.addEventListener('keyup', this.handleKeyUp);
  }

  /** Remove DOM event listeners when component is destroyed */
  beforeDestroy() {
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  /** Close the modal and clear bound parameters */
  handleClose() {
    this.component = null;
    this.events = {};
    this.props = {};
    this.modalOptions = { open: false };
  }

  /**
   * Close the modal when the escape key is pressed
   */
  handleKeyUp(e: KeyboardEvent) {
    if (e.keyCode === 27) {
      this.handleClose();
    }
  }

  /** Close the modal when the overlay is clicked */
  handleOverlay() {
    this.handleClose();
  }
}
</script>
