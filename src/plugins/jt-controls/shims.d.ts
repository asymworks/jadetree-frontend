declare module 'vue-focus-lock';
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
