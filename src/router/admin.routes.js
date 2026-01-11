import GestionUsuario from '@/views/GestionUsuario.vue'
import ViewUserModal from '@/components/admin/ViewUserModal.vue'
import EditUserModal from '@/components/admin/EditUserModal.vue'
import GestionSedes from '@/views/GestionSedes.vue'
import EditSedeModal from '@/components/admin/EditSedeModal.vue'
import GestionCuadrillas from '@/views/GestionCuadrillas.vue'
import ViewCuadrillaModal from '@/components/admin/cuadrillas/ViewCuadrillaModal.vue'
import EditCuadrillaModal from '@/components/admin/cuadrillas/EditCuadrillaModal.vue'
import GestionServicios from '@/views/GestionServicios.vue'
import ViewServicioModal from '@/components/admin/servicios/ViewServicioModal.vue'
import EditServicioModal from '@/components/admin/servicios/EditServicioModal.vue'

export const adminRoutes = [
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
  {
    path: 'admin/sedes',
    name: 'gestion-sedes',
    component: GestionSedes,
    meta: { roles: ['ROLE_ADMINISTRACION'] },
    children: [
      {
        path: 'editar/:codigoSede',
        name: 'editar-sede',
        component: EditSedeModal
      }
    ]
  },
  {
    path: 'admin/cuadrillas',
    name: 'gestion-cuadrillas',
    component: GestionCuadrillas,
    meta: { roles: ['ROLE_ADMINISTRACION', 'ROLE_GERENCIA'] },
    children: [
      {
        path: 'ver/:codigoCuadrilla',
        name: 'ver-cuadrilla',
        component: ViewCuadrillaModal
      },
      {
        path: 'editar/:codigoCuadrilla',
        name: 'editar-cuadrilla',
        component: EditCuadrillaModal
      }
    ]
  },
  {
    path: 'admin/servicios',
    name: 'gestion-servicios',
    component: GestionServicios,
    meta: { roles: ['ROLE_ADMINISTRACION', 'ROLE_GERENCIA'] },
    children: [
      {
        path: 'ver/:codigoServicio',
        name: 'ver-servicio',
        component: ViewServicioModal
      },
      {
        path: 'editar/:codigoServicio',
        name: 'editar-servicio',
        component: EditServicioModal
      }
    ]
  }
]
