<script setup>
import { ref, computed, watch } from 'vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { cuadrillaService } from '@/services/cuadrilla.service'
import { adminCuadrillaService } from '@/services/admin-cuadrilla.service'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter, useRoute } from 'vue-router'

import CuadrillaFilters from '@/components/admin/cuadrillas/CuadrillaFilters.vue'
import CuadrillaTable from '@/components/admin/cuadrillas/CuadrillaTable.vue'
import CreateCuadrillaModal from '@/components/admin/cuadrillas/CreateCuadrillaModal.vue'
import EditCuadrillaModal from '@/components/admin/cuadrillas/EditCuadrillaModal.vue'
import ViewCuadrillaModal from '@/components/admin/cuadrillas/ViewCuadrillaModal.vue'

/* ================= STATE ================= */
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const cuadrillas = ref([])
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

const isAdmin = computed(() =>
  authStore.hasRole('ROLE_ADMINISTRACION')
)

/* ================= LOAD ================= */
const loadCuadrillas = async (filters = activeFilters.value) => {
  loading.value = true

  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  )

  if (cleanFilters.enabled === 'true') cleanFilters.enabled = true
  if (cleanFilters.enabled === 'false') cleanFilters.enabled = false

  const { data } = await cuadrillaService.search({
    ...cleanFilters,
    page: pagination.value.current - 1,
    size: pagination.value.pageSize
  })

  cuadrillas.value = data.content
  pagination.value.total = data.totalElements
  loading.value = false
}

/* ================= TABLE ================= */
const onTableChange = (pager, filters, sorter) => {
  pagination.value.current = pager.current
  pagination.value.pageSize = pager.pageSize

  let sort = null
  if (sorter?.field && sorter?.order) {
    const dir = sorter.order === 'ascend' ? 'asc' : 'desc'
    sort = `${sorter.field},${dir}`
  }

  loadCuadrillas({ sort })
}

/* ================= FILTERS ================= */
const onSearch = (filters) => {
  pagination.value.current = 1
  activeFilters.value = { ...filters }
  loadCuadrillas(filters)
}

/* ================= ROUTED MODALS ================= */
const openView = (record) => {
  router.push({
    name: 'ver-cuadrilla',
    params: { codigoCuadrilla: record.codigoCuadrilla }
  })
}

const openEdit = (record) => {
  router.push({
    name: 'editar-cuadrilla',
    params: { codigoCuadrilla: record.codigoCuadrilla }
  })
}

/* ================= WATCH ROUTE ================= */
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

/* ================= ACTIONS ================= */
const activar = async (codigo) => {
  await adminCuadrillaService.activar(codigo)
  loadCuadrillas()
}

const desactivar = async (codigo) => {
  await adminCuadrillaService.desactivar(codigo)
  loadCuadrillas()
}

/* ================= EXPORT ================= */
const exportExcel = async () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(activeFilters.value).filter(
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
  const link = document.createElement('a')

  link.href = url
  link.download = 'cuadrillas.xlsx'
  document.body.appendChild(link)
  link.click()

  link.remove()
  globalThis.URL.revokeObjectURL(url)
}

const exportExcelAuditoria = async () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(activeFilters.value).filter(
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
  const link = document.createElement('a')

  link.href = url
  link.download = 'cuadrillas_auditoria.xlsx'
  document.body.appendChild(link)
  link.click()

  link.remove()
  globalThis.URL.revokeObjectURL(url)
}

/* ================= INIT ================= */
loadCuadrillas()
</script>

<template>
  <div>
    <h2>Gestión de Cuadrillas</h2>

    <a-space wrap style="margin: 24px 0;">
      <a-button type="primary" @click="createOpen = true">
        + Nueva Cuadrilla
      </a-button>

      <a-button @click="exportExcel">
        <DownloadOutlined /> Exportar Excel
      </a-button>

      <a-tooltip title="Incluye campos de auditoría (solo administración)" placement="top">
        <a-button :disabled="!isAdmin" type="dashed" @click="exportExcelAuditoria">
          <DownloadOutlined /> Exportar con auditoría
        </a-button>
      </a-tooltip>
    </a-space>

    <!-- MODALS -->
    <CreateCuadrillaModal :open="createOpen" @close="createOpen = false" @success="loadCuadrillas()" />

    <EditCuadrillaModal :open="editOpen" :codigoCuadrilla="editCodigo"
      @close="router.push({ name: 'gestion-cuadrillas' })" @success="loadCuadrillas()" />

    <ViewCuadrillaModal :open="viewOpen" :codigoCuadrilla="viewCodigo"
      @close="router.push({ name: 'gestion-cuadrillas' })" />

    <!-- FILTERS -->
    <CuadrillaFilters @search="onSearch" />

    <!-- TABLE -->
    <CuadrillaTable :data="cuadrillas" :loading="loading" :pagination="pagination" @change="onTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'actions'">
          <a-dropdown trigger="click">
            <a-button type="text">⋮</a-button>

            <template #overlay>
              <a-menu>
                <a-menu-item v-if="!record.enabled" @click="activar(record.codigoCuadrilla)">
                  Activar
                </a-menu-item>

                <a-menu-item v-if="record.enabled" danger @click="desactivar(record.codigoCuadrilla)">
                  Desactivar
                </a-menu-item>

                <a-menu-divider />

                <a-menu-item @click="openView(record)">
                  Ver
                </a-menu-item>

                <a-menu-item @click="openEdit(record)">
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
