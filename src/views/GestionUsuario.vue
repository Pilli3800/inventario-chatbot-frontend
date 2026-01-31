<!-- GestionUsuario.vue -->
<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userService } from '@/services/user.service'
import { adminUserService } from '@/services/admin-user.service'
import UserFilters from '@/components/admin/users/UserFilters.vue'
import UserTable from '@/components/admin/users/UserTable.vue'
import ResetPasswordModal from '@/components/admin/users/ResetPasswordModal.vue'
import EditUserModal from '@/components/admin/users/EditUserModal.vue'
import ViewUserModal from '@/components/admin/users/ViewUserModal.vue'
import CreateUserModal from '@/components/admin/users/CreateUserModal.vue'
import { DownloadOutlined } from '@ant-design/icons-vue';
import { useTableData } from '@/composables/useTableData'
import { useAuthStore } from '@/stores/auth.store'

const resetOpen = ref(false)
const userResetIdent = ref(null)
const viewOpen = ref(false)
const viewIdent = ref(null)
const createOpen = ref(false)

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()

const {
  data: users,
  loading,
  pagination,
  sorter,
  filters,
  load: loadUsers,
  onTableChange,
  onSearch
} = useTableData({
  service: userService.search,
  defaultSort: {
    field: 'identUsuario',
    order: 'ascend'
  },
  pageSize: 10
})

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

const activarUser = async (identUsuario) => {
  await adminUserService.activar(identUsuario)
  loadUsers() // recarga tabla
}

const desactivarUser = async (identUsuario) => {
  await adminUserService.desactivar(identUsuario)
  loadUsers() // recarga tabla
}

/* Estadísticas */
const totalUsuarios = computed(() => users.value.length)

const totalAdministracion = computed(() =>
  users.value.filter(u => u.roles?.includes('ADMINISTRACION')).length
)

const totalLogistica = computed(() =>
  users.value.filter(u => u.roles?.includes('LOGISTICA')).length
)

const totalGerencia = computed(() =>
  users.value.filter(u => u.roles?.includes('GERENCIA')).length
)

const totalJefeCuadrilla = computed(() =>
  users.value.filter(u => u.roles?.includes('JEFE_CUADRILLA')).length
)

const totalActivos = computed(() =>
  users.value.filter(u => u.enabled).length
)

const totalInactivos = computed(() =>
  users.value.filter(u => !u.enabled).length
)

/* Exportar */
const exportExcel = async () => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters.value).filter(
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

// util: si es el usuario actual
const isSelf = (record) => {
  return record.identUsuario === authStore.ident
}

loadUsers()
</script>

<template>
  <div>
    <h2>Gestión de Usuarios</h2>

    <a-collapse ghost default-active-key="stats">
      <a-collapse-panel key="stats" header="Resumen de usuarios">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="👥 Total usuarios" :value="totalUsuarios" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="🧑‍💼 Administración" :value="totalAdministracion" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="📦 Logística" :value="totalLogistica" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="📊 Gerencia" :value="totalGerencia" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="🛠️ Jefe cuadrilla" :value="totalJefeCuadrilla" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="🟢 Activos" :value="totalActivos" :value-style="{ color: '#52c41a' }" />
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-card size="small">
              <a-statistic title="🔴 Inactivos" :value="totalInactivos" :value-style="{ color: '#ff4d4f' }" />
            </a-card>
          </a-col>
        </a-row>
      </a-collapse-panel>
    </a-collapse>


    <a-space wrap style="margin: 24px 0;">
      <a-button type="primary" @click="createOpen = true">
        + Nuevo Usuario
      </a-button>

      <a-button @click="exportExcel">
        <DownloadOutlined /> Exportar Excel
      </a-button>
    </a-space>

    <CreateUserModal :open="createOpen" @close="createOpen = false" @success="loadUsers()" />

    <UserFilters @search="onSearch" />

    <UserTable :data="users" :loading="loading" :pagination="pagination" :sorter="sorter" @change="onTableChange">
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
                <a-tooltip v-if="record.enabled && isSelf(record)" title="No puedes desactivarte a ti mismo">
                  <span>
                    <a-menu-item disabled danger>
                      Desactivar
                    </a-menu-item>
                  </span>
                </a-tooltip>

                <a-menu-item v-else-if="record.enabled" danger @click="desactivarUser(record.identUsuario)">
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
