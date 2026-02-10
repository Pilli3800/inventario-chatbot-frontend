export const PERMISSIONS = {
  ROLE_ADMINISTRACION: {
    create: true,
    createMovimiento: false,
    createSolicitud: false,
    manageSolicitudes: false,
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
    createSolicitud: false,
    manageSolicitudes: true,
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
    createSolicitud: false,
    manageSolicitudes: false,
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
    createSolicitud: true,
    manageSolicitudes: false,
    edit: false,
    toggle: false,
    view: true,
    viewItemHistory: false,
    report: false,
    audit: false
  },
}
