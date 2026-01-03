<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { itemService } from '@/services/item.service'
import { useAuthStore } from '@/stores/auth.store'
import ItemFilters from '@/components/logistica/ItemFilters.vue'
import ItemTable from '@/components/logistica/ItemTable.vue'
import CreateItemModal from '@/components/logistica/CreateItemModal.vue'
import EditItemModal from '@/components/logistica/EditItemModal.vue'
import ViewItemModal from '@/components/logistica/ViewItemModal.vue'
import { DownloadOutlined } from '@ant-design/icons-vue';
import { adminItemService } from '@/services/admin-item.service'


const router = useRouter()
const route = useRoute()

const items = ref([])
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

const authStore = useAuthStore()

/* Cargar items */
const loadItems = async (filters = activeFilters.value) => {
  loading.value = true

  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  )

  if (cleanFilters.enabled === 'true') cleanFilters.enabled = true
  if (cleanFilters.enabled === 'false') cleanFilters.enabled = false

  const { data } = await itemService.search({
    ...cleanFilters,
    page: pagination.value.current - 1,
    size: pagination.value.pageSize
  })

  items.value = data.content
  pagination.value.total = data.totalElements
  loading.value = false
}

/* Paginación */
const onTableChange = (pager, filters, sorter) => {
  pagination.value.current = pager.current
  pagination.value.pageSize = pager.pageSize

  let sort = null

  if (sorter?.field && sorter?.order) {
    const direction = sorter.order === 'ascend' ? 'asc' : 'desc'
    sort = `${sorter.field},${direction}`
  }

  loadItems({ sort })
}

const onSearch = (filters) => {
  pagination.value.current = 1
  activeFilters.value = { ...filters }
  loadItems(filters)
}

/* Ver */
const openView = (record) => {
  router.push({
    name: 'ver-item',
    params: { codigoItem: record.codigoItem }
  })
}

watch(
  () => route.name,
  (name) => {
    if (name === 'ver-item') {
      viewCodigo.value = route.params.codigoItem
      viewOpen.value = true
    } else {
      viewOpen.value = false
      viewCodigo.value = null
    }
  },
  { immediate: true }
)

/* Editar */
const openEdit = (record) => {
  router.push({
    name: 'editar-item',
    params: { codigoItem: record.codigoItem }
  })
}

watch(
  () => route.name,
  (name) => {
    if (name === 'editar-item') {
      editCodigo.value = route.params.codigoItem
      editOpen.value = true
    } else {
      editOpen.value = false
      editCodigo.value = null
    }
  },
  { immediate: true }
)

/* Activar / Desactivar */
const activarItem = async (codigoItem) => {
  await itemService.activar(codigoItem)
  loadItems()
}

const desactivarItem = async (codigoItem) => {
  await itemService.desactivar(codigoItem)
  loadItems()
}

/* Exportar */
const exportExcel = async () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(activeFilters.value).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  )

  if (cleanFilters.enabled === 'true') cleanFilters.enabled = true
  if (cleanFilters.enabled === 'false') cleanFilters.enabled = false

  const response = await itemService.exportExcel(cleanFilters)

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = globalThis.URL.createObjectURL(blob)

  let filename = 'items.xlsx'
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
    Object.entries(activeFilters.value).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  )

  if (cleanFilters.enabled === 'true') cleanFilters.enabled = true
  if (cleanFilters.enabled === 'false') cleanFilters.enabled = false

  const response = await adminItemService.exportExcelAuditoria(cleanFilters)

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = globalThis.URL.createObjectURL(blob)

  let filename = 'items_auditoria.xlsx'
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

const isAdmin = computed(() =>
  authStore.hasRole('ROLE_ADMINISTRACION')
)

loadItems()
</script>

<template>
  <div>
    <h2>Gestión de Items</h2>

    <a-space wrap style="margin: 24px 0;">
      <a-button type="primary" @click="createOpen = true">
        + Nuevo Item
      </a-button>

      <a-button @click="exportExcel">
        <DownloadOutlined /> Exportar Excel
      </a-button>

      <!-- Exportar con auditoría (solo administrador) -->
      <a-tooltip title="Incluye campos de auditoría (solo administración)" placement="top">
        <a-button :disabled="!isAdmin" type="dashed" @click="exportExcelAuditoria">
          <DownloadOutlined />
          Exportar con auditoría
        </a-button>
      </a-tooltip>
    </a-space>

    <CreateItemModal :open="createOpen" @close="createOpen = false" @success="loadItems()" />

    <ItemFilters @search="onSearch" />

    <ItemTable :data="items" :loading="loading" :pagination="pagination" @change="onTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'actions'">
          <a-dropdown trigger="click">
            <a-button type="text">⋮</a-button>

            <template #overlay>
              <a-menu>
                <a-menu-item v-if="!record.enabled" @click="activarItem(record.codigoItem)">
                  Activar
                </a-menu-item>

                <a-menu-item v-if="record.enabled" danger @click="desactivarItem(record.codigoItem)">
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
    </ItemTable>

    <EditItemModal :open="editOpen" :codigoItem="editCodigo" @close="router.push({ name: 'gestion-items' })"
      @success="loadItems()" />

    <ViewItemModal :open="viewOpen" :codigoItem="viewCodigo" @close="router.push({ name: 'gestion-items' })" />

    <router-view />
  </div>
</template>
