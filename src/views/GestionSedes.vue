<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import { adminSedeService } from '@/services/admin-sede.service'
import { sedeService } from '@/services/sede.service'
import EditSedeModal from '@/components/admin/EditSedeModal.vue'

const sedes = ref([])
const loading = ref(false)

const router = useRouter()
const route = useRoute()

/* Editar sede */
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

/* Cargar sedes */
const loadSedes = async () => {
  loading.value = true
  try {
    const { data } = await sedeService.getSedes()
    sedes.value = data.content
  } finally {
    loading.value = false
  }
}

/* Activar/Desactivar sede */
const toggleEstado = (sede) => {
  Modal.confirm({
    title: sede.enabled ? '¿Desactivar sede?' : '¿Activar sede?',
    content: `Sede ${sede.codigo}`,
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
    <a-table :data-source="sedes" :loading="loading" row-key="codigo" :pagination="false"
      :scroll="{ x: 'max-content' }">
      <a-table-column title="Código" data-index="codigo" />

      <a-table-column title="Nombre" data-index="nombre" />

      <a-table-column title="Descripción" data-index="descripcion" />

      <a-table-column title="Estado">
        <template #default="{ record }">
          <a-tag :color="record.enabled ? 'green' : 'red'">
            {{ record.enabled ? 'Activo' : 'Inactivo' }}
          </a-tag>
        </template>
      </a-table-column>

      <a-table-column title="Acciones" :align="'center'" fixed="right">

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
