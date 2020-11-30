<!-- eslint-disable max-len -->
<template>
  <span v-if="option.search">
    Create &ldquo;<span class="font-medium">{{ option.label }}</span>&rdquo;
  </span>
  <div v-else-if="option.key === '_split'" class="flex items-center justify-start space-x-2">
    <span>{{ option.label }}</span>
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
    </svg>
  </div>
  <div v-else class="flex items-center justify-between pr-2">
    <span>{{ option.label }}</span>
    <span>
      {{ option.option.balance ? formatCurrency(option.option.balance) : '' }}
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
  computed: mapGetters('l10n', ['formatCurrency']),
})
export default class CategorySelectItem extends Vue {
  @Prop({ required: true })
  private option!: object;
}
</script>
