<template>
  <loading-page
    v-if="error || loading"
    v-bind="{ error, errorTitle, loading, loadingTitle }"
  />
  <div v-else class="flex-grow relative w-full max-w-5xl mx-auto">
    <slot name="default"></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LoadingPage from '../pages/LoadingPage.vue';

@Component({ components: { LoadingPage } })
export default class JtStandardLayout extends Vue {
  @Prop({ default: '' })
  private error!: string;

  @Prop({ default: 'Error' })
  private errorTitle!: string;

  @Prop({ default: false })
  private loading!: boolean;

  @Prop({ default: 'Loading' })
  private loadingTitle!: string;
}
</script>
