<!-- eslint-disable max-len -->
<template>
  <jt-sidebar-layout>
    <template v-slot:default>
      <div class="flex flex-col items-stretch justify-start h-full">
        <Plotly
          :data="plotlyConfig.data"
          :layout="plotlyConfig.layout"
          :display-mode-bar="false"
        />
      </div>
    </template>
    <template v-slot:sidebar>
      <div class="flex flex-row items-center justify-end w-full">
        Report Type
      </div>
    </template>
  </jt-sidebar-layout>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Plotly } from 'vue-plotly';
import { Component, Vue } from 'vue-property-decorator';
import { reportsService } from '@/api';
import { Money } from '@jadetree/currency';
import { format } from 'date-fns';
import JtSidebarLayout from '../layouts/JtSidebarLayout.vue';

/** Bar Plot Data */
type BarData = {
  x: string[] | number[];
  y: number[];
  text: string[];
  hoverinfo?: string;
  name?: string;
  type: string;
}

/** Plot Data */
type PlotData = BarData;

/** Plotly Configuration */
interface PlotlyConfig {
  data: PlotData[];
  layout: {
    barmode?: string;
    title?: string;
  };
}

@Component({
  components: {
    JtSidebarLayout,
    Plotly,
  },
  computed: {
    ...mapGetters('l10n', ['formatCurrency']),
  },
})
export default class BudgetPage extends Vue {
  /* eslint-disable lines-between-class-members */
  private formatCurrency!: (money: Money) => string;
  /* eslint-enable lines-between-class-members */

  /** Plotly Data */
  plotlyConfig: PlotlyConfig = {
    data: [],
    layout: {
      barmode: 'relative',
      title: 'Net Worth',
    },
  };

  mounted() {
    this.loadNetWorth();
  }

  /** Load Net Worth Report */
  loadNetWorth() {
    reportsService.netWorth().then((report) => {
      /* eslint-disable object-curly-newline */
      const traceA: BarData = { x: [], y: [], text: [], name: 'Assets', type: 'bar', hoverinfo: 'text' };
      const traceL: BarData = { x: [], y: [], text: [], name: 'Liabilities', type: 'bar', hoverinfo: 'text' };
      const traceN: BarData = { x: [], y: [], text: [], name: 'Net Worth', type: 'scatter', hoverinfo: 'text' };
      /* eslint-enable object-curly-newline */

      traceA.x = report.map((p) => format(new Date(p.month), 'yyyy-MM-dd'));
      traceA.y = report.map((p) => new Money(p.assets).amount.toNumber());
      traceA.text = report.map((p) => `Assets: ${this.formatCurrency(new Money(p.assets))}`);
      traceL.x = traceA.x;
      traceL.y = report.map((p) => new Money(p.liabilities).amount.neg().toNumber());
      traceL.text = report.map((p) => `Liabilities: ${this.formatCurrency(new Money(p.liabilities).negate())}`);
      traceN.x = traceA.x;
      traceN.y = report.map((p) => new Money(p.assets).subtract(new Money(p.liabilities))
        .amount.toNumber());
      traceN.text = report.map((p) => `Net Worth: ${this.formatCurrency(new Money(p.assets)
        .subtract(new Money(p.liabilities)))}`);

      this.plotlyConfig.data = [traceA, traceL, traceN];
    });
  }
}
</script>
