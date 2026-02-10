<!-- GestionSolicitudesRetiro.vue -->
<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { EllipsisOutlined } from '@ant-design/icons-vue'
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

import { solicitudItemsService } from '@/services/solicitud-items.service'

const router = useRouter()
const route = useRoute()
const { canCreateSolicitud, canView, canManageSolicitudes } = usePermissions()
const authStore = useAuthStore()
const isJefeCuadrilla = computed(() =>
  authStore.hasRole('ROLE_JEFE_CUADRILLA') || authStore.hasRole('JEFE_CUADRILLA')
)

const createOpen = ref(false)
const viewOpen = ref(false)
const approveOpen = ref(false)
const rejectOpen = ref(false)
const deliverOpen = ref(false)

const selectedId = ref(null)

const {
  data: solicitudes,
  loading,
  pagination,
  sorter,
  load: loadSolicitudes,
  onTableChange,
  onSearch
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

const totalSolicitudes = computed(() => solicitudes.value.length)
const totalPendientes = computed(() =>
  solicitudes.value.filter(s => s.estado === 'PENDIENTE').length
)
const totalAprobadas = computed(() =>
  solicitudes.value.filter(s => s.estado === 'APROBADA').length
)
const totalRechazadas = computed(() =>
  solicitudes.value.filter(s => s.estado === 'RECHAZADA').length
)
const totalEntregadas = computed(() =>
  solicitudes.value.filter(s => s.estado === 'ENTREGADO').length
)

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

loadSolicitudes()
</script>

<template>
  <div>
    <h2>Gestión de Solicitudes de Retiro</h2>

    <a-collapse ghost :default-active-key="[]">
      <a-collapse-panel key="stats" header="📊 Resumen de solicitudes">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="📄 Total" :value="totalSolicitudes" />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="🕒 Pendientes" :value="totalPendientes" />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="✅ Aprobadas" :value="totalAprobadas" />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="❌ Rechazadas" :value="totalRechazadas" />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="📦 Entregadas" :value="totalEntregadas" />
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
      @success="loadSolicitudes()" />

    <AprobarSolicitudModal :open="approveOpen" :idSolicitud="selectedId" @close="approveOpen = false"
      @success="loadSolicitudes()" />

    <RechazarSolicitudModal :open="rejectOpen" :idSolicitud="selectedId" @close="rejectOpen = false"
      @success="loadSolicitudes()" />

    <EntregarSolicitudModal :open="deliverOpen" :idSolicitud="selectedId" @close="deliverOpen = false"
      @success="loadSolicitudes()" />

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
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
    </SolicitudesTable>

    <router-view />
  </div>
</template>
