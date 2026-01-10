export const menuItems = [
  {
    key: 'home',
    label: 'Inicio',
    route: '/home',
    roles: [] // vacío = todos los roles
  },
  {
    key: 'administracion',
    label: 'Administración',
    roles: ['ROLE_ADMINISTRACION'],
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
        roles: ['ROLE_ADMINISTRACION']
      }
    ]
  },
  {
    key: 'logistica',
    label: 'Logística',
    roles: ['ROLE_LOGISTICA'],
    children: [
      {
        key: 'gestion-items',
        label: 'Gestión de Items',
        route: '/logistica/items',
        roles: ['ROLE_LOGISTICA']
      },
      {
        key: 'gestion-inventarios',
        label: 'Gestión de Inventario',
        route: '/logistica/inventarios',
        roles: ['ROLE_LOGISTICA']
      }
    ]
  }
]
