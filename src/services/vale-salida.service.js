import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/vales-salida'

export const valeSalidaService = {
  async getById(id) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: authStore.token }
    })
  },

  async getBySolicitudId(solicitudId) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/solicitud/${solicitudId}`, {
      headers: { Authorization: authStore.token }
    })
  },

  async descargarPdf(id) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/${id}/pdf`, {
      responseType: 'blob',
      headers: { Authorization: authStore.token }
    })
  }
}
