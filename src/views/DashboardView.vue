<script setup>
import { computed, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import {
  BarChartOutlined,
  InboxOutlined,
  ReloadOutlined,
  RiseOutlined,
  SearchOutlined,
  SwapOutlined,
  TransactionOutlined
} from '@ant-design/icons-vue'
import GraficosMovimientos from '@/components/dashboard/GraficosMovimientos.vue'
import TablasItemsMovidos from '@/components/dashboard/TablasItemsMovidos.vue'
import { movimientosService } from '@/services/movimientos.service'

const TIPOS_ENTRADA = ['COMPRA', 'ENTRADA']
const TIPOS_SALIDA = ['SALIDA', 'SALIDA_CUADRILLA']
const TIPOS_DEVOLUCION = ['DEVOLUCION']
const TIPOS_INTERNO = ['TRANSFERENCIA', 'TRANSFERENCIA_SERVICIO', 'RETORNO_A_SEDE']

const loading = ref(false)
const loadingItems = ref(false)
const movimientos = ref([])
const itemsMasMovidos = ref([])
const stockMovido = ref([])

const filtros = reactive({
  fechaInicio: dayjs().subtract(30, 'day'),
  fechaFin: dayjs()
})

const getFechaMovimiento = (movimiento) =>
  dayjs(movimiento.fechaMovimiento).format('DD/MM/YYYY')

const getTipoResumen = (tipoMovimiento) => {
  if (TIPOS_ENTRADA.includes(tipoMovimiento)) return 'entradas'
  if (TIPOS_SALIDA.includes(tipoMovimiento)) return 'salidas'
  if (TIPOS_DEVOLUCION.includes(tipoMovimiento)) return 'devoluciones'
  if (TIPOS_INTERNO.includes(tipoMovimiento)) return 'internos'
  return 'internos'
}

const resumen = computed(() => {
  const totales = {
    total: movimientos.value.length,
    entradas: 0,
    salidas: 0,
    devoluciones: 0,
    internos: 0
  }

  movimientos.value.forEach((movimiento) => {
    const tipo = getTipoResumen(movimiento.tipoMovimiento)
    totales[tipo] += 1
  })

  return totales
})

const seriesPorFecha = computed(() => {
  const agrupado = new Map()

  movimientos.value.forEach((movimiento) => {
    const tipo = getTipoResumen(movimiento.tipoMovimiento)

    const fecha = getFechaMovimiento(movimiento)
    const actual = agrupado.get(fecha) || {
      fecha,
      entradas: 0,
      salidas: 0,
      devoluciones: 0,
      internos: 0
    }

    actual[tipo] += 1
    agrupado.set(fecha, actual)
  })

  return Array.from(agrupado.values())
})

const tarjetas = computed(() => [
  {
    titulo: 'Movimientos',
    valor: resumen.value.total,
    detalle: 'Incluye compras, entradas, salidas, salidas a cuadrilla, devoluciones y movimientos internos.',
    color: '#0f172a',
    icono: BarChartOutlined
  },
  {
    titulo: 'Entradas',
    valor: resumen.value.entradas,
    detalle: 'Incluye COMPRA y ENTRADA.',
    color: '#16a34a',
    icono: InboxOutlined
  },
  {
    titulo: 'Salidas',
    valor: resumen.value.salidas,
    detalle: 'Incluye SALIDA y SALIDA_CUADRILLA.',
    color: '#dc2626',
    icono: RiseOutlined
  },
  {
    titulo: 'Devoluciones',
    valor: resumen.value.devoluciones,
    detalle: 'Incluye DEVOLUCION.',
    color: '#2563eb',
    icono: SwapOutlined
  },
  {
    titulo: 'Internos',
    valor: resumen.value.internos,
    detalle: 'Incluye TRANSFERENCIA, TRANSFERENCIA_SERVICIO y RETORNO_A_SEDE.',
    color: '#7c3aed',
    icono: TransactionOutlined
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
      page: 0,
      size: 1000,
      sort: 'fechaMovimiento,asc'
    }

    const { data } = await movimientosService.search(params)
    movimientos.value = data.content || []
  } finally {
    loading.value = false
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
          <p>Resumen visual de movimientos del inventario</p>
        </a-col>

        <a-col :xs="24" :lg="12" class="filtros-col">
          <a-card size="small" class="filtros-card" :body-style="{ padding: 0 }">
            <a-space class="filtros-space" wrap>
              <a-date-picker v-model:value="filtros.fechaInicio" class="filtro-fecha" placeholder="Desde" />
              <a-date-picker v-model:value="filtros.fechaFin" class="filtro-fecha" placeholder="Hasta" />
              <a-button type="primary" :loading="loading || loadingItems" @click="cargarDatos">
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

    <GraficosMovimientos :resumen="resumen" :series-por-fecha="seriesPorFecha" :loading="loading" />

    <TablasItemsMovidos
      :items-mas-movidos="itemsMasMovidos"
      :stock-movido="stockMovido"
      :loading="loadingItems"
    />
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
