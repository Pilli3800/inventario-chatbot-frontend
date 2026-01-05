import GestionItems from '@/views/GestionItems.vue'
import ViewItemModal from '@/components/logistica/ViewItemModal.vue'
import EditItemModal from '@/components/logistica/EditItemModal.vue'
import GestionInventarios from '@/views/GestionInventarios.vue'

export const logisticaRoutes = [
  {
    path: 'logistica/items',
    name: 'gestion-items',
    component: GestionItems,
    meta: {
      roles: ['ROLE_LOGISTICA']
    },
    children: [
      {
        path: 'ver/:codigoItem',
        name: 'ver-item',
        component: ViewItemModal
      },
      {
        path: 'editar/:codigoItem',
        name: 'editar-item',
        component: EditItemModal
      }
    ]
  },
  {
    path: 'logistica/inventarios',
    name: 'gestion-inventarios',
    component: GestionInventarios,
    meta: {
      roles: ['ROLE_LOGISTICA']
    }
  }
]
