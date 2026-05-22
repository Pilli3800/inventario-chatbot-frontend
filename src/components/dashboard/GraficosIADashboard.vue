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
  dashboard: {
    type: Object,
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

const porFecha = computed(() => props.dashboard?.porFecha || [])
const topUsuarios = computed(() => props.dashboard?.topUsuarios || [])

const fechas = computed(() => porFecha.value.map(item => item.fecha))

const opcionLineas = computed(() => ({
  color: ['#2563eb', '#7c3aed', '#16a34a'],
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    top: 0,
    data: ['Consultas', 'Sesiones', 'Usuarios']
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
      name: 'Consultas',
      type: 'line',
      smooth: true,
      data: porFecha.value.map(item => item.consultas || 0)
    },
    {
      name: 'Sesiones',
      type: 'line',
      smooth: true,
      data: porFecha.value.map(item => item.sesiones || 0)
    },
    {
      name: 'Usuarios',
      type: 'line',
      smooth: true,
      data: porFecha.value.map(item => item.usuarios || 0)
    }
  ]
}))

const opcionUsuarios = computed(() => ({
  color: ['#2563eb'],
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  grid: {
    top: 24,
    right: 16,
    bottom: 48,
    left: 48
  },
  xAxis: {
    type: 'category',
    data: topUsuarios.value.map(item => item.usuario),
    axisLabel: {
      interval: 0,
      rotate: 20
    }
  },
  yAxis: {
    type: 'value',
    minInterval: 1
  },
  series: [
    {
      name: 'Consultas',
      type: 'bar',
      barWidth: 36,
      data: topUsuarios.value.map(item => item.totalConsultas || 0),
      itemStyle: {
        borderRadius: [6, 6, 0, 0]
      }
    }
  ]
}))
</script>

<template>
  <a-row :gutter="[16, 16]">
    <a-col :xs="24" :lg="15">
      <a-card class="grafico-card" title="Uso del asistente por fecha">
        <v-chart
          class="grafico"
          :option="opcionLineas"
          :loading="loading"
          autoresize
        />
      </a-card>
    </a-col>

    <a-col :xs="24" :lg="9">
      <a-card class="grafico-card" title="Top usuarios por consultas">
        <v-chart
          class="grafico"
          :option="opcionUsuarios"
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
