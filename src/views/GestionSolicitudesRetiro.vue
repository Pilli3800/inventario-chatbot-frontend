<!-- GestionSolicitudesRetiro.vue -->
<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { EllipsisOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useTableData } from '@/composables/useTableData'
import { usePermissions } from '@/composables/usePermissions'
import { useAuthStore } from '@/stores/auth.store'

import SolicitudFilters from '@/components/logistica/solicitudes/SolicitudFilters.vue'
import SolicitudesTable from '@/components/logistica/solicitudes/SolicitudesTable.vue'
import CreateSolicitudModal from '@/components/logistica/solicitudes/CreateSolicitudModal.vue'
import ViewSolicitudModal from '@/components/logistica/solicitudes/ViewSolicitudModal.vue'
import AprobarSolicitudModal from '@/components/logistica/solicitudes/AprobarSolicitudModal.vue'
import RechazarSolicitudModal from '@/components/logistica/solicitudes/RechazarSolicitudModal.vue'
import EntregarSolicitudModal from '@/components/logistica/solicitudes/EntregarSolicitudModal.vue'
import DevolverSolicitudModal from '@/components/logistica/solicitudes/DevolverSolicitudModal.vue'
import CerrarSinDevolucionSolicitudModal from '@/components/logistica/solicitudes/CerrarSinDevolucionSolicitudModal.vue'

import { solicitudItemsService } from '@/services/solicitud-items.service'
import { comprobanteDevolucionService } from '@/services/comprobante-devolucion.service'

const router = useRouter()
const route = useRoute()
const { canCreateSolicitud, canView, canManageSolicitudes } = usePermissions()
const authStore = useAuthStore()
const isJefeCuadrilla = computed(() =>
  authStore.hasRole('ROLE_JEFE_CUADRILLA') || authStore.hasRole('JEFE_CUADRILLA')
)
const isLogistica = computed(() =>
  authStore.hasRole('ROLE_LOGISTICA') || authStore.hasRole('LOGISTICA')
)

const createOpen = ref(false)
const viewOpen = ref(false)
const approveOpen = ref(false)
const rejectOpen = ref(false)
const deliverOpen = ref(false)
const returnOpen = ref(false)
const closeWithoutReturnOpen = ref(false)

const selectedId = ref(null)
const dashboardStats = ref({
  total: 0,
  pendientes: 0,
  aprobadas: 0,
  rechazadas: 0,
  entregadas: 0,
  devueltas: 0,
  cerradasSinDevolucion: 0
})

const {
  data: solicitudes,
  loading,
  pagination,
  sorter,
  filters: activeFilters,
  load: loadSolicitudes,
  onTableChange,
  onSearch: onTableSearch
} = useTableData({
  service: (params) => {
    const nextParams = { ...params }
    if (isJefeCuadrilla.value && authStore.ident) {
      nextParams.identUsuario = authStore.ident
    }
    return solicitudItemsService.search(nextParams)
  },
  defaultSort: {
    field: 'fcCreacion',
    order: 'descend'
  },
  pageSize: 10
})

const paginationConfig = computed(() => ({
  ...pagination.value,
  showTotal: (total, range) => `${range[0]}–${range[1]} de ${total} solicitudes`,
  showQuickJumper: true,
  showSizeChanger: true,
  locale: {
    jump_to: 'Ir a',
    page: 'página',
    items_per_page: ' / página'
  }
}))

const loadDashboardStats = async (filters = activeFilters.value) => {
  const params = { ...filters }
  if (isJefeCuadrilla.value && authStore.ident) {
    params.identUsuario = authStore.ident
  }

  const { data } = await solicitudItemsService.getDashboard(params)
  dashboardStats.value = data?.data ?? data?.content ?? data
}

const refreshSolicitudes = () => {
  loadSolicitudes()
  loadDashboardStats()
}

const onSearch = (filters) => {
  onTableSearch(filters)
  loadDashboardStats(filters)
}

const openView = (record) => {
  router.push({
    name: 'ver-solicitud',
    params: { idSolicitud: record.id }
  })
}

watch(
  () => route.name,
  (name) => {
    if (name === 'ver-solicitud') {
      selectedId.value = route.params.idSolicitud
      viewOpen.value = true
    } else {
      viewOpen.value = false
      selectedId.value = null
    }
  },
  { immediate: true }
)

const openAprobar = (record) => {
  selectedId.value = record.id
  approveOpen.value = true
}

const openRechazar = (record) => {
  selectedId.value = record.id
  rejectOpen.value = true
}

const openEntregar = (record) => {
  selectedId.value = record.id
  deliverOpen.value = true
}

const openDevolver = (record) => {
  selectedId.value = record.id
  returnOpen.value = true
}

const openCerrarSinDevolucion = (record) => {
  selectedId.value = record.id
  closeWithoutReturnOpen.value = true
}

const getErrorMessage = (err, fallback) => {
  const responseData = err?.response?.data?.content ?? err?.response?.data
  if (Array.isArray(responseData)) return responseData[0] || fallback
  if (typeof responseData === 'string') return responseData || fallback
  return fallback
}

const downloadBlobResponse = (response, fallbackName) => {
  const blob = response?.data instanceof Blob
    ? response.data
    : new Blob([response.data], { type: 'application/pdf' })

  const url = globalThis.URL.createObjectURL(blob)
  let filename = fallbackName
  const disposition = response.headers?.['content-disposition']
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

const descargarComprobanteDevolucion = async (record) => {
  try {
    const { data } = await comprobanteDevolucionService.getBySolicitudId(record.id)
    const comprobante = data?.content ?? data
    if (!comprobante?.id) {
      message.warning('No hay comprobante de devolucion disponible')
      return
    }

    const response = await comprobanteDevolucionService.descargarPdf(comprobante.id)
    downloadBlobResponse(response, `comprobante_devolucion_${comprobante.numeroComprobante || comprobante.id}.pdf`)
  } catch (err) {
    message.error(getErrorMessage(err, 'No se pudo descargar el comprobante de devolucion'))
  }
}

refreshSolicitudes()
</script>

<template>
  <div>
    <h2>Gestión de Solicitudes de Retiro</h2>

    <a-collapse ghost :default-active-key="[]">
      <a-collapse-panel key="stats" header="📊 Resumen de solicitudes">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="Total" :value="dashboardStats.total" />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="Pendientes" :value="dashboardStats.pendientes" />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="Aprobadas" :value="dashboardStats.aprobadas" />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="Rechazadas" :value="dashboardStats.rechazadas" />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="Entregadas" :value="dashboardStats.entregadas" />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="Devueltas" :value="dashboardStats.devueltas" />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="Cerradas sin dev." :value="dashboardStats.cerradasSinDevolucion" />
            </a-card>
          </a-col>
        </a-row>
      </a-collapse-panel>
    </a-collapse>

    <a-space wrap style="margin: 24px 0;">
      <a-button type="primary" v-if="canCreateSolicitud" @click="createOpen = true">
        + Nueva Solicitud
      </a-button>
    </a-space>

    <CreateSolicitudModal v-if="canCreateSolicitud" :open="createOpen" @close="createOpen = false"
      @success="refreshSolicitudes()" />

    <AprobarSolicitudModal :open="approveOpen" :idSolicitud="selectedId" @close="approveOpen = false"
      @success="refreshSolicitudes()" />

    <RechazarSolicitudModal :open="rejectOpen" :idSolicitud="selectedId" @close="rejectOpen = false"
      @success="refreshSolicitudes()" />

    <EntregarSolicitudModal :open="deliverOpen" :idSolicitud="selectedId" @close="deliverOpen = false"
      @success="refreshSolicitudes()" />

    <DevolverSolicitudModal :open="returnOpen" :idSolicitud="selectedId" @close="returnOpen = false"
      @success="refreshSolicitudes()" />

    <CerrarSinDevolucionSolicitudModal :open="closeWithoutReturnOpen" :idSolicitud="selectedId"
      @close="closeWithoutReturnOpen = false" @success="refreshSolicitudes()" />

    <ViewSolicitudModal :open="viewOpen" :idSolicitud="selectedId"
      @close="router.push({ name: 'gestion-solicitudes-retiro' })" />

    <SolicitudFilters @search="onSearch" />

    <SolicitudesTable :data="solicitudes" :loading="loading" :pagination="paginationConfig" :sorter="sorter"
      @change="onTableChange">
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

                <a-menu-divider v-if="canManageSolicitudes" />

                <a-menu-item v-if="canManageSolicitudes && record.estado === 'PENDIENTE'" @click="openAprobar(record)">
                  Aprobar
                </a-menu-item>
                <a-menu-item v-if="canManageSolicitudes && record.estado === 'PENDIENTE'" danger
                  @click="openRechazar(record)">
                  Rechazar
                </a-menu-item>
                <a-menu-item v-if="canManageSolicitudes && record.estado === 'APROBADA'" @click="openEntregar(record)">
                  Marcar como Entregado
                </a-menu-item>
                <a-menu-item v-if="canManageSolicitudes && isLogistica && record.estado === 'ENTREGADO'"
                  @click="openDevolver(record)">
                  Devolver
                </a-menu-item>
                <a-menu-item v-if="canManageSolicitudes && isLogistica && record.estado === 'ENTREGADO'"
                  @click="openCerrarSinDevolucion(record)">
                  Cerrar sin devolucion
                </a-menu-item>
                <a-menu-item v-if="canView && isLogistica && record.estado === 'DEVUELTA'"
                  @click="descargarComprobanteDevolucion(record)">
                  Descargar comprobante devolucion
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
    </SolicitudesTable>

    <router-view />
  </div>
</template>
