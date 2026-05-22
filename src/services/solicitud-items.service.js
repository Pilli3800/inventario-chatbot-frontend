import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/solicitud-items'
const LOGISTICA_URL = 'http://localhost:8080/api/solicitud-items'

export const solicitudItemsService = {
  async search(params) {
    const authStore = useAuthStore()
    return axios.get(API_URL, {
      params,
      headers: { Authorization: authStore.token }
    })
  },

  async getById(id) {
    const authStore = useAuthStore()
    return axios.get(`${LOGISTICA_URL}/${id}`, {
      headers: { Authorization: authStore.token }
    })
  },

  async getDashboard(params) {
    const authStore = useAuthStore()
    return axios.get(`${LOGISTICA_URL}/dashboard`, {
      params,
      headers: { Authorization: authStore.token }
    })
  },

  async create(payload) {
    const authStore = useAuthStore()
    return axios.post(API_URL, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async aprobar(id, payload) {
    const authStore = useAuthStore()
    return axios.patch(`${LOGISTICA_URL}/${id}/aprobar`, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async rechazar(id, payload) {
    const authStore = useAuthStore()
    return axios.patch(`${LOGISTICA_URL}/${id}/rechazar`, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async entregar(id, payload) {
    const authStore = useAuthStore()
    return axios.patch(`${LOGISTICA_URL}/${id}/entregar`, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async devolver(id, payload) {
    const authStore = useAuthStore()
    return axios.patch(`${LOGISTICA_URL}/${id}/devolver`, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async cerrarSinDevolucion(id, payload) {
    const authStore = useAuthStore()
    return axios.patch(`${LOGISTICA_URL}/${id}/cerrar-sin-devolucion`, payload, {
      headers: { Authorization: authStore.token }
    })
  }
}
