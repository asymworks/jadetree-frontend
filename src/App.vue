<!-- eslint-disable max-len -->
<template>
  <div id="app" class="h-full flex flex-col">
    <navbar />
    <loading-page
      v-if="apiLoading || apiError"
      :error="apiError"
      :loading="apiLoading"
      errorTitle="Error loading Jade Tree"
      loadingTitle="Loading Jade Tree"
    />
    <router-view v-else></router-view>
    <jt-notification-group group="top" />
    <jt-modal-root />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

import Navbar from './components/Navbar.vue';
import LoadingPage from './pages/LoadingPage.vue';
import JtNotificationGroup from './layouts/JtNotificationGroup.vue';

@Component({
  components: { JtNotificationGroup, LoadingPage, Navbar },
  computed: mapGetters(['apiError', 'apiLoading', 'needsSetup']),
})
export default class App extends Vue {
  /* eslint-disable lines-between-class-members */
  private apiLoading!: boolean;
  private apiError!: string;
  private needsSetup!: boolean | unknown;
  /* eslint-enable lines-between-class-members */

  @Watch('needsSetup')
  needsSetupChanged(value: boolean) {
    if (value && this.$router.currentRoute.path !== '/setup') {
      this.$router.replace('/setup');
    }
  }
}
</script>

<style>
html,
body {
  @apply .bg-gray-100;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.jt-notification-title {
  @apply font-semibold;
}
</style>
