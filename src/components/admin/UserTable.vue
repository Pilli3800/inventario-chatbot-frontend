<script setup>
defineProps({
  data: Array,
  loading: Boolean,
  pagination: Object
})

const emit = defineEmits(['change'])

const columns = [
  { title: 'Usuario', dataIndex: 'identUsuario' },
  { title: 'Nombres', dataIndex: 'nombres' },
  { title: 'Apellidos', dataIndex: 'apellidos' },
  { title: 'Email', dataIndex: 'email' },
  { title: 'Estado',dataIndex: 'enabled'},
  { title: '', dataIndex: 'actions', fixed: 'right', width: 1 }
]

const handleChange = (pagination) => {
  emit('change', pagination)
}
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    :scroll="{ x: 'max-content'}"
    row-key="id"
    :pagination="{
      ...pagination,
      showTotal: (total, range) => `${range[0]}–${range[1]} de ${total} usuarios`,
    }"
    @change="handleChange"
  >
    <template #bodyCell="slotProps">
      <!-- Pasamos el slot del padre -->
      <slot name="bodyCell" v-bind="slotProps" />

      <!-- Mantienes tus condiciones por defecto -->
      <template v-if="slotProps.column.dataIndex === 'enabled'">
        <a-tag :color="slotProps.record.enabled ? 'green' : 'red'">
          {{ slotProps.record.enabled ? 'Activo' : 'Inactivo' }}
        </a-tag>
      </template>

      <template v-else-if="slotProps.column.dataIndex === 'email'">
        <a-typography-text copyable>
          {{ slotProps.record.email }}
        </a-typography-text>
      </template>

      <!-- YA NO agregues menú aquí -->
    </template>
  </a-table>
</template>

