import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/admin/cuadrillas'

export const adminCuadrillaService = {
  async create(payload) {
    const authStore = useAuthStore()
    return axios.post(API_URL, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async update(codigoCuadrilla, payload) {
    const authStore = useAuthStore()
    return axios.put(`${API_URL}/${codigoCuadrilla}`, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async activar(codigoCuadrilla) {
    const authStore = useAuthStore()
    return axios.patch(`${API_URL}/${codigoCuadrilla}/activar`, null, {
      headers: { Authorization: authStore.token }
    })
  },

  async desactivar(codigoCuadrilla) {
    const authStore = useAuthStore()
    return axios.patch(`${API_URL}/${codigoCuadrilla}/desactivar`, null, {
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
