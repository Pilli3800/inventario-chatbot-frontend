<!-- GestionMovimientos.vue -->
<script setup>
import { ref, watch, computed } from 'vue'
import { DownloadOutlined, EllipsisOutlined } from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'
import { useTableData } from '@/composables/useTableData'
import MovimientoFilters from '@/components/logistica/movimientos/MovimientoFilters.vue'
import MovimientosTable from '@/components/logistica/movimientos/MovimientosTable.vue'
import CreateMovimientoModal from '@/components/logistica/movimientos/CreateMovimientoModal.vue'
import ViewMovimientoModal from '@/components/logistica/movimientos/ViewMovimientoModal.vue'

import { movimientosService } from '@/services/movimientos.service'

/* Router */
const router = useRouter()
const route = useRoute()

const createOpen = ref(false)
const viewOpen = ref(false)

const viewId = ref(null)

/* Tabla y filtros */
const {
  data: movimientos,
  loading,
  pagination,
  sorter,
  filters,
  load: loadMovimientos,
  onTableChange,
  onSearch
} = useTableData({
  service: movimientosService.search,
  defaultSort: {
    field: 'fechaMovimiento',
    order: 'descend'
  },
  pageSize: 10
})

const paginationConfig = computed(() => ({
  ...pagination.value,
  showTotal: (total, range) => `${range[0]}–${range[1]} de ${total} movimientos`,
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
  canCreateMovimiento,
  canView,
  canReport
} = usePermissions()

/* Modals ruteados */
const openView = (record) => {
  router.push({
    name: 'ver-movimiento',
    params: { idMovimiento: record.id }
  })
}

/* Watch rutas */
watch(
  () => route.name,
  (name) => {
    if (name === 'ver-movimiento') {
      viewId.value = route.params.idMovimiento
      viewOpen.value = true
    } else {
      viewOpen.value = false
      viewId.value = null
    }
  },
  { immediate: true }
)

/* Exportar */
const exportExcel = async () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters.value).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  )

  const response = await movimientosService.exportExcel(cleanFilters)

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = globalThis.URL.createObjectURL(blob)

  let filename = 'movimientos.xlsx'
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
loadMovimientos()
</script>

<template>
  <div>
    <h2>Gestión de Movimientos</h2>

    <a-space wrap style="margin: 24px 0;">
      <a-button type="primary" v-if="canCreateMovimiento" @click="createOpen = true">
        + Registrar Movimiento
      </a-button>

      <a-button v-if="canReport" @click="exportExcel">
        <DownloadOutlined /> Exportar Excel
      </a-button>
    </a-space>

    <!-- Modals -->
    <CreateMovimientoModal v-if="canCreateMovimiento" :open="createOpen" @close="createOpen = false"
      @success="loadMovimientos()" />

    <ViewMovimientoModal :open="viewOpen" :idMovimiento="viewId" @close="router.back()" />

    <!-- Filtros -->
    <MovimientoFilters @search="onSearch" />

    <!-- Tabla -->
    <div class="movimientos-wrapper">
      <MovimientosTable
        :data="movimientos"
        :loading="loading"
        :pagination="paginationConfig"
        :sorter="sorter"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'actions'">
            <a-dropdown trigger="click">
              <a-button type="text">
                <EllipsisOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="canView" @click="openView(record)">
                    Ver
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </MovimientosTable>
    </div>

    <router-view />
  </div>
</template>

<style>
.movimientos-wrapper {
  display: flex;
  flex-direction: column;
}
</style>
