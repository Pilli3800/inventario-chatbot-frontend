<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

const props = defineProps({
  dashboard: {
    type: Object,
    required: true
  },
  seriesPorFecha: {
    type: Array,
    required: true
  },
  loading: Boolean
})

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent
])

const tipos = [
  { key: 'compra', label: 'Compra', color: '#16a34a' },
  { key: 'entrada', label: 'Entrada', color: '#22c55e' },
  { key: 'salida', label: 'Salida', color: '#dc2626' },
  { key: 'salidaCuadrilla', label: 'Salida cuadrilla', color: '#f97316' },
  { key: 'devolucion', label: 'Devolucion', color: '#2563eb' },
  { key: 'transferencia', label: 'Transferencia', color: '#7c3aed' },
  { key: 'transferenciaServicio', label: 'Transf. servicio', color: '#a855f7' },
  { key: 'retornoASede', label: 'Retorno a sede', color: '#64748b' },
  { key: 'ajuste', label: 'Ajuste', color: '#ca8a04' }
]

const fechas = computed(() =>
  props.seriesPorFecha.map(item => item.fecha)
)

const pieData = computed(() =>
  tipos.map(tipo => ({
    name: tipo.label,
    value: props.dashboard?.[tipo.key] || 0,
    itemStyle: { color: tipo.color }
  }))
)

const opcionLineas = computed(() => ({
  color: tipos.map(tipo => tipo.color),
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    top: 0,
    type: 'scroll',
    data: tipos.map(tipo => tipo.label)
  },
  grid: {
    top: 56,
    right: 24,
    bottom: 32,
    left: 48
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: fechas.value
  },
  yAxis: {
    type: 'value',
    minInterval: 1
  },
  series: tipos.map(tipo => ({
    name: tipo.label,
    type: 'line',
    smooth: true,
    data: props.seriesPorFecha.map(item => item[tipo.key] || 0)
  }))
}))

const opcionTorta = computed(() => ({
  color: tipos.map(tipo => tipo.color),
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    right: 8,
    top: 'middle',
    type: 'scroll'
  },
  series: [
    {
      name: 'Movimientos',
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: true,
      label: {
        formatter: '{b}: {c}'
      },
      data: pieData.value
    }
  ]
}))
</script>

<template>
  <a-row :gutter="[16, 16]">
    <a-col :xs="24" :lg="15">
      <a-card class="grafico-card" title="Evolucion de movimientos">
        <v-chart
          class="grafico"
          :option="opcionLineas"
          :loading="loading"
          autoresize
        />
      </a-card>
    </a-col>

    <a-col :xs="24" :lg="9">
      <a-card class="grafico-card" title="Distribucion por tipo">
        <v-chart
          class="grafico"
          :option="opcionTorta"
          :loading="loading"
          autoresize
        />
      </a-card>
    </a-col>
  </a-row>
</template>

<style scoped>
.grafico-card {
  height: 100%;
}

.grafico {
  width: 100%;
  height: 320px;
}
</style>
