<script setup>
import { formatDateTime } from '@/utils/date'

const props = defineProps({
  modo: {
    type: String,
    default: 'movimientos'
  },
  itemsMasMovidos: {
    type: Array,
    default: () => []
  },
  stockMovido: {
    type: Array,
    default: () => []
  },
  pendientesCierre: {
    type: Array,
    default: () => []
  },
  porServicio: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

const columnasItemsMasMovidos = [
  { title: 'Codigo', dataIndex: 'codigoItem', width: 110 },
  { title: 'Item', dataIndex: 'nombreItem', ellipsis: true },
  {
    title: 'Movimientos',
    dataIndex: 'cantidadMovimientos',
    width: 130,
    align: 'right'
  }
]

const columnasStockMovido = [
  { title: 'Codigo', dataIndex: 'codigoItem', width: 110 },
  { title: 'Item', dataIndex: 'nombreItem', ellipsis: true },
  {
    title: 'Total movido',
    dataIndex: 'totalMovido',
    width: 130,
    align: 'right'
  }
]

const columnasPendientesCierre = [
  { title: 'Solicitud', dataIndex: 'id', width: 100 },
  { title: 'Servicio', dataIndex: 'servicioOrigenCodigo', width: 120 },
  { title: 'Cuadrilla', dataIndex: 'codigoCuadrilla', width: 120 },
  { title: 'Estado', dataIndex: 'estado', width: 120 },
  { title: 'Fecha entrega', dataIndex: 'fechaEntrega', width: 170 }
]

const columnasPorServicio = [
  { title: 'Servicio', dataIndex: 'servicioOrigenCodigo', width: 120 },
  { title: 'Total', dataIndex: 'total', width: 90, align: 'right' },
  { title: 'Entregadas', dataIndex: 'entregadas', width: 120, align: 'right' },
  { title: 'Devueltas', dataIndex: 'devueltas', width: 110, align: 'right' },
  { title: 'Cerradas sin dev.', dataIndex: 'cerradasSinDevolucion', width: 150, align: 'right' }
]
</script>

<template>
  <a-row :gutter="[16, 16]">
    <a-col v-if="props.modo === 'solicitudes'" :xs="24" :lg="12">
      <a-card class="tabla-card" title="Entregadas pendientes de cierre">
        <a-table
          :columns="columnasPendientesCierre"
          :data-source="props.pendientesCierre"
          :loading="loading"
          row-key="id"
          size="small"
          :pagination="false"
          :scroll="{ x: 640 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'fechaEntrega'">
              {{ formatDateTime(record.fechaEntrega) }}
            </template>
          </template>
        </a-table>
      </a-card>
    </a-col>

    <a-col v-if="props.modo === 'solicitudes'" :xs="24" :lg="12">
      <a-card class="tabla-card" title="Resumen por servicio">
        <a-table
          :columns="columnasPorServicio"
          :data-source="props.porServicio"
          :loading="loading"
          row-key="servicioOrigenCodigo"
          size="small"
          :pagination="false"
          :scroll="{ x: 640 }"
        />
      </a-card>
    </a-col>

    <a-col v-if="props.modo === 'movimientos'" :xs="24" :lg="12">
      <a-card class="tabla-card" title="Items con mas movimientos">
        <a-table
          :columns="columnasItemsMasMovidos"
          :data-source="props.itemsMasMovidos"
          :loading="loading"
          row-key="codigoItem"
          size="small"
          :pagination="false"
          :scroll="{ x: 520 }"
        />
      </a-card>
    </a-col>

    <a-col v-if="props.modo === 'movimientos'" :xs="24" :lg="12">
      <a-card class="tabla-card" title="Items con mayor stock movido">
        <a-table
          :columns="columnasStockMovido"
          :data-source="props.stockMovido"
          :loading="loading"
          row-key="codigoItem"
          size="small"
          :pagination="false"
          :scroll="{ x: 520 }"
        />
      </a-card>
    </a-col>
  </a-row>
</template>

<style scoped>
.tabla-card {
  height: 100%;
}
</style>
