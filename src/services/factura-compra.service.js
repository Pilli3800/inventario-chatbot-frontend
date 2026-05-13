import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/facturas-compra'

export const facturaCompraService = {
  async search(params) {
    const authStore = useAuthStore()
    return axios.get(API_URL, {
      params,
      headers: { Authorization: authStore.token }
    })
  },

  async get(codigoProveedor, numeroFactura) {
    const authStore = useAuthStore()
    const codigo = encodeURIComponent(codigoProveedor)
    const numero = encodeURIComponent(numeroFactura)
    return axios.get(`${API_URL}/${codigo}/${numero}`, {
      headers: { Authorization: authStore.token }
    })
  },

  async create(payload) {
    const authStore = useAuthStore()
    return axios.post(API_URL, payload, {
      headers: { Authorization: authStore.token }
    })
  }
}
