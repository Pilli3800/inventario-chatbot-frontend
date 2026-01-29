<!-- MovimientosTable.vue -->
<script setup>
import { formatDateTime } from '@/utils/date'
import { computed } from 'vue'

const props = defineProps({
  data: Array,
  loading: Boolean,
  pagination: Object,
  sorter: Object
})

const emit = defineEmits(['change'])

const columns = computed(() => [
  {
    title: 'Fecha',
    dataIndex: 'fechaMovimiento',
    width: 180,
    sorter: true,
    sortOrder:
      props.sorter?.field === 'fechaMovimiento'
        ? props.sorter.order
        : null
  },
  { title: 'Tipo', dataIndex: 'tipoMovimiento', width: 120 },
  { title: 'Código Item', dataIndex: 'codigoItem', width: 120 },
  { title: 'Nombre Item', dataIndex: 'nombreItem', width: 200 },
  {
    title: 'Cantidad',
    dataIndex: 'cantidad',
    width: 100,
    sorter: true,
    sortOrder:
      props.sorter?.field === 'cantidad'
        ? props.sorter.order
        : null
  },
  { title: 'Sede Origen', dataIndex: 'sedeOrigen', width: 120 },
  { title: 'Sede Destino', dataIndex: 'sedeDestino', width: 120 },
  { title: 'Cuadrilla', dataIndex: 'codigoCuadrilla', width: 120 },
  { title: 'Servicio', dataIndex: 'servicio', width: 120 },
  { title: 'Usuario', dataIndex: 'usuario', width: 140 },
  { title: 'Observaciones', dataIndex: 'observaciones', width: 260 },
  {
    title: ' ',
    dataIndex: 'actions',
    key: 'actions',
    fixed: 'right',
    width: 60,
    align: 'center',
    ellipsis: true
  }

])

const handleChange = (pagination, filters, sorter) => {
  emit('change', pagination, filters, sorter)
}
</script>

<template>
  <a-table :columns="columns" :data-source="data" :loading="loading" row-key="id" :pagination="pagination"
    table-layout="fixed" :scroll="{ y: 300, x: '100%' }" @change="handleChange">
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'fechaMovimiento'">
        {{ formatDateTime(record.fechaMovimiento) }}
      </template>

      <template v-else-if="column.dataIndex === 'tipoMovimiento'">
        <a-tag :color="{
          ENTRADA: 'green',
          SALIDA: 'volcano',
          TRANSFERENCIA: 'blue',
          DEVOLUCION: 'gold'
        }[record.tipoMovimiento]">
          {{ record.tipoMovimiento }}
        </a-tag>
      </template>


      <template v-else-if="column.dataIndex === 'actions'">
        <slot name="bodyCell" :column="column" :record="record" />
      </template>

      <template v-else-if="column.dataIndex === 'cantidad'">
        <span style="font-weight: 600;">
          {{ record.cantidad }}
        </span>
      </template>

      <template v-else-if="column.dataIndex === 'sedeOrigen'">
        <a-tag v-if="record.sedeOrigen" color="red">
          {{ record.sedeOrigen }}
        </a-tag>
        <span v-else>—</span>
      </template>

      <template v-else-if="column.dataIndex === 'servicio'">
        <a-tooltip v-if="record.servicio" :title="record.servicio.nombre">
          <span class="truncate">
            {{ record.servicio.codigo }}
          </span>
        </a-tooltip>
        <span v-else>—</span>
      </template>

      <template v-else-if="column.dataIndex === 'sedeDestino'">
        <a-tag v-if="record.sedeDestino" color="green">
          {{ record.sedeDestino }}
        </a-tag>
        <span v-else>—</span>
      </template>

      <template v-else-if="column.dataIndex === 'observaciones'">
        <a-tooltip v-if="record.observaciones" :title="record.observaciones">
          <span class="truncate">
            {{ record.observaciones }}
          </span>
        </a-tooltip>
        <span v-else>—</span>
      </template>


      <template v-else>
        {{ record[column.dataIndex] ?? '—' }}
      </template>


    </template>
  </a-table>
</template>


<style scoped>
.truncate {
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
</style>
