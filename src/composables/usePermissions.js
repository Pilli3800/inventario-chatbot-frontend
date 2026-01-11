// src/composables/usePermissions.js
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

export function usePermissions() {
  const authStore = useAuthStore()

  const canCreate = computed(() => authStore.hasPermission('create'))
  const canEdit   = computed(() => authStore.hasPermission('edit'))
  const canToggle = computed(() => authStore.hasPermission('toggle'))
  const canView   = computed(() => authStore.hasPermission('view'))
  const canReport = computed(() => authStore.hasPermission('report'))

  return {
    canCreate,
    canEdit,
    canToggle,
    canView,
    canReport
  }
}
