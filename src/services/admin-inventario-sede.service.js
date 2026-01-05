import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/admin/inventarios'

export const adminInventarioSedeService = {

  async exportExcelAuditoria(params) {
    const authStore = useAuthStore()

    return axios.get(`${API_URL}/export/excel/auditoria`, {
      params,
      responseType: 'blob',
      headers: { Authorization: authStore.token }
    })
  }

}
