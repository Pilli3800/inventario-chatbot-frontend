import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/admin/sedes'

export const adminSedeService = {

  async getSede(codigoSede) {
    const authStore = useAuthStore()

    return axios.get(`${API_URL}/${codigoSede}`, {
      headers: {
        Authorization: authStore.token
      }
    })
  },

  async activarSede(codigoSede) {
    const authStore = useAuthStore()

    return axios.patch(`${API_URL}/${codigoSede}/activar`, null, {
      headers: {
        Authorization: authStore.token
      }
    })
  },

  async desactivarSede(codigoSede) {
    const authStore = useAuthStore()

    return axios.patch(`${API_URL}/${codigoSede}/desactivar`, null, {
      headers: {
        Authorization: authStore.token
      }
    })
  },

  async actualizarSede(codigoSede, payload) {
    const authStore = useAuthStore()

    return axios.put(`${API_URL}/${codigoSede}`, payload, {
      headers: {
        Authorization: authStore.token
      }
    })
  }

}
