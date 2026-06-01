<script setup>
import { computed, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { consumoMlService } from '@/services/consumo-ml.service'
import { itemService } from '@/services/item.service'
import { cuadrillaService } from '@/services/cuadrilla.service'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent
])

const route = useRoute()
const router = useRouter()

const panelRoutes = {
  anomalias: '/dashboard/consumo/anomalias',
  evolucion: '/dashboard/consumo/evolucion',
  proyeccion: '/dashboard/consumo/proyeccion',
  alertas: '/dashboard/consumo/alertas'
}

const activePanel = computed(() => {
  if (route.path === panelRoutes.evolucion) return 'evolucion'
  if (route.path === panelRoutes.proyeccion) return 'proyeccion'
  if (route.path === panelRoutes.alertas) return 'alertas'
  return 'anomalias'
})

const onPanelChange = (key) => {
  const path = panelRoutes[key]
  if (path && route.path !== path) {
    router.push(path)
  }
}

const loadingAnomalias = ref(false)
const loadingEvolucion = ref(false)
const loadingProyeccion = ref(false)
const loadingAlertas = ref(false)
const loadingItems = ref(false)
const loadingCuadrillas = ref(false)
const items = ref([])
const cuadrillas = ref([])
const anomaliasResponse = ref(null)
const evolucionResponse = ref(null)
const proyeccionResponse = ref(null)
const alertasResponse = ref(null)

const anomaliasForm = reactive({
  dias: 7,
  periodosHistorial: 4,
  guardarAlertas: false
})

const evolucionForm = reactive({
  cuadrillaCodigo: undefined,
  itemCodigo: undefined,
  dias: 30,
  guardarAlertas: false
})

const proyeccionForm = reactive({
  itemCodigo: undefined,
  diasHist: 60,
  diasFuturo: 15
})

const alertasForm = reactive({
  tipo: undefined,
  referenciaTipo: undefined,
  referenciaCodigo: '',
  fechaInicio: undefined,
  fechaFin: undefined,
  limit: 20
})

const panelOptions = [
  { label: 'Anomalias', value: 'anomalias' },
  { label: 'Evolucion', value: 'evolucion' },
  { label: 'Proyeccion', value: 'proyeccion' },
  { label: 'Alertas', value: 'alertas' }
]

const alertaTipoOptions = [
  { label: 'Consumo anomalo', value: 'CONSUMO_ANOMALO' },
  { label: 'Evento consumo', value: 'EVENTO_CONSUMO' }
]

const referenciaTipoOptions = [
  { label: 'Item', value: 'ITEM' },
  { label: 'Cuadrilla', value: 'CUADRILLA' }
]

const getContent = (response) =>
  response?.content ?? response?.data ?? response ?? {}

const getResultados = (response) => {
  const content = getContent(response)
  if (Array.isArray(content)) return content
  return content.resultados || content.data || content.items || []
}

const anomalias = computed(() => getResultados(anomaliasResponse.value))
const evolucion = computed(() => getResultados(evolucionResponse.value))
const proyeccion = computed(() => getResultados(proyeccionResponse.value))
const alertas = computed(() => getResultados(alertasResponse.value))
const evolucionContent = computed(() => getContent(evolucionResponse.value))
const evolucionBackendResumen = computed(() => evolucionContent.value?.resumen || {})
const proyeccionContent = computed(() => getContent(proyeccionResponse.value))
const proyeccionBackendResumen = computed(() => proyeccionContent.value?.resumen || {})

const sumByKeys = (rows, keys) =>
  rows.reduce((total, row) => {
    const value = keys.map(key => row?.[key]).find(item => item !== undefined && item !== null)
    return total + Number(value || 0)
  }, 0)

const maxByKeys = (rows, keys) =>
  rows.reduce((max, row) => {
    const value = Number(keys.map(key => row?.[key]).find(item => item !== undefined && item !== null) || 0)
    return value > max ? value : max
  }, 0)

const evolucionResumen = computed(() => ({
  dias: evolucion.value.length,
  consumoTotal: Number(
    evolucionBackendResumen.value.consumoTotal ??
    sumByKeys(evolucion.value, ['consumoDiario'])
  ),
  eventos: Number(
    evolucionBackendResumen.value.eventosDestacados ??
    evolucion.value.filter(item => item.eventoDestacado === true).length
  ),
  maxZScore: maxByKeys(evolucion.value, ['zScore', 'score'])
}))

const anomaliasResumen = computed(() => ({
  evaluados: anomalias.value.length,
  anomalias: anomalias.value.filter(item => item.isAnomaly === true || item.anomalia === true).length,
  maxScore: maxByKeys(anomalias.value, ['anomalyScore', 'score']),
  consumoActual: sumByKeys(anomalias.value, ['consumoActual'])
}))

const proyeccionResumen = computed(() => ({
  periodos: proyeccion.value.length,
  consumoTotal: sumByKeys(proyeccion.value, ['consumoEstimado']),
  promedioDiario: Number(
    proyeccionBackendResumen.value.consumoPromedioDiario ??
    (proyeccion.value.length
      ? sumByKeys(proyeccion.value, ['consumoEstimado']) / proyeccion.value.length
      : 0)
  ),
  desviacionDiaria: Number(proyeccionBackendResumen.value.desviacionStdDiaria ?? 0)
}))

const alertasResumen = computed(() => ({
  total: alertas.value.length,
  consumoAnomalo: alertas.value.filter(item => item.tipo === 'CONSUMO_ANOMALO').length,
  eventoConsumo: alertas.value.filter(item => item.tipo === 'EVENTO_CONSUMO').length,
  sinReferencia: alertas.value.filter(item => !item.referenciaCodigo).length
}))

const valueToText = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const formatColumnTitle = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, letter => letter.toUpperCase())

const buildColumns = (rows) => {
  const first = rows.find(row => row && typeof row === 'object')
  if (!first) return []

  return Object.keys(first).slice(0, 10).map(key => ({
    title: formatColumnTitle(key),
    dataIndex: key,
    key,
    ellipsis: true
  }))
}

const anomaliasColumns = [
  { title: 'Cuadrilla', dataIndex: 'cuadrillaCodigo', width: 120 },
  { title: 'Item', dataIndex: 'itemCodigo', width: 120 },
  { title: 'Nombre item', dataIndex: 'itemNombre', width: 230 },
  { title: 'Consumo actual', dataIndex: 'consumoActual', width: 130, align: 'right' },
  { title: 'Promedio historico', dataIndex: 'consumoPromedio', width: 150, align: 'right' },
  { title: 'Variacion', dataIndex: 'zScore', width: 120, align: 'right' },
  { title: 'Estado', dataIndex: 'isAnomaly', width: 120 },
  { title: 'Explicacion', dataIndex: 'explicacion', width: 420 }
]
const evolucionColumns = [
  { title: 'Fecha', dataIndex: 'fecha', width: 120 },
  { title: 'Consumo diario', dataIndex: 'consumoDiario', width: 140, align: 'right' },
  { title: 'Tendencia', dataIndex: 'tendencia', width: 120, align: 'right' },
  { title: 'Z Score', dataIndex: 'zScore', width: 100, align: 'right' },
  { title: 'Evento', dataIndex: 'eventoDestacado', width: 120 },
  { title: 'Explicacion', dataIndex: 'explicacion', width: 360 }
]
const proyeccionColumns = [
  { title: 'Fecha', dataIndex: 'fecha', width: 130 },
  { title: 'Consumo estimado', dataIndex: 'consumoEstimado', width: 160, align: 'right' },
  { title: 'Metodo', dataIndex: 'metodo', width: 220 },
  { title: 'Explicacion', dataIndex: 'explicacion', width: 460 }
]
const alertasColumns = [
  { title: 'Fecha', dataIndex: 'fechaAlerta', width: 170 },
  { title: 'Tipo', dataIndex: 'tipo', width: 170 },
  { title: 'Referencia', dataIndex: 'referenciaCodigo', width: 190 },
  { title: 'Descripcion', dataIndex: 'descripcion', width: 420 }
]

const getTableColumns = (rows, preferredColumns) => {
  if (!rows.length) return preferredColumns

  const first = rows.find(row => row && typeof row === 'object')
  const hasPreferredField = preferredColumns.some(column =>
    Object.prototype.hasOwnProperty.call(first || {}, column.dataIndex)
  )

  return hasPreferredField ? preferredColumns : buildColumns(rows)
}

const resolvedEvolucionColumns = computed(() =>
  getTableColumns(evolucion.value, evolucionColumns)
)

const booleanTag = (value, trueText = 'Si', falseText = 'No') => ({
  color: value ? 'orange' : 'green',
  text: value ? trueText : falseText
})

const formatNumber = (value) => {
  const number = Number(value)
  if (Number.isNaN(number)) return valueToText(value)
  return Number.isInteger(number) ? String(number) : number.toFixed(2)
}

const formatDateTime = (value) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'

const getConsumoDiarioValue = (item) =>
  Number(item.consumoDiario ?? 0)

const evolucionChartOption = computed(() =>
  ({
    color: ['#2563eb'],
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      top: 0,
      data: ['Consumo diario']
    },
    grid: {
      top: 48,
      right: 24,
      bottom: 36,
      left: 48
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: evolucion.value.map(item => item.fecha)
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: 'Consumo diario',
        type: 'line',
        smooth: true,
        data: evolucion.value.map(getConsumoDiarioValue)
      }
    ]
  })
)

const proyeccionChartOption = computed(() =>
  ({
    color: ['#16a34a'],
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      top: 0,
      data: ['Consumo estimado']
    },
    grid: {
      top: 48,
      right: 24,
      bottom: 36,
      left: 48
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: proyeccion.value.map(item => item.fecha)
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: 'Consumo estimado',
        type: 'line',
        smooth: true,
        data: proyeccion.value.map(item => Number(item.consumoEstimado ?? 0))
      }
    ]
  })
)

const getErrorMessage = (err, fallback) => {
  const responseData = err?.response?.data?.content ?? err?.response?.data
  if (Array.isArray(responseData)) return responseData[0] || fallback
  if (typeof responseData === 'string') return responseData || fallback
  return fallback
}

const isInvalidDateRange = (fechaInicio, fechaFin) =>
  fechaInicio && fechaFin && dayjs(fechaInicio).isAfter(dayjs(fechaFin), 'day')

const buscarItems = async (texto) => {
  loadingItems.value = true
  try {
    const params = {
      enabled: true,
      page: 0,
      size: 20
    }

    if (texto?.trim()) {
      params.codigoItem = texto.trim()
    }

    const { data } = await itemService.search(params)
    items.value = data.content || []
  } finally {
    loadingItems.value = false
  }
}

const buscarCuadrillas = async (texto) => {
  loadingCuadrillas.value = true
  try {
    const params = {
      enabled: true,
      page: 0,
      size: 20
    }

    if (texto?.trim()) {
      params.codigoCuadrilla = texto.trim()
    }

    const { data } = await cuadrillaService.search(params)
    cuadrillas.value = data.content || []
  } finally {
    loadingCuadrillas.value = false
  }
}

const consultarAnomalias = async () => {
  if (!anomaliasForm.dias) {
    message.warning('Ingrese dias a analizar')
    return
  }

  if (anomaliasForm.dias < 1 || anomaliasForm.dias > 30) {
    message.warning('Dias debe estar entre 1 y 30')
    return
  }

  if (anomaliasForm.periodosHistorial < 2 || anomaliasForm.periodosHistorial > 12) {
    message.warning('Periodos historial debe estar entre 2 y 12')
    return
  }

  loadingAnomalias.value = true
  try {
    const { data } = await consumoMlService.getAnomalias({ ...anomaliasForm })
    anomaliasResponse.value = data?.content ?? data
  } catch (err) {
    message.error(getErrorMessage(err, 'No se pudo consultar anomalias'))
  } finally {
    loadingAnomalias.value = false
  }
}

const consultarEvolucion = async () => {
  if (!evolucionForm.cuadrillaCodigo || !evolucionForm.itemCodigo || !evolucionForm.dias) {
    message.warning('Seleccione cuadrilla, item y dias')
    return
  }

  if (evolucionForm.dias < 7 || evolucionForm.dias > 120) {
    message.warning('Dias debe estar entre 7 y 120')
    return
  }

  loadingEvolucion.value = true
  try {
    const { data } = await consumoMlService.getEvolucion({ ...evolucionForm })
    evolucionResponse.value = data?.content ?? data
  } catch (err) {
    message.error(getErrorMessage(err, 'No se pudo consultar evolucion'))
  } finally {
    loadingEvolucion.value = false
  }
}

const consultarProyeccion = async () => {
  if (!proyeccionForm.itemCodigo || !proyeccionForm.diasHist || !proyeccionForm.diasFuturo) {
    message.warning('Seleccione item, dias historicos y dias futuro')
    return
  }

  if (proyeccionForm.diasHist < 15 || proyeccionForm.diasHist > 180) {
    message.warning('Dias historicos debe estar entre 15 y 180')
    return
  }

  if (proyeccionForm.diasFuturo < 1 || proyeccionForm.diasFuturo > 60) {
    message.warning('Dias futuro debe estar entre 1 y 60')
    return
  }

  loadingProyeccion.value = true
  try {
    const { data } = await consumoMlService.getProyeccion({ ...proyeccionForm })
    proyeccionResponse.value = data?.content ?? data
  } catch (err) {
    message.error(getErrorMessage(err, 'No se pudo consultar proyeccion'))
  } finally {
    loadingProyeccion.value = false
  }
}

const consultarAlertas = async () => {
  if (isInvalidDateRange(alertasForm.fechaInicio, alertasForm.fechaFin)) {
    message.warning('La fecha desde no puede ser mayor que la fecha hasta')
    return
  }

  loadingAlertas.value = true
  try {
    const params = {
      tipo: alertasForm.tipo,
      referenciaTipo: alertasForm.referenciaTipo,
      referenciaCodigo: alertasForm.referenciaCodigo?.trim() || undefined,
      fechaInicio: alertasForm.fechaInicio
        ? dayjs(alertasForm.fechaInicio).format('YYYY-MM-DD')
        : undefined,
      fechaFin: alertasForm.fechaFin
        ? dayjs(alertasForm.fechaFin).format('YYYY-MM-DD')
        : undefined,
      limit: alertasForm.limit
    }

    const { data } = await consumoMlService.getAlertas(params)
    alertasResponse.value = data?.content ?? data
  } catch (err) {
    message.error(getErrorMessage(err, 'No se pudo consultar alertas'))
  } finally {
    loadingAlertas.value = false
  }
}

const limpiarAlertas = () => {
  alertasForm.tipo = undefined
  alertasForm.referenciaTipo = undefined
  alertasForm.referenciaCodigo = ''
  alertasForm.fechaInicio = undefined
  alertasForm.fechaFin = undefined
  alertasForm.limit = 20
  consultarAlertas()
}
</script>

<template>
  <div class="consumo-panel">
    <a-card size="small">
      <a-segmented :value="activePanel" :options="panelOptions" @change="onPanelChange" />
    </a-card>

    <a-card v-if="activePanel === 'anomalias'" title="Anomalias de consumo">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :md="6">
            <a-form-item label="Dias a analizar" required>
              <a-input-number
                v-model:value="anomaliasForm.dias"
                :min="1"
                :max="30"
                :precision="0"
                placeholder="1 a 30, sugerido 7"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="6">
            <a-form-item label="Periodos historial">
              <a-input-number
                v-model:value="anomaliasForm.periodosHistorial"
                :min="2"
                :max="12"
                :precision="0"
                placeholder="2 a 12, sugerido 4"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="6">
            <a-form-item label="Guardar alertas">
              <a-switch v-model:checked="anomaliasForm.guardarAlertas" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="6" class="form-actions">
            <a-button type="primary" :loading="loadingAnomalias" @click="consultarAnomalias">
              Detectar anomalias
            </a-button>
          </a-col>
        </a-row>
      </a-form>

      <a-row :gutter="[12, 12]" class="decision-grid">
        <a-col :xs="12" :md="6">
          <a-card size="small">
            <a-statistic title="Evaluados" :value="anomaliasResumen.evaluados" />
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card size="small">
            <a-statistic title="Anomalias" :value="anomaliasResumen.anomalias" :value-style="{ color: '#dc2626' }" />
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-tooltip title="Muestra que tan inusual es el caso mas extremo detectado. Mientras mas alto sea el valor, mas se aleja del consumo historico esperado.">
            <a-card size="small">
              <a-statistic title="Max score" :value="anomaliasResumen.maxScore" :precision="2" />
            </a-card>
          </a-tooltip>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card size="small">
            <a-statistic title="Consumo actual" :value="anomaliasResumen.consumoActual" />
          </a-card>
        </a-col>
      </a-row>

      <a-alert
        type="info"
        show-icon
        class="legend-alert"
        message="Criterio de anomalia"
        description="Compara consumo actual contra periodos historicos por cuadrilla e item. La variacion es el Z Score: desde 2.0 se considera consumo anomalo. El score ordena los casos mas alejados del patron historico."
      />

      <a-table
        class="consumo-data-table"
        :columns="anomaliasColumns"
        :data-source="anomalias"
        :loading="loadingAnomalias"
        :pagination="false"
        :scroll="{ x: 1410, y: 420 }"
        size="small"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="['consumoActual', 'consumoPromedio', 'zScore'].includes(column.dataIndex)">
            {{ formatNumber(record[column.dataIndex]) }}
          </template>
          <template v-else-if="column.dataIndex === 'isAnomaly'">
            <a-tag :color="booleanTag(record.isAnomaly, 'Anomalia', 'Normal').color">
              {{ booleanTag(record.isAnomaly, 'Anomalia', 'Normal').text }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'itemNombre'">
            <a-tooltip :title="record.itemNombre">
              <span class="table-text">{{ record.itemNombre || '-' }}</span>
            </a-tooltip>
          </template>
          <template v-else-if="column.dataIndex === 'explicacion'">
            <a-tooltip :title="record.explicacion">
              <span class="table-text">{{ record.explicacion || '-' }}</span>
            </a-tooltip>
          </template>
          <template v-else>
            {{ valueToText(record[column.dataIndex]) }}
          </template>
        </template>
      </a-table>
    </a-card>

    <a-card v-if="activePanel === 'evolucion'" title="Evolucion de consumo">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :md="6">
            <a-form-item label="Cuadrilla" required>
              <a-select
                v-model:value="evolucionForm.cuadrillaCodigo"
                show-search
                allow-clear
                placeholder="Buscar cuadrilla"
                :filter-option="false"
                :loading="loadingCuadrillas"
                :dropdown-style="{ maxHeight: '280px', overflow: 'auto' }"
                @search="buscarCuadrillas"
                @focus="!cuadrillas.length && buscarCuadrillas()"
              >
                <a-select-option
                  v-for="cuadrilla in cuadrillas"
                  :key="cuadrilla.codigoCuadrilla"
                  :value="cuadrilla.codigoCuadrilla"
                >
                  {{ cuadrilla.codigoCuadrilla }} - {{ cuadrilla.jefeCuadrillaNombresyApellidos || '-' }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="6">
            <a-form-item label="Item" required>
              <a-select
                v-model:value="evolucionForm.itemCodigo"
                show-search
                allow-clear
                placeholder="Buscar item"
                :filter-option="false"
                :loading="loadingItems"
                :dropdown-style="{ maxHeight: '280px', overflow: 'auto' }"
                @search="buscarItems"
                @focus="!items.length && buscarItems()"
              >
                <a-select-option v-for="item in items" :key="item.codigoItem" :value="item.codigoItem">
                  {{ item.codigoItem }} - {{ item.nombre }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="4">
            <a-form-item label="Dias" required>
              <a-input-number
                v-model:value="evolucionForm.dias"
                :min="7"
                :max="120"
                :precision="0"
                placeholder="7 a 120, sugerido 30"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="4">
            <a-form-item label="Guardar alertas">
              <a-switch v-model:checked="evolucionForm.guardarAlertas" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="4" class="form-actions">
            <a-button type="primary" :loading="loadingEvolucion" @click="consultarEvolucion">
              Ver evolucion
            </a-button>
          </a-col>
        </a-row>
      </a-form>

      <a-alert
        type="info"
        show-icon
        class="legend-alert"
        message="Criterio de evolucion"
        description="Consumo diario es SALIDA menos DEVOLUCION. Tendencia es el promedio movil de 7 dias. Evento destacado aparece cuando abs(Z Score) >= 2.0 y el consumo diario es mayor a 0."
      />

      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :lg="14">
          <v-chart class="consumo-chart" :option="evolucionChartOption" :loading="loadingEvolucion" autoresize />
        </a-col>
        <a-col :xs="24" :lg="10">
          <a-row :gutter="[12, 12]" class="decision-grid">
            <a-col :xs="12" :sm="6" :lg="12">
              <a-card size="small">
                <a-statistic title="Dias evaluados" :value="evolucionResumen.dias" />
              </a-card>
            </a-col>
            <a-col :xs="12" :sm="6" :lg="12">
              <a-card size="small">
                <a-statistic title="Consumo total" :value="evolucionResumen.consumoTotal" />
              </a-card>
            </a-col>
            <a-col :xs="12" :sm="6" :lg="12">
              <a-card size="small">
                <a-statistic title="Eventos" :value="evolucionResumen.eventos" />
              </a-card>
            </a-col>
            <a-col :xs="12" :sm="6" :lg="12">
              <a-card size="small">
                <a-statistic title="Max Z Score" :value="evolucionResumen.maxZScore" :precision="2" />
              </a-card>
            </a-col>
          </a-row>
        </a-col>
        <a-col :xs="24">
          <a-table
            class="consumo-data-table"
            :columns="resolvedEvolucionColumns"
            :data-source="evolucion"
            :loading="loadingEvolucion"
            :pagination="false"
            :scroll="{ x: 960, y: 360 }"
            size="small"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="['consumoDiario', 'tendencia', 'zScore'].includes(column.dataIndex)">
                {{ formatNumber(record[column.dataIndex]) }}
              </template>
              <template v-else-if="column.dataIndex === 'eventoDestacado'">
                <a-tag :color="booleanTag(record.eventoDestacado, 'Evento', 'Normal').color">
                  {{ booleanTag(record.eventoDestacado, 'Evento', 'Normal').text }}
                </a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'explicacion'">
                <a-tooltip :title="record.explicacion">
                  <span class="table-text">{{ record.explicacion || '-' }}</span>
                </a-tooltip>
              </template>
              <template v-else-if="typeof record[column.dataIndex] === 'boolean'">
                <a-tag :color="booleanTag(record[column.dataIndex]).color">
                  {{ booleanTag(record[column.dataIndex]).text }}
                </a-tag>
              </template>
              <template v-else>
                {{ valueToText(record[column.dataIndex]) }}
              </template>
            </template>
          </a-table>
        </a-col>
      </a-row>
    </a-card>

    <a-card v-if="activePanel === 'proyeccion'" title="Proyeccion de consumo">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :md="8">
            <a-form-item label="Item" required>
              <a-select
                v-model:value="proyeccionForm.itemCodigo"
                show-search
                allow-clear
                placeholder="Buscar item"
                :filter-option="false"
                :loading="loadingItems"
                :dropdown-style="{ maxHeight: '280px', overflow: 'auto' }"
                @search="buscarItems"
                @focus="!items.length && buscarItems()"
              >
                <a-select-option v-for="item in items" :key="item.codigoItem" :value="item.codigoItem">
                  {{ item.codigoItem }} - {{ item.nombre }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="5">
            <a-form-item label="Dias historicos" required>
              <a-input-number
                v-model:value="proyeccionForm.diasHist"
                :min="15"
                :max="180"
                :precision="0"
                placeholder="15 a 180, sugerido 60"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="5">
            <a-form-item label="Dias futuro" required>
              <a-input-number
                v-model:value="proyeccionForm.diasFuturo"
                :min="1"
                :max="60"
                :precision="0"
                placeholder="1 a 60, sugerido 15"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="6" class="form-actions">
            <a-button type="primary" :loading="loadingProyeccion" @click="consultarProyeccion">
              Proyectar consumo
            </a-button>
          </a-col>
        </a-row>
      </a-form>

      <a-alert
        v-if="proyeccionContent.explicacionGeneral"
        :type="proyeccion.length ? 'info' : 'warning'"
        show-icon
        class="legend-alert"
        message="Resultado de proyeccion"
        :description="proyeccionContent.explicacionGeneral"
      />

      <a-alert
        v-if="proyeccion.length"
        type="info"
        show-icon
        class="legend-alert"
        message="Lectura de variacion"
        description="La desviacion diaria indica que tan irregular fue el consumo historico: si es alta frente al promedio, el consumo no fue uniforme."
      />

      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :lg="14">
          <v-chart class="consumo-chart" :option="proyeccionChartOption" :loading="loadingProyeccion" autoresize />
        </a-col>
        <a-col :xs="24" :lg="10">
          <a-row :gutter="[12, 12]" class="decision-grid">
            <a-col :xs="12">
              <a-tooltip title="Cantidad de dias futuros devueltos en content.resultados. Normalmente coincide con Dias futuro.">
                <a-card size="small">
                  <a-statistic title="Periodos" :value="proyeccionResumen.periodos" />
                </a-card>
              </a-tooltip>
            </a-col>
            <a-col :xs="12">
              <a-tooltip title="Suma de consumoEstimado en todos los periodos proyectados. Representa el total estimado para los dias futuros.">
                <a-card size="small">
                  <a-statistic title="Consumo proyectado" :value="proyeccionResumen.consumoTotal" />
                </a-card>
              </a-tooltip>
            </a-col>
            <a-col :xs="12">
              <a-tooltip title="consumoPromedioDiario viene del resumen del backend y representa el consumo promedio por dia calculado con el historial.">
                <a-card size="small">
                  <a-statistic title="Promedio diario" :value="proyeccionResumen.promedioDiario" :precision="2" />
                </a-card>
              </a-tooltip>
            </a-col>
            <a-col :xs="12">
              <a-tooltip title="desviacionStdDiaria mide que tanto varia el consumo diario respecto al promedio. Si es alta, el consumo diario es irregular; si es baja, el consumo es mas estable.">
                <a-card size="small">
                  <a-statistic title="Desviacion diaria" :value="proyeccionResumen.desviacionDiaria" :precision="2" />
                </a-card>
              </a-tooltip>
            </a-col>
          </a-row>
        </a-col>
        <a-col :xs="24">
          <a-table
            class="consumo-data-table"
            :columns="proyeccionColumns"
            :data-source="proyeccion"
            :loading="loadingProyeccion"
            :pagination="false"
            :scroll="{ x: 970, y: 360 }"
            size="small"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'consumoEstimado'">
                {{ formatNumber(record.consumoEstimado) }}
              </template>
              <template v-else-if="column.dataIndex === 'explicacion'">
                <a-tooltip :title="record.explicacion">
                  <span class="table-text">{{ record.explicacion || '-' }}</span>
                </a-tooltip>
              </template>
              <template v-else>
                {{ valueToText(record[column.dataIndex]) }}
              </template>
            </template>
          </a-table>
        </a-col>
      </a-row>
    </a-card>

    <a-card v-if="activePanel === 'alertas'" title="Alertas de consumo">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :md="5">
            <a-form-item label="Tipo">
              <a-select
                v-model:value="alertasForm.tipo"
                allow-clear
                placeholder="Tipo de alerta"
                :options="alertaTipoOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="4">
            <a-form-item label="Referencia">
              <a-select
                v-model:value="alertasForm.referenciaTipo"
                allow-clear
                placeholder="Referencia"
                :options="referenciaTipoOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="4">
            <a-form-item label="Codigo referencia">
              <a-input
                v-model:value="alertasForm.referenciaCodigo"
                allow-clear
                placeholder="ITEM o cuadrilla"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="4">
            <a-form-item label="Desde">
              <a-date-picker v-model:value="alertasForm.fechaInicio" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="4">
            <a-form-item label="Hasta">
              <a-date-picker v-model:value="alertasForm.fechaFin" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="3">
            <a-form-item label="Limite">
              <a-input-number
                v-model:value="alertasForm.limit"
                :precision="0"
                placeholder="Opcional, default 50"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :xs="24" class="alert-actions">
            <a-space wrap>
              <a-button type="primary" :loading="loadingAlertas" @click="consultarAlertas">
                Buscar alertas
              </a-button>
              <a-button @click="limpiarAlertas">
                Limpiar
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>

      <a-row :gutter="[12, 12]" class="decision-grid alert-summary">
        <a-col :xs="12" :md="6">
          <a-card size="small">
            <a-statistic title="Alertas" :value="alertasResumen.total" />
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card size="small">
            <a-statistic title="Consumo anomalo" :value="alertasResumen.consumoAnomalo" :value-style="{ color: '#dc2626' }" />
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card size="small">
            <a-statistic title="Evento consumo" :value="alertasResumen.eventoConsumo" :value-style="{ color: '#f59e0b' }" />
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card size="small">
            <a-statistic title="Sin referencia" :value="alertasResumen.sinReferencia" :value-style="{ color: '#64748b' }" />
          </a-card>
        </a-col>
      </a-row>

      <a-table
        class="consumo-data-table"
        :columns="alertasColumns"
        :data-source="alertas"
        :loading="loadingAlertas"
        :pagination="false"
        :scroll="{ x: 1080, y: 420 }"
        size="small"
        row-key="idAlerta"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'fechaAlerta'">
            {{ formatDateTime(record.fechaAlerta) }}
          </template>
          <template v-else-if="column.dataIndex === 'referenciaCodigo'">
            <a-space size="small">
              <a-tag>{{ record.referenciaTipo || '-' }}</a-tag>
              <span>{{ record.referenciaCodigo || '-' }}</span>
            </a-space>
          </template>
          <template v-else-if="column.dataIndex === 'descripcion'">
            <a-tooltip :title="record.descripcion">
              <span class="table-text">{{ record.descripcion || '-' }}</span>
            </a-tooltip>
          </template>
          <template v-else>
            {{ valueToText(record[column.dataIndex]) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
.consumo-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-actions {
  display: flex;
  align-items: center;
}

.decision-grid {
  margin-bottom: 16px;
}

.alert-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: -4px;
  margin-bottom: 16px;
}

.alert-summary {
  margin-top: 0;
}

.legend-alert {
  margin-bottom: 16px;
}

.table-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  white-space: nowrap;
}

.consumo-data-table {
  width: 100%;
}

.consumo-data-table :deep(.ant-table-content) {
  overflow-x: auto !important;
}

.consumo-data-table :deep(.ant-table-thead > tr > th),
.consumo-data-table :deep(.ant-table-tbody > tr > td) {
  white-space: nowrap;
}

.consumo-data-table :deep(.ant-pagination) {
  padding-right: 8px;
}

.consumo-chart {
  width: 100%;
  height: 320px;
}

@media (max-width: 767px) {
  .form-actions,
  .alert-actions,
  .alert-actions :deep(.ant-space),
  .form-actions :deep(.ant-btn) {
    width: 100%;
  }

  .alert-actions :deep(.ant-space-item),
  .alert-actions :deep(.ant-btn) {
    width: 100%;
  }
}
</style>
