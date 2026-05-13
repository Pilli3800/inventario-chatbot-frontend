<!-- GestionProveedores.vue -->
<script setup>
import { ref, watch, computed } from 'vue'
import { DownloadOutlined, EllipsisOutlined } from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'
import { useTableData } from '@/composables/useTableData'
import { proveedorService } from '@/services/proveedor.service'

import ProveedorFilters from '@/components/logistica/proveedores/ProveedorFilters.vue'
import ProveedorTable from '@/components/logistica/proveedores/ProveedorTable.vue'
import CreateProveedorModal from '@/components/logistica/proveedores/CreateProveedorModal.vue'
import EditProveedorModal from '@/components/logistica/proveedores/EditProveedorModal.vue'
import ViewProveedorModal from '@/components/logistica/proveedores/ViewProveedorModal.vue'

/* Router */
const router = useRouter()
const route = useRoute()

const createOpen = ref(false)
const viewOpen = ref(false)
const editOpen = ref(false)

const viewCodigo = ref(null)
const editCodigo = ref(null)

/* Tabla y filtros */
const {
  data: proveedores,
  loading,
  pagination,
  sorter,
  filters,
  load: loadProveedores,
  onTableChange,
  onSearch
} = useTableData({
  service: proveedorService.search,
  defaultSort: {
    field: 'codigo',
    order: 'ascend'
  },
  pageSize: 5
})

const paginationConfig = computed(() => ({
  ...pagination.value,
  showTotal: (total, range) => `${range[0]}–${range[1]} de ${total} proveedores`,
  showQuickJumper: true,
  showSizeChanger: true,
  locale: {
    jump_to: 'Ir a',
    page: 'página',
    items_per_page: ' / página'
  }
}))

/* Permisos */
const {
  canCreate,
  canEdit,
  canToggle,
  canView,
  canReport,
  canAudit
} = usePermissions()

const totalProveedores = computed(() => proveedores.value.length)
const totalActivos = computed(() =>
  proveedores.value.filter(p => p.enabled).length
)
const totalInactivos = computed(() =>
  proveedores.value.filter(p => !p.enabled).length
)
const totalConTelefono = computed(() =>
  proveedores.value.filter(p => p.telefono && String(p.telefono).trim() !== '').length
)
const totalSinTelefono = computed(() =>
  proveedores.value.filter(p => !p.telefono || String(p.telefono).trim() === '').length
)

/* Modals ruteados */
const openView = (record) => {
  router.push({
    name: 'ver-proveedor',
    params: { codigoProveedor: record.codigo }
  })
}

const openEdit = (record) => {
  router.push({
    name: 'editar-proveedor',
    params: { codigoProveedor: record.codigo }
  })
}

/* Watch rutas */
watch(
  () => [route.name, route.params.codigoProveedor],
  ([name, codigo]) => {
    if (name === 'ver-proveedor' && codigo) {
      viewCodigo.value = codigo
      viewOpen.value = true
    } else {
      viewOpen.value = false
      viewCodigo.value = null
    }

    if (name === 'editar-proveedor' && codigo) {
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
  await proveedorService.activar(codigo)
  loadProveedores()
}

const desactivar = async (codigo) => {
  await proveedorService.desactivar(codigo)
  loadProveedores()
}

const downloadBlobResponse = (response, fallbackName) => {
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = globalThis.URL.createObjectURL(blob)
  let filename = fallbackName

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

/* Exportar */
const exportExcel = async () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters.value).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  )

  const response = await proveedorService.exportExcel(cleanFilters)
  downloadBlobResponse(response, 'proveedores.xlsx')
}

const exportExcelAuditoria = async () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters.value).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  )

  const response = await proveedorService.exportExcelAuditoria(cleanFilters)
  downloadBlobResponse(response, 'proveedores_auditoria.xlsx')
}

/* Carga inicial */
loadProveedores()
</script>

<template>
  <div>
    <h2>Gestion de Proveedores</h2>

    <a-collapse ghost :default-active-key="[]">
      <a-collapse-panel key="stats" header="📊 Resumen de proveedores">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="📄 Total" :value="totalProveedores" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="🟢 Activos" :value="totalActivos" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="🔴 Inactivos" :value="totalInactivos" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="📞 Con telefono" :value="totalConTelefono" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="🚫 Sin telefono" :value="totalSinTelefono" />
            </a-card>
          </a-col>
        </a-row>
      </a-collapse-panel>
    </a-collapse>

    <a-space wrap style="margin: 24px 0;">
      <a-button type="primary" v-if="canCreate" @click="createOpen = true">
        + Nuevo Proveedor
      </a-button>

      <a-button v-if="canReport" @click="exportExcel">
        <DownloadOutlined /> Exportar Excel
      </a-button>

      <a-tooltip title="Incluye campos de auditoria" placement="top">
        <a-button v-if="canAudit" type="dashed" @click="exportExcelAuditoria">
          <DownloadOutlined /> Exportar con auditoria
        </a-button>
      </a-tooltip>
    </a-space>

    <!-- Modals -->
    <CreateProveedorModal :open="createOpen" @close="createOpen = false" @success="loadProveedores()" />

    <EditProveedorModal v-if="editOpen" :open="editOpen" :codigoProveedor="editCodigo"
      @close="router.push({ name: 'gestion-proveedores' })" @success="loadProveedores()" />

    <ViewProveedorModal v-if="viewOpen" :open="viewOpen" :codigoProveedor="viewCodigo"
      @close="router.push({ name: 'gestion-proveedores' })" />

    <!-- Filtros -->
    <ProveedorFilters @search="onSearch" />

    <!-- Tabla -->
    <div class="proveedores-wrapper">
      <ProveedorTable :data="proveedores" :loading="loading" :pagination="paginationConfig" :sorter="sorter"
        @change="onTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'actions'">
            <a-dropdown trigger="click">
              <a-button type="text">
                <EllipsisOutlined />
              </a-button>

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
      </ProveedorTable>
    </div>

    <router-view />
  </div>
</template>

<style>
.proveedores-wrapper {
  display: flex;
  flex-direction: column;
}
</style>
