<!-- GestionSedes.vue -->
<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import { adminSedeService } from '@/services/admin-sede.service'
import { sedeService } from '@/services/sede.service'
import EditSedeModal from '@/components/admin/EditSedeModal.vue'
import { useTableData } from '@/composables/useTableData'

const router = useRouter()
const route = useRoute()

/* Data de Sedes */
const {
  data: sedes,
  loading,
  load: loadSedes
} = useTableData({
  service: sedeService.getSedes
  // no defaultSort
  // no pagination
  // no filters
})

/* Editar Sede */
const editOpen = ref(false)
const editCodigo = ref(null)

const openEdit = (sede) => {
  router.push({
    name: 'editar-sede',
    params: { codigoSede: sede.codigo }
  })
}

watch(
  () => route.name,
  (name) => {
    if (name === 'editar-sede') {
      editCodigo.value = route.params.codigoSede
      editOpen.value = true
    } else {
      editOpen.value = false
      editCodigo.value = null
    }
  },
  { immediate: true }
)

/* Activar/Desactivar Sede */
const toggleEstado = (sede) => {
  Modal.confirm({
    title: sede.enabled ? 'Desactivar sede' : 'Activar sede',
    content: `La sede "${sede.nombre}" será ${sede.enabled ? 'desactivada' : 'activada'}.`,
    okText: sede.enabled ? 'Desactivar' : 'Activar',
    okType: sede.enabled ? 'danger' : 'primary',
    async onOk() {
      if (sede.enabled) {
        await adminSedeService.desactivarSede(sede.codigo)
        message.success('Sede desactivada')
      } else {
        await adminSedeService.activarSede(sede.codigo)
        message.success('Sede activada')
      }
      loadSedes()
    }
  })
}

const onEditSuccess = () => {
  message.success({
    content: 'Sede actualizada correctamente',
    duration: 2
  })
  loadSedes()
}

loadSedes()
</script>


<template>
  <div>
    <h2>Gestión de Sedes</h2>

    <a-collapse ghost default-active-key="stats" style="margin-bottom: 16px">
      <a-collapse-panel key="stats" header="Resumen de sedes">
        <a-row :gutter="[16, 16]">

          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-card size="small">
              <a-statistic title="🏢 Total sedes" :value="sedes.length" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-card size="small">
              <a-statistic title="🟢 Activas" :value="sedes.filter(s => s.enabled).length"
                :value-style="{ color: '#52c41a' }" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-card size="small">
              <a-statistic title="🔴 Inactivas" :value="sedes.filter(s => !s.enabled).length"
                :value-style="{ color: '#ff4d4f' }" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-card size="small">
              <a-statistic title="⭐ Sede principal" :value="sedes.find(s => s.codigo === 'S1') ? 'S1' : '-'" />
            </a-card>
          </a-col>

        </a-row>
      </a-collapse-panel>
    </a-collapse>

    <a-alert
      description="En próximas versiones podrás crear y administrar todas las sedes que necesites. Actualmente el sistema trabaja con un conjunto fijo de 2 sedes."
      type="info" show-icon style="margin-bottom: 16px" />

    <a-table :data-source="sedes" :loading="loading" row-key="codigo" :pagination="false"
      :scroll="{ x: 'max-content' }">
      <a-table-column title="Código" data-index="codigo">
        <template #default="{ record }">
          <a-space>
            <strong>{{ record.codigo }}</strong>
            <a-tag v-if="record.codigo === 'S1'" color="blue">
              Principal
            </a-tag>
          </a-space>
        </template>
      </a-table-column>

      <a-table-column title="Nombre" data-index="nombre" />
      <a-table-column title="Descripción" data-index="descripcion" />

      <a-table-column title="Estado">
        <template #default="{ record }">
          <a-tag :color="record.enabled ? 'green' : 'red'">
            {{ record.enabled ? 'Activo' : 'Inactivo' }}
          </a-tag>
        </template>
      </a-table-column>

      <a-table-column title="Acciones" fixed="right">
        <template #default="{ record }">
          <a-dropdown :trigger="['click']">
            <a-button type="text" @click.stop @touchstart.stop>
              ⋮
            </a-button>

            <template #overlay>
              <a-menu>
                <a-menu-item v-if="!record.enabled" @click="toggleEstado(record)">
                  Activar
                </a-menu-item>

                <a-menu-item v-if="record.enabled" danger @click="toggleEstado(record)">
                  Desactivar
                </a-menu-item>

                <a-menu-divider />

                <a-menu-item @click="openEdit(record)">
                  Editar
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </a-table-column>
    </a-table>

    <EditSedeModal :open="editOpen" :codigoSede="editCodigo" @close="router.push({ name: 'gestion-sedes' })"
      @success="onEditSuccess" />

    <router-view />
  </div>
</template>
