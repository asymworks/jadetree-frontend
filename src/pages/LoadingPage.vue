<template>
  <div class="flex-grow flex flex-col items-stretch sm:items-center">
    <div class="sm:w-full sm:max-w-sm m-4 p-4 border rounded-lg bg-white shadow">
      <div v-if="loading" class="flex flex-col items-center">
        <div class="text-lg font-medium">{{ loadingTitle }}</div>
        <jt-spinner class="w-12 h-12 mt-4" />
      </div>
      <div v-else-if="error" class="flex flex-col items-center">
        <div class="text-lg text-red-600 font-bold">{{ errorTitle }}</div>
        <hr class="w-full my-3" />
        <div class="w-full text-justify" v-text="error" />
      </div>
      <div v-else class="flex flex-col items-center">
        <div class="text-lg font-medium">Jade Tree</div>
        <hr class="w-full my-3" />
        <router-link to="/home">Return to Dashboard</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class LoadingPage extends Vue {
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
