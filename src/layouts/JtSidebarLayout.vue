<!-- eslint-disable max-len -->
<template>
  <loading-page
    v-if="error || loading"
    v-bind="{ error, errorTitle, loading, loadingTitle }"
  />
  <div v-else class="flex-grow relative w-full max-w-5xl mx-auto">
    <div class="flex flex-row items-start md:space-x-2 md:px-2 h-full">
      <div class="fixed bottom-0 inset-x-0 z-20 flex-none md:sticky md:top-0 md:py-2 md:inset-auto md:w-72">
        <div class="flex flex-col items-start h-full p-2 bg-white border-t border-gray-800 md:border-gray-400 md:border md:rounded">
          <slot name="sidebar"></slot>
        </div>
      </div>
      <div class="flex-grow overflow-visible max-w-full h-full">
        <slot name="default"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LoadingPage from '../pages/LoadingPage.vue';

@Component({ components: { LoadingPage } })
export default class JtSidebarLayout extends Vue {
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
