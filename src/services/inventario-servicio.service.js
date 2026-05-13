import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/logistica/inventarios-servicio'

export const inventarioServicioService = {
  async search(params) {
    const authStore = useAuthStore()
    return axios.get(API_URL, {
      params,
      headers: { Authorization: authStore.token }
    })
  },

  async asignar(payload) {
    const authStore = useAuthStore()
    return axios.post(API_URL, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async eliminar(id) {
    const authStore = useAuthStore()
    return axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: authStore.token }
    })
  }
}
