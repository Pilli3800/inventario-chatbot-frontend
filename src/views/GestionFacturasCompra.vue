<script setup>
import { ref, watch, computed } from 'vue'
import { EllipsisOutlined } from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'
import { useTableData } from '@/composables/useTableData'
import { facturaCompraService } from '@/services/factura-compra.service'

import FacturaFilters from '@/components/logistica/facturas/FacturaFilters.vue'
import FacturasTable from '@/components/logistica/facturas/FacturasTable.vue'
import CreateFacturaCompraModal from '@/components/logistica/facturas/CreateFacturaCompraModal.vue'
import ViewFacturaCompraModal from '@/components/logistica/facturas/ViewFacturaCompraModal.vue'

const router = useRouter()
const route = useRoute()

const createOpen = ref(false)
const viewOpen = ref(false)

const viewCodigoProveedor = ref(null)
const viewNumeroFactura = ref(null)

const {
  data: facturas,
  loading,
  pagination,
  sorter,
  load: loadFacturas,
  onTableChange,
  onSearch
} = useTableData({
  service: facturaCompraService.search,
  defaultSort: {
    field: 'fechaEmision',
    order: 'ascend'
  },
  pageSize: 10
})

const paginationConfig = computed(() => ({
  ...pagination.value,
  showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} facturas`,
  showQuickJumper: true,
  showSizeChanger: true,
  locale: {
    jump_to: 'Ir a',
    page: 'pagina',
    items_per_page: ' / pagina'
  }
}))

const {
  canCreate,
  canView
} = usePermissions()

const totalFacturas = computed(() => facturas.value.length)
const totalConFecha = computed(() =>
  facturas.value.filter(f => !!f.fechaEmision).length
)
const totalSinFecha = computed(() =>
  facturas.value.filter(f => !f.fechaEmision).length
)
const totalConObservaciones = computed(() =>
  facturas.value.filter(f => f.observaciones && String(f.observaciones).trim() !== '').length
)
const totalSinObservaciones = computed(() =>
  facturas.value.filter(f => !f.observaciones || String(f.observaciones).trim() === '').length
)

const openView = (record) => {
  router.push({
    name: 'ver-factura-compra',
    params: {
      codigoProveedor: record.codigoProveedor,
      numeroFactura: record.numeroFactura
    }
  })
}

watch(
  () => [route.name, route.params.codigoProveedor, route.params.numeroFactura],
  ([name, codigoProveedor, numeroFactura]) => {
    if (name === 'ver-factura-compra' && codigoProveedor && numeroFactura) {
      viewCodigoProveedor.value = codigoProveedor
      viewNumeroFactura.value = numeroFactura
      viewOpen.value = true
    } else {
      viewOpen.value = false
      viewCodigoProveedor.value = null
      viewNumeroFactura.value = null
    }
  },
  { immediate: true }
)

loadFacturas()
</script>

<template>
  <div>
    <h2>Gestion de Facturas de Compra</h2>

    <a-collapse ghost :default-active-key="[]">
      <a-collapse-panel key="stats" header="📊 Resumen de facturas">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="📄 Total" :value="totalFacturas" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="📅 Con fecha" :value="totalConFecha" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="🚫 Sin fecha" :value="totalSinFecha" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="📝 Con observaciones" :value="totalConObservaciones" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="🔕 Sin observaciones" :value="totalSinObservaciones" />
            </a-card>
          </a-col>
        </a-row>
      </a-collapse-panel>
    </a-collapse>

    <a-space wrap style="margin: 24px 0;">
      <a-button type="primary" v-if="canCreate" @click="createOpen = true">
        + Nueva Factura
      </a-button>
    </a-space>

    <CreateFacturaCompraModal v-if="canCreate" :open="createOpen" @close="createOpen = false" @success="loadFacturas()" />

    <ViewFacturaCompraModal
      v-if="viewOpen"
      :open="viewOpen"
      :codigoProveedor="viewCodigoProveedor"
      :numeroFactura="viewNumeroFactura"
      @close="router.push({ name: 'gestion-facturas-compra' })"
    />

    <FacturaFilters @search="onSearch" />

    <div class="facturas-wrapper">
      <FacturasTable :data="facturas" :loading="loading" :pagination="paginationConfig" :sorter="sorter" @change="onTableChange">
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
      </FacturasTable>
    </div>

    <router-view />
  </div>
</template>

<style>
.facturas-wrapper {
  display: flex;
  flex-direction: column;
}
</style>
