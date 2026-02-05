export const PERMISSIONS = {
  ROLE_ADMINISTRACION: {
    create: true,
    createMovimiento: false,
    edit: true,
    delete: false,
    toggle: true,
    view: true,
    viewItemHistory: true,
    report: true,
    audit: true
  },

  ROLE_LOGISTICA: {
    create: true,
    createMovimiento: true,
    edit: true,
    delete: true,
    toggle: true,
    view: true,
    viewItemHistory: true,
    report: true,
    audit: false
  },

  ROLE_GERENCIA: {
    create: false,
    createMovimiento: false,
    edit: false,
    toggle: false,
    view: true,
    viewItemHistory: true,
    report: true,
    audit: true
  },

  ROLE_JEFE_CUADRILLA: {
    create: true,
    createMovimiento: true,
    edit: false,
    toggle: false,
    view: true,
    viewItemHistory: false,
    report: false,
    audit: false
  },
}
