import axios from 'axios'
import { apiUrl } from '@/config/api.config'
import { useAuthStore } from '@/stores/auth.store'

const API_INVENTARIO_URL = apiUrl('/api/movimientos')
const API_HISTORICO_URL  = apiUrl('/api/movimientos/historico')

export const movimientosService = {

  /* Historico - buscar movimientos */
  async search(params) {
    const authStore = useAuthStore()
    return axios.get(API_HISTORICO_URL, {
      params,
      headers: {
        Authorization: authStore.token
      }
    })
  },

  /* Registrar movimiento */
  async create(payload) {
    const authStore = useAuthStore()
    return axios.post(API_INVENTARIO_URL, payload, {
      headers: {
        Authorization: authStore.token
      }
    })
  },

  /* Ver detalle de movimiento */
  async getById(id) {
    const authStore = useAuthStore()
    return axios.get(`${API_HISTORICO_URL}/${id}`, {
      headers: {
        Authorization: authStore.token
      }
    })
  },

  async getDashboard(params) {
    const authStore = useAuthStore()
    return axios.get(`${API_HISTORICO_URL}/dashboard`, {
      params,
      headers: {
        Authorization: authStore.token
      }
    })
  },

  /* Items con mayor cantidad de movimientos */
  async getItemsMasMovidos(params) {
    const authStore = useAuthStore()
    return axios.get(`${API_HISTORICO_URL}/items-mas-movidos`, {
      params,
      headers: {
        Authorization: authStore.token
      }
    })
  },

  /* Items con mayor stock movido */
  async getStockMovido(params) {
    const authStore = useAuthStore()
    return axios.get(`${API_HISTORICO_URL}/stock-movido`, {
      params,
      headers: {
        Authorization: authStore.token
      }
    })
  },

  /* Exportar Excel */
  async exportExcel(params) {
    const authStore = useAuthStore()
    return axios.get(`${API_HISTORICO_URL}/export/excel`, {
      params,
      responseType: 'blob',
      headers: {
        Authorization: authStore.token
      }
    })
  }

}
