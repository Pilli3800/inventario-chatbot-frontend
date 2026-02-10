// src/composables/usePermissions.js
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

export function usePermissions() {
  const authStore = useAuthStore()

  const canCreate = computed(() => authStore.hasPermission('create'))
  const canEdit   = computed(() => authStore.hasPermission('edit'))
  const canDelete = computed(() => authStore.hasPermission('delete'))
  const canToggle = computed(() => authStore.hasPermission('toggle'))
  const canView   = computed(() => authStore.hasPermission('view'))
  const canReport = computed(() => authStore.hasPermission('report'))
  const canAudit  = computed(() => authStore.hasPermission('audit'))
  const canViewList = computed(() => authStore.hasPermission('viewList'))
  const canCreateMovimiento = computed(() => authStore.hasPermission('createMovimiento'))
  const canCreateSolicitud = computed(() => authStore.hasPermission('createSolicitud'))
  const canManageSolicitudes = computed(() => authStore.hasPermission('manageSolicitudes'))
  const canViewItemHistory = computed(() => authStore.hasPermission('viewItemHistory'))

  return {
    canCreate,
    canCreateMovimiento,
    canCreateSolicitud,
    canManageSolicitudes,
    canEdit,
    canDelete,
    canToggle,
    canView,
    canViewItemHistory,
    canReport,
    canAudit,
    canViewList
  }
}
