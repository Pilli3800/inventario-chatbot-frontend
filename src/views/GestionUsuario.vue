<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { adminUserService } from '@/services/admin-user.service'
import UserFilters from '@/components/admin/UserFilters.vue'
import UserTable from '@/components/admin/UserTable.vue'
import ResetPasswordModal from '@/components/admin/ResetPasswordModal.vue'
import EditUserModal from '@/components/admin/EditUserModal.vue'
import ViewUserModal from '@/components/admin/ViewUserModal.vue'
import CreateUserModal from '@/components/admin/CreateUserModal.vue'
import { DownloadOutlined } from '@ant-design/icons-vue';


const users = ref([])
const loading = ref(false)
const resetOpen = ref(false)
const userResetIdent = ref(null)
const viewOpen = ref(false)
const viewIdent = ref(null)
const createOpen = ref(false)

const router = useRouter()
const route = useRoute()

const pagination = ref({
  current: 1,
  pageSize: 6,
  total: 0
})

const activeFilters = ref({})

// VER
const openView = (record) => {
  router.push({
    name: 'ver-usuario',
    params: { identUsuario: record.identUsuario }
  })
}
watch(
  () => route.name,
  (name) => {
    if (name === 'ver-usuario') {
      viewIdent.value = route.params.identUsuario
      viewOpen.value = true
    } else {
      viewOpen.value = false
      viewIdent.value = null
    }
  },
  { immediate: true }
)

// EDITAR
const editOpen = ref(false)
const editIdent = ref(null)
const openEdit = (record) => {
  router.push({
    name: 'editar-usuario',
    params: { identUsuario: record.identUsuario }
  })
}
watch(
  () => route.name,
  (name) => {
    if (name === 'editar-usuario') {
      editIdent.value = route.params.identUsuario
      editOpen.value = true
    } else {
      editOpen.value = false
      editIdent.value = null
    }
  },
  { immediate: true }
)

// CARGAR USUARIOS
const loadUsers = async (filters = activeFilters.value) => {
  loading.value = true

  // Se limpia filtros vacios antes de enviarlos al servicio
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  )

  if (cleanFilters.enabled === "true") cleanFilters.enabled = true
  if (cleanFilters.enabled === "false") cleanFilters.enabled = false

  const { data } = await adminUserService.search({
    ...cleanFilters,
    page: pagination.value.current - 1,
    size: pagination.value.pageSize
  })

  users.value = data.content
  pagination.value.total = data.totalElements

  loading.value = false
}

const onTableChange = (pager) => {
  pagination.value.current = pager.current
  pagination.value.pageSize = pager.pageSize

  loadUsers()
}

const onSearch = (filters) => {
  pagination.value.current = 1   //resetear paginación
  activeFilters.value = { ...filters }
  loadUsers(filters)
}

const activarUser = async (identUsuario) => {
  await adminUserService.activar(identUsuario)
  loadUsers() // recarga tabla
}

const desactivarUser = async (identUsuario) => {
  await adminUserService.desactivar(identUsuario)
  loadUsers() // recarga tabla
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

  const response = await adminUserService.exportExcel(cleanFilters)

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = globalThis.URL.createObjectURL(blob)

  let filename = 'usuarios.xlsx'
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

loadUsers()
</script>

<template>
  <div>
    <h2>Gestión de Usuarios</h2>
    <div style="margin: 12px 0;">
      <a-button type="primary" @click="createOpen = true">
        + Nuevo Usuario
      </a-button>

      <a-button style="margin-left: 8px" @click="exportExcel">
        <DownloadOutlined /> Exportar Excel
      </a-button>
    </div>

    <CreateUserModal :open="createOpen" @close="createOpen = false" @success="loadUsers()" />

    <UserFilters @search="onSearch" />

    <UserTable :data="users" :loading="loading" :pagination="pagination" @change="onTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'actions'">
          <a-dropdown>
            <a-button type="text">⋮</a-button>

            <template #overlay>
              <a-menu>
                <!-- Mostrar Activar si está inactivo -->
                <a-menu-item v-if="!record.enabled" @click="activarUser(record.identUsuario)">
                  Activar
                </a-menu-item>

                <!-- Mostrar Desactivar si está activo -->
                <a-menu-item v-if="record.enabled" danger @click="desactivarUser(record.identUsuario)">
                  Desactivar
                </a-menu-item>

                <a-menu-divider />

                <a-menu-item @click="openView(record)">
                  Ver
                </a-menu-item>

                <a-menu-item @click="openEdit(record)">
                  Editar
                </a-menu-item>

                <a-menu-item @click="
                  userResetIdent = record.identUsuario;
                resetOpen = true;
                ">
                  Resetear contraseña
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
    </UserTable>
    <ResetPasswordModal :open="resetOpen" :identUsuario="userResetIdent" @close="resetOpen = false"
      @success="loadUsers()" />

    <EditUserModal :open="editOpen" :identUsuario="editIdent" @close="router.push({ name: 'gestion-usuarios' })"
      @success="loadUsers()" />

    <ViewUserModal :open="viewOpen" :identUsuario="viewIdent" @close="router.push({ name: 'gestion-usuarios' })" />

    <router-view />
  </div>
</template>
