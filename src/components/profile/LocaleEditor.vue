<template>
  <locale-editor-controller
    :language="language"
    :country="country"
    :currency="currency"
    :locale="locale"
    :previewNegative="previewNegative"
    :restrictLocales.sync="restrictLocales"
    v-on="$listeners"
  >
    <template v-slot:default="context">
      <div class="flex flex-col items-stretch">
        <formulate-input
          :clearButton="false"
          :disabled="true"
          :help="'This field has been set by your system administrator and cannot be changed'"
          :options="context.languageOptions"
          :value="language"
          @input="$emit('update:language', $event)"
          label="Language"
          labelPosition="float"
          name="language"
          type="jtSelect"
          validation="required"
        />
        <formulate-input
          :options="context.countryOptions"
          :value="country"
          @input="$emit('update:country', $event)"
          label="Country"
          labelPosition="float"
          name="country"
          type="jtSelect"
          validation="required"
        />
        <div class="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4">
          <div class="w-full">
            <formulate-input
              :class="['w-full']"
              :options="context.localeOptions"
              :value="locale"
              @input="$emit('update:locale', $event)"
              label="Formatting Locale"
              labelPosition="float"
              name="locale"
              type="jtSelect"
              validation="required"
            />
            <formulate-input
              label="Only Suggested Locales"
              labelClass="ml-2 font-medium text-xs"
              type="checkbox"
              v-model="restrictLocales"
            />
          </div>
          <div class="w-full mb-4 sm:mb-0">
            <formulate-input
              :class="['w-full']"
              :options="context.currencyOptions"
              :value="currency"
              @input="$emit('update:currency', $event)"
              label="Default Currency"
              labelPosition="float"
              name="currency"
              type="jtSelect"
              validation="required"
            />
          </div>
        </div>
        <div class="sm:border-b h-px my-1 sm:my-4"></div>
        <div class="w-full flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between">
          <div class="flex-grow flex flex-col items-stretch mt-4 sm:mt-0">
            <div class="flex items-center cursor-pointer" @click="previewOpen=!previewOpen">
              <div class="w-4">
                <div v-if="previewOpen" class="arrow-down"></div>
                <div v-else class="arrow-right"></div>
              </div>
              <span class="block font-medium text-sm">Preview Number and Date Formats</span>
            </div>
            <div v-if="previewOpen">
              <table class="w-full sm:w-64 my-2 text-xs leading-relaxed">
                <tr>
                  <th class="text-left">Decimal Number</th>
                  <td class="text-right">{{ context.previewDecimal }}</td>
                </tr>
                <tr>
                  <th class="text-left">Currency</th>
                  <td class="text-right">{{ context.previewCurrency }}</td>
                </tr>
                <tr>
                  <th class="text-left">Accounting</th>
                  <td class="text-right">{{ context.previewAccounting }}</td>
                </tr>
                <tr><td class="py-1" colspan="2"><hr /></td></tr>
                <tr>
                  <th class="text-left">Short Date</th>
                  <td class="text-right">{{ context.previewShortDate }}</td>
                </tr>
                <tr>
                  <th class="text-left">Long Date</th>
                  <td class="text-right">{{ context.previewLongDate }}</td>
                </tr>
              </table>
              <formulate-input
                :class="['mt-3']"
                label="Show Negative Numbers"
                labelClass="ml-1 font-medium text-xs"
                type="checkbox"
                v-model="previewNegative"
              />
            </div>
          </div>
          <div class="mt-2 flex items-center justify-end">
            <slot name="button" v-bind="context"></slot>
          </div>
        </div>
      </div>
    </template>
  </locale-editor-controller>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LocaleEditorController from './LocaleEditorController';

@Component({
  components: {
    LocaleEditorController,
  },
})
export default class LocaleEditor extends Vue {
  /** Country Code (ISO3166 Alpha 2) */
  @Prop({ required: true })
  private country!: string;

  /** Currency Code (ISO4217) */
  @Prop({ required: true })
  private currency!: string;

  /** Language Code */
  @Prop({ required: true })
  private language!: string;

  /** Locale Loading Flag */
  @Prop({ default: false })
  private loading!: boolean;

  /** Locale Tag */
  @Prop({ required: true })
  private locale!: string;

  /** Onboard Request is Loading */
  private onboardLoading = false;

  /** Preview Negative Numbers */
  private previewNegative = false;

  /** Preview Pane Open */
  private previewOpen = false;

  /** Restrict Locales to Suggested */
  private restrictLocales = true;

  /** Update Currency Code */
  updateCountry(value: string) {
    console.log(`updateCountry(${value})`);
    this.$emit('update:country', value);
  }

  /** Update Currency Code */
  updateCurrency(value: string) {
    console.log(`updateCurrency(${value})`);
    this.$emit('update:currency', value);
  }

  /** Update Language Code */
  updateLanguage(value: string) {
    console.log(`updateLanguage(${value})`);
    this.$emit('update:language', value);
  }

  /** Update Locale Tag */
  updateLocale(value: string) {
    console.log(`updateLocale(${value})`);
    this.$emit('update:locale', value);
  }
}
</script>
