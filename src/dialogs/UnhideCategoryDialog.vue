<!-- eslint-disable max-len -->
<template>
  <jt-dialog title="Unhide Category">
    <div class="flex flex-col items-stretch p-2">
      <div>
        Click a Category Name to unhide it.
      </div>
    </div>
    <div class="max-h-64 overflow-y-scroll">
      <template v-for="group in hiddenCategories">
        <div
          class="px-2 bg-blue-100 border-b border-gray-500 z-10 font-bold"
          :key="group.id"
        >
          <div class="py-1 flex flex-row items-center justify-start">
            <div v-if="group.hidden" class="cursor-pointer flex items-center justify-start" @click="onUnhideCategory(group.id)">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"></path><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"></path>
              </svg>
              {{ translateName(group.name) }}
            </div>
            <div v-else>
              {{ translateName(group.name) }}
            </div>
          </div>
        </div>
        <div
          v-for="child in sortedCategories(group.children)"
          class="relative px-2 border-b border-gray-200 md:group"
          :key="child.id"
        >
          <div class="cursor-pointer flex items-center justify-start" @click="onUnhideCategory(child.id)">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"></path><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"></path>
            </svg>
            {{ translateName(child.name) }}
          </div>
        </div>
      </template>
    </div>
  </jt-dialog>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { budgetService } from '@/api';
import { ApiError, CategorySchema } from '@/api/types';
import BaseDialog from './BaseDialog';

@Component
export default class UnhideCategoryDialog extends BaseDialog {
  /** Hidden Category List */
  @Prop({ required: true })
  private hiddenCategories!: CategorySchema[];

  /** Hide Category Click Handler */
  onUnhideCategory(id: number) {
    const { dispatch } = this.$store;
    dispatch('budget/unhideCategory', id)
      .then(() => {
        this.close();
        this.$notify({
          group: 'top',
          title: 'Category Restored',
          text: 'Category was changed to visible',
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

  /** Get a Sorted List of Categories */
  sortedCategories(categories: CategorySchema[]): CategorySchema[] {
    return [...categories]
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }

  /** Category Name Helper */
  translateName(name: string): string {
    return budgetService.translateName(name);
  }
}
</script>
