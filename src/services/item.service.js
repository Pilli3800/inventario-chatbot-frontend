import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/logistica/items'

export const itemService = {
  async search(params) {
    const authStore = useAuthStore()
    return axios.get(API_URL, {
      params,
      headers: { Authorization: authStore.token }
    })
  },

  async get(codigoItem) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/${codigoItem}`, {
      headers: { Authorization: authStore.token }
    })
  },

  async create(payload) {
    const authStore = useAuthStore()
    return axios.post(API_URL, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async update(codigoItem, payload) {
    const authStore = useAuthStore()
    return axios.put(`${API_URL}/${codigoItem}`, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async activar(codigoItem) {
    const authStore = useAuthStore()
    return axios.patch(`${API_URL}/${codigoItem}/activar`, null, {
      headers: { Authorization: authStore.token }
    })
  },

  async desactivar(codigoItem) {
    const authStore = useAuthStore()
    return axios.patch(`${API_URL}/${codigoItem}/desactivar`, null, {
      headers: { Authorization: authStore.token }
    })
  },

  async exportExcel(params) {
    const authStore = useAuthStore()

    return axios.get(`${API_URL}/export/excel`, {
      params,
      responseType: 'blob',
      headers: {
        Authorization: authStore.token
      }
    })
  }
}
