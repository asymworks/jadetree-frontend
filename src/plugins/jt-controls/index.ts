import _Vue from 'vue';
import * as components from './components';
import { ModalBus } from './helpers/eventBus';
import JtFormulateLibrary from './components/JtFormulate/library';

// Vue plugin object
const plugin = {
  install(Vue: typeof _Vue): void {
    // Register Components
    Object.entries(components).forEach(([name, cmp]) => {
      Vue.component(name, cmp);
    });

    // Register Modal Event Bus
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$modalEventBus = ModalBus;
  },
};

// Auto-install when the Vue instance is global
const globalVue = (typeof window !== 'undefined')
  ? window.Vue
  : undefined;

if (globalVue) {
  globalVue.use(plugin);
}

export default plugin;
export { JtFormulateLibrary, ModalBus };
