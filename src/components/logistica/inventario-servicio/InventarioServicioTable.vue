<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: Array,
  loading: Boolean,
  pagination: Object,
  sorter: Object
})

const emit = defineEmits(['change'])

const columns = computed(() => [
  { title: 'Servicio', dataIndex: 'codigoServicio', width: 120 },
  {
    title: 'Codigo Item',
    dataIndex: 'codigoItem',
    width: 130
  },
  {
    title: 'Nombre Item',
    dataIndex: 'nombreItem',
    width: 220,
    sorter: true,
    sortOrder:
      props.sorter?.field === 'nombreItem'
        ? props.sorter.order
        : null
  },
  { title: 'Tipo', dataIndex: 'tipoItem', width: 130 },
  {
    title: 'Stock',
    dataIndex: 'stockActual',
    width: 100,
    sorter: true,
    sortOrder:
      props.sorter?.field === 'stockActual'
        ? props.sorter.order
        : null
  },
  { title: '', dataIndex: 'actions', fixed: 'right', width: 60 }
])

const handleChange = (pagination, filters, sorter) => {
  emit('change', pagination, filters, sorter)
}

const getStock = (record) => record.stockActual ?? record.stock ?? 0
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    :pagination="pagination"
    :scroll="{ x: 940 }"
    row-key="id"
    @change="handleChange"
  >
    <template #bodyCell="{ column, record }">
      <slot name="bodyCell" :column="column" :record="record" />

      <template v-if="column.dataIndex === 'codigoItem'">
        <strong>{{ record.codigoItem }}</strong>
      </template>

      <template v-else-if="column.dataIndex === 'stockActual'">
        <a-tag :color="getStock(record) > 0 ? 'blue' : 'default'">
          {{ getStock(record) }}
        </a-tag>
      </template>
    </template>
  </a-table>
</template>
