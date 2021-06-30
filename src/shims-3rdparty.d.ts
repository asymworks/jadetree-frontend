declare module '@braid/vue-formulate' {
  import { PluginObject, PluginObject, DirectiveFunction } from 'vue';

  type VueFormulateOptions = {
  };
  declare const plugin: PluginObject<VueFormulateOptions>;
  export default plugin;
}

declare module 'vt-notifications' {

  declare const plugin: PluginObject<void>;
  export default plugin;
}

declare module 'vue-clickaway' {

  const directive: DirectiveFunction;
  export { directive };
}

declare module 'vue-virtual-scroll-list' {
}

declare module 'md5' {
  function md5(data: string): string;
  export default md5;
}

declare module 'palette.js' {
  function palette(
    scheme: string,
    number: number,
    optIndex?: number,
    varargs?: unknown[],
  ): string[];
  export { palette };
}

declare module 'qinu' {
  declare type qinuOptions = {
    length?: number;
    template?: string;
    dict?: string;
    random?: boolean;
  }
  function qinu(options: qinuOptions, args?: string | string[]): string;
  export default qinu;
}
