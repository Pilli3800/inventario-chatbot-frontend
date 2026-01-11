import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/admin/servicios'

export const adminServicioService = {

  async create(payload) {
    const authStore = useAuthStore()
    return axios.post(API_URL, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async update(codigoServicio, payload) {
    const authStore = useAuthStore()
    return axios.put(`${API_URL}/${codigoServicio}`, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async activar(codigoServicio) {
    const authStore = useAuthStore()
    return axios.patch(`${API_URL}/${codigoServicio}/activar`, null, {
      headers: { Authorization: authStore.token }
    })
  },

  async desactivar(codigoServicio) {
    const authStore = useAuthStore()
    return axios.patch(`${API_URL}/${codigoServicio}/desactivar`, null, {
      headers: { Authorization: authStore.token }
    })
  }
}
