<script setup>
defineProps({
  data: Array,
  loading: Boolean,
  pagination: Object
})

const emit = defineEmits(['change'])

const columns = [
  { title: 'Código', dataIndex: 'codigo', sorter: true, width: 100 },
  { title: 'Nombre', dataIndex: 'nombre', width: 150 },
  { title: 'Descripción', dataIndex: 'descripcion', width: 200 },
  { title: 'Estado', dataIndex: 'enabled', width: 100 },
  {
    title: '',
    dataIndex: 'actions',
    fixed: 'right',
    width: 60
  }
]

const handleChange = (pagination, filters, sorter) => {
  emit('change', pagination, filters, sorter)
}
</script>

<template>
  <a-table :columns="columns" :data-source="data" :loading="loading" row-key="codigo" :scroll="{ x: 720 }"
    :pagination="pagination" @change="handleChange">
    <template #bodyCell="slotProps">
      <slot name="bodyCell" v-bind="slotProps" />

      <!-- Estado -->
      <template v-if="slotProps.column.dataIndex === 'enabled'">
        <a-tag :color="slotProps.record.enabled ? 'green' : 'red'">
          {{ slotProps.record.enabled ? 'Activo' : 'Inactivo' }}
        </a-tag>
      </template>
    </template>
  </a-table>
</template>
