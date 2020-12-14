import Vue from 'vue';

// Load Plugins
import Notifications from 'vt-notifications';
import VTooltip from 'v-tooltip';
import VueFormulate from '@braid/vue-formulate';
import VueSocketIOExt from 'vue-socket.io-extended';
import { JtControls, JtFormulateLibrary } from '@jadetree/controls';
import { Manager } from 'socket.io-client';

// Load API
import api from './api';

// Load Vue Router and Vuex Store
import router from './router';
import store from './store';

// Load Tailwind Styles
import './assets/css/jadetree.css';

// Application Component
import App from './App.vue';

// Configuration Schema
type JadeTreeConfig = {
  apiurl: string;
  ws_url?: string;
  ws_namespace?: string;
};

// Configuration Loader
const loadConfig: () => Promise<JadeTreeConfig> = async () => fetch('/config.json')
  .then((response) => response.json())
  .catch((error) => store.dispatch(
    'startupError',
    `Could not load config.json: ${error}`,
  ));

// Provide API Helper to Components
Vue.prototype.$api = api;

// Setup Plugins
Vue.use(JtControls);
Vue.use(Notifications);
Vue.use(VTooltip);

// Setup Formulate with Jade Tree Customizations
Vue.use(VueFormulate, {
  classes: {
    outer: (
      context: { labelPosition: string | boolean },
      classes: string[],
    ) => (
      context.labelPosition === 'float'
        ? ['formulate-input--float']
        : classes
    ),
    element: (
      context: { labelPosition: string | boolean },
      classes: string[],
    ) => classes.concat([
      ...(context.labelPosition === 'float' ? ['formulate-float-label'] : []),
    ]),
  },
  library: {
    ...JtFormulateLibrary,
  },
  slotComponents: {
    label: 'JtFormulateLabel',
  },
});

Vue.config.devtools = true;
Vue.config.performance = true;
Vue.config.productionTip = false;

async function startup() {
  // Load Configuration
  const config = await loadConfig();

  // Check API Configuration
  if (!config.apiurl) {
    // FIXME: Replace with Store Dispatch to Application Startup Error
    const msg = 'The API URL is not configured in config.js. Please '
      + 'update the configuration and reload the Jade Tree frontend. If you '
      + 'are using Docker, please set the JADETREE_APIURL environment variable '
      + 'to the publicly-accessible Jade Tree API URL.';
    store.dispatch('startupError', msg);
  }

  api.baseUrl = config.apiurl;

  // Setup WebSockets
  const wsUrl = config.ws_url || config.apiurl;
  const wsNamespace = config.ws_namespace || '/';
  const manager = new Manager(wsUrl, { autoConnect: false });

  api.socket = manager.socket(wsNamespace);

  Vue.use(VueSocketIOExt, api.socket);

  // Initialize Vuex Modules
  store.dispatch('dispatchAll', { actionName: 'startup' });

  // Initialize Vue
  new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount('#app');
}

// Run Startup
startup();
