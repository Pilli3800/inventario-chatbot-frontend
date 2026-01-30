<!-- UserTable.vue -->
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
  {
    title: 'Usuario',
    dataIndex: 'identUsuario',
    sorter: true,
    sortOrder:
      props.sorter?.field === 'identUsuario'
        ? props.sorter.order
        : null
  },
  {
    title: 'Nombres',
    dataIndex: 'nombres',
    sorter: true,
    sortOrder:
      props.sorter?.field === 'nombres'
        ? props.sorter.order
        : null
  },
  {
    title: 'Apellidos',
    dataIndex: 'apellidos',
    sorter: true,
    sortOrder:
      props.sorter?.field === 'apellidos'
        ? props.sorter.order
        : null
  },
  {
    title: 'Email',
    dataIndex: 'email',
    sorter: true,
    sortOrder:
      props.sorter?.field === 'email'
        ? props.sorter.order
        : null
  },
  { title: 'Estado', dataIndex: 'enabled' },
  { title: '', dataIndex: 'actions', fixed: 'right', width: 1 }
])

const handleChange = (pagination, filters, sorter) => {
  emit('change', pagination, filters, sorter)
}
</script>

<template>
  <a-table :columns="columns" :data-source="data" :loading="loading" :scroll="{ x: 'max-content', y: 360 }" row-key="id"
    :pagination="{
      ...pagination,
      showTotal: (total, range) => `${range[0]}–${range[1]} de ${total} usuarios`,
    }" @change="handleChange">
    <template #bodyCell="slotProps">
      <!-- Pasamos el slot del padre -->
      <slot name="bodyCell" v-bind="slotProps" />

      <!-- Columnas -->
      <!-- Usuario en negrita -->
      <template v-if="slotProps.column.dataIndex === 'identUsuario'">
        <strong>{{ slotProps.record.identUsuario }}</strong>
      </template>

      <!-- Estado -->
      <template v-else-if="slotProps.column.dataIndex === 'enabled'">
        <a-tag :color="slotProps.record.enabled ? 'green' : 'red'">
          {{ slotProps.record.enabled ? 'Activo' : 'Inactivo' }}
        </a-tag>
      </template>

      <!-- Email -->
      <template v-else-if="slotProps.column.dataIndex === 'email'">
        <a-typography-text copyable>
          {{ slotProps.record.email }}
        </a-typography-text>
      </template>

    </template>
  </a-table>
</template>
