import axios from 'axios'
import { apiUrl } from '@/config/api.config'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = apiUrl('/api/consumo/ml')

const getHeaders = () => {
  const authStore = useAuthStore()
  return { Authorization: authStore.token }
}

export const consumoMlService = {
  async getAnomalias(params) {
    return axios.get(`${API_URL}/anomalias`, {
      params,
      headers: getHeaders()
    })
  },

  async getEvolucion(params) {
    return axios.get(`${API_URL}/evolucion`, {
      params,
      headers: getHeaders()
    })
  },

  async getProyeccion(params) {
    return axios.get(`${API_URL}/proyeccion`, {
      params,
      headers: getHeaders()
    })
  },

  async getAlertas(params) {
    return axios.get(`${API_URL}/alertas`, {
      params,
      headers: getHeaders()
    })
  }
}
