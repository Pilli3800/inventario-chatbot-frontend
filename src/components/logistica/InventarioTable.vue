<script setup>
defineProps({
  data: Array,
  loading: Boolean,
  pagination: Object
})

const emit = defineEmits(['change'])

const columns = [
  { title: 'Sede', dataIndex: 'sedeCodigo' },
  { title: 'Código Item', dataIndex: 'codigoItem' },
  { title: 'Nombre', dataIndex: 'nombreItem' },
  { title: 'Tipo', dataIndex: 'tipoItem' },
  { title: 'Stock', dataIndex: 'stock' },
  { title: 'Reabastecer', dataIndex: 'stockCritico' },
  { title: '', dataIndex: 'actions', fixed: 'right', width: 60 }
]

const handleChange = (pagination) => emit('change', pagination)
</script>

<template>
  <a-table :columns="columns" :data-source="data" :loading="loading" :scroll="{ x: 720 }" row-key="id"
    :pagination="pagination" @change="handleChange">
    <template #bodyCell="slotProps">
      <slot name="bodyCell" v-bind="slotProps" />

      <template v-if="slotProps.column.dataIndex === 'stockCritico'">
        <a-tag :color="slotProps.record.stockCritico ? 'red' : 'green'">
          {{ slotProps.record.stockCritico ? 'Sí' : 'No' }}
        </a-tag>
      </template>
    </template>
  </a-table>
</template>
