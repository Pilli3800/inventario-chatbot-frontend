import axios from 'axios'
import { apiUrl } from '@/config/api.config'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = apiUrl('/api/comprobantes-devolucion')

export const comprobanteDevolucionService = {
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
  },

  async generarPorSolicitud(solicitudId) {
    const authStore = useAuthStore()
    return axios.post(`${API_URL}/solicitud/${solicitudId}/generar`, null, {
      headers: { Authorization: authStore.token }
    })
  }
}
