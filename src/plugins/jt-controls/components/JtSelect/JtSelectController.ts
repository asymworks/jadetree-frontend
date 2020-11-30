/* eslint-disable class-methods-use-this */
import { AsyncComponent, Component as VueComponent } from 'vue';
import {
  Component,
  Prop,
  Vue,
  Watch,
} from 'vue-property-decorator';
import qinu from 'qinu';

/** Select Option Component Type */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ItemComponent = VueComponent<any, any, any, any> | AsyncComponent<any, any, any, any>;

/** Select Option Object Type */
export type SelectOptionObject = {
  disabled?: boolean;
  divider?: boolean;
  group?: SelectOption[];
  [key: string]: unknown;
};

/** Select Option Type */
export type SelectOption = string | SelectOptionObject;

/**
 * Option Comparator Function
 * @param a left hand option
 * @param b right hand option
 * @return -1 if a comes before b; +1 if a comes after b; 0 if a equals b
 */
export type SelectOptionComparator = (
  a?: SelectOption,
  b?: SelectOption,
) => number;

/**
 * Option Getter Function
 * @param option option
 * @return data field string
 */
export type SelectOptionFieldGetter = (option: SelectOption) => string;

/**
 * Getter Function for the display text of the selected values
 * @param options list of selected options
 * @return display text
 */
export type SelectionDisplayTextGetter = (options: SelectOption[]) => string;

/** Default Option Key Getter */
function optionKeyFieldGetter(
  this: JtSelectController,
  option: SelectOption,
): string {
  if (typeof option === 'string') {
    return option;
  }

  if (Object.prototype.hasOwnProperty.call(option, this.keyField)) {
    return `${option[this.keyField]}`;
  }

  // Special Handling for Dividers
  if (option.divider) {
    return '_divider';
  }

  const warning = `[jt-select warn]: Key field '${this.keyField}' does not `
    + 'exist in options object';

  // eslint-disable-next-line no-console
  console.warn(warning, option);
  return JSON.stringify(option);
}

/** Default Option Key Getter */
function optionLabelFieldGetter(
  this: JtSelectController,
  option: SelectOption,
): string {
  if (typeof option === 'string') {
    return option;
  }

  if (Object.prototype.hasOwnProperty.call(option, this.labelField)) {
    return `${option[this.labelField]}`;
  }

  // Special Handling for Dividers
  if (option.divider) {
    return '';
  }

  const warning = `[jt-select warn]: Label field '${this.labelField}' does not `
    + 'exist in options object';

  // eslint-disable-next-line no-console
  console.warn(warning, option);
  return JSON.stringify(option);
}

/** Default Option Comparator */
function optionComparator(
  this: JtSelectController,
  a?: SelectOption,
  b?: SelectOption,
): number {
  const keyA = typeof a === 'undefined' ? undefined : this.getOptionKey(a);
  const keyB = typeof b === 'undefined' ? undefined : this.getOptionKey(b);
  if (typeof keyA === 'undefined' && typeof keyB !== 'undefined') return -1;
  if (typeof keyA !== 'undefined' && typeof keyB === 'undefined') return +1;
  if (keyA === keyB) return 0;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return keyA! < keyB!
    ? -1
    : +1;
}

/** Default display text generator */
function displayTextGetter(
  this: JtSelectController,
  options: SelectOption[],
): string {
  return options.sort().map((o) => this.getOptionLabel(o)).join(', ');
}

/** Select List Item */
export type SelectListItem = {
  /** Unique id for the item */
  id: string;

  /** Unique key for the item */
  key: string;

  /** Display Text for the Item */
  label: string;

  /** If the item is disabled and cannot be selected */
  disabled: boolean;

  /** If the item can be selected */
  selectable: boolean;

  /** If the item is currently selected */
  selected: boolean;

  /** If the item is an option group header */
  header: boolean;

  /** If the item is an empty option group */
  empty: boolean;

  /** If the item is a list divider */
  divider: boolean;

  /** The group item that contains this item */
  parent?: SelectListItem;

  /** The {@link SelectOption} that generated this item */
  option: SelectOption;

  /** If the option is the search option (and no exact match exists) */
  search: boolean;
}

/** Filter Function */
export type SelectItemFilter = (
  item: SelectListItem,
  searchText: string,
  exact?: boolean,
) => boolean;

/** Default Filter Function */
function selectItemFilter(
  item: SelectListItem,
  searchText: string,
  exact?: boolean,
): boolean {
  const label = (item.label || '');
  if (exact) {
    return label.trim().toLowerCase() === searchText.trim().toLowerCase();
  }
  return label.trim().toLowerCase().includes(searchText.trim().toLowerCase());
}

/** Bind Options for Select Control */
export type JtSelectControlOptions = {
  attrs: {
    id: string;
    role: string;
    uid: string;
    ['aria-expanded']: string;
    ['aria-owns']: string;
  };
}

/** Bind Options for Input Control */
export type JtSelectInputOptions = {
  attrs: {
    autocomplete: string;
    disabled: boolean;
    placeholder: string;
    readonly: boolean;
    tabindex: number;
    type: string;
    value: string;
    id: string;
    ['aria-autocomplete']: string;
    ['aria-labelledby']: string;
    ['aria-controls']: string;
    ['aria-activedescendant']?: string;
  };
  events: {
    compositionstart: () => void;
    compositionend: () => void;
    keydown: (ev: KeyboardEvent) => void;
    blur: () => void;
    focus: () => void;
    input: (ev: InputEvent) => void;
  };
}

/** Bind Options for Select List */
export type JtSelectListOptions = {
  attrs: {
    id: string;
  };
}

/** Controller Default Slot Scope */
export type JtSelectSlotScope = {
  activeIndex: number;
  bindControl: JtSelectControlOptions;
  bindInput: JtSelectInputOptions;
  disabled: boolean;
  empty: boolean;
  filteredOptions: SelectListItem[];
  hasFocus: boolean;
  hasSelectable: boolean;
  itemClick: (item: SelectListItem) => void;
  itemDeselect: (item: SelectListItem) => void;
  itemMouseEnter: (item: SelectListItem, index: number) => void;
  itemMouseLeave: (item: SelectListItem, index: number) => void;
  itemSelect: (item: SelectListItem) => void;
  itemComponent: string | ItemComponent;
  listboxMouseDown: () => void;
  listboxMouseUp: () => void;
  placeholder: string;
  readonly: boolean;
  selected: SelectOption[];
  setActive: (item: SelectListItem) => void;
  setSearchText: (text: string) => void;
  tabindex: number;
}

@Component({
  name: 'JtSelectController',
})
export class JtSelectController extends Vue {
  /**
   * When true, the popup list will be scrolled to keep the
   * currently highlighted option in the list viewport.
   */
  @Prop({ default: true })
  private autoscroll!: boolean;

  /** Blur input control when an item is selected */
  @Prop({ default: true })
  private blurOnSelect!: boolean;

  /**
   * Set to `true` to allow for new options to be created dynamically from
   * the current search text value
   */
  @Prop({ default: false })
  private canCreate!: boolean;

  /** Show or hide a clear button */
  @Prop({ default: true })
  private clearButton!: boolean;

  /** Close the list popup when the input loses focus */
  @Prop({ default: true })
  private closeOnBlur!: boolean;

  /** Close the list popup when an item is selected */
  @Prop({ default: true })
  private closeOnSelect!: boolean;

  /**
   * Set to `false` to render adjacent dividers even when all intervening
   * items have been filtered out. Defaults to `true`.
   */
  @Prop({ default: true })
  private collapseDividers!: boolean;

  /**
   * Set to `false` to render group headers even when all group items have
   * been filtered out and no items would be displayed. Defaults to `true`.
   */
  @Prop({ default: true })
  private collapseHeaders!: boolean;

  /** Disable the select control */
  @Prop({ default: false })
  private disabled!: boolean;

  /** Focus the search box when the item list is opened */
  @Prop({ default: true })
  private focusOnOpen!: boolean;

  /**
   * Function which returns the text to display in the control field.
   * Defaults to a comma-separated list of the selected value labels.
   */
  @Prop({ default: () => displayTextGetter })
  private getDisplayText!: SelectionDisplayTextGetter;

  /**
   * Function which returns the unique item key corresponding to an
   * option item. Defaults to `option[this.keyField]`.
   */
  @Prop({ default: () => optionKeyFieldGetter })
  protected getOptionKey!: SelectOptionFieldGetter;

  /**
   * Function which returns the unique item key corresponding to an
   * option item. Defaults to `option[this.keyField]`.
   */
  @Prop({ default: () => optionLabelFieldGetter })
  protected getOptionLabel!: SelectOptionFieldGetter;

  /** Identifier for the Input Element */
  @Prop({ default: null })
  protected id!: string | null;

  /** What component to use to render List Items */
  @Prop({ default: 'JtSelectItem' })
  protected itemComponent!: ItemComponent;

  /** What field key to use to generate default option keys */
  @Prop({ default: 'value' })
  protected keyField!: string;

  /** What field key to use to generate default option labels */
  @Prop({ default: 'label' })
  protected labelField!: string;

  /**
   * If the control value model should use the full object. The default is
   * to interpret `value` as the option key and to provide the option key to
   * the `input` event to mimic standard `<select>` controls.
   */
  @Prop({ default: false })
  private modelObject!: boolean;

  /** If the control allows multiple selections */
  @Prop({ default: false })
  private multiple!: boolean;

  /** Whether to open the list when the control receives focus */
  @Prop({ default: true })
  private openOnFocus!: boolean;

  /**
   * Function to determine if two option objects are matching. By default
   * compares the result of `getOptionKey`.
   */
  @Prop({ default: () => optionComparator })
  private optionComparator!: SelectOptionComparator;

  /**
   * Function to determine if a `SelectListItem` object matches a filter
   * string
   */
  @Prop({ default: () => selectItemFilter })
  private optionFilter!: SelectItemFilter;

  /**
   * An array of strings or objects to be used as dropdown choices.
   * If you are using an array of objects, jt-select will look for
   * a `label` key (ex. [{label: 'This is Foo', value: 'foo'}]). A
   * custom label key can be set with the `label` prop.
   *
   * To use option groups, include an object with a `group` key
   * corresponding to an array of the children, using the same item
   * schema, which will then be grouped in the display.
   */
  @Prop({ default: () => [] })
  private options!: SelectOption[];

  /** Placeholder text when control is empty */
  @Prop({ default: '' })
  private placeholder!: string;

  /** Make the select control read-only */
  @Prop({ default: false })
  private readonly!: boolean;

  /** Allow searching of the options */
  @Prop({ default: true })
  private searchable!: boolean;

  /**
   * Set to `true` to allow group headers to be selected. Defaults to `false`
   * which matches the HTML spec for `<optgroup>` items not being selectable
   */
  @Prop({ default: false })
  private selectHeaders!: boolean;

  /** List of key presses to use to select the current option */
  @Prop({ default: () => [13] })
  private selectKeys!: number[];

  /** Tab index for the control */
  @Prop({ default: 0 })
  private tabindex!: number;

  /** Currently selected option or options */
  @Prop()
  private value?: SelectOption | SelectOption[] | null;

  /* ---------------  Data  ------------------- */

  /** If the search input is composing */
  private composing = false;

  /** Selection cursor location */
  private cursor = -1;

  /** If the select box is focused */
  private focused = false;

  /** Currently highlighted item */
  private highlighted = -1;

  /** Internal list of selected items */
  private internalValue: SelectOption[] = [];

  /** If the item list is visible */
  private listOpen = false;

  /** If the mouse is currently pressed in the listbox */
  private mouseDown = false;

  /** Current search text */
  private search = '';

  /** If a search operation is active */
  private searching = false;

  /** Unique string for id and ARIA attributes */
  private uid = '';

  /* -------------  Computed  ----------------- */

  /** Bind Options for the Select Control */
  get bindControl(): JtSelectControlOptions {
    return {
      attrs: {
        id: `jtc-${this.uid}__combobox`,
        role: 'combobox',
        'aria-expanded': this.listOpen.toString(),
        'aria-owns': `jtc-${this.uid}__listbox`,
        uid: this.uid,
      },
    };
  }

  /** Bind Options for the Search Input Control */
  get bindInput(): JtSelectInputOptions {
    return {
      attrs: {
        autocomplete: 'off',
        disabled: this.disabled,
        placeholder: this.placeholder,
        tabindex: this.tabindex,
        readonly: this.readonly || (!this.listOpen && !this.canCreate),
        type: 'text',
        value: this.displayText,
        id: this.id || `jtc-${this.uid}__input`,
        'aria-autocomplete': 'list',
        'aria-labelledby': `jtc-${this.uid}__combobox`,
        'aria-controls': `jtc-${this.uid}__listbox`,
      },
      events: {
        compositionstart: () => { this.composing = true; },
        compositionend: () => { this.composing = false; },
        keydown: this.inputKeyDown,
        blur: this.inputBlur,
        focus: this.inputFocus,
        input: this.inputInput,
      },
    };
  }

  /** Bind Options for the Select List */
  get bindList(): JtSelectListOptions {
    return {
      attrs: {
        id: `jtc-${this.uid}__listbox`,
      },
    };
  }

  /** Current selection text to display in the search field */
  get displayText(): string {
    if (this.searching) {
      return this.search;
    }

    if (typeof this.value === 'undefined') {
      if (this.internalValue === null) return '';
      return this.getDisplayText(this.internalValue);
    }

    if (this.value === null) return '';

    let options = this.selected;
    if (!options.length) {
      // Fall back to the current control value
      if (Array.isArray(this.value)) {
        options = this.value;
      } else {
        options = [this.value];
      }
    }

    return this.getDisplayText(options);
  }

  /** If the control is empty */
  get empty(): boolean {
    return this.selected.length === 0;
  }

  /**
   * The currently displayed options, filtered by the search elements value. If
   * tagging is true, the search text will be prepended if it doesn't already
   * exist.
   *
   * This method also flattens group members so
   * that the render loop only has one level. If
   * the `keepEmptyGroups` is set to false (its
   * default) then groups with no members will
   * not have a header shown.
   */
  get filteredOptions(): SelectListItem[] {
    const optionList = this.flattenList(this.options);
    if (!this.searchable || !this.searching) {
      return this.collapseList(optionList);
    }

    const filteredList = optionList.filter((item) => {
      if (item.header || item.divider) return true;
      return this.optionFilter(item, this.search);
    });

    if (this.canCreate && !filteredList.some(
      (item) => this.optionFilter(item, this.search, true),
    )) {
      const option = this.search.trim();
      filteredList.push({
        id: 'item-create-div',
        key: 'item-create-div',
        label: '',
        disabled: false,
        selectable: false,
        selected: false,
        divider: true,
        header: false,
        empty: true,
        search: false,
        parent: undefined,
        option: {},
      });
      filteredList.push({
        id: 'item-create',
        key: this.getOptionKey(option),
        label: this.getOptionLabel(option),
        disabled: false,
        selectable: true,
        selected: false,
        divider: false,
        header: false,
        empty: true,
        search: true,
        parent: undefined,
        option,
      });
    }

    return this.collapseList(filteredList);
  }

  /** Check whether the control is in a focused state */
  get hasFocus(): boolean {
    return this.focused || this.listOpen;
  }

  /** Check whether any selectable items match the filter */
  get hasSelectable(): boolean {
    return this.filteredOptions.some((item) => item.selectable);
  }

  /** Input text field element */
  get inputElement(): HTMLInputElement | null {
    return this.$el.querySelector(`input#${this.bindInput.attrs.id}`);
  }

  /** Return currently selected items */
  get selected(): SelectOption[] {
    if (typeof this.value === 'undefined') {
      return this.internalValue;
    }

    if (this.value === null) {
      return [];
    }

    let { value } = this;
    if (!Array.isArray(value)) {
      value = [value];
    }

    if (!this.multiple && value.length > 0) {
      value = [value[0]];
    }

    return this.findOptions(value, true, this.options);
  }

  /* --------------- Watchers ----------------- */

  @Watch('disabled')
  onDisabledChanged() {
    if (this.listOpen) {
      this.closeList();
    }
  }

  @Watch('filteredOptions')
  onFilteredOptions() {
    this.highlighted = -1;
    this.cursor = -1;
  }

  @Watch('hasFocus')
  onFocusChanged(value: boolean) {
    if (value) {
      this.$emit('focus');
    } else {
      this.$emit('blur');
    }
  }

  @Watch('listOpen')
  onListOpenChanged() {
    if (this.listOpen) {
      this.$nextTick(() => this.adjustScroll());
    }
  }

  /*
   * This breaks Formulate when used inside a FormulateForm
  @Watch('options')
  onOptionsChanged() {
    if (this.listOpen) {
      this.closeList();
    }
  }
  */

  @Watch('readonly')
  onReadonlyChanged() {
    if (this.listOpen) {
      this.closeList();
    }
  }

  @Watch('value')
  onValueChanged() {
    this.$nextTick(() => {
      this.updateHighlight();

      const el = this.inputElement;
      if (el && this.hasFocus) {
        el.select();
      }
    });
  }

  /* ---------------  Hooks  ------------------ */

  mounted() {
    this.uid = qinu({ length: 16 });
  }

  /* --------------  Methods  ----------------- */

  /** Scroll the list box to keep the highlighted option in view */
  adjustScroll() {
    const listEl = this.getListElement();
    const hlEl = listEl
      ? listEl.children[this.highlighted]
      : false;

    if (hlEl && listEl && this.listOpen) {
      const bounds = this.getSelectListViewport();
      const { top, bottom, height } = hlEl.getBoundingClientRect();

      if (top < bounds.top) {
        listEl.scrollTop = (hlEl as HTMLElement).offsetTop;
      } else if (bottom > bounds.bottom) {
        listEl.scrollTop = (hlEl as HTMLElement).offsetTop - (bounds.height - height);
      }
    }
  }

  /** Handle updates after the selection changes */
  afterDeselect(option: SelectOption) {
    if (this.disabled || this.readonly) return;
    this.$emit('after-deselect', { option });
  }

  /** Handle updates after the selection changes */
  afterSelect(option: SelectOption, wasCreated?: boolean) {
    if (this.disabled || this.readonly) return;

    this.search = '';
    this.searching = false;
    if (this.listOpen && this.closeOnSelect) {
      this.closeList();
    }

    if (this.blurOnSelect) {
      this.$nextTick(() => {
        if (this.inputElement && document.activeElement === this.inputElement) {
          this.inputElement.blur();
        }
      });
    }

    this.$emit('after-select', { option, wasCreated });
  }

  /** Handle updates before the selection changes */
  beforeDeselect(option: SelectOption) {
    if (this.disabled || this.readonly) return;

    this.$emit('before-deselect', { option });
  }

  /** Handle updates before the selection changes */
  beforeSelect(option: SelectOption, willCreate?: boolean) {
    if (this.disabled || this.readonly) return;

    this.$emit('before-select', { option, willCreate });
    if (willCreate) {
      this.$emit('create-option', option);
    }
  }

  /** Clear the select control */
  clearSelection() {
    if (this.disabled || this.readonly) return;

    const selected = [...this.selected];
    selected.forEach((o) => {
      this.beforeDeselect(o);
    });

    this.updateSelection(this.multiple ? [] : null);
    this.$nextTick(() => {
      selected.forEach((o) => {
        if (!this.isSelected(o)) {
          this.afterDeselect(o);
        }
      });

      if (this.listOpen && this.closeOnSelect) {
        this.closeList();
      }
    });
  }

  /** Close the popup list */
  closeList() {
    this.listOpen = false;
    this.search = '';
    this.searching = false;
  }

  /**
   * Collapse adjacent header and divider items into a single row
   */
  collapseList(items: SelectListItem[]): SelectListItem[] {
    const collapsePass = (list: SelectListItem[]): SelectListItem[] => (
      list.filter((item, index) => {
        if (item.header) {
          if (index === list.length - 1) return !this.collapseHeaders;
          if (list[index + 1].header || list[index + 1].divider) {
            return !this.collapseHeaders;
          }
        } else if (item.divider) {
          if (index === list.length - 1) return !this.collapseDividers;
          if (list[index + 1].divider) {
            return !this.collapseDividers;
          }
        }
        return true;
      })
    );

    // Collapse items until the list length no longer changes
    let lastLength = items.length;
    let collapsedList = collapsePass(items);
    while (lastLength > collapsedList.length) {
      lastLength = collapsedList.length;
      collapsedList = collapsePass(collapsedList);
    }

    // Return fully collapsed list
    return collapsedList;
  }

  /**
   * Deselect a selected option
   * @param option option to deselect
   */
  deselectOption(option?: SelectOption) {
    if (option && !this.isSelected(option)) return;

    if (typeof option !== 'undefined') {
      this.beforeDeselect(option);
      this.updateSelection(this.selected.filter(
        (o) => this.optionComparator(o, option) !== 0,
      ));
      this.$nextTick(() => {
        if (!this.isSelected(option)) {
          this.afterDeselect(option);
        }
      });
    }
  }

  /** Find options matching the provided option list */
  findOptions(
    values: SelectOption[],
    selectableOnly = true,
    options: SelectOption[],
  ): SelectOption[] {
    let result: SelectOption[] = [];
    options.forEach((option) => {
      if (!selectableOnly || this.isSelectable(option)) {
        if (values.some((v) => this.optionComparator(v, option) === 0)) {
          result.push(option);
        }
      }

      if (this.isHeader(option) && typeof option === 'object' && Array.isArray(option.group)) {
        result = [
          ...result,
          ...this.findOptions(values, selectableOnly, option.group),
        ];
      }
    });
    return result;
  }

  /**
   * Flatten the options into a single flat list of {@link SelectListItem}
   * objects to pass to the rendering component
   */
  flattenList(options: SelectOption[]): SelectListItem[] {
    const optList: SelectListItem[] = [];
    options.forEach((option, index) => {
      const item: SelectListItem = {
        id: `item-${index}`,
        key: this.getOptionKey(option),
        label: this.getOptionLabel(option),
        disabled: this.isDisabled(option),
        selectable: this.isSelectable(option),
        selected: this.isSelected(option),
        divider: this.isDivider(option),
        header: this.isHeader(option),
        empty: true,
        search: false,
        parent: undefined,
        option,
      };

      if (typeof option === 'object' && item.header) {
        item.empty = !Array.isArray(option.group) || option.group.length === 0;

        // Append Group Header
        if (!item.empty || !this.collapseHeaders) {
          optList.push(item);
        }

        // Append Group Items
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        option.group!.forEach((groupOption, groupIndex) => {
          const groupItem: SelectListItem = {
            id: `item-${index}-${groupIndex}`,
            key: this.getOptionKey(groupOption),
            label: this.getOptionLabel(groupOption),
            disabled: this.isDisabled(groupOption),
            selectable: this.isSelectable(groupOption),
            selected: this.isSelected(groupOption),
            divider: this.isDivider(groupOption),
            header: this.isHeader(groupOption),
            search: false,
            empty: true,
            parent: item,
            option: groupOption,
          };

          if (typeof groupOption === 'object' && groupOption.group) {
            const warning = '[jt-select warn]: Jade Tree Select does not '
              + 'support nested option groups. Skipping nested options.';
            // eslint-disable-next-line no-console
            console.warn(warning, item, groupItem);
          }

          optList.push(groupItem);
        });
      } else {
        optList.push(item);
      }
    });

    return optList;
  }

  /**
   * Get the Select List element (NB: do not use getter because it is not
   * reactive when the JtSelect object is created and destroyed on subsequent
   * openList/closeList events)
   */
  getListElement(): HTMLElement | null {
    return this.$el.querySelector(`ul#${this.bindList.attrs.id}`);
  }

  /** The currently viewable portion of the select list */
  getSelectListViewport(): { height: number; top: number; bottom: number } {
    const listEl = this.getListElement();
    return listEl
      ? listEl.getBoundingClientRect()
      : {
        height: 0,
        top: 0,
        bottom: 0,
      };
  }

  /** Move the highlight pointer down */
  highlightDown() {
    if (!this.listOpen) {
      this.openList();
    } else {
      for (let i = this.highlighted + 1; i < this.filteredOptions.length; i += 1) {
        if (this.isSelectable(this.filteredOptions[i].option)) {
          this.highlighted = i;
          this.cursor = i;
          break;
        }
      }
    }

    this.$nextTick(() => this.adjustScroll());
  }

  /** Move the highlight pointer up */
  highlightUp() {
    for (let i = this.highlighted - 1; i >= 0; i -= 1) {
      if (this.isSelectable(this.filteredOptions[i].option)) {
        this.highlighted = i;
        this.cursor = i;
        break;
      }
    }

    this.$nextTick(() => this.adjustScroll());
  }

  /** Open the listbox on focus (if enabled) */
  inputBlur() {
    if (this.mouseDown && !this.searching) {
      this.mouseDown = false;
    } else if (this.closeOnBlur) {
      this.selectCursor();
      this.closeList();
      this.$emit('input:blur');
    }
  }

  /** Open the listbox on focus (if enabled) */
  inputFocus() {
    if (!this.listOpen && this.openOnFocus) {
      // Needs debouncing on mobile to prevent popup overlay from receiving
      // the click event and immediately closing
      setTimeout(() => this.openList(), 10);
    }
    this.$emit('input:focus');
  }

  /** Update the search text */
  inputInput(ev: InputEvent) {
    if (!this.listOpen) {
      this.$nextTick(() => this.openList());
    }

    this.setSearchText((ev.target as HTMLInputElement).value);
  }

  /**
   * Search field keydown handler
   *
   * Processes:
   * Esc -> Cancel select drop down
   * Enter -> Select currently highlighted item
   * Tab -> Select currently highlighted item
   * Up -> Move highlight pointer up
   * Down -> Move highlight pointer down
   */
  inputKeyDown(ev: KeyboardEvent) {
    const preventAndSelect = (e: Event) => {
      e.preventDefault();
      return !this.composing && this.selectCursor();
    };

    const defaultHandlers: { [key: number]: (e: KeyboardEvent) => void } = {
      27: () => this.onEscape(),
      38: () => {
        ev.preventDefault();
        this.highlightUp();
      },
      40: () => {
        ev.preventDefault();
        this.highlightDown();
      },
    };

    this.selectKeys.forEach(
      (keyCode: number) => { defaultHandlers[keyCode] = preventAndSelect; },
    );

    if (typeof defaultHandlers[ev.keyCode] === 'function') {
      defaultHandlers[ev.keyCode](ev);
    }
  }

  /**
   * Determine if the option is the currently highlighted option
   * @param option option to test
   * @return if the option is currently highlighted
   */
  isActive(option: SelectOption): boolean {
    if (this.disabled || this.readonly || this.highlighted === -1) return false;
    return this.optionComparator(
      option,
      this.filteredOptions[this.highlighted],
    ) === 0;
  }

  /**
   * Determine if the option is currently disabled
   * @param option option to test
   * @return if the option is currently disabled
   */
  isDisabled(option: SelectOption): boolean {
    if (typeof option === 'string') return false;
    return !!option.disabled;
  }

  /**
   * Determine if the option is a list divider
   * @param option option to test
   * @return if the option is a list divider
   */
  isDivider(option: SelectOption): boolean {
    if (typeof option === 'string') return false;
    return !!option.divider;
  }

  /**
   * Determine if the option is a group header
   * @param option option to test
   * @return if the option is a group header
   */
  isHeader(option: SelectOption): boolean {
    if (typeof option === 'string') return false;
    return Array.isArray(option.group);
  }

  /**
   * Determine if the option is selectable
   * @param option option to test
   * @return if the option is selectable
   */
  isSelectable(option: SelectOption): boolean {
    if (this.isHeader(option) && !this.selectHeaders) return false;
    return (!this.isDisabled(option) && !this.isDivider(option));
  }

  /**
   * Determine if the option is currently selected
   * @param option option to test
   * @return if the option is currently selected
   */
  isSelected(option: SelectOption): boolean {
    return this.selected.some((o) => this.optionComparator(o, option) === 0);
  }

  /**
   * Handle a click on an item (selects item, or if multiple select is enabled
   * will toggle the selection state)
   * @param item item to select
   */
  itemClick(item: SelectListItem) {
    if (this.multiple && item && item.selected) {
      this.deselectOption(item.option);
    } else {
      this.selectOption(item.option, item.search);
    }
  }

  /**
   * Deselect an item
   * @param item item to select
   */
  itemDeselect(item: SelectListItem) {
    this.deselectOption(item.option);
  }

  /**
   * Handle the mouse pointer entering a list item
   * @param item item to activate
   */
  itemMouseEnter(item: SelectListItem, index: number) {
    this.setActive(index);
  }

  /**
   * Handle the mouse pointer leaving a list item
   * @param item item to activate
   */
  itemMouseLeave() {
    this.setActive();
  }

  /**
   * Select an item
   * @param item item to select
   */
  itemSelect(item: SelectListItem) {
    this.selectOption(item.option, item.search);
  }

  /** Set the mousedown flag to avoid accidentally closing the menu */
  listboxMouseDown() {
    this.mouseDown = true;
  }

  /** Clear the mousedown flag */
  listboxMouseUp() {
    this.mouseDown = false;
  }

  /** Handle an Escape key press */
  onEscape() {
    this.clearSelection();
  }

  /** Open the popup list */
  openList() {
    this.listOpen = true;
    if (this.focusOnOpen && this.inputElement && document.activeElement !== this.inputElement) {
      this.inputElement.focus();
    }

    this.updateHighlight();
  }

  /** Select the option at the cursor location */
  selectCursor() {
    if (this.cursor > -1) {
      this.selectOption(this.filteredOptions[this.cursor].option);
    } else if (this.searching && this.search.trim() !== '') {
      // See if an option matching the search text already exists and pick
      // it if it does; otherwise, create the new option if possible
      const pickIndex = this.filteredOptions.findIndex(
        (item) => this.optionFilter(item, this.search, true),
      );
      if (pickIndex >= 0) {
        const { option, search } = this.filteredOptions[pickIndex];
        this.selectOption(option, search);
      } else if (this.canCreate) {
        this.selectOption(this.search, true);
      }
    }
  }

  /**
   * Select an option
   * @param option option to select
   */
  selectOption(option?: SelectOption, create?: boolean) {
    if (!option || !this.isSelectable(option)) {
      return;
    }

    if (!this.multiple) {
      const prevSelected = this.selected.length > 0 && this.selected[0];
      if (prevSelected) {
        this.beforeDeselect(prevSelected);
      }

      this.beforeSelect(option, create);
      this.updateSelection(option);
      this.$nextTick(() => {
        let wasCreated = false;
        if (create) {
          wasCreated = this.options.some((o) => this.optionComparator(o, option));
        }

        this.afterSelect(option, wasCreated);
        if (prevSelected) {
          this.afterDeselect(prevSelected);
        }
      });
    } else {
      this.beforeSelect(option, false);
      this.updateSelection([option, ...this.selected]);
      this.afterSelect(option, false);
    }
  }

  /**
   * Set the currently active (highlighted) option. Clears the selection if
   * the `option` parameter is not selectable.
   * @param item item to activate
   */
  setActive(index?: number) {
    if (typeof index !== 'number') {
      this.cursor = -1;
      this.highlighted = -1;
    } else if (index < 0 || index >= this.filteredOptions.length) {
      this.cursor = -1;
      this.highlighted = -1;
    } else if (!this.isSelectable(this.filteredOptions[index].option)) {
      this.cursor = -1;
      this.highlighted = -1;
    } else {
      this.cursor = -1;
      this.highlighted = index;
    }
  }

  /**
   * Set the current search text
   * @param search new search text
   */
  setSearchText(search: string) {
    this.search = search;
    this.searching = true;
  }

  /** Toggle the popup list visibility */
  toggleList() {
    if (this.listOpen) {
      this.closeList();
    } else {
      this.openList();
    }
  }

  /** Update the Highlight Cursor */
  updateHighlight() {
    this.highlighted = -1;
    for (let i = 0; i < this.filteredOptions.length; i += 1) {
      if (this.filteredOptions[i].selected) {
        this.highlighted = i;
        break;
      }
    }

    if (this.listOpen) {
      this.$nextTick(() => this.adjustScroll());
    }
  }

  /**
   * Update the current selected item list
   * @param options new list of selected options
   */
  updateSelection(options: SelectOption | SelectOption[] | null) {
    if (this.disabled || this.readonly) return;

    if (typeof this.value === 'undefined') {
      if (options === null) {
        this.internalValue = [];
      } else if (!Array.isArray(options)) {
        this.internalValue = [options];
      } else {
        this.internalValue = options;
      }
    }

    if (options === null || (Array.isArray(options) && options.length === 0)) {
      this.$emit('input', options);
    } else {
      let payload: SelectOption | SelectOption[] = options;
      if (!this.modelObject) {
        if (Array.isArray(payload)) {
          payload = payload.map((o) => this.getOptionKey(o));
        } else {
          payload = this.getOptionKey(payload);
        }
      }

      this.$emit('input', payload);
    }
  }

  /* ------------  Render Function  ----------- */

  /**
   * Render the Component
   */
  render() {
    const {
      bindControl,
      bindInput,
      bindList,
      clearButton,
      clearSelection,
      closeList,
      disabled,
      empty,
      filteredOptions,
      hasFocus,
      hasSelectable,
      highlighted,
      itemClick,
      itemDeselect,
      itemMouseEnter,
      itemMouseLeave,
      itemSelect,
      itemComponent,
      listboxMouseDown,
      listboxMouseUp,
      listOpen,
      openList,
      placeholder,
      readonly,
      selected,
      setActive,
      setSearchText,
      tabindex,
      toggleList,
    } = this;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.$scopedSlots.default!({
      activeIndex: highlighted,
      bindControl,
      bindInput,
      bindList,
      clearButton,
      clearSelection,
      closeList,
      disabled,
      empty,
      filteredOptions,
      hasFocus,
      hasSelectable,
      itemClick,
      itemDeselect,
      itemMouseEnter,
      itemMouseLeave,
      itemSelect,
      itemComponent,
      listboxMouseDown,
      listboxMouseUp,
      listOpen,
      openList,
      placeholder,
      readonly,
      selected,
      setActive,
      setSearchText,
      tabindex,
      toggleList,
    });
  }
}
