import {
  HomeOutlined,
  DashboardOutlined,
  SettingOutlined,
  DeploymentUnitOutlined,
  RobotOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'

export const menuItems = [
  {
    key: 'home',
    label: 'Inicio',
    icon: HomeOutlined,
    route: '/home',
    roles: [] // vacío = todos los roles
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: DashboardOutlined,
    route: '/dashboard',
    roles: ['ROLE_ADMINISTRACION', 'ROLE_LOGISTICA', 'ROLE_GERENCIA']
  },
  {
    key: 'administracion',
    label: 'Administración',
    icon: SettingOutlined,
    roles: ['ROLE_ADMINISTRACION', 'ROLE_GERENCIA'],
    children: [
      {
        key: 'gestion-usuarios',
        label: 'Gestión de Usuarios',
        route: '/admin/usuarios',
        roles: ['ROLE_ADMINISTRACION']
      },
      {
        key: 'gestion-sedes',
        label: 'Gestión de Sedes',
        route: '/admin/sedes',
        roles: ['ROLE_ADMINISTRACION']
      },
      {
        key: 'gestion-cuadrillas',
        label: 'Gestión de Cuadrillas',
        route: '/admin/cuadrillas',
        roles: ['ROLE_ADMINISTRACION', 'ROLE_GERENCIA']
      },
      {
        key: 'gestion-servicios',
        label: 'Gestión de Servicios',
        route: '/admin/servicios',
        roles: ['ROLE_ADMINISTRACION', 'ROLE_GERENCIA']
      }
    ]
  },
  {
    key: 'logistica',
    label: 'Logística',
    icon: DeploymentUnitOutlined,
    roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION','ROLE_JEFE_CUADRILLA', 'ROLE_GERENCIA'],
    children: [
      {
        key: 'gestion-proveedores',
        label: 'Gestion de Proveedores',
        route: '/logistica/proveedores',
        roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION', 'ROLE_GERENCIA']
      },
      {
        key: 'gestion-facturas-compra',
        label: 'Gestion de Facturas',
        route: '/logistica/facturas-compra',
        roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION', 'ROLE_GERENCIA']
      },
      {
        key: 'gestion-items',
        label: 'Gestión de Items',
        route: '/logistica/items',
        roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION']
      },
      {
        key: 'gestion-inventarios',
        label: 'Gestión de Inventario',
        route: '/logistica/inventarios',
        roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION']
      },
        {
          key: 'gestion-inventario-servicio',
          label: 'Gestion de Inventario Servicio',
          route: '/logistica/inventarios-servicio',
          roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION']
        },
        {
          key: 'gestion-conteo-fisico',
          label: 'Conteo Fisico',
          route: '/logistica/conteo-fisico',
          roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION']
        },
        {
          key: 'reportes-discrepancia',
          label: 'Reportes de Discrepancia',
          route: '/logistica/reportes-discrepancia',
          roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION', 'ROLE_GERENCIA']
        },
        {
          key: 'gestion-movimientos',
        label: 'Gestión de Movimientos',
        route: '/logistica/movimientos',
        roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION', 'ROLE_JEFE_CUADRILLA', 'ROLE_GERENCIA']
      }
    ]
  },
  {
    key: 'solicitudes',
    label: 'Solicitudes',
    icon: FileTextOutlined,
    roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION', 'ROLE_JEFE_CUADRILLA', 'ROLE_GERENCIA'],
    children: [
      {
        key: 'solicitudes-retiro',
        label: 'Retiro',
        route: '/solicitudes/retiro',
        roles: ['ROLE_LOGISTICA', 'ROLE_ADMINISTRACION', 'ROLE_JEFE_CUADRILLA', 'ROLE_GERENCIA']
      }
    ]
  },
  {
  key: 'ia',
  label: 'Asistente IA',
  icon: RobotOutlined,
  children: [
    {
      key: 'chat',
      label: 'Chat Inteligente',
      route: '/ia/chat',
      roles: []
    }
  ]
}
]
