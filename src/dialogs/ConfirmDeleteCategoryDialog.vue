<!-- eslint-disable max-len -->
<template>
  <jt-dialog title="Confirm Deletion">
    <div class="flex flex-col items-stretch p-2">
      <div>
        Are you sure you want to delete
        <span class="font-bold" v-html="categoryName.replace(/ : /mg, '&nbsp;:&nbsp;')" />?
        This action cannot be undone.
      </div>
      <div class="mt-2 flex flex-col-reverse sm:flex-row items-center justify-between">
        <jt-button
          :class="['flex items-center justify-center w-full sm:w-auto']"
          color="gray"
          type="button"
          @click.stop="close"
        >Cancel</jt-button>
        <jt-button
          :class="['flex items-center justify-center w-full sm:w-auto']"
          :loading="budgetLoading"
          color="red"
          type="button"
          @click.stop="onDelete"
        >Delete</jt-button>
      </div>
    </div>
  </jt-dialog>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { budgetService } from '@/api';
import { ApiError, CategorySchema } from '@/api/types';
import BaseDialog from './BaseDialog';

@Component({
  computed: {
    ...mapGetters('budget', ['budgetLoading', 'findCategory']),
  },
})
export default class ConfirmDeleteCategoryDialog extends BaseDialog {
  /* eslint-disable lines-between-class-members */
  private findCategory!: (id: number) => CategorySchema[];
  /* eslint-enable lines-between-class-members */

  /** Category Id */
  @Prop({ required: true })
  private categoryId!: number;

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
  }

  /** Delete Category Click Handler */
  onDelete() {
    const { categoryId } = this;
    const { dispatch } = this.$store;

    dispatch('budget/deleteCategory', categoryId)
      .then(() => {
        this.close();
        this.$notify({
          group: 'top',
          title: 'Category Deleted',
          text: 'Category was deleted',
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
