import axios from 'axios'
import { apiUrl } from '@/config/api.config'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = apiUrl('/api/cuadrillas')

export const cuadrillaService = {
  async search(params) {
    const authStore = useAuthStore()
    return axios.get(API_URL, {
      params,
      headers: { Authorization: authStore.token }
    })
  },

  async get(codigoCuadrilla) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/${codigoCuadrilla}`, {
      headers: { Authorization: authStore.token }
    })
  }
}
