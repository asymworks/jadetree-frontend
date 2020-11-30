import { ModalBus } from './plugins/jt-controls/helpers/eventBus';

declare module 'vue/types/vue' {
  type Notification = {
    group: string;
    title: string;
    text: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }

  // 3. Declare augmentation for Vue
  interface Vue {
    $modalEventBus: typeof ModalBus;
    $notify(notification: Notification, timeout?: number): void;
  }
}
