<script setup>
import { ref, watch } from 'vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { servicioService } from '@/services/servicio.service'
import { adminServicioService } from '@/services/admin-servicio.service'
import { useRouter, useRoute } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'

import ServicioFilters from '@/components/admin/servicios/ServicioFilters.vue'
import ServicioTable from '@/components/admin/servicios/ServicioTable.vue'
import CreateServicioModal from '@/components/admin/servicios/CreateServicioModal.vue'
import EditServicioModal from '@/components/admin/servicios/EditServicioModal.vue'
import ViewServicioModal from '@/components/admin/servicios/ViewServicioModal.vue'

/* Estados */
const router = useRouter()
const route = useRoute()

const servicios = ref([])
const loading = ref(false)

const createOpen = ref(false)
const viewOpen = ref(false)
const editOpen = ref(false)

const viewCodigo = ref(null)
const editCodigo = ref(null)

const pagination = ref({
  current: 1,
  pageSize: 5,
  total: 0
})

const activeFilters = ref({})

/* Permisos */
const {
  canCreate,
  canEdit,
  canToggle,
  canView,
  canReport
} = usePermissions()

/* Load */
const loadServicios = async (filters = activeFilters.value) => {
  loading.value = true

  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  )

  if (cleanFilters.enabled === 'true') cleanFilters.enabled = true
  if (cleanFilters.enabled === 'false') cleanFilters.enabled = false

  const { data } = await servicioService.search({
    ...cleanFilters,
    page: pagination.value.current - 1,
    size: pagination.value.pageSize
  })

  servicios.value = data.content
  pagination.value.total = data.totalElements
  loading.value = false
}

/* Tabla */
const onTableChange = (pager, filters, sorter) => {
  pagination.value.current = pager.current
  pagination.value.pageSize = pager.pageSize

  let sort = null
  if (sorter?.field && sorter?.order) {
    const dir = sorter.order === 'ascend' ? 'asc' : 'desc'
    sort = `${sorter.field},${dir}`
  }

  loadServicios({ sort })
}

/* Filtros */
const onSearch = (filters) => {
  pagination.value.current = 1
  activeFilters.value = { ...filters }
  loadServicios(filters)
}

/* Modals Ruteados */
const openView = (record) => {
  router.push({
    name: 'ver-servicio',
    params: { codigoServicio: record.codigo }
  })
}

const openEdit = (record) => {
  router.push({
    name: 'editar-servicio',
    params: { codigoServicio: record.codigo }
  })
}

/* WATCH DE RUTAS */
watch(
  () => [route.name, route.params.codigoServicio],
  ([name, codigo]) => {
    if (name === 'ver-servicio' && codigo) {
      viewCodigo.value = codigo
      viewOpen.value = true
    } else {
      viewOpen.value = false
      viewCodigo.value = null
    }

    if (name === 'editar-servicio' && codigo) {
      editCodigo.value = codigo
      editOpen.value = true
    } else {
      editOpen.value = false
      editCodigo.value = null
    }
  },
  { immediate: true }
)

/* Acciones */
const activar = async (codigo) => {
  await adminServicioService.activar(codigo)
  loadServicios()
}

const desactivar = async (codigo) => {
  await adminServicioService.desactivar(codigo)
  loadServicios()
}

/* EXPORTAR */
const exportExcel = async () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(activeFilters.value).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  )

  if (cleanFilters.enabled === 'true') cleanFilters.enabled = true
  if (cleanFilters.enabled === 'false') cleanFilters.enabled = false

  const response = await adminServicioService.exportExcel(cleanFilters)

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = globalThis.URL.createObjectURL(blob)
  let filename = 'servicios.xlsx'

  const disposition = response.headers['content-disposition']
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

const exportExcelAuditoria = async () => {
  const response = await adminServicioService.exportExcelAuditoria(activeFilters.value)

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = globalThis.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'servicios_auditoria.xlsx'
  document.body.appendChild(link)
  link.click()

  link.remove()
  globalThis.URL.revokeObjectURL(url)
}

/* Carga inicial */
loadServicios()
</script>

<template>
  <div>
    <h2>Gestión de Servicios</h2>

    <a-space wrap style="margin: 24px 0;">
      <a-button type="primary" v-if="canCreate" @click="createOpen = true">
        + Nuevo Servicio
      </a-button>

      <a-button v-if="canReport" @click="exportExcel">
        <DownloadOutlined /> Exportar Excel
      </a-button>

      <a-tooltip title="Incluye campos de auditoría (solo administración)" placement="top">
        <a-button v-if="canReport" type="dashed" @click="exportExcelAuditoria">
          <DownloadOutlined /> Exportar con auditoría
        </a-button>
      </a-tooltip>
    </a-space>

    <!-- Modals -->
    <CreateServicioModal :open="createOpen" @close="createOpen = false" @success="loadServicios()" />

    <EditServicioModal v-if="editOpen" :open="editOpen" :codigoServicio="editCodigo"
      @close="router.push({ name: 'gestion-servicios' })" @success="loadServicios()" />

    <ViewServicioModal v-if="viewOpen" :open="viewOpen" :codigoServicio="viewCodigo"
      @close="router.push({ name: 'gestion-servicios' })" />

    <!-- Filtros -->
    <ServicioFilters @search="onSearch" />

    <!-- Tabla -->
    <ServicioTable :data="servicios" :loading="loading" :pagination="pagination" @change="onTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'actions'">
          <a-dropdown trigger="click">
            <a-button type="text">⋮</a-button>

            <template #overlay>
              <a-menu>
                <a-menu-item v-if="!record.enabled && canToggle" @click="activar(record.codigo)">
                  Activar
                </a-menu-item>

                <a-menu-item v-if="record.enabled && canToggle" danger @click="desactivar(record.codigo)">
                  Desactivar
                </a-menu-item>

                <a-menu-divider />

                <a-menu-item v-if="canView" @click="openView(record)">
                  Ver
                </a-menu-item>

                <a-menu-item v-if="canEdit" @click="openEdit(record)">
                  Editar
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
    </ServicioTable>

    <router-view />
  </div>
</template>
