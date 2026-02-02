<!-- CuadrillaTable.vue -->
<script setup>
const props = defineProps({
  data: Array,
  loading: Boolean,
  pagination: Object,
  sorter: Object
})

const emit = defineEmits(['change'])

const columns = [
  {
    title: 'Código', dataIndex: 'codigoCuadrilla', sorter: true, width: 100, sortOrder: props.sorter?.field === 'codigoCuadrilla'
      ? props.sorter.order
      : null,
  },
  { title: 'Jefe', dataIndex: 'jefeCuadrillaUsuario', width: 100 },
  { title: 'Estado', dataIndex: 'enabled', width: 100 },
  {
    title: '',
    dataIndex: 'actions',
    fixed: 'right',
    width: 30
  }
]

const handleChange = (pagination, filters, sorter) => {
  emit('change', pagination, filters, sorter)
}
</script>

<template>
  <a-table :columns="columns" :data-source="data" :loading="loading" row-key="codigoCuadrilla"
    :scroll="{ x: 'max-content', y: 360 }" :pagination="pagination" @change="handleChange">
    <template #bodyCell="slotProps">
      <slot name="bodyCell" v-bind="slotProps" />

      <!-- Codigo -->
      <template v-if="slotProps.column.dataIndex === 'codigoCuadrilla'">
        <strong>
          {{ slotProps.record.codigoCuadrilla }}
        </strong>
      </template>


      <!-- Jefe de cuadrilla -->
      <!-- Jefe de cuadrilla -->
      <template v-if="slotProps.column.dataIndex === 'jefeCuadrillaUsuario'">
        <div style="line-height: 1.2; cursor: help">
          <a-typography-text>
            {{ slotProps.record.jefeCuadrillaUsuario }}
          </a-typography-text>
          <br />
          <a-typography-text type="secondary" style="font-size: 12px">
            {{ slotProps.record.jefeCuadrillaNombresyApellidos }}
          </a-typography-text>
        </div>
      </template>



      <!-- Estado -->
      <template v-if="slotProps.column.dataIndex === 'enabled'">
        <a-tag :color="slotProps.record.enabled ? 'green' : 'red'">
          {{ slotProps.record.enabled ? 'Activo' : 'Inactivo' }}
        </a-tag>
      </template>
    </template>
  </a-table>
</template>
