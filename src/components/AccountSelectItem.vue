<template>
  <span v-if="option.search">
    Create &ldquo;<span class="font-medium">{{ option.label }}</span>&rdquo;
  </span>
  <div class="flex items-center justify-between pr-2" v-else>
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
export default class AccountSelectItem extends Vue {
  @Prop({ required: true })
  private option!: object;
}
</script>
