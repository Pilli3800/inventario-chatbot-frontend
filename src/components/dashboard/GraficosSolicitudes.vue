<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
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
  GridComponent,
  LegendComponent,
  TooltipComponent
])

const estados = [
  { key: 'PENDIENTE', label: 'Pendientes', color: '#f59e0b' },
  { key: 'APROBADA', label: 'Aprobadas', color: '#16a34a' },
  { key: 'ENTREGADO', label: 'Entregadas', color: '#2563eb' },
  { key: 'DEVUELTA', label: 'Devueltas', color: '#7c3aed' },
  { key: 'CERRADA_SIN_DEVOLUCION', label: 'Cerradas sin dev.', color: '#64748b' },
  { key: 'RECHAZADA', label: 'Rechazadas', color: '#dc2626' }
]

const porEstado = computed(() => props.dashboard?.porEstado || {})
const porServicio = computed(() => props.dashboard?.porServicio || [])

const opcionEstados = computed(() => ({
  color: estados.map(estado => estado.color),
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  grid: {
    top: 24,
    right: 16,
    bottom: 56,
    left: 48
  },
  xAxis: {
    type: 'category',
    data: estados.map(estado => estado.label),
    axisLabel: {
      interval: 0,
      rotate: 24
    }
  },
  yAxis: {
    type: 'value',
    minInterval: 1
  },
  series: [
    {
      name: 'Solicitudes',
      type: 'bar',
      barWidth: 36,
      data: estados.map(estado => ({
        value: porEstado.value[estado.key] || 0,
        itemStyle: { color: estado.color }
      })),
      itemStyle: {
        borderRadius: [6, 6, 0, 0]
      }
    }
  ]
}))

const servicios = computed(() =>
  porServicio.value.map(item => item.servicioOrigenCodigo || 'Sin servicio')
)

const opcionServicios = computed(() => ({
  color: ['#f59e0b', '#16a34a', '#2563eb', '#7c3aed', '#64748b', '#dc2626'],
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  legend: {
    top: 0,
    data: ['Pendientes', 'Aprobadas', 'Entregadas', 'Devueltas', 'Cerradas sin dev.', 'Rechazadas']
  },
  grid: {
    top: 56,
    right: 24,
    bottom: 48,
    left: 48
  },
  xAxis: {
    type: 'category',
    data: servicios.value,
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
      name: 'Pendientes',
      type: 'bar',
      stack: 'solicitudes',
      data: porServicio.value.map(item => item.pendientes || 0)
    },
    {
      name: 'Aprobadas',
      type: 'bar',
      stack: 'solicitudes',
      data: porServicio.value.map(item => item.aprobadas || 0)
    },
    {
      name: 'Entregadas',
      type: 'bar',
      stack: 'solicitudes',
      data: porServicio.value.map(item => item.entregadas || 0)
    },
    {
      name: 'Devueltas',
      type: 'bar',
      stack: 'solicitudes',
      data: porServicio.value.map(item => item.devueltas || 0)
    },
    {
      name: 'Cerradas sin dev.',
      type: 'bar',
      stack: 'solicitudes',
      data: porServicio.value.map(item => item.cerradasSinDevolucion || 0)
    },
    {
      name: 'Rechazadas',
      type: 'bar',
      stack: 'solicitudes',
      data: porServicio.value.map(item => item.rechazadas || 0)
    }
  ]
}))
</script>

<template>
  <a-row :gutter="[16, 16]">
    <a-col :xs="24" :lg="10">
      <a-card class="grafico-card" title="Solicitudes por estado">
        <v-chart
          class="grafico"
          :option="opcionEstados"
          :loading="loading"
          autoresize
        />
      </a-card>
    </a-col>

    <a-col :xs="24" :lg="14">
      <a-card class="grafico-card" title="Trazabilidad por servicio">
        <v-chart
          class="grafico"
          :option="opcionServicios"
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
