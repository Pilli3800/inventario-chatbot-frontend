import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { authService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    ident: null,
    roles: [],
    exp: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    hasRole: (state) => {
      return (role) => state.roles.includes(role)
    },
    isExpired: (state) => {
      return state.exp ? Date.now() > state.exp : true
}
  },

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)

      const decoded = jwtDecode(token)

      this.ident = decoded.ident || null
      this.roles = decoded.roles || []
      this.exp = decoded.exp ? decoded.exp * 1000 : null
    },

    loadFromStorage() {
      const token = localStorage.getItem('token')
      if (token) {
        this.setToken(token)
      }
    },

    logout() {
        this.token = null
        this.ident = null
        this.roles = []
        localStorage.removeItem('token')
      },
      async login(credentials) {
    const token = await authService.login(credentials)
    this.setToken(token)
  }
  }
})
