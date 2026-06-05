import axios from 'axios'
import { apiUrl } from '@/config/api.config'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = apiUrl('/api/servicios')

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
