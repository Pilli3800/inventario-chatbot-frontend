<script setup>
import { ref, h, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  ExclamationCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'

import InventarioFilters from '@/components/logistica/InventarioFilters.vue'
import InventarioTable from '@/components/logistica/InventarioTable.vue'
import CreateInventarioModal from '@/components/logistica/CreateInventarioModal.vue'

import { inventarioSedeService } from '@/services/inventario-sede.service'
import { adminInventarioSedeService } from '@/services/admin-inventario-sede.service'
import { usePermissions } from '@/composables/usePermissions'

/* Permisos */
const {
  canCreate,
  canReport,
  canAudit
} = usePermissions()

/* DATA */
const inventarios = ref([])
const loading = ref(false)
const createOpen = ref(false)

const pagination = ref({
  current: 1,
  pageSize: 5,
  total: 0
})

const activeFilters = ref({
  sedeCodigo: undefined
})

/* Saber si hay sede seleccionada */
const sedeSeleccionada = computed(() =>
  !!activeFilters.value.sedeCodigo
)

/* Cargar inventario */
const loadInventario = async (filters = activeFilters.value) => {
  if (!filters.sedeCodigo) {
    inventarios.value = []
    pagination.value.total = 0
    loading.value = false
    return
  }

  loading.value = true

  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
  )

  try {
    const { data } = await inventarioSedeService.search({
      ...cleanFilters,
      page: pagination.value.current - 1,
      size: pagination.value.pageSize
    })

    inventarios.value = data.content
    pagination.value.total = data.totalElements
  } finally {
    loading.value = false
  }
}

/* Buscar */
const onSearch = (filters) => {
  pagination.value.current = 1
  activeFilters.value = { ...filters }
  loadInventario(filters)
}

/* Paginación */
const onTableChange = (pager) => {
  pagination.value.current = pager.current
  pagination.value.pageSize = pager.pageSize
  loadInventario()
}

/* Eliminar asignación */
const eliminarAsignacion = (record) => {
  Modal.confirm({
    title: '¿Eliminar asignación?',
    icon: h(ExclamationCircleOutlined),
    content: 'Solo se puede eliminar si el stock es 0.',
    okText: 'Eliminar',
    okType: 'danger',
    cancelText: 'Cancelar',
    async onOk() {
      try {
        await inventarioSedeService.eliminar(record.id)
        message.success('Asignación eliminada')
        loadInventario()
      } catch (err) {
        message.error(err.response?.data?.content?.[0] || 'Error')
      }
    }
  })
}

/* Exportar Excel */
const exportExcel = async () => {
  if (!sedeSeleccionada.value) {
    message.warning('Seleccione una sede antes de exportar')
    return
  }

  const cleanFilters = Object.fromEntries(
    Object.entries(activeFilters.value).filter(([, v]) => v !== undefined && v !== '')
  )

  const response = await inventarioSedeService.exportExcel(cleanFilters)

  downloadBlob(response, 'inventario.xlsx')
}

/* Exportar Excel con auditoría (ADMIN) */
const exportExcelAuditoria = async () => {
  if (!sedeSeleccionada.value) {
    message.warning('Seleccione una sede antes de exportar')
    return
  }

  const cleanFilters = Object.fromEntries(
    Object.entries(activeFilters.value).filter(([, v]) => v !== undefined && v !== '')
  )

  const response =
    await adminInventarioSedeService.exportExcelAuditoria(cleanFilters)

  downloadBlob(response, 'inventario_auditoria.xlsx')
}

/* Helper descarga */
const downloadBlob = (response, defaultName) => {
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = globalThis.URL.createObjectURL(blob)

  let filename = defaultName
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
</script>

<template>
  <div>
    <h2>Gestión de Inventarios</h2>

    <!-- BOTONES -->
    <a-space wrap style="margin: 24px 0;">
      <a-button type="primary" v-if="canCreate" @click="createOpen = true">
        + Asignar Item a Sede
      </a-button>

      <a-button :disabled="!sedeSeleccionada" v-if="canReport" @click="exportExcel">
        <DownloadOutlined />
        Exportar Excel
      </a-button>

      <!-- Exportar con auditoría (solo admin) -->
      <a-tooltip title="Incluye campos de auditoría (solo administración)" placement="top">
        <a-button type="dashed" :disabled="!isAdmin || !sedeSeleccionada" @click="exportExcelAuditoria" v-if="canAudit">
          <DownloadOutlined />
          Exportar con auditoría
        </a-button>
      </a-tooltip>
    </a-space>

    <!-- Modal crear -->
    <CreateInventarioModal :open="createOpen" @close="createOpen = false" @success="loadInventario" />

    <!-- Filtros -->
    <InventarioFilters @search="onSearch" />

    <!-- Mensaje inicial -->
    <a-empty v-if="!sedeSeleccionada" description="Seleccione una sede para ver el inventario"
      style="margin-top: 48px" />

    <!-- Tabla -->
    <InventarioTable v-else :data="inventarios" :loading="loading" :pagination="pagination" @change="onTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'actions'">
          <a-dropdown trigger="click">
            <a-button type="text">⋮</a-button>

            <template #overlay>
              <a-menu>
                <a-menu-item v-if="cantDelete" @click="eliminarAsignacion(record)">
                  Eliminar
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
    </InventarioTable>
  </div>
</template>
