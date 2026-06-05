import axios from 'axios'
import { apiUrl } from '@/config/api.config'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = apiUrl('/api/logistica/proveedores')

export const proveedorService = {
  async search(params) {
    const authStore = useAuthStore()
    return axios.get(API_URL, {
      params,
      headers: { Authorization: authStore.token }
    })
  },

  async get(codigoProveedor) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/${codigoProveedor}`, {
      headers: { Authorization: authStore.token }
    })
  },

  async create(payload) {
    const authStore = useAuthStore()
    return axios.post(API_URL, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async update(codigoProveedor, payload) {
    const authStore = useAuthStore()
    return axios.put(`${API_URL}/${codigoProveedor}`, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async activar(codigoProveedor) {
    const authStore = useAuthStore()
    return axios.patch(`${API_URL}/${codigoProveedor}/activar`, null, {
      headers: { Authorization: authStore.token }
    })
  },

  async desactivar(codigoProveedor) {
    const authStore = useAuthStore()
    return axios.patch(`${API_URL}/${codigoProveedor}/desactivar`, null, {
      headers: { Authorization: authStore.token }
    })
  },

  async exportExcel(params) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/export/excel`, {
      params,
      responseType: 'blob',
      headers: { Authorization: authStore.token }
    })
  },

  async exportExcelAuditoria(params) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/export/excel/auditoria`, {
      params,
      responseType: 'blob',
      headers: { Authorization: authStore.token }
    })
  }
}
