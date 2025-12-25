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
      }
    ]
  }
]
