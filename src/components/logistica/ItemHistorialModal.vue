<script setup>
import { ref, watch, computed } from 'vue'
import { EllipsisOutlined } from '@ant-design/icons-vue'
import { useTableData } from '@/composables/useTableData'
import { usePermissions } from '@/composables/usePermissions'
import { movimientosService } from '@/services/movimientos.service'
import MovimientoFilters from '@/components/logistica/movimientos/MovimientoFilters.vue'
import MovimientosTable from '@/components/logistica/movimientos/MovimientosTable.vue'
import ViewMovimientoModal from '@/components/logistica/movimientos/ViewMovimientoModal.vue'

const props = defineProps({
  open: Boolean,
  codigoItem: String
})

const emit = defineEmits(['close'])

const {
  data: movimientos,
  loading,
  pagination,
  sorter,
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

const { canView } = usePermissions()

const viewOpen = ref(false)
const viewId = ref(null)

const openView = (record) => {
  viewId.value = record.id
  viewOpen.value = true
}

const resetAndSearch = () => {
  if (!props.codigoItem) return
  onSearch({
    codigoItem: props.codigoItem
  })
}

watch(
  () => [props.open, props.codigoItem],
  ([open, codigoItem]) => {
    if (open && codigoItem) resetAndSearch()
  },
  { immediate: true }
)

const title = computed(() =>
  props.codigoItem
    ? `Historial del Item ${props.codigoItem}`
    : 'Historial del Item'
)

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

const handleClose = () => emit('close')
</script>

<template>
  <a-modal :open="open" :title="title" ok-text="Cerrar" :cancelButtonProps="{ style: { display: 'none' } }"
    :width="1200" @ok="handleClose" @cancel="handleClose">
    <ViewMovimientoModal :open="viewOpen" :idMovimiento="viewId" @close="viewOpen = false" />

    <MovimientoFilters
      :initialCodigoItem="codigoItem"
      :lockItem="true"
      @search="onSearch"
    />

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
  </a-modal>
</template>

<style scoped>
.movimientos-wrapper {
  display: flex;
  flex-direction: column;
}

:deep(.ant-table-pagination) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

:deep(.ant-pagination-total-text) {
  margin-right: auto;
}
</style>
