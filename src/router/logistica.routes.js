import GestionItems from '@/views/GestionItems.vue'
import ViewItemModal from '@/components/logistica/ViewItemModal.vue'
import EditItemModal from '@/components/logistica/EditItemModal.vue'
import ItemHistorialModal from '@/components/logistica/ItemHistorialModal.vue'
import GestionInventarios from '@/views/GestionInventarios.vue'
import GestionInventarioServicio from '@/views/GestionInventarioServicio.vue'
import GestionMovimientos from '@/views/GestionMovimientos.vue'
import GestionConteoFisico from '@/views/GestionConteoFisico.vue'
import GestionReportesDiscrepancia from '@/views/GestionReportesDiscrepancia.vue'
import GestionProveedores from '@/views/GestionProveedores.vue'
import GestionFacturasCompra from '@/views/GestionFacturasCompra.vue'
import ViewProveedorModal from '@/components/logistica/proveedores/ViewProveedorModal.vue'
import EditProveedorModal from '@/components/logistica/proveedores/EditProveedorModal.vue'
import ViewFacturaCompraModal from '@/components/logistica/facturas/ViewFacturaCompraModal.vue'
import ViewMovimientoModal from '@/components/logistica/movimientos/ViewMovimientoModal.vue'
import ViewConteoFisicoModal from '@/components/logistica/conteo-fisico/ViewConteoFisicoModal.vue'

export const logisticaRoutes = [
  {
    path: 'logistica/proveedores',
    name: 'gestion-proveedores',
    component: GestionProveedores,
    meta: {
      roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION', 'ROLE_GERENCIA']
    },
    children: [
      {
        path: 'ver/:codigoProveedor',
        name: 'ver-proveedor',
        component: ViewProveedorModal
      },
      {
        path: 'editar/:codigoProveedor',
        name: 'editar-proveedor',
        component: EditProveedorModal
      }
    ]
  },
  {
    path: 'logistica/facturas-compra',
    name: 'gestion-facturas-compra',
    component: GestionFacturasCompra,
    meta: {
      roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION', 'ROLE_GERENCIA']
    },
    children: [
      {
        path: 'ver/:codigoProveedor/:numeroFactura',
        name: 'ver-factura-compra',
        component: ViewFacturaCompraModal
      }
    ]
  },
  {
    path: 'logistica/items',
    name: 'gestion-items',
    component: GestionItems,
    meta: {
      roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION']
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
      },
      {
        path: 'historial/:codigoItem',
        name: 'historial-item',
        component: ItemHistorialModal
      }
    ]
  },
  {
    path: 'logistica/inventarios',
    name: 'gestion-inventarios',
    component: GestionInventarios,
    meta: {
      roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION']
    }
  },
  {
    path: 'logistica/inventarios-servicio',
    name: 'gestion-inventario-servicio',
    component: GestionInventarioServicio,
    meta: {
      roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION']
    }
  },
  {
    path: 'logistica/conteo-fisico',
    name: 'gestion-conteo-fisico',
    component: GestionConteoFisico,
    meta: {
      roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION']
    }
  },
  {
    path: 'logistica/reportes-discrepancia',
    name: 'reportes-discrepancia',
    component: GestionReportesDiscrepancia,
    meta: {
      roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION', 'ROLE_GERENCIA']
    },
    children: [
      {
        path: 'ver/:idConteo',
        name: 'ver-reporte-discrepancia',
        component: ViewConteoFisicoModal
      }
    ]
  },
  {
    path: 'logistica/movimientos',
    name: 'gestion-movimientos',
    component: GestionMovimientos,
    meta: {
      roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION', 'ROLE_JEFE_CUADRILLA', 'ROLE_GERENCIA']
    },
    children: [
      {
        path: 'ver/:idMovimiento',
        name: 'ver-movimiento',
        component: ViewMovimientoModal
      },
      {
        path: 'editar/:idMovimiento',
        name: 'editar-movimiento',
        component: EditItemModal
      }
    ]
  }
]
