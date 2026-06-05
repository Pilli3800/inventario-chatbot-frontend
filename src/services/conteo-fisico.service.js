import axios from 'axios'
import { apiUrl } from '@/config/api.config'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = apiUrl('/api/conteos-fisicos')

export const conteoFisicoService = {
  async search(params) {
    const authStore = useAuthStore()
    return axios.get(API_URL, {
      params,
      headers: { Authorization: authStore.token }
    })
  },

  async getDashboard(params) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/dashboard`, {
      params,
      headers: { Authorization: authStore.token }
    })
  },

  async getById(id) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: authStore.token }
    })
  },

  async create(payload) {
    const authStore = useAuthStore()
    return axios.post(API_URL, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async descargarPdf(id) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/${id}/pdf`, {
      responseType: 'blob',
      headers: { Authorization: authStore.token }
    })
  },

  async descargarExcel(id) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/${id}/excel`, {
      responseType: 'blob',
      headers: { Authorization: authStore.token }
    })
  }
}
