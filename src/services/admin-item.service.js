import axios from 'axios'
import { apiUrl } from '@/config/api.config'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = apiUrl('/api/admin/items')

export const adminItemService = {

  async exportExcelAuditoria(params) {
    const authStore = useAuthStore()

    return axios.get(`${API_URL}/export/excel/auditoria`, {
      params,
      responseType: 'blob',
      headers: { Authorization: authStore.token }
    })
  }

}
