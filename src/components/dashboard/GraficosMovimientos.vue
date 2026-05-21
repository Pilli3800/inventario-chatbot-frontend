<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

const props = defineProps({
  resumen: {
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
  BarChart,
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent
])

const colores = {
  entradas: '#16a34a',
  salidas: '#dc2626',
  devoluciones: '#2563eb',
  internos: '#7c3aed'
}

const fechas = computed(() =>
  props.seriesPorFecha.map(item => item.fecha)
)

const entradasPorFecha = computed(() =>
  props.seriesPorFecha.map(item => item.entradas)
)

const salidasPorFecha = computed(() =>
  props.seriesPorFecha.map(item => item.salidas)
)

const devolucionesPorFecha = computed(() =>
  props.seriesPorFecha.map(item => item.devoluciones)
)

const internosPorFecha = computed(() =>
  props.seriesPorFecha.map(item => item.internos)
)

const opcionBarras = computed(() => ({
  color: [colores.entradas, colores.salidas, colores.devoluciones, colores.internos],
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    top: 24,
    right: 16,
    bottom: 32,
    left: 48
  },
  xAxis: {
    type: 'category',
    data: ['Entradas', 'Salidas', 'Devoluciones', 'Internos'],
    axisTick: {
      alignWithLabel: true
    }
  },
  yAxis: {
    type: 'value',
    minInterval: 1
  },
  series: [
    {
      name: 'Movimientos',
      type: 'bar',
      barWidth: 42,
      data: [
        {
          value: props.resumen.entradas,
          itemStyle: { color: colores.entradas }
        },
        {
          value: props.resumen.salidas,
          itemStyle: { color: colores.salidas }
        },
        {
          value: props.resumen.devoluciones,
          itemStyle: { color: colores.devoluciones }
        },
        {
          value: props.resumen.internos,
          itemStyle: { color: colores.internos }
        }
      ],
      itemStyle: {
        borderRadius: [6, 6, 0, 0]
      }
    }
  ]
}))

const opcionLineas = computed(() => ({
  color: [colores.entradas, colores.salidas, colores.devoluciones, colores.internos],
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    top: 0,
    data: ['Entradas', 'Salidas', 'Devoluciones', 'Internos']
  },
  grid: {
    top: 48,
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
  series: [
    {
      name: 'Entradas',
      type: 'line',
      smooth: true,
      data: entradasPorFecha.value
    },
    {
      name: 'Salidas',
      type: 'line',
      smooth: true,
      data: salidasPorFecha.value
    },
    {
      name: 'Devoluciones',
      type: 'line',
      smooth: true,
      data: devolucionesPorFecha.value
    },
    {
      name: 'Internos',
      type: 'line',
      smooth: true,
      data: internosPorFecha.value
    }
  ]
}))
</script>

<template>
  <a-row :gutter="[16, 16]">
    <a-col :xs="24" :lg="9">
      <a-card class="grafico-card" title="Movimientos por tipo">
        <v-chart
          class="grafico"
          :option="opcionBarras"
          :loading="loading"
          autoresize
        />
      </a-card>
    </a-col>

    <a-col :xs="24" :lg="15">
      <a-card class="grafico-card" title="Evolucion por fecha">
        <v-chart
          class="grafico"
          :option="opcionLineas"
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
