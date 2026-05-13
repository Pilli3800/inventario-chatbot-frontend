<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  data: Array,
  loading: Boolean,
  pagination: Object,
  sorter: Object
})

const emit = defineEmits(['change'])

const columns = computed(() => [
  {
    title: 'Fecha Emision',
    dataIndex: 'fechaEmision',
    width: 140,
    sorter: true,
    sortOrder:
      props.sorter?.field === 'fechaEmision'
        ? props.sorter.order
        : null
  },
  {
    title: 'Numero de Factura',
    dataIndex: 'numeroFactura',
    width: 210
  },
  {
    title: 'Proveedor',
    dataIndex: 'nombreProveedor',
    width: 220
  },
  {
    title: 'Codigo Proveedor',
    dataIndex: 'codigoProveedor',
    width: 140
  },
  {
    title: 'RUC',
    dataIndex: 'rucProveedor',
    width: 140
  },
  {
    title: 'Serie',
    dataIndex: 'serie',
    width: 100
  },
  {
    title: 'Correlativo',
    dataIndex: 'correlativo',
    width: 110
  },
  {
    title: 'Observaciones',
    dataIndex: 'observaciones',
    width: 260
  },
  {
    title: '',
    dataIndex: 'actions',
    fixed: 'right',
    width: 60
  }
])

const handleChange = (pagination, filters, sorter) => {
  emit('change', pagination, filters, sorter)
}

const formatDate = (value) =>
  value ? dayjs(value).format('DD/MM/YYYY') : '-'
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    :pagination="pagination"
    :scroll="{ x: 1400 }"
    :row-key="(record) => `${record.codigoProveedor}-${record.numeroFactura}`"
    @change="handleChange"
  >
    <template #bodyCell="{ column, record }">
      <slot name="bodyCell" :column="column" :record="record" />

      <template v-if="column.dataIndex === 'fechaEmision'">
        {{ formatDate(record.fechaEmision) }}
      </template>

      <template v-else-if="column.dataIndex === 'numeroFactura'">
        <strong>{{ record.numeroFactura }}</strong>
      </template>

      <template v-else-if="column.dataIndex === 'observaciones'">
        <a-tooltip v-if="record.observaciones" :title="record.observaciones">
          <span class="truncate">{{ record.observaciones }}</span>
        </a-tooltip>
        <span v-else>-</span>
      </template>
    </template>
  </a-table>
</template>

<style scoped>
.truncate {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
</style>
