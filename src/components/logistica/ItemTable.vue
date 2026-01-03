<script setup>
defineProps({
  data: Array,
  loading: Boolean,
  pagination: Object
})

const emit = defineEmits(['change'])

const columns = [
  { title: 'Código', dataIndex: 'codigoItem', sorter: true },
  { title: 'Nombre', dataIndex: 'nombre', sorter: true },
  { title: 'Tipo', dataIndex: 'tipo' },
  { title: 'Estado', dataIndex: 'enabled' },
  { title: '', dataIndex: 'actions', fixed: 'right', width: 1 }
]

const handleChange = (pagination, filters, sorter) => {
  emit('change', pagination, filters, sorter)
}
</script>

<template>
  <a-table :columns="columns" :data-source="data" :loading="loading" :scroll="{ x: 'max-content' }" row-key="codigoItem"
    :pagination="{
      ...pagination,
      showTotal: (total, range) => `${range[0]}–${range[1]} de ${total} items`,
    }" @change="handleChange">
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
