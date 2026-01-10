import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/admin/servicios'

export const servicioService = {
  async search(params) {
    const authStore = useAuthStore()
    return axios.get(API_URL, {
      params,
      headers: { Authorization: authStore.token }
    })
  },

  async get(codigoServicio) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/${codigoServicio}`, {
      headers: { Authorization: authStore.token }
    })
  }
}
