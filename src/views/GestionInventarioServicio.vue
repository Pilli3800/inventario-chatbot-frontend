<script setup>
import { ref, h, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { usePermissions } from '@/composables/usePermissions'
import { useTableData } from '@/composables/useTableData'

import InventarioServicioFilters from '@/components/logistica/inventario-servicio/InventarioServicioFilters.vue'
import InventarioServicioTable from '@/components/logistica/inventario-servicio/InventarioServicioTable.vue'
import CreateInventarioServicioModal from '@/components/logistica/inventario-servicio/CreateInventarioServicioModal.vue'

import { inventarioServicioService } from '@/services/inventario-servicio.service'

const createOpen = ref(false)

const {
  data: inventariosServicio,
  loading,
  pagination,
  sorter,
  filters,
  load: loadInventarioServicio,
  onTableChange,
  onSearch
} = useTableData({
  service: async (params) => {
    if (!params?.codigoServicio) {
      return {
        data: {
          content: [],
          totalElements: 0
        }
      }
    }
    return inventarioServicioService.search(params)
  },
  defaultSort: {
    field: 'nombreItem',
    order: 'ascend'
  },
  pageSize: 10
})

const {
  canCreate,
  canDelete
} = usePermissions()

const servicioSeleccionado = computed(() =>
  !!filters.value.codigoServicio
)

const paginationConfig = computed(() => ({
  ...pagination.value,
  showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
  showQuickJumper: true,
  showSizeChanger: true,
  locale: {
    jump_to: 'Ir a',
    page: 'pagina',
    items_per_page: ' / pagina'
  }
}))

const getStock = (record) => Number(record.stockActual ?? record.stock ?? 0)
const getTipoItem = (record) => String(record.tipoItem || '').toUpperCase()

const totalRegistros = computed(() => inventariosServicio.value.length)
const totalConStock = computed(() =>
  inventariosServicio.value.filter(r => getStock(r) > 0).length
)
const totalSinStock = computed(() =>
  inventariosServicio.value.filter(r => getStock(r) <= 0).length
)
const totalMateriales = computed(() =>
  inventariosServicio.value.filter(r => getTipoItem(r) === 'MATERIAL').length
)
const totalHerramientas = computed(() =>
  inventariosServicio.value.filter(r => getTipoItem(r) === 'HERRAMIENTA').length
)
const totalEquipos = computed(() =>
  inventariosServicio.value.filter(r => getTipoItem(r) === 'EQUIPO').length
)

const eliminarAsignacion = (record) => {
  if (getStock(record) !== 0) {
    message.warning('Solo se puede eliminar si el stock actual es 0')
    return
  }

  Modal.confirm({
    title: 'Eliminar asignacion',
    icon: h(ExclamationCircleOutlined),
    content: 'Se eliminara la asignacion solo si cumple: stock actual = 0 y sin movimientos asociados.',
    okText: 'Eliminar',
    okType: 'danger',
    cancelText: 'Cancelar',
    async onOk() {
      try {
        await inventarioServicioService.eliminar(record.id)
        message.success('Asignacion eliminada')
        loadInventarioServicio()
      } catch (err) {
        const content = err.response?.data?.content
        const errorMsg = Array.isArray(content)
          ? content.join(', ')
          : content
        message.error(errorMsg || 'No se pudo eliminar. Verifique stock en 0 y ausencia de movimientos asociados.')
      }
    }
  })
}

loadInventarioServicio()
</script>

<template>
  <div>
    <h2>Gestion de Inventario por Servicio</h2>

    <a-collapse ghost :default-active-key="[]">
      <a-collapse-panel key="stats" header="📊 Resumen de inventario servicio">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="📄 Total" :value="totalRegistros" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="📦 Con stock" :value="totalConStock" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="📭 Sin stock" :value="totalSinStock" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="🧱 Materiales" :value="totalMateriales" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="🛠️ Herramientas" :value="totalHerramientas" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="⚙️ Equipos" :value="totalEquipos" />
            </a-card>
          </a-col>
        </a-row>
      </a-collapse-panel>
    </a-collapse>

    <a-space wrap style="margin: 24px 0;">
      <a-button type="primary" v-if="canCreate" @click="createOpen = true">
        + Asignar Item a Servicio
      </a-button>
    </a-space>

    <CreateInventarioServicioModal v-if="canCreate" :open="createOpen" @close="createOpen = false" @success="loadInventarioServicio" />

    <InventarioServicioFilters @search="onSearch" />

    <a-empty v-if="!servicioSeleccionado" description="Seleccione un servicio para ver el inventario" style="margin-top: 48px" />

    <div v-else class="inventario-servicio-wrapper">
      <InventarioServicioTable
        :data="inventariosServicio"
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
                  <a-menu-item v-if="canDelete && getStock(record) === 0" danger @click="eliminarAsignacion(record)">
                    Eliminar
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </InventarioServicioTable>
    </div>
  </div>
</template>

<style>
.inventario-servicio-wrapper {
  display: flex;
  flex-direction: column;
}
</style>
