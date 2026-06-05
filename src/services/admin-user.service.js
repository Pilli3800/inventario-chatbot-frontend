import axios from 'axios'
import { apiUrl } from '@/config/api.config'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = apiUrl('/api/admin/users')

export const adminUserService = {
  async activar(identUsuario) {
    const authStore = useAuthStore()
    return axios.patch(`${API_URL}/${identUsuario}/activar`, null, {
      headers: { Authorization: authStore.token }
    })
  },

  async desactivar(identUsuario) {
    const authStore = useAuthStore()
    return axios.patch(`${API_URL}/${identUsuario}/desactivar`, null, {
      headers: { Authorization: authStore.token }
    })
  },

  async resetPassword(identUsuario, password) {
  const authStore = useAuthStore()
  return axios.patch(`${API_URL}/${identUsuario}/password`, { password }, {
    headers: { Authorization: authStore.token }
    })
  },

  async update(identUsuario, payload) {
    const authStore = useAuthStore()
    return axios.put(`${API_URL}/${identUsuario}`, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async getRoles() {
    const authStore = useAuthStore()
    return axios.get(apiUrl('/api/admin/roles'), {
      headers: { Authorization: authStore.token }
    })
  },

  async create(payload) {
    const authStore = useAuthStore()
    return axios.post(apiUrl('/api/admin/users'), payload, {
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
  }

}
