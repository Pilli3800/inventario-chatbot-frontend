import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

export const API_BASE_URL = 'http://localhost:8080'
const API_URL = `${API_BASE_URL}/api/logistica/items`

export const getItemImageUrl = (imagenUrl) => {
  if (!imagenUrl) return null
  if (/^https?:\/\//i.test(imagenUrl)) return imagenUrl
  return `${API_BASE_URL}${imagenUrl}`
}

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

  async uploadImage(codigoItem, file) {
    const authStore = useAuthStore()
    const formData = new FormData()
    formData.append('file', file)

    return axios.put(`${API_URL}/${codigoItem}/imagen`, formData, {
      headers: {
        Authorization: authStore.token,
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  async deleteImage(codigoItem) {
    const authStore = useAuthStore()
    return axios.delete(`${API_URL}/${codigoItem}/imagen`, {
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
  },

  async historial(codigoItem) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/${codigoItem}/historial`, {
      headers: { Authorization: authStore.token }
    })
  }
}
