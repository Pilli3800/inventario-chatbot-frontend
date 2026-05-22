import { screenContexts } from '@/config/screen-context.config'
import { useAuthStore } from '@/stores/auth.store'

const getCurrentPath = (route) => {
  if (typeof window !== 'undefined') {
    return window.location.pathname
  }
  return route?.path || ''
}

const getRouteContext = (route) => {
  const matchedNames = route?.matched
    ?.map(record => record.name)
    .filter(Boolean)
    .reverse() || []

  const names = [
    route?.name,
    ...matchedNames
  ].filter(Boolean)

  return names.map(name => screenContexts[name]).find(Boolean)
}

const canUseContextItem = (item, authStore) => {
  if (typeof item === 'string') return true

  const permissions = Array.isArray(item.permissions)
    ? item.permissions
    : [item.permission].filter(Boolean)

  const roles = Array.isArray(item.roles)
    ? item.roles
    : [item.role].filter(Boolean)

  const hasPermission = permissions.length === 0 ||
    permissions.some(permission => authStore.hasPermission(permission))

  const hasRole = roles.length === 0 ||
    roles.some(role => authStore.hasRole(role))

  return hasPermission && hasRole
}

const normalizeContextList = (items, authStore) =>
  (items || [])
    .filter(item => canUseContextItem(item, authStore))
    .map(item => typeof item === 'string' ? item : item.label)
    .filter(Boolean)

export const buildScreenContext = (route) => {
  const context = getRouteContext(route)
  const authStore = useAuthStore()

  return {
    ruta: getCurrentPath(route),
    titulo: context?.titulo || 'Pantalla del sistema',
    modulo: context?.modulo || 'General',
    elementosVisibles: normalizeContextList(context?.elementosVisibles, authStore),
    accionesDisponibles: normalizeContextList(context?.accionesDisponibles, authStore)
  }
}
