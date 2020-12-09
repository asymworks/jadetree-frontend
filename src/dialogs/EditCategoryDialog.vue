<!-- eslint-disable max-len -->
<template>
  <jt-dialog title="Update Category">
    <div class="flex flex-col items-stretch p-4">
      <formulate-form
        class="block w-full"
        error-behavior="submit"
        v-model="categoryData"
        @submit="onSubmit"
      >
        <div class="sm:flex sm:space-x-4 justify-between mt-2">
          <formulate-input
            :class="['w-full']"
            label="Category Name"
            labelPosition="float"
            name="name"
            type="text"
            validation="required"
            validation-name="Category Name"
          />
          <formulate-input
            v-if="showDefault"
            :class="['w-full']"
            label="Default Budget Amount"
            labelPosition="float"
            name="defaultBudget"
            type="jtMoney"
          />
        </div>
        <div class="mt-2">
          <formulate-input
            :class="['w-full']"
            label="Notes"
            labelPosition="float"
            name="notes"
            rows="3"
            type="textarea"
          />
        </div>
        <div class="mt-2 flex flex-col-reverse sm:flex-row items-center justify-between">
          <div class="flex items-center justify-between space-x-4">
            <jt-button
              :class="['flex items-center justify-center w-full sm:w-auto']"
              color="gray"
              type="button"
              @click.stop="onHideCategory"
            >Hide Category</jt-button>
            <jt-button
              :class="['flex items-center justify-center w-full sm:w-auto']"
              color="red"
              type="button"
              @click.stop="onDeleteCategory"
            >Delete Category</jt-button>
          </div>
          <jt-button
            :class="['flex items-center justify-center w-full sm:w-auto']"
            :loading="budgetLoading"
            color="blue"
            type="submit"
          >Update</jt-button>
        </div>
      </formulate-form>
    </div>
  </jt-dialog>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { Money } from '@jadetree/currency';
import { budgetService } from '@/api';
import { ApiError, BudgetSchema, CategorySchema } from '@/api/types';
import BaseDialog from './BaseDialog';

import ConfirmDeleteCategoryDialog from './ConfirmDeleteCategoryDialog.vue';

type CategoryData = {
  name?: string;
  defaultBudget?: string;
  hidden?: boolean;
  system?: boolean;
  notes?: string | null;
};

@Component({
  computed: {
    ...mapGetters('budget', ['budgetLoading', 'findCategory']),
    ...mapState('budget', ['currentBudget']),
  },
})
export default class EditCategoryDialog extends BaseDialog {
  /* eslint-disable lines-between-class-members */
  private currentBudget!: BudgetSchema;
  private findCategory!: (id: number) => CategorySchema[];
  /* eslint-enable lines-between-class-members */

  /** Category Id */
  @Prop({ required: true })
  private categoryId!: number;

  /** Category Form Data */
  private categoryData: CategoryData = {
    name: '',
    defaultBudget: '',
    hidden: false,
    system: false,
    notes: '',
  };

  /** Category Default Budget */
  get categoryDefault(): Money {
    const { currency } = this.currentBudget;
    const categories = this.findCategory(this.categoryId);

    if (categories && categories.length) {
      return categories[0].default_budget as Money;
    }

    return new Money(0, currency);
  }

  /** Category Name */
  get categoryName(): string {
    const categories = this.findCategory(this.categoryId);

    if (!categories || categories.length === 0) return '';
    if (categories.length === 1) {
      return budgetService.translateName(categories[0].name || '');
    }

    return categories.map(
      (c) => budgetService.translateName(c.name || ''),
    ).reverse().join(' : ');
  }

  /** Show Default Budget Field (hide for Category Groups) */
  get showDefault(): boolean {
    const categories = this.findCategory(this.categoryId);

    if (!categories || categories.length === 0) return false;
    return !categories[0].children || categories[0].children.length === 0;
  }

  /** Load Budget Form Data */
  mounted() {
    const categories = this.findCategory(this.categoryId);
    if (!categories.length) {
      this.close();
      this.$notify({
        group: 'top',
        title: 'Budget Error',
        text: `Could not find category with id ${this.categoryId}`,
        type: 'warning',
      }, 5000);
    }

    // Load Category Data
    const [category] = categories;
    if (category) {
      this.categoryData.name = category.name;
      this.categoryData.notes = category.notes;
      this.categoryData.hidden = category.hidden;
      this.categoryData.system = category.system;

      if (category.default_budget) {
        this.categoryData.defaultBudget = (category.default_budget as Money)
          .amount.toFixed(4).toString();
      }
    }
  }

  /** Delete Category Click Handler */
  onDeleteCategory() {
    const { categoryId } = this;
    this.close();
    this.$modalEventBus.$emit('open', {
      component: ConfirmDeleteCategoryDialog,
      options: { lockFocus: true },
      props: { categoryId },
    });
  }

  /** Hide Category Click Handler */
  onHideCategory() {
    const { dispatch } = this.$store;
    dispatch('budget/hideCategory', this.categoryId)
      .then(() => {
        this.close();
        this.$notify({
          group: 'top',
          title: 'Category Hidden',
          text: 'Category was hidden',
          type: 'success',
        }, 5000);
      })
      .catch((error: ApiError) => {
        this.$notify({
          group: 'top',
          title: 'Error',
          text: error.message,
          type: 'error',
        });
      });
  }

  /** Update Category Budget */
  onSubmit() {
    const { categoryId } = this;
    const { name, notes, defaultBudget } = this.categoryData;
    const { dispatch } = this.$store;
    const data = {
      name,
      notes,
      /* eslint-disable @typescript-eslint/camelcase */
      ...(defaultBudget === ''
        ? { default_budget: '0' }
        : { default_budget: defaultBudget }
      ),
      /* eslint-enable @typescript-eslint/camelcase */
    };

    dispatch('budget/updateCategory', { categoryId, data })
      .then(() => {
        this.close();
        this.$notify({
          group: 'top',
          title: 'Category Updated',
          text: 'Category was updated',
          type: 'success',
        }, 5000);
      })
      .catch((error: ApiError) => {
        this.$notify({
          group: 'top',
          title: 'Error',
          text: error.message,
          type: 'error',
        });
      });
  }
}
</script>
