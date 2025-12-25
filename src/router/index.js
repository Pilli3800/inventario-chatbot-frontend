import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import GestionUsuario from '@/views/GestionUsuario.vue'
import ViewUserModal from '@/components/admin/ViewUserModal.vue'
import EditUserModal from '@/components/admin/EditUserModal.vue'


const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: HomeView
      },
      {
        path: 'admin/usuarios',
        name: 'gestion-usuarios',
        component: GestionUsuario,
          meta: {
            roles: ['ROLE_ADMINISTRACION']
          },
          children: [
              {
                path: 'ver/:identUsuario',
                name: 'ver-usuario',
                component: ViewUserModal
              },
              {
                path: 'editar/:identUsuario',
                name: 'editar-usuario',
                component: EditUserModal
              }
          ]
      },
    ]
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

/* ===== GUARD GLOBAL DE RUTAS ===== */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Sesión expirada → cerrar sesión y redirigir al login
  if (to.path !== '/login' && authStore.isExpired) {
    authStore.logout()
    return next('/login')
  }

  // Ruta protegida → redirigir usuarios no autenticados
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  // Control de acceso por roles (RBAC)
  // Obtiene los roles requeridos desde las rutas coincidentes
  const requiredRoles = to.matched
    .flatMap(record => record.meta?.roles || [])

  // Bloquea el acceso si el usuario no posee los roles requeridos
  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.some(role =>
      authStore.roles.includes(role)
    )

    if (!hasRole) {
      return next('/home') // o vista 403
    }
  }

  // Evita que usuarios autenticados accedan al login
  if (to.path === '/login' && authStore.isAuthenticated) {
    return next('/home')
  }

  // Todas las validaciones superadas
  next()
})

export default router
