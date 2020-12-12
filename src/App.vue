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
    <div class="border-t bg-gray-100 text-gray-600 text-xs mt-2 p-2">
      <div class="flex flex-col items-stretch w-full max-w-5xl mx-auto">
        <div class="flex items-center">
          <p><span class="font-medium">Jade Tree</span> {{ appVersion }}</p>
          <p class="block px-2">|</p>
          <p><span class="font-medium">API Server:</span> {{ backendName }} {{ backendVersion }}</p>
          <p class="block px-2">|</p>
          <p><span class="font-medium">API Version:</span> {{ apiVersion }}</p>
          <p class="block px-2">|</p>
          <p><span class="font-medium">WebSocket:</span> {{ $socket.connected ? 'Connected' : 'Disconnected' }}</p>
        </div>
        <div class="flex items-center">
          <p class="font-light">
            Copyright &copy; {{ copyrightYears }} Asymworks, LLC. All Rights Reserved.
          </p>
          <p class="block px-2">|</p>
          <a href="https://jadetree.io" target="_blank" class="text-blue-500 underline">
            Jade Tree Documentation
          </a>
        </div>
      </div>
    </div>
    <jt-notification-group group="top" />
    <jt-modal-root />
  </div>
</template>

<script lang="ts">
import { Socket } from 'vue-socket.io-extended';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { getYear } from 'date-fns';

import Navbar from './components/Navbar.vue';
import LoadingPage from './pages/LoadingPage.vue';
import JtNotificationGroup from './layouts/JtNotificationGroup.vue';

type SocketEvent = {
  class: string;
  items: unknown[];
}

@Component({
  components: { JtNotificationGroup, LoadingPage, Navbar },
  computed: mapGetters([
    'apiError',
    'apiLoading',
    'apiVersion',
    'appVersion',
    'backendName',
    'backendVersion',
    'needsSetup',
  ]),
})
export default class App extends Vue {
  /* eslint-disable lines-between-class-members */
  private apiLoading!: boolean;
  private apiError!: string;
  private appVersion!: string;
  private backendName!: string;
  private backendVersion!: string;
  private needsSetup!: boolean | unknown;
  /* eslint-enable lines-between-class-members */

  get copyrightYears(): string {
    const thisYear = getYear(new Date());
    if (thisYear > 2020) {
      return `2020-${thisYear}`;
    }
    return '2020';
  }

  @Watch('needsSetup')
  needsSetupChanged(value: boolean) {
    if (value && this.$router.currentRoute.path !== '/setup') {
      this.$router.replace('/setup');
    }
  }

  @Socket('create')
  wsCreated(data: SocketEvent) {
    this.dispatchWsEvent('Create', data);
  }

  @Socket('delete')
  wsDeleted(data: SocketEvent) {
    this.dispatchWsEvent('Delete', data);
  }

  @Socket('update')
  wsUpdated(data: SocketEvent) {
    this.dispatchWsEvent('Update', data);
  }

  @Socket('clear')
  wsChangedTransaction(data: SocketEvent) {
    this.dispatchWsEvent('Clear', data);
  }

  /** Dispatch a WebSockets Event */
  dispatchWsEvent(name: string, data: SocketEvent) {
    const { dispatch } = this.$store;
    const actionName = `ws${name}${data.class}`;
    console.log(`Dispatching ${actionName}`);
    dispatch('dispatchAll', { actionName, actionPayload: data.items });
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
