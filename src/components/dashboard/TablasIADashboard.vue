<script setup>
const props = defineProps({
  topUsuarios: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

const columns = [
  { title: 'Usuario', dataIndex: 'usuario', width: 140 },
  { title: 'Consultas', dataIndex: 'totalConsultas', width: 120, align: 'right' },
  { title: 'Sesiones', dataIndex: 'totalSesiones', width: 120, align: 'right' },
  { title: 'Promedio por sesion', dataIndex: 'promedio', width: 170, align: 'right' }
]

const getPromedio = (record) => {
  if (!record.totalSesiones) return '0.00'
  return (record.totalConsultas / record.totalSesiones).toFixed(2)
}
</script>

<template>
  <a-card class="tabla-card" title="Top usuarios del asistente IA">
    <a-table
      :columns="columns"
      :data-source="props.topUsuarios"
      :loading="loading"
      row-key="usuario"
      size="small"
      :pagination="false"
      :scroll="{ x: 560 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'promedio'">
          {{ getPromedio(record) }}
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<style scoped>
.tabla-card {
  height: 100%;
}
</style>
