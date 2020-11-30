<!-- eslint-disable max-len -->
<template>
  <jt-sidebar-layout>
    <template v-slot:default>
      <div class="hidden md:block sticky top-0 w-full h-2 bg-gray-100 z-10"><!-- mask space above totals header --></div>
      <div
        class="sticky top-0 md:top-2 flex flex-col justify-center z-10 h-12 w-full px-2 md:rounded-t text-white bg-blue-700"
      >
        <div class="flex flex-row items-center justify-end text-sm">
          <div class="w-30% lg:w-20% flex-none px-2 text-right">Budgeted</div>
          <div class="hidden lg:block lg:w-20% flex-none px-2 text-right">Outflow</div>
          <div class="w-30% lg:w-20% flex-none px-2 text-right">Balance</div>
        </div>
        <div class="flex flex-row items-center justify-end font-bold">
          <div class="flex-grow">
            <div class="flex items-center justify-between">
              Categories
              <button
                class="border-none focus:outline-none active:outline-none hover:text-gray-400"
                v-tooltip="'Add a Category Group'"
                @click="onAddGroupClick"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
              </button>
            </div>
          </div>
          <div class="w-30% lg:w-20% flex-none px-2 text-right">
            {{ displayMonthData ? formatCurrency(rollup(displayMonthData.categories).budget) : '' }}
          </div>
          <div class="hidden lg:block w-30% lg:w-20% flex-none px-2 text-right">
            {{ displayMonthData ? formatCurrency(rollup(displayMonthData.categories).outflow.negate()) : '' }}
          </div>
          <div class="w-30% lg:w-20% flex-none px-2 text-right">
            {{ displayMonthData ? formatCurrency(rollup(displayMonthData.categories).balance) : '' }}
          </div>
        </div>
      </div>
      <div class="relative pb-32 md:pb-0">
        <template v-for="group in visibleGroups">
          <div
            class="sticky top-12 md:top-14 px-2 bg-blue-100 border-b border-gray-500 z-10 font-bold"
            :key="group.id"
          >
            <!-- Category Header -->
            <budget-row-item
              :collapsed="isCollapsed(group.id)"
              :isGroup="true"
              :key="group.id"
              v-bind="{
                  name: translateName(group.name),
                  notes: group.notes,
                  ...rollup(
                    group.children
                      .filter((c) => !c.hidden)
                      .map((c) => categoryData(c.id))
                  ),
                }"
              @collapse-click="onCollapseClick(group.id)"
              @name-click="onNameClick(group.id)"
            >
              <template v-slot:actions>
                <button
                  class="border-none focus:outline-none active:outline-none hover:text-gray-600"
                  v-tooltip="'Add a Category'"
                  @click="onAddCategoryClick(group.id)"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                </button>
              </template>
            </budget-row-item>
          </div>
          <template v-if="!isCollapsed(group.id)">
            <div
              v-for="child in sortedCategories(group.children)"
              class="relative px-2 border-b border-gray-200 md:group"
              :key="child.id"
            >
              <budget-entry-item
                :key="child.id"
                v-bind="{
                    name: translateName(child.name),
                    notes: child.notes,
                    defaultBudget: categoryDefault(child.id),
                    ...categoryData(child.id),
                  }"
                @dragStart="onCategoryDragStart($event, child)"
                @budget-click="onBudgetClick(child.id)"
                @name-click="onNameClick(child.id)"
                @rollover-click="onRolloverClick(child.id)"
              />
            </div>
          </template>
        </template>
        <template v-if="hiddenCategories.length">
          <div
            class="sticky top-12 md:top-14 px-2 bg-blue-100 border-b border-gray-500 z-10 font-bold"
            key="_hidden"
          >
            <!-- Category Header -->
            <budget-row-item
              key="_hidden"
              v-bind="{
                  name: 'Hidden Categories',
                  ...rollup(hiddenCategoryData),
                }"
            >
              <template v-slot:actions>
                <button
                  class="border-none focus:outline-none active:outline-none hover:text-gray-600"
                  v-tooltip="`${hiddenCategoryCount} Hidden Categories`"
                  @click="onUnhideClick"
                >
                  Unhide
                </button>
              </template>
            </budget-row-item>
          </div>
        </template>
      </div>
    </template>
    <template v-slot:sidebar>
      <div class="flex flex-row items-center justify-end w-full">
        <div class="flex items-center font-bold text-lg flex-grow">
          {{ currentBudget ? currentBudget.name : '' }}
          <div v-if="currentBudget && currentBudget.notes" class="ml-2" v-tooltip="currentBudget.notes">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="document-text w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
        </div>
        <button class="ml-3 md:ml-1 hover:text-blue-500 border-none active:outline-none focus:outline-none" v-tooltip="'Edit Budget Information'" @click="openBudgetDialog">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="pencil w-6 h-6 md:w-4 md:h-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        </button>
      </div>
      <div class="w-full border rounded py-1 mt-2">
        <month-picker :value="displayMonthISO" @input="updateDisplayMonth" />
      </div>
      <div class="w-full mt-2 flex flex-col items-start">
        <div class="hidden md:flex items-center justify-end w-full">
          <span class="flex-grow">Remaining Last Month</span>
          <div class="font-medium text-right">
            {{ displayMonthData ? formatCurrency(displayMonthData.last_available) : '' }}
          </div>
        </div>
        <div class="hidden md:flex items-center justify-end w-full">
          <span class="flex-grow">Overspent Last Month</span>
          <div class="font-medium text-right">
            {{ displayMonthData ? formatCurrency(displayMonthData.last_overspent) : '' }}
          </div>
        </div>
        <div class="hidden md:flex items-center justify-end w-full">
          <span class="flex-grow">Income</span>
          <div class="font-medium text-right">
            {{ displayMonthData ? formatCurrency(displayMonthData.income) : '' }}
          </div>
        </div>
        <div class="hidden md:flex items-center justify-end w-full">
          <span class="flex-grow">Budgeted</span>
          <div class="font-medium text-right">
            {{ displayMonthData ? formatCurrency(displayMonthData.budgeted.negate()) : '' }}
          </div>
        </div>
        <div class="flex items-center justify-end w-full mt-2 font-medium" :class="{
            'text-red-700': displayMonthData && displayMonthData.available.lt(0),
            'text-blue-700': displayMonthData && displayMonthData.available.gt(0),
          }"
        >
          <span class="hidden md:inline flex-grow">Available</span>
          <span class="inline md:hidden flex-grow">Available to Budget</span>
          <div class="text-right">
            {{ displayMonthData ? formatCurrency(displayMonthData.available) : '' }}
          </div>
          <button class="md:hidden ml-2 text-blue-500 appearance-none active:outline-none" @click.prevent="openBalanceDialog">
            <svg viewBox="0 0 20 20" fill="currentColor" class="information-circle w-6 h-6">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    </template>
  </jt-sidebar-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { formatISO, isValid, parseISO } from 'date-fns';
import { Money } from '@jadetree/currency';
import { budgetService } from '@/api';
// eslint-disable-next-line import/named
import {
  BudgetSchema,
  BudgetDataSchema,
  CategorySchema,
  CategoryDataSchema,
  EntrySchema,
} from '@/api/types';

import BudgetEntryItem from '../components/BudgetEntryItem.vue';
import BudgetRowItem from '../components/BudgetRowItem.vue';
import MonthPicker from '../components/MonthPicker.vue';

import JtSidebarLayout from '../layouts/JtSidebarLayout.vue';

import AddCategoryDialog from '../dialogs/AddCategoryDialog.vue';
import BudgetBalancesDialog from '../dialogs/BudgetBalancesDialog.vue';
import ChangeRolloverDialog from '../dialogs/ChangeRolloverDialog.vue';
import EditBudgetDialog from '../dialogs/EditBudgetDialog.vue';
import EditCategoryDialog from '../dialogs/EditCategoryDialog.vue';
import EditEntryDialog from '../dialogs/EditEntryDialog.vue';
import UnhideCategoryDialog from '../dialogs/UnhideCategoryDialog.vue';

@Component({
  components: {
    BudgetEntryItem,
    BudgetRowItem,
    JtSidebarLayout,
    MonthPicker,
  },
  computed: {
    ...mapState('budget', ['collapseGroups', 'currentBudget', 'displayMonth', 'displayMonthData']),
    ...mapGetters(['userCurrency']),
    ...mapGetters('budget', ['budgetError', 'budgetLoading', 'findCategory']),
    ...mapGetters('l10n', ['formatCurrency']),
  },
})
export default class BudgetPage extends Vue {
  /* eslint-disable lines-between-class-members */
  private collapseGroups!: number[];
  private currentBudget!: BudgetSchema | undefined;
  private displayMonth!: Date;
  private displayMonthData!: BudgetDataSchema;
  private findCategory!: (id: number) => CategorySchema[];
  private userCurrency!: string | undefined;
  /* eslint-enable lines-between-class-members */

  /** Display Month ISO Format */
  get displayMonthISO(): string {
    if (!this.displayMonth) return '';
    return this.displayMonth && isValid(this.displayMonth)
      ? formatISO(this.displayMonth)
      : '';
  }

  /** Hidden Categories */
  get hiddenCategories(): CategorySchema[] {
    if (!this.currentBudget || !this.currentBudget.categories) return [];

    function filterHidden(categories: CategorySchema[]): CategorySchema[] {
      const hidden: CategorySchema[] = [];
      categories.forEach((group) => {
        if (group.hidden) {
          hidden.push(group);
        } else if (group.children && group.children.length) {
          const hiddenChildren = filterHidden(group.children);
          if (hiddenChildren.length) {
            hidden.push({ ...group, children: hiddenChildren });
          }
        }
      });

      return hidden;
    }

    // Return all except _income special group
    return filterHidden(
      this.currentBudget.categories.filter((c) => c.name !== '_income'),
    );
  }

  /** Hidden Category Count */
  get hiddenCategoryCount(): number {
    let result = 0;

    const gatherHidden = (categories: CategorySchema[], parentHidden: boolean) => {
      categories.forEach((c) => {
        if (c.hidden || parentHidden) result += 1;
        if (c.children) gatherHidden(c.children, !!c.hidden);
      });
    };

    gatherHidden(this.hiddenCategories, false);

    return result;
  }

  /** Hidden Category Data */
  get hiddenCategoryData(): CategoryDataSchema[] {
    const result: CategoryDataSchema[] = [];

    const gatherHidden = (categories: CategorySchema[]) => {
      categories.forEach((c) => {
        const data = c && c.id
          ? this.categoryData(c.id)
          : null;
        if (data) result.push(data);
        if (c.children) gatherHidden(c.children);
      });
    };

    gatherHidden(this.hiddenCategories);

    return result;
  }

  /** Visible Category Groups */
  get visibleGroups(): CategorySchema[] {
    if (!this.currentBudget || !this.currentBudget.categories) return [];
    return this.sortedCategories(this.currentBudget.categories);
  }

  /** Get Display Data for a Category */
  categoryData(categoryId: number): CategoryDataSchema {
    const { displayMonthData } = this;
    const currency = this.currentBudget
      ? this.currentBudget.currency
      : this.userCurrency;
    const defaultData = {
      budget: new Money(0, currency),
      outflow: new Money(0, currency),
      balance: new Money(0, currency),
      carryover: new Money(0, currency),
      overspend: new Money(0, currency),
      rollover: false,
      numTransactions: 0,
    };

    if (displayMonthData && displayMonthData.categories) {
      const { categories } = displayMonthData;
      const data = categories.find((c) => c.category_id === categoryId);
      if (data && data.num_transactions) {
        data.numTransactions = data.num_transactions;
      }
      if (data) return data;
    }

    return {
      /* eslint-disable @typescript-eslint/camelcase */
      category_id: categoryId,
      parent_id: null,
      entry_id: null,
      ...defaultData,
      /* eslint-enable @typescript-eslint/camelcase */
    };
  }

  /** Category Default Budget */
  categoryDefault(categoryId: number): Money {
    const categories = this.findCategory(categoryId);
    const currency = this.currentBudget
      ? this.currentBudget.currency
      : this.userCurrency;

    if (categories.length && categories[0].default_budget instanceof Money) {
      return categories[0].default_budget;
    }

    return new Money(0, currency);
  }

  /** Get Entry Data for a Category */
  entryData(categoryId: number): EntrySchema | undefined {
    const { displayMonthData } = this;
    if (displayMonthData && displayMonthData.entries) {
      return displayMonthData.entries.find((e) => e.category_id === categoryId);
    }
    return undefined;
  }

  /** Check if a Group is Collapsed */
  isCollapsed(groupId: number | undefined): boolean {
    return this.collapseGroups.includes(groupId || -1);
  }

  /** Add Category Clicked */
  onAddCategoryClick(parentId: number) {
    this.$modalEventBus.$emit('open', {
      component: AddCategoryDialog,
      options: { lockFocus: true },
      props: {
        parentId,
      },
    });
  }

  /** Add Category Group Clicked */
  onAddGroupClick() {
    this.$modalEventBus.$emit('open', {
      component: AddCategoryDialog,
      options: { lockFocus: true },
      props: {
        parentId: null,
      },
    });
  }

  /** Budget Entry Click Handler */
  onBudgetClick(categoryId: number) {
    const data = this.categoryData(categoryId);
    this.$modalEventBus.$emit('open', {
      component: EditEntryDialog,
      options: { lockFocus: true },
      props: {
        categoryId,
        entryId: data.entry_id || null,
      },
    });
  }

  /** Start Dragging a Category */
  onCategoryDragStart(evt: DragEvent, item: CategorySchema) {
    const { dataTransfer } = evt;
    if (dataTransfer) {
      dataTransfer.dropEffect = 'move';
      dataTransfer.effectAllowed = 'move';
      dataTransfer.setData('itemId', `${item.id}`);
      dataTransfer.setData('parentId', `${item.parent_id}`);
    }
    // eslint-disable-next-line no-console
    console.log(evt);
  }

  /** Drop a Category */
  onCategoryDragDrop(evt: DragEvent, target: CategorySchema) {
    const { dataTransfer } = evt;
    if (dataTransfer) {
      // eslint-disable-next-line no-console
      console.log(dataTransfer, target);
    }
  }

  /** Group Collapse Click */
  onCollapseClick(groupId: number) {
    const { dispatch } = this.$store;
    if (this.isCollapsed(groupId)) {
      dispatch('budget/expandGroup', groupId);
    } else {
      dispatch('budget/collapseGroup', groupId);
    }
  }

  /** Category Name Click Handler */
  onNameClick(categoryId: number) {
    this.$modalEventBus.$emit('open', {
      component: EditCategoryDialog,
      options: { lockFocus: true },
      props: { categoryId },
    });
  }

  /** Budget Rollover Click Handler */
  onRolloverClick(categoryId: number) {
    const data = this.categoryData(categoryId);
    this.$modalEventBus.$emit('open', {
      component: ChangeRolloverDialog,
      options: { lockFocus: true },
      props: {
        categoryId,
        entryId: data.entry_id || null,
      },
    });
  }

  /** Unhide Category Click Handler */
  onUnhideClick() {
    const { hiddenCategories } = this;
    this.$modalEventBus.$emit('open', {
      component: UnhideCategoryDialog,
      props: {
        hiddenCategories,
      },
    });
  }

  /** Show the Budget Balances Dialog */
  openBalanceDialog() {
    this.$modalEventBus.$emit('open', { component: BudgetBalancesDialog });
  }

  /** Show the Edit Budget Dialog */
  openBudgetDialog() {
    this.$modalEventBus.$emit('open', {
      component: EditBudgetDialog,
      options: { lockFocus: true },
      props: { budgetId: this.currentBudget ? this.currentBudget.id : -1 },
    });
  }

  /** Rollup Totals of CategoryDataSchema Items */
  rollup(categories: CategoryDataSchema[]): CategoryDataSchema {
    const currency = this.currentBudget
      ? this.currentBudget.currency
      : this.userCurrency;
    const fields = [
      'budget',
      'outflow',
      'balance',
      'carryover',
      'overspend',
    ];

    const init: CategoryDataSchema = {
      /* eslint-disable @typescript-eslint/camelcase */
      category_id: -1,
      parent_id: null,
      entry_id: null,
      ...fields.reduce(
        (o, key) => ({ ...o, [key]: new Money(0, currency) }),
        {},
      ),
      /* eslint-enable @typescript-eslint/camelcase */
    };

    return categories.reduce((acc, cur) => {
      fields.forEach(
        (field) => {
          acc[field] = (acc[field] as Money).add(
            cur[field] !== undefined ? cur[field] as Money : new Money(0, currency),
          );
        },
      );
      return acc;
    }, init);
  }

  /** Get a Sorted List of Categories */
  sortedCategories(
    categories: CategorySchema[],
    hidden?: boolean,
  ): CategorySchema[] {
    return categories
      .filter((c) => c && c.hidden === !!hidden)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }

  /** Category Name Helper */
  translateName(name: string): string {
    return budgetService.translateName(name);
  }

  /** Update Display Month */
  updateDisplayMonth(value: string) {
    const { dispatch } = this.$store;
    dispatch('budget/updateDisplayMonth', parseISO(value));
  }
}
</script>
