export const PERMISSIONS = {
  ROLE_ADMINISTRACION: {
    create: true,
    edit: true,
    delete: false,
    toggle: true,
    view: true,
    report: true,
    audit: true
  },

  ROLE_LOGISTICA: {
    create: true,
    edit: true,
    delete: true,
    toggle: true,
    view: true,
    report: true,
    audit: false
  },

  ROLE_GERENCIA: {
    create: false,
    edit: false,
    toggle: false,
    view: true,
    report: true,
    audit: true
  }
}
