<script setup>
import { computed, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import {
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExportOutlined,
  InboxOutlined,
  ImportOutlined,
  MessageOutlined,
  RobotOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  SwapOutlined,
  TransactionOutlined,
  UndoOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import GraficosIADashboard from '@/components/dashboard/GraficosIADashboard.vue'
import GraficosMovimientos from '@/components/dashboard/GraficosMovimientos.vue'
import GraficosSolicitudes from '@/components/dashboard/GraficosSolicitudes.vue'
import TablasItemsMovidos from '@/components/dashboard/TablasItemsMovidos.vue'
import TablasIADashboard from '@/components/dashboard/TablasIADashboard.vue'
import { movimientosService } from '@/services/movimientos.service'
import { solicitudItemsService } from '@/services/solicitud-items.service'
import { chatbotService } from '@/services/chatbot.service'

const loading = ref(false)
const loadingMovimientos = ref(false)
const loadingIA = ref(false)
const loadingItems = ref(false)
const solicitudDashboard = ref(null)
const movimientoDashboard = ref(null)
const iaDashboard = ref(null)
const itemsMasMovidos = ref([])
const stockMovido = ref([])

const filtros = reactive({
  fechaInicio: dayjs().subtract(30, 'day'),
  fechaFin: dayjs()
})

const resumenSolicitudes = computed(() => solicitudDashboard.value || {
  total: 0,
  abiertas: 0,
  finales: 0,
  pendientes: 0,
  aprobadas: 0,
  rechazadas: 0,
  entregadas: 0,
  devueltas: 0,
  cerradasSinDevolucion: 0,
  porEstado: {},
  porServicio: [],
  pendientesCierre: [],
  topCuadrillas: []
})

const resumenMovimientos = computed(() => movimientoDashboard.value || {
  total: 0,
  compra: 0,
  entrada: 0,
  salida: 0,
  salidaCuadrilla: 0,
  devolucion: 0,
  transferencia: 0,
  transferenciaServicio: 0,
  retornoASede: 0
})

const resumenIA = computed(() => iaDashboard.value || {
  totalConsultas: 0,
  consultasExitosas: 0,
  consultasFallidas: 0,
  totalSesiones: 0,
  usuariosQueUsaronIA: 0,
  totalUsuariosActivos: 0,
  porcentajeUsuariosQueUsaronIA: 0,
  promedioConsultasPorSesion: 0,
  consultasHoy: 0,
  consultasUltimos7Dias: 0,
  consultasUltimos30Dias: 0,
  porFecha: [],
  topUsuarios: []
})

const seriesMovimientosPorFecha = computed(() =>
  resumenMovimientos.value.porFecha || []
)

const tarjetas = computed(() => [
  {
    titulo: 'Solicitudes',
    valor: resumenSolicitudes.value.total,
    detalle: 'Total de solicitudes en el periodo filtrado.',
    color: '#0f172a',
    icono: BarChartOutlined
  },
  {
    titulo: 'Abiertas',
    valor: resumenSolicitudes.value.abiertas,
    detalle: 'PENDIENTE, APROBADA y ENTREGADO.',
    color: '#2563eb',
    icono: ClockCircleOutlined
  },
  {
    titulo: 'Entregadas',
    valor: resumenSolicitudes.value.entregadas,
    detalle: 'Solicitudes entregadas pendientes de devolucion o cierre.',
    color: '#f59e0b',
    icono: InboxOutlined
  },
  {
    titulo: 'Devueltas',
    valor: resumenSolicitudes.value.devueltas,
    detalle: 'Solicitudes con devolucion registrada y comprobante generado.',
    color: '#7c3aed',
    icono: UndoOutlined
  },
  {
    titulo: 'Cerradas sin dev.',
    valor: resumenSolicitudes.value.cerradasSinDevolucion,
    detalle: 'Solicitudes cerradas sin devolucion de materiales.',
    color: '#64748b',
    icono: CheckCircleOutlined
  },
  {
    titulo: 'Rechazadas',
    valor: resumenSolicitudes.value.rechazadas,
    detalle: 'Solicitudes rechazadas.',
    color: '#dc2626',
    icono: StopOutlined
  }
])

const tarjetasMovimientos = computed(() => [
  {
    titulo: 'Movimientos',
    valor: resumenMovimientos.value.total,
    detalle: 'Total de movimientos historicos en el periodo filtrado.',
    color: '#0f172a',
    icono: BarChartOutlined
  },
  {
    titulo: 'Compra',
    valor: resumenMovimientos.value.compra,
    detalle: 'Movimientos tipo COMPRA.',
    color: '#16a34a',
    icono: ImportOutlined
  },
  {
    titulo: 'Entrada',
    valor: resumenMovimientos.value.entrada,
    detalle: 'Movimientos tipo ENTRADA.',
    color: '#22c55e',
    icono: InboxOutlined
  },
  {
    titulo: 'Salida',
    valor: resumenMovimientos.value.salida,
    detalle: 'Movimientos tipo SALIDA.',
    color: '#dc2626',
    icono: ExportOutlined
  },
  {
    titulo: 'Salida cuadrilla',
    valor: resumenMovimientos.value.salidaCuadrilla,
    detalle: 'Movimientos tipo SALIDA_CUADRILLA.',
    color: '#f97316',
    icono: ExportOutlined
  },
  {
    titulo: 'Devolucion',
    valor: resumenMovimientos.value.devolucion,
    detalle: 'Movimientos historicos tipo DEVOLUCION.',
    color: '#2563eb',
    icono: UndoOutlined
  },
  {
    titulo: 'Transferencia',
    valor: resumenMovimientos.value.transferencia,
    detalle: 'Movimientos tipo TRANSFERENCIA.',
    color: '#7c3aed',
    icono: SwapOutlined
  },
  {
    titulo: 'Transf. servicio',
    valor: resumenMovimientos.value.transferenciaServicio,
    detalle: 'Movimientos tipo TRANSFERENCIA_SERVICIO.',
    color: '#a855f7',
    icono: TransactionOutlined
  },
  {
    titulo: 'Retorno a sede',
    valor: resumenMovimientos.value.retornoASede,
    detalle: 'Movimientos tipo RETORNO_A_SEDE.',
    color: '#64748b',
    icono: CheckCircleOutlined
  }
])

const tarjetasIA = computed(() => [
  {
    titulo: 'Consultas',
    valor: resumenIA.value.totalConsultas,
    detalle: 'Total de mensajes enviados al asistente.',
    color: '#0f172a',
    icono: MessageOutlined
  },
  {
    titulo: 'Exitosas',
    valor: resumenIA.value.consultasExitosas,
    detalle: 'Consultas respondidas correctamente.',
    color: '#16a34a',
    icono: CheckCircleOutlined
  },
  {
    titulo: 'Fallidas',
    valor: resumenIA.value.consultasFallidas,
    detalle: 'Consultas con error.',
    color: '#dc2626',
    icono: StopOutlined
  },
  {
    titulo: 'Sesiones',
    valor: resumenIA.value.totalSesiones,
    detalle: 'Sesiones distintas usadas.',
    color: '#2563eb',
    icono: RobotOutlined
  },
  {
    titulo: 'Usuarios IA',
    valor: resumenIA.value.usuariosQueUsaronIA,
    detalle: 'Usuarios distintos que usaron el asistente.',
    color: '#7c3aed',
    icono: UserOutlined
  },
  {
    titulo: 'Adopcion',
    valor: resumenIA.value.porcentajeUsuariosQueUsaronIA,
    detalle: 'Porcentaje de usuarios activos que usaron IA.',
    color: '#f59e0b',
    icono: TransactionOutlined,
    suffix: '%'
  },
  {
    titulo: 'Prom. sesion',
    valor: resumenIA.value.promedioConsultasPorSesion,
    detalle: 'Promedio de consultas por sesion.',
    color: '#64748b',
    icono: BarChartOutlined
  },
  {
    titulo: 'Hoy',
    valor: resumenIA.value.consultasHoy,
    detalle: 'Consultas realizadas hoy.',
    color: '#0ea5e9',
    icono: ClockCircleOutlined
  }
])

const getFiltrosFecha = () => ({
  fechaDesde: filtros.fechaInicio
    ? dayjs(filtros.fechaInicio).format('YYYY-MM-DD')
    : undefined,
  fechaHasta: filtros.fechaFin
    ? dayjs(filtros.fechaFin).format('YYYY-MM-DD')
    : undefined
})

const cargarDashboard = async () => {
  loading.value = true

  try {
    const params = {
      ...getFiltrosFecha(),
      incluirRankingCuadrillas: true
    }

    const { data } = await solicitudItemsService.getDashboard(params)
    solicitudDashboard.value = data?.data ?? data?.content ?? data
  } finally {
    loading.value = false
  }
}

const cargarMovimientos = async () => {
  loadingMovimientos.value = true

  try {
    const params = {
      ...getFiltrosFecha(),
      porFechas: true
    }

    const { data } = await movimientosService.getDashboard(params)
    movimientoDashboard.value = data?.data ?? data?.content ?? data
  } finally {
    loadingMovimientos.value = false
  }
}

const cargarDashboardIA = async () => {
  loadingIA.value = true

  try {
    const { data } = await chatbotService.getDashboard(getFiltrosFecha())
    iaDashboard.value = data?.content ?? data?.data ?? data
  } finally {
    loadingIA.value = false
  }
}

const cargarItemsMovidos = async () => {
  loadingItems.value = true

  try {
    const params = getFiltrosFecha()

    try {
      const { data } = await movimientosService.getItemsMasMovidos(params)
      itemsMasMovidos.value = (data || []).slice(0, 10)
    } catch {
      itemsMasMovidos.value = []
    }

    try {
      const { data } = await movimientosService.getStockMovido(params)
      stockMovido.value = (data || [])
        .sort((a, b) => b.totalMovido - a.totalMovido)
        .slice(0, 10)
    } catch {
      stockMovido.value = []
    }
  } finally {
    loadingItems.value = false
  }
}

const cargarDatos = () => {
  cargarDashboard()
  cargarMovimientos()
  cargarDashboardIA()
  cargarItemsMovidos()
}

const limpiarFiltros = () => {
  filtros.fechaInicio = dayjs().subtract(30, 'day')
  filtros.fechaFin = dayjs()
  cargarDatos()
}

cargarDatos()
</script>

<template>
  <div class="dashboard">
    <a-card class="dashboard-header" :body-style="{ padding: '22px' }">
      <a-row :gutter="[16, 16]" align="middle" justify="space-between">
        <a-col :xs="24" :lg="12">
          <h2>Dashboard</h2>
          <p>Trazabilidad de solicitudes, devoluciones e inventario</p>
        </a-col>

        <a-col :xs="24" :lg="12" class="filtros-col">
          <a-card size="small" class="filtros-card" :body-style="{ padding: 0 }">
            <a-space class="filtros-space" wrap>
              <a-date-picker v-model:value="filtros.fechaInicio" class="filtro-fecha" placeholder="Desde" />
              <a-date-picker v-model:value="filtros.fechaFin" class="filtro-fecha" placeholder="Hasta" />
              <a-button type="primary" :loading="loading || loadingMovimientos || loadingIA || loadingItems" @click="cargarDatos">
                <SearchOutlined />
                Buscar
              </a-button>
              <a-button @click="limpiarFiltros">
                <ReloadOutlined />
                Limpiar
              </a-button>
            </a-space>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <a-tabs>
      <a-tab-pane key="solicitudes" tab="Solicitudes">
        <div class="tab-content">
        <a-row :gutter="[16, 16]" class="resumen-grid">
          <a-col v-for="tarjeta in tarjetas" :key="tarjeta.titulo" :xs="24" :sm="12" :lg="8" :xl="4">
            <a-tooltip :title="tarjeta.detalle" placement="top">
              <a-card class="resumen-card" :body-style="{ padding: '18px' }">
                <a-statistic :title="tarjeta.titulo" :value="tarjeta.valor">
                  <template #prefix>
                    <span class="resumen-icono" :style="{ color: tarjeta.color, backgroundColor: `${tarjeta.color}14` }">
                      <component :is="tarjeta.icono" />
                    </span>
                  </template>
                </a-statistic>
              </a-card>
            </a-tooltip>
          </a-col>
        </a-row>

        <GraficosSolicitudes :dashboard="resumenSolicitudes" :loading="loading" />

        <TablasItemsMovidos
          :pendientes-cierre="resumenSolicitudes.pendientesCierre"
          :por-servicio="resumenSolicitudes.porServicio"
          :top-cuadrillas="resumenSolicitudes.topCuadrillas"
          :loading="loading"
          modo="solicitudes"
        />
        </div>
      </a-tab-pane>

      <a-tab-pane key="movimientos" tab="Movimientos">
        <div class="tab-content">
        <a-row :gutter="[16, 16]" class="resumen-grid">
          <a-col v-for="tarjeta in tarjetasMovimientos" :key="tarjeta.titulo" :xs="24" :sm="12" :lg="8" :xl="4">
            <a-tooltip :title="tarjeta.detalle" placement="top">
              <a-card class="resumen-card" :body-style="{ padding: '18px' }">
                <a-statistic :title="tarjeta.titulo" :value="tarjeta.valor">
                  <template #prefix>
                    <span class="resumen-icono" :style="{ color: tarjeta.color, backgroundColor: `${tarjeta.color}14` }">
                      <component :is="tarjeta.icono" />
                    </span>
                  </template>
                </a-statistic>
              </a-card>
            </a-tooltip>
          </a-col>
        </a-row>

        <GraficosMovimientos
          :dashboard="resumenMovimientos"
          :series-por-fecha="seriesMovimientosPorFecha"
          :loading="loadingMovimientos"
        />

        <TablasItemsMovidos
          :items-mas-movidos="itemsMasMovidos"
          :stock-movido="stockMovido"
          :loading="loadingItems"
          modo="movimientos"
        />
        </div>
      </a-tab-pane>

      <a-tab-pane key="ia" tab="Asistente IA">
        <div class="tab-content">
        <a-row :gutter="[16, 16]" class="resumen-grid">
          <a-col v-for="tarjeta in tarjetasIA" :key="tarjeta.titulo" :xs="24" :sm="12" :lg="8" :xl="6">
            <a-tooltip :title="tarjeta.detalle" placement="top">
              <a-card class="resumen-card" :body-style="{ padding: '18px' }">
                <a-statistic :title="tarjeta.titulo" :value="tarjeta.valor" :suffix="tarjeta.suffix">
                  <template #prefix>
                    <span class="resumen-icono" :style="{ color: tarjeta.color, backgroundColor: `${tarjeta.color}14` }">
                      <component :is="tarjeta.icono" />
                    </span>
                  </template>
                </a-statistic>
              </a-card>
            </a-tooltip>
          </a-col>
        </a-row>

        <GraficosIADashboard :dashboard="resumenIA" :loading="loadingIA" />

        <TablasIADashboard
          :top-usuarios="resumenIA.topUsuarios"
          :loading="loadingIA"
        />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-header {
  border: 0;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
}

.dashboard-header h2 {
  margin: 0;
  color: #0f172a;
}

.dashboard-header p {
  margin: 6px 0 0;
  color: #0f172a;
}

.filtros-col {
  display: flex;
  justify-content: flex-end;
}

.filtros-card {
  border: 0;
  background: transparent;
  box-shadow: none;
}

.filtro-fecha {
  width: 140px;
}

.resumen-grid {
  margin-top: 2px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 2px;
}

.resumen-card {
  height: 100%;
  border: 0;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
}

.resumen-icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 4px;
  border-radius: 8px;
  font-size: 18px;
}

@media (max-width: 991px) {
  .filtros-col {
    justify-content: flex-start;
  }

  .filtros-card,
  .filtros-space,
  .filtros-space :deep(.ant-space-item),
  .filtro-fecha,
  .filtros-card :deep(.ant-btn) {
    width: 100%;
  }
}
</style>
