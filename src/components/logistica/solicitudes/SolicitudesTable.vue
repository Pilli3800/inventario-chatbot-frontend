<!-- SolicitudesTable.vue -->
<script setup>
import { computed } from 'vue'
import { formatDateTime } from '@/utils/date'

const props = defineProps({
  data: Array,
  loading: Boolean,
  pagination: Object,
  sorter: Object
})

const emit = defineEmits(['change'])

const columns = computed(() => [
  {
    title: 'Número de solicitud',
    dataIndex: 'id',
    width: 120,
    sorter: true,
    sortOrder:
      props.sorter?.field === 'id'
        ? props.sorter.order
        : null
  },
  {
    title: 'Fecha',
    dataIndex: 'fcCreacion',
    width: 180,
    sorter: true,
    sortOrder:
      props.sorter?.field === 'fcCreacion'
        ? props.sorter.order
        : null
  },
  { title: 'Estado', dataIndex: 'estado', width: 120 },
  { title: 'Solicitante', dataIndex: 'solicitante', width: 160 },
  { title: 'Cuadrilla', dataIndex: 'codigoCuadrilla', width: 140 },
  { title: 'Sede Origen', dataIndex: 'sedeOrigen', width: 100 },
  { title: 'Observaciones', dataIndex: 'observaciones', width: 260 },
  {
    title: ' ',
    dataIndex: 'actions',
    key: 'actions',
    fixed: 'right',
    width: 72,
    align: 'center',
    ellipsis: true
  }
])

const handleChange = (pagination, filters, sorter) => {
  emit('change', pagination, filters, sorter)
}

const getFechaSolicitud = (record) =>
  record.fcCreacion ||
  record.fechaSolicitud ||
  record.fechaCreacion ||
  record.fechaCreada ||
  record.createdAt

const buildUserLabel = (codigo, nombre) => {
  if (codigo && nombre) return `${codigo} - ${nombre}`;
  if (codigo) return codigo;
  if (nombre) return nombre;
  return null
}

const getSolicitante = (record) =>
  buildUserLabel(record.codigoSolicitante, record.nombreSolicitante) ||
  record.solicitante?.identUsuario ||
  record.solicitanteIdent ||
  record.identSolicitante ||
  record.solicitante

const getCodigoCuadrilla = (record) =>
  record.codigoCuadrilla ||
  record.cuadrilla?.codigoCuadrilla ||
  record.cuadrillaCodigo

const getJefeCuadrillaNombre = (record) =>
  record.nombreJefeCuadrilla ||
  record.cuadrilla?.jefeCuadrillaNombresyApellidos ||
  record.jefeCuadrillaNombresyApellidos

const getSedeOrigen = (record) =>
  record.sedeOrigenCodigo ||
  record.sedeOrigen?.codigo ||
  record.sedeOrigen
</script>

<template>
  <a-table :columns="columns" :data-source="data" :loading="loading" row-key="id" :pagination="pagination"
    table-layout="fixed" :scroll="{ y: '350px', x: '100%' }" @change="handleChange">
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'fcCreacion'">
        {{ formatDateTime(getFechaSolicitud(record)) }}
      </template>

      <template v-else-if="column.dataIndex === 'estado'">
        <a-tag :color="{
          PENDIENTE: 'orange',
          APROBADA: 'green',
          RECHAZADA: 'red',
          ENTREGADO: 'blue'
        }[record.estado]">
          {{ record.estado }}
        </a-tag>
      </template>

      <template v-else-if="column.dataIndex === 'solicitante'">
        <div style="line-height: 1.2; cursor: help;">
          <a-typography-text>
            {{ record.codigoSolicitante || getSolicitante(record) || '—' }}
          </a-typography-text>
          <br />
          <a-typography-text type="secondary" style="font-size: 12px">
            {{ record.nombreSolicitante || '—' }}
          </a-typography-text>
        </div>
      </template>

      <template v-else-if="column.dataIndex === 'codigoCuadrilla'">
        <div style="line-height: 1.2; cursor: help;">
          <a-typography-text>
            {{ getCodigoCuadrilla(record) || '—' }}
          </a-typography-text>
          <br />
          <a-typography-text type="secondary" style="font-size: 12px">
            {{ getJefeCuadrillaNombre(record) || '—' }}
          </a-typography-text>
        </div>
      </template>

      <template v-else-if="column.dataIndex === 'sedeOrigen'">
        <a-tag v-if="getSedeOrigen(record)" color="red">
          {{ getSedeOrigen(record) }}
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

      <template v-else-if="column.dataIndex === 'actions'">
        <slot name="bodyCell" :column="column" :record="record" />
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
