<!-- eslint-disable max-len -->
<template>
  <jt-dialog :title="this.parentId === null ? 'Add Category Group' : 'Add Category'">
    <div class="flex flex-col items-stretch p-4">
      <div v-if="this.parentId !== null">
        Create a new budget category within
        <span class="font-bold" v-html="parentName.replace(/ : /mg, '&nbsp;:&nbsp;')" />?
      </div>
      <formulate-form
        class="block w-full"
        error-behavior="submit"
        v-model="categoryData"
        @submit="onSubmit"
      >
        <div class="sm:flex sm:space-x-4 justify-between mt-2">
          <formulate-input
            :class="['w-full']"
            :label="this.parentId === null ? 'Category Group Name' : 'Category Name'"
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
        <div class="mt-2 flex flex-col-reverse sm:flex-row items-center justify-end">
          <jt-button
            :class="['flex items-center justify-center w-full sm:w-auto']"
            :loading="budgetLoading"
            color="blue"
            type="submit"
          >Create</jt-button>
        </div>
      </formulate-form>
    </div>
  </jt-dialog>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { budgetService } from '@/api';
import { ApiError, BudgetSchema, CategorySchema } from '@/api/types';
import BaseDialog from './BaseDialog';

type CategoryData = {
  name?: string;
  defaultBudget?: string;
  notes?: string;
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

  /** Parent Id or null to create a Category Group */
  @Prop({ required: true })
  private parentId!: number | null;

  /** Category Form Data */
  private categoryData: CategoryData = {
    name: '',
    defaultBudget: '',
    notes: '',
  };

  /** Category Group Name */
  get parentName(): string {
    if (this.parentId === null) return '';

    const categories = this.findCategory(this.parentId);
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
    return this.parentId !== null;
  }

  /** Load Budget Form Data */
  mounted() {
    if (this.parentId !== null) {
      const parents = this.findCategory(this.parentId);
      if (!parents.length) {
        this.close();
        this.$notify({
          group: 'top',
          title: 'Budget Error',
          text: `Could not find category with id ${this.parentId}`,
          type: 'warning',
        }, 5000);
      }
    }
  }

  /** Update Category Budget */
  onSubmit() {
    /* eslint-disable @typescript-eslint/camelcase */
    const { parentId } = this;
    const { name, notes, defaultBudget } = this.categoryData;
    const schema: CategorySchema = {
      name,
      notes,
      default_budget: defaultBudget === '' ? undefined : defaultBudget,
      parent_id: parentId === null ? undefined : parentId,
    };
    /* eslint-enable @typescript-eslint/camelcase */

    const { dispatch } = this.$store;
    dispatch('budget/createCategory', schema)
      .then(() => {
        this.close();
        this.$notify({
          group: 'top',
          title: 'Success',
          text: 'Category was created successfully',
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
