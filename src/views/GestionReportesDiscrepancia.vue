<!-- GestionReportesDiscrepancia.vue -->
<script setup>
import { computed, reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { EllipsisOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useRouter, useRoute } from 'vue-router'
import { userService } from '@/services/user.service'
import { sedeService } from '@/services/sede.service'
import { servicioService } from '@/services/servicio.service'
import { conteoFisicoService } from '@/services/conteo-fisico.service'
import { useTableData } from '@/composables/useTableData'
import ViewConteoFisicoModal from '@/components/logistica/conteo-fisico/ViewConteoFisicoModal.vue'
import { formatDateTime } from '@/utils/date'

const router = useRouter()
const route = useRoute()

const viewOpen = ref(false)
const selectedId = ref(null)

const filtersForm = reactive({
  fechaInicio: undefined,
  fechaFin: undefined,
  usuario: undefined,
  tipoInventario: undefined,
  codigoUbicacion: undefined
})

const usuarios = ref([])
const sedes = ref([])
const servicios = ref([])
const loadingUsuarios = ref(false)
const loadingUbicaciones = ref(false)
const downloading = ref(false)

const {
  data: reportes,
  loading,
  pagination,
  sorter,
  load: loadReportes,
  onTableChange,
  onSearch
} = useTableData({
  service: conteoFisicoService.search,
  defaultSort: {
    field: 'fechaConteo',
    order: 'descend'
  },
  pageSize: 10
})

const paginationConfig = computed(() => ({
  ...pagination.value,
  showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} reportes`,
  showQuickJumper: true,
  showSizeChanger: true
}))

const columns = computed(() => [
  { title: 'ID', dataIndex: 'id', width: 90 },
  {
    title: 'Fecha',
    dataIndex: 'fechaConteo',
    width: 170,
    sorter: true,
    sortOrder: sorter.value?.field === 'fechaConteo' ? sorter.value.order : null
  },
  { title: 'Tipo', dataIndex: 'tipoInventario', width: 110 },
  { title: 'Ubicacion', dataIndex: 'ubicacion', width: 190 },
  { title: 'Usuario', dataIndex: 'usuario', width: 190 },
  { title: 'Items', dataIndex: 'totalItems', width: 100, align: 'right' },
  { title: 'Discrepancias', dataIndex: 'itemsConDiscrepancia', width: 130, align: 'right' },
  { title: 'Observaciones', dataIndex: 'observaciones', width: 240 },
  { title: '', dataIndex: 'actions', fixed: 'right', width: 72, align: 'center' }
])

const buscarUsuarios = async (texto = '') => {
  loadingUsuarios.value = true
  try {
    const { data } = await userService.search({
      identUsuario: texto || '',
      page: 0,
      size: 20
    })
    usuarios.value = data.content
  } finally {
    loadingUsuarios.value = false
  }
}

const loadUbicaciones = async () => {
  loadingUbicaciones.value = true
  try {
    const [sedesResponse, serviciosResponse] = await Promise.all([
      sedeService.getActivas(),
      servicioService.search({
        enabled: true,
        page: 0,
        size: 1000,
        sort: 'nombre,asc'
      })
    ])
    sedes.value = sedesResponse.data.content
    servicios.value = serviciosResponse.data.content
  } finally {
    loadingUbicaciones.value = false
  }
}

const onTipoChange = () => {
  filtersForm.codigoUbicacion = undefined
}

const buildFilters = () => ({
  fechaDesde: filtersForm.fechaInicio
    ? dayjs(filtersForm.fechaInicio).format('YYYY-MM-DD')
    : undefined,
  fechaHasta: filtersForm.fechaFin
    ? dayjs(filtersForm.fechaFin).format('YYYY-MM-DD')
    : undefined,
  usuario: filtersForm.usuario,
  tipoInventario: filtersForm.tipoInventario,
  codigoUbicacion: filtersForm.codigoUbicacion
})

const searchReportes = () => {
  onSearch(buildFilters())
}

const resetFilters = () => {
  filtersForm.fechaInicio = undefined
  filtersForm.fechaFin = undefined
  filtersForm.usuario = undefined
  filtersForm.tipoInventario = undefined
  filtersForm.codigoUbicacion = undefined
  searchReportes()
}

const openView = (record) => {
  router.push({
    name: 'ver-reporte-discrepancia',
    params: { idConteo: record.id }
  })
}

const closeView = () => {
  router.push({ name: 'reportes-discrepancia' })
}

const getUbicacionLabel = (record) =>
  `${record.codigoUbicacion || '-'} - ${record.nombreUbicacion || '-'}`

const getUsuarioLabel = (record) =>
  `${record.codigoUsuario || '-'} - ${record.nombreUsuario || '-'}`

const downloadBlobResponse = (response, fallbackName) => {
  const blob = response?.data instanceof Blob
    ? response.data
    : new Blob([response.data])

  const url = globalThis.URL.createObjectURL(blob)
  let filename = fallbackName
  const disposition = response.headers?.['content-disposition']
  if (disposition) {
    const match = disposition.match(/filename="?(.+)"?/)
    if (match?.[1]) filename = match[1]
  }

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  globalThis.URL.revokeObjectURL(url)
}

const descargarPdf = async (record) => {
  downloading.value = true
  try {
    const response = await conteoFisicoService.descargarPdf(record.id)
    downloadBlobResponse(response, `conteo_fisico_${record.id}.pdf`)
  } catch {
    message.error('No se pudo descargar el PDF')
  } finally {
    downloading.value = false
  }
}

const descargarExcel = async (record) => {
  downloading.value = true
  try {
    const response = await conteoFisicoService.descargarExcel(record.id)
    downloadBlobResponse(response, `conteo_fisico_${record.id}.xlsx`)
  } catch {
    message.error('No se pudo descargar el Excel')
  } finally {
    downloading.value = false
  }
}

watch(
  () => route.name,
  (name) => {
    if (name === 'ver-reporte-discrepancia') {
      selectedId.value = route.params.idConteo
      viewOpen.value = true
    } else {
      selectedId.value = null
      viewOpen.value = false
    }
  },
  { immediate: true }
)

loadUbicaciones()
buscarUsuarios('')
loadReportes()
</script>

<template>
  <div>
    <h2>Reportes de Discrepancia</h2>

    <a-card size="small" style="margin-bottom: 16px">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :md="4">
            <a-form-item label="Desde">
              <a-date-picker v-model:value="filtersForm.fechaInicio" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :md="4">
            <a-form-item label="Hasta">
              <a-date-picker v-model:value="filtersForm.fechaFin" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :md="5">
            <a-form-item label="Usuario">
              <a-select v-model:value="filtersForm.usuario" show-search allow-clear placeholder="Buscar usuario"
                :filter-option="false" :loading="loadingUsuarios" @search="buscarUsuarios">
                <a-select-option v-for="u in usuarios" :key="u.identUsuario" :value="u.identUsuario">
                  {{ u.identUsuario }} - {{ u.nombres }} {{ u.apellidos }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="4">
            <a-form-item label="Tipo">
              <a-select v-model:value="filtersForm.tipoInventario" allow-clear @change="onTipoChange">
                <a-select-option value="SEDE">SEDE</a-select-option>
                <a-select-option value="SERVICIO">SERVICIO</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="5">
            <a-form-item label="Ubicacion">
              <a-select v-model:value="filtersForm.codigoUbicacion" show-search allow-clear placeholder="Seleccione"
                :disabled="!filtersForm.tipoInventario" :loading="loadingUbicaciones"
                :dropdown-style="{ maxHeight: '280px', overflow: 'auto' }">
                <template v-if="filtersForm.tipoInventario === 'SEDE'">
                  <a-select-option v-for="sede in sedes" :key="sede.codigo" :value="sede.codigo">
                    {{ sede.codigo }} - {{ sede.nombre }}
                  </a-select-option>
                </template>
                <template v-else>
                  <a-select-option v-for="servicio in servicios" :key="servicio.codigo" :value="servicio.codigo">
                    {{ servicio.codigo }} - {{ servicio.nombre }}
                  </a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="6">
            <a-form-item label=" ">
              <a-button type="primary" @click="searchReportes">
                Buscar
              </a-button>
              <a-button style="margin-left: 8px" @click="resetFilters">
                Limpiar
              </a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <a-table
      :columns="columns"
      :data-source="reportes"
      :loading="loading"
      :pagination="paginationConfig"
      row-key="id"
      table-layout="fixed"
      :scroll="{ x: 1240 }"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'fechaConteo'">
          {{ formatDateTime(record.fechaConteo) }}
        </template>
        <template v-else-if="column.dataIndex === 'tipoInventario'">
          <a-tag>{{ record.tipoInventario }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'ubicacion'">
          {{ getUbicacionLabel(record) }}
        </template>
        <template v-else-if="column.dataIndex === 'usuario'">
          {{ getUsuarioLabel(record) }}
        </template>
        <template v-else-if="column.dataIndex === 'itemsConDiscrepancia'">
          <a-tag :color="record.itemsConDiscrepancia > 0 ? 'red' : 'green'">
            {{ record.itemsConDiscrepancia || 0 }}
          </a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'observaciones'">
          <a-tooltip v-if="record.observaciones" :title="record.observaciones">
            <span class="truncate">{{ record.observaciones }}</span>
          </a-tooltip>
          <span v-else>-</span>
        </template>
        <template v-else-if="column.dataIndex === 'actions'">
          <a-dropdown trigger="click">
            <a-button type="text">
              <EllipsisOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="openView(record)">
                  Ver detalle
                </a-menu-item>
                <a-menu-item :disabled="downloading" @click="descargarPdf(record)">
                  Descargar PDF
                </a-menu-item>
                <a-menu-item :disabled="downloading" @click="descargarExcel(record)">
                  Descargar Excel
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
    </a-table>

    <ViewConteoFisicoModal :open="viewOpen" :idConteo="selectedId" @close="closeView" />

    <router-view />
  </div>
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
