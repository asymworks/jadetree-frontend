<template>
  <div>
    <div
      class="jtc-popup-control"
      :class="controlClasses"
      @click.self.stop="hidePopup"
      @keyup.esc="handleEsc"
    >
      <slot name="control" v-bind="slotScope"></slot>
      <div v-if="open" class="jtc-popup-outer">
        <div
          ref="popup"
          :class="popupWrapperClasses"
          @click.self.stop="hidePopup"
        >
          <div :class="popupContainerClasses">
            <slot name="popup" v-bind="slotScope"></slot>
          </div>
        </div>
      </div>
    </div>
    <div v-if="open" class="jtc-popup-overlay-wrapper">
      <div
        class="jtc-popup-overlay"
        :class="overlayClasses"
        @click.self.stop="hidePopup"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Ref,
  Watch,
  Vue,
} from 'vue-property-decorator';

export type JtPopupMobileMode = 'auto' | 'modal' | 'fullscreen';
export type JtPopupPosition = 'top-left' | 'top-right' | 'top-both'
  | 'bottom-left' | 'bottom-right' | 'bottom-both'
  | 'left-top' | 'left-bottom' | 'left-both'
  | 'right-top' | 'right-bottom' | 'right-both';

export type JtPopupSlotScope = {
  flipped: boolean;
  fullscreen: boolean;
  modal: boolean;
  open: boolean;
  handleEsc: (ev: KeyboardEvent) => void;
  hidePopup: () => void;
  updateFlip: () => void;
};

/** @internal Find the opposite direction */
function opposite(dir: string): string {
  const opposites: { [key: string]: string } = {
    left: 'right',
    right: 'left',
    top: 'bottom',
    bottom: 'top',
  };
  if (Object.prototype.hasOwnProperty.call(opposites, dir)) {
    return opposites[dir];
  }
  return dir;
}

/** @internal Find the opposite direction */
function orthogonal(dir: string, ccw = true): string | undefined {
  const ortho: { [key: string]: string[] } = {
    left: ['bottom', 'top'],
    right: ['top', 'bottom'],
    top: ['left', 'right'],
    bottom: ['right', 'left'],
  };
  if (Object.prototype.hasOwnProperty.call(ortho, dir)) {
    return ortho[dir][ccw ? 0 : 1];
  }
  return undefined;
}

@Component({
  name: 'JtPopup',
})
export default class JtPopup extends Vue {
  @Ref('popup') readonly popupElement!: HTMLElement;

  /**
   * Control whether the popup will emit a `popup-hide` event when an overlay
   * element is clicked
   */
  @Prop({ default: true })
  private hideOnClick!: boolean;

  /**
   * Control whether the popup will emit a `popup-hide` event when the escape
   * key is pressed
   */
  @Prop({ default: true })
  private hideOnEscape!: boolean;

  /**
   * Set the mobile display mode for this popup, which can be:
   * - `auto` which is default and displays the popup as it appears on a
   *          desktop browser
   * - `modal` which displays the popup content alone in a modal display
   *           centered in the screen (the trigger control is unavailable on
   *           mobile in this mode)
   * - `fullscreen` which displays the trigger control at the top of a full-
   *                screen modal with the popup content filling the remaining
   *                screen space.
   */
  @Prop({ default: 'auto' })
  private mobileMode!: JtPopupMobileMode;

  /** Open or Closed state of the popup */
  @Prop({ default: false })
  private open!: boolean;

  /**
   * Position of the Popup relative to the Trigger Control. Accepts a string
   * formatted as `{side}[-{align}]` where `side` can be one of `top`,
   * `bottom`, `left`, and `right`; and, `align` can be one of `top`,
   * `bottom`, `left`, `right`, or `both`.
   *
   * Note that `side` and `align` must be orthogonal: if `side` is `top` or
   * `bottom`, `align` must be `left`, `right`, or `both`. If `align` is not
   * specified, it will default to `left` or `top` depending on whether side
   * is `top`/`bottom` or `left`/`right`.
   *
   * The default is `bottom-left`
   */
  @Prop({
    default: 'bottom-left',
    validator(v: unknown): boolean {
      if (typeof v !== 'string') return false;
      const [side, corner]: string[] = v.split('-');
      const sides = ['top', 'bottom', 'left', 'right'];
      const corners = [...sides, 'both'];
      if (!sides.includes(side)) {
        // eslint-disable-next-line no-console
        console.log(`${side} is not a recognized side in ${v}`);
        return false;
      }
      if (typeof corner === 'undefined') {
        return true;
      }
      if (!corners.includes(corner)) {
        // eslint-disable-next-line no-console
        console.log(`${corner} is not a recognized alignment in ${v}`);
        return false;
      }
      if (corner === side || corner === opposite(side)) {
        // eslint-disable-next-line no-console
        console.log(`${corner} must be orthogonal to ${side} in ${v}`);
        return false;
      }
      return true;
    },
  })
  private position!: JtPopupPosition;

  /* ---------------  Data  ------------------- */

  /** Whether the position has flipped due to viewport overflow */
  private flipped = false;

  /* -------------  Computed  ----------------- */

  /** Control Container Classes */
  get controlClasses(): { [key: string]: boolean } {
    return {
      'jtc-popup-control__closed': !this.open,
      'jtc-popup-control__open-menu': this.open && !this.modal,
      'jtc-popup-control__open-modal': this.open && this.modal,
      'jtc-popup-control__open-fullscreen': this.open && this.fullscreen,
      ...this.controlAnchorClass,
    };
  }

  /** Control Container Anchor Position Classes */
  get controlAnchorClass(): { [key: string]: boolean } {
    /* eslint-disable key-spacing */
    return {
      'jtc-popup-control__anchor-left':   this.positionSide === 'left',
      'jtc-popup-control__anchor-right':  this.positionSide === 'right',
      'jtc-popup-control__anchor-top':    this.positionSide === 'top',
      'jtc-popup-control__anchor-bottom': this.positionSide === 'bottom',
    };
    /* eslint-enable key-spacing */
  }

  /** Return true if the mobile display mode is `fullscreen` */
  get fullscreen(): boolean {
    return this.mobileMode === 'fullscreen';
  }

  /** Return true if the mobile display mode is `modal` */
  get modal(): boolean {
    return this.mobileMode === 'modal';
  }

  /** Popup Overlay Classes */
  get overlayClasses(): { [key: string]: boolean } {
    return {
      'jtc-popup-overlay__modal': this.modal,
    };
  }

  /** Popup Container Classes */
  get popupContainerClasses(): { [key: string]: boolean } {
    const row = this.positionSide === 'left' || this.positionSide === 'right';
    const col = this.positionSide === 'top' || this.positionSide === 'bottom';
    return {
      'jtc-popup-container__menu': !this.modal && !this.fullscreen,
      'jtc-popup-container__modal': this.modal || this.fullscreen,
      'jtc-popup-container__row': row,
      'jtc-popup-container__col': col,
    };
  }

  /** Popup Wrapper Classes */
  get popupWrapperClasses(): { [key: string]: boolean } {
    const menu = !this.modal && !this.fullscreen;
    /* eslint-disable key-spacing */
    return {
      /* General */
      'jtc-popup-wrapper__menu': menu,
      'jtc-popup-wrapper__modal': this.modal && !this.fullscreen,
      'jtc-popup-wrapper__fullscreen': !this.modal && this.fullscreen,
      /* Anchors */
      'jtc-popup-wrapper__left-menu':   this.hasSideAnchor('left') && menu,
      'jtc-popup-wrapper__right-menu':  this.hasSideAnchor('right') && menu,
      'jtc-popup-wrapper__top-menu':    this.hasSideAnchor('top') && menu,
      'jtc-popup-wrapper__bottom-menu': this.hasSideAnchor('bottom') && menu,
      'jtc-popup-wrapper__left-modal':   this.hasSideAnchor('left') && !menu,
      'jtc-popup-wrapper__right-modal':  this.hasSideAnchor('right') && !menu,
      'jtc-popup-wrapper__top-modal':    this.hasSideAnchor('top') && !menu,
      'jtc-popup-wrapper__bottom-modal': this.hasSideAnchor('bottom') && !menu,
    };
    /* eslint-enable key-spacing */
  }

  /** Popup Position Alignment */
  get positionAlign(): string {
    const [side, align] = this.position.split('-');
    if (typeof align === 'string') {
      return align;
    }

    if (side === 'top' || side === 'bottom') {
      return 'left';
    }
    return 'top';
  }

  /** Popup Position Side */
  get positionSide(): string {
    const side = this.position.split('-')[0];
    return side;
  }

  /** Slot Scope */
  get slotScope(): JtPopupSlotScope {
    const {
      flipped,
      fullscreen,
      modal,
      open,
      hidePopup,
      handleEsc,
      updateFlip,
    } = this;

    return {
      flipped,
      fullscreen,
      modal,
      open,
      hidePopup,
      handleEsc,
      updateFlip,
    };
  }

  /* --------------  Watchers  ---------------- */
  @Watch('open')
  openChanged(val: boolean) {
    if (val) {
      this.$nextTick(() => {
        this.updateFlip();
      });
    }
  }

  /* --------------  Methods  ----------------- */

  /** Handle an 'Escape' key press */
  handleEsc(ev: KeyboardEvent): void {
    if (this.open && this.hideOnEscape) {
      ev.stopPropagation();
      this.$emit('popup-hide');
    }
  }

  /**
   * Check if the control should have an anchor at the specified side, which
   * translates into a `{side}-0` Tailwind class (or `{side}: 0` style).
   */
  hasSideAnchor(side: string): boolean {
    return opposite(this.positionSide) === side
      || (this.positionSide === orthogonal(side, true) && this.positionAlign === side)
      || (this.positionSide === orthogonal(side, true) && this.positionAlign === 'both')
      || (this.positionSide === orthogonal(side, false) && this.positionAlign === side)
      || (this.positionSide === orthogonal(side, false) && this.positionAlign === 'both');
  }

  /** Hide the popup menu */
  hidePopup() {
    if (this.hideOnClick) {
      this.$emit('popup-hide');
    }
  }

  /**
   * Update the popup flip so that if it would overflow the bottom of the
   * viewport, it is shown above the control instead.
   */
  updateFlip() {
    if (!this.popupElement) {
      return;
    }

    let el: HTMLElement | null = this.popupElement;
    const { position } = window.getComputedStyle(el);
    if (position === 'fixed') {
      return;
    }

    let yPos = 0;
    while (el) {
      if (el.tagName === 'BODY') {
        const yScroll = el.scrollTop || document.documentElement.scrollTop;
        yPos += (el.offsetTop - yScroll + el.clientTop);
      } else {
        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
      }
      el = el.offsetParent as HTMLElement;
    }

    this.flipped = yPos + this.popupElement.offsetHeight > window.innerHeight;
  }
}
</script>
