import { Component, Vue } from 'vue-property-decorator';

@Component
export default class BaseDialog extends Vue {
  /** Close the Dialog */
  close() {
    this.$emit('dialog:close');
    this.$modalEventBus.$emit('close');
  }
}
