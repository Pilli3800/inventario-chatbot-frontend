<!-- GestionCuadrillas.vue -->
<script setup>
import { ref, watch, computed } from 'vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { cuadrillaService } from '@/services/cuadrilla.service'
import { adminCuadrillaService } from '@/services/admin-cuadrilla.service'
import { usePermissions } from '@/composables/usePermissions'
import { useTableData } from '@/composables/useTableData'

import CuadrillaFilters from '@/components/admin/cuadrillas/CuadrillaFilters.vue'
import CuadrillaTable from '@/components/admin/cuadrillas/CuadrillaTable.vue'
import CreateCuadrillaModal from '@/components/admin/cuadrillas/CreateCuadrillaModal.vue'
import EditCuadrillaModal from '@/components/admin/cuadrillas/EditCuadrillaModal.vue'
import ViewCuadrillaModal from '@/components/admin/cuadrillas/ViewCuadrillaModal.vue'

/* Router */
const router = useRouter()
const route = useRoute()

/* Permisos */
const {
  canCreate,
  canEdit,
  canToggle,
  canView,
  canReport
} = usePermissions()

/* Tabla (useTableData) */
const {
  data: cuadrillas,
  loading,
  pagination,
  sorter,
  filters,
  load: loadCuadrillas,
  onTableChange,
  onSearch
} = useTableData({
  service: cuadrillaService.search,
  defaultSort: {
    field: 'codigoCuadrilla',
    order: 'ascend'
  },
  pageSize: 5
})

/* Modales */
const createOpen = ref(false)
const viewOpen = ref(false)
const editOpen = ref(false)

const viewCodigo = ref(null)
const editCodigo = ref(null)

/* Watch rutas */
watch(
  () => route.name,
  (name) => {
    if (name === 'ver-cuadrilla') {
      viewCodigo.value = route.params.codigoCuadrilla
      viewOpen.value = true
    } else {
      viewOpen.value = false
      viewCodigo.value = null
    }
  },
  { immediate: true }
)

watch(
  () => route.name,
  (name) => {
    if (name === 'editar-cuadrilla') {
      editCodigo.value = route.params.codigoCuadrilla
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
  await adminCuadrillaService.activar(codigo)
  loadCuadrillas()
}

const desactivar = async (codigo) => {
  await adminCuadrillaService.desactivar(codigo)
  loadCuadrillas()
}

/* Estadísticas */
const totalCuadrillas = computed(() => cuadrillas.value.length)

const totalActivas = computed(() =>
  cuadrillas.value.filter(c => c.enabled).length
)

const totalInactivas = computed(() =>
  cuadrillas.value.filter(c => !c.enabled).length
)

/* Exportar */
const exportExcel = async () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters.value).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  )

  if (cleanFilters.enabled === 'true') cleanFilters.enabled = true
  if (cleanFilters.enabled === 'false') cleanFilters.enabled = false

  const response = await adminCuadrillaService.exportExcel(cleanFilters)

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = globalThis.URL.createObjectURL(blob)

  let filename = 'cuadrillas.xlsx'
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
  const cleanFilters = Object.fromEntries(
    Object.entries(filters.value).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  )

  if (cleanFilters.enabled === 'true') cleanFilters.enabled = true
  if (cleanFilters.enabled === 'false') cleanFilters.enabled = false

  const response = await adminCuadrillaService.exportExcelAuditoria(cleanFilters)

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = globalThis.URL.createObjectURL(blob)

  let filename = 'cuadrillas_auditoria.xlsx'
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

/* Carga inicial */
loadCuadrillas()
</script>

<template>
  <div>
    <h2>Gestión de Cuadrillas</h2>

    <!-- Resumen -->
    <a-collapse ghost>
      <a-collapse-panel key="stats" header="📊 Resumen de cuadrillas">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-card size="small">
              <a-statistic title="🧑‍🔧 Total cuadrillas" :value="totalCuadrillas" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-card size="small">
              <a-statistic title="🟢 Activas" :value="totalActivas" :value-style="{ color: '#52c41a' }" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-card size="small">
              <a-statistic title="🔴 Inactivas" :value="totalInactivas" :value-style="{ color: '#ff4d4f' }" />
            </a-card>
          </a-col>
        </a-row>
      </a-collapse-panel>
    </a-collapse>

    <!-- Acciones -->
    <a-space wrap style="margin: 24px 0;">
      <a-button type="primary" v-if="canCreate" @click="createOpen = true">
        + Nueva Cuadrilla
      </a-button>

      <a-button v-if="canReport" @click="exportExcel">
        <DownloadOutlined /> Exportar Excel
      </a-button>

      <a-tooltip title="Incluye campos de auditoría (solo administración)">
        <a-button v-if="canReport" type="dashed" @click="exportExcelAuditoria">
          <DownloadOutlined /> Exportar con auditoría
        </a-button>
      </a-tooltip>
    </a-space>

    <!-- Modales -->
    <CreateCuadrillaModal :open="createOpen" @close="createOpen = false" @success="loadCuadrillas()" />

    <EditCuadrillaModal :open="editOpen" :codigoCuadrilla="editCodigo"
      @close="router.push({ name: 'gestion-cuadrillas' })" @success="loadCuadrillas()" />

    <ViewCuadrillaModal :open="viewOpen" :codigoCuadrilla="viewCodigo"
      @close="router.push({ name: 'gestion-cuadrillas' })" />

    <!-- Filtros -->
    <CuadrillaFilters @search="onSearch" />

    <!-- Tabla -->
    <CuadrillaTable :data="cuadrillas" :loading="loading" :pagination="pagination" :sorter="sorter"
      @change="onTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'actions'">
          <a-dropdown trigger="click">
            <a-button type="text">⋮</a-button>

            <template #overlay>
              <a-menu>
                <a-menu-item v-if="!record.enabled && canToggle" @click="activar(record.codigoCuadrilla)">
                  Activar
                </a-menu-item>

                <a-menu-item v-if="record.enabled && canToggle" danger @click="desactivar(record.codigoCuadrilla)">
                  Desactivar
                </a-menu-item>

                <a-menu-divider />

                <a-menu-item v-if="canView"
                  @click="router.push({ name: 'ver-cuadrilla', params: { codigoCuadrilla: record.codigoCuadrilla } })">
                  Ver
                </a-menu-item>

                <a-menu-item v-if="canEdit"
                  @click="router.push({ name: 'editar-cuadrilla', params: { codigoCuadrilla: record.codigoCuadrilla } })">
                  Editar
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
    </CuadrillaTable>

    <router-view />
  </div>
</template>
