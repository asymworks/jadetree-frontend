<!-- eslint-disable max-len -->
<template>
  <formulate-form
    class="flex flex-col items-stretch p-4"
    error-behavior="submit"
    @submit="submit"
  >
    <div class="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 mb-4 sm:mb-0">
      <formulate-input
        :class="['w-full']"
        label="Category Name"
        labelPosition="float"
        name="name"
        type="text"
        validation="required"
        validation-name="Category Name"
        v-model="name"
      />
      <formulate-input
        v-if="showDefault"
        :class="['w-full']"
        label="Default Budget Amount"
        labelPosition="float"
        name="defaultBudget"
        type="jtMoney"
        v-model="defaultBudget"
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
        v-model="notes"
      />
    </div>
    <div class="w-full flex items-center justify-between mt-2">
      <div class="flex items-center justify-start space-x-4">
        <jt-button
          v-if="hideButton"
          :class="['flex items-center justify-center w-full sm:w-auto']"
          color="gray"
          type="button"
          @click.stop="$emit('hide')"
        >Hide Category</jt-button>
        <jt-button
          v-if="deleteButton"
          :class="['flex items-center justify-center w-full sm:w-auto']"
          color="red"
          type="button"
          @click.stop="$emit('delete')"
        >Delete Category</jt-button>
      </div>
      <jt-button
        :class="['flex items-center justify-center w-full sm:w-auto']"
        :loading="submitLoading || budgetLoading"
        color="blue"
        type="submit"
      >{{ submitText }}</jt-button>
    </div>
  </formulate-form>
</template>

<script lang="ts">
// eslint-disable-next-line object-curly-newline
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { BudgetSchema, CategorySchema } from '@/api/types';

@Component({
  computed: {
    ...mapGetters('budget', ['budgetLoading', 'findCategory']),
    ...mapState('budget', ['currentBudget']),
  },
})
export default class TransactionEditor extends Vue {
  /* eslint-disable lines-between-class-members */
  private budgetLoading!: boolean;
  private currentBudget!: BudgetSchema;
  private findCategory!: (id: number) => CategorySchema[];
  /* eslint-enable lines-between-class-members */

  /** Show Delete Button */
  @Prop({ default: false })
  private deleteButton!: boolean;

  /** Show Hide Button */
  @Prop({ default: false })
  private hideButton!: boolean;

  /** Submit Button Loading */
  @Prop({ default: false })
  private submitLoading!: boolean;

  /** Submit Button Text */
  @Prop({ default: 'Update' })
  private submitText!: string;

  /** Transaction to Edit */
  @Prop({ default: null })
  private transaction!: CategorySchema | null;

  /** Default Budget */
  private defaultBudget = '';

  /** Category Name */
  private name = '';

  /** Category Notes */
  private notes = '';
}
</script>
