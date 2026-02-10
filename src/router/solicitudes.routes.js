import GestionSolicitudesRetiro from '@/views/GestionSolicitudesRetiro.vue'
import ViewSolicitudModal from '@/components/logistica/solicitudes/ViewSolicitudModal.vue'

export const solicitudesRoutes = [
  {
    path: 'solicitudes/retiro',
    name: 'gestion-solicitudes-retiro',
    component: GestionSolicitudesRetiro,
    meta: {
      roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION', 'ROLE_JEFE_CUADRILLA', 'ROLE_GERENCIA']
    },
    children: [
      {
        path: 'ver/:idSolicitud',
        name: 'ver-solicitud',
        component: ViewSolicitudModal
      }
    ]
  }
]
