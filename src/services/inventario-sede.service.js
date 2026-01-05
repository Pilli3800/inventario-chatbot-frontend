import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/logistica/inventarios'

export const inventarioSedeService = {

  async search(params) {
    const authStore = useAuthStore()
    return axios.get(API_URL, {
      params,
      headers: { Authorization: authStore.token }
    })
  },

  async asignar(payload) {
    const authStore = useAuthStore()
    return axios.post(API_URL, payload, {
      headers: { Authorization: authStore.token }
    })
  },

  async eliminar(id) {
    const authStore = useAuthStore()
    return axios.delete(`${API_URL}/${id}`, {
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
