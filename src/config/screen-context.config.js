export const screenContexts = {
  home: {
    titulo: 'Inicio',
    modulo: 'General',
    elementosVisibles: [
      'Mensaje de bienvenida con el usuario actual',
      'Texto: Iniciaste sesion correctamente',
      'Seccion Configuracion',
      'Texto: Seguridad y preferencias de la cuenta',
      'Boton Cambiar mi contrasena'
    ],
    accionesDisponibles: [
      'Abrir menu lateral',
      'Cambiar mi contrasena',
      'Abrir asistente IA'
    ]
  },
  'dashboard-solicitudes': {
    titulo: 'Dashboard - Solicitudes',
    modulo: 'Dashboard',
    elementosVisibles: [
      'Filtros de fecha',
      'Resumen de solicitudes',
      'Graficos de solicitudes',
      'Pendientes de cierre',
      'Solicitudes por servicio',
      'Top cuadrillas'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      'Cambiar pestana'
    ]
  },
  'dashboard-movimientos': {
    titulo: 'Dashboard - Movimientos',
    modulo: 'Dashboard',
    elementosVisibles: [
      'Filtros de fecha',
      'Resumen de movimientos',
      'Graficos de movimientos',
      'Items mas movidos',
      'Stock movido'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      'Cambiar pestana'
    ]
  },
  'dashboard-asistente-ia': {
    titulo: 'Dashboard - Asistente IA',
    modulo: 'Dashboard',
    elementosVisibles: [
      'Filtros de fecha',
      'Resumen de uso del asistente IA',
      'Graficos de consultas',
      'Top usuarios'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      'Cambiar pestana'
    ]
  },
  'dashboard-consumo-anomalias': {
    titulo: 'Dashboard - Consumo - Anomalias',
    modulo: 'Consumo',
    elementosVisibles: [
      'Selector Anomalias',
      'Selector Evolucion',
      'Selector Proyeccion',
      'Selector Alertas',
      'Formulario de anomalias de consumo',
      'Leyenda de criterio de anomalia con Z Score y score ML',
      'Tabla de resultados'
    ],
    accionesDisponibles: [
      'Detectar anomalias',
      'Cambiar pestana'
    ]
  },
  'dashboard-consumo-evolucion': {
    titulo: 'Dashboard - Consumo - Evolucion',
    modulo: 'Consumo',
    elementosVisibles: [
      'Selector Anomalias',
      'Selector Evolucion',
      'Selector Proyeccion',
      'Selector Alertas',
      'Formulario de evolucion de consumo',
      'Leyenda de consumo diario, tendencia, Z Score y evento destacado',
      'Grafico de evolucion',
      'Resumen de dias evaluados, consumo total, eventos y max Z Score',
      'Tabla de evolucion'
    ],
    accionesDisponibles: [
      'Buscar cuadrilla',
      'Buscar item',
      'Ver evolucion',
      'Cambiar pestana'
    ]
  },
  'dashboard-consumo-proyeccion': {
    titulo: 'Dashboard - Consumo - Proyeccion',
    modulo: 'Consumo',
    elementosVisibles: [
      'Selector Anomalias',
      'Selector Evolucion',
      'Selector Proyeccion',
      'Selector Alertas',
      'Formulario de proyeccion de consumo',
      'Grafico de proyeccion',
      'Resumen de periodos, consumo proyectado y promedio proyectado',
      'Tabla de proyeccion'
    ],
    accionesDisponibles: [
      'Buscar item',
      'Proyectar consumo',
      'Cambiar pestana'
    ]
  },
  'dashboard-consumo-alertas': {
    titulo: 'Dashboard - Consumo - Alertas',
    modulo: 'Consumo',
    elementosVisibles: [
      'Selector Anomalias',
      'Selector Evolucion',
      'Selector Proyeccion',
      'Selector Alertas',
      'Filtros de alertas por tipo, referencia, codigo de referencia y fechas',
      'Resumen de alertas por tipo y referencias faltantes',
      'Tabla de alertas'
    ],
    accionesDisponibles: [
      'Buscar alertas',
      'Limpiar filtros de alertas',
      'Cambiar pestana'
    ]
  },
  'gestion-usuarios': {
    titulo: 'Gestion de Usuarios',
    modulo: 'Usuarios',
    elementosVisibles: [
      'Filtros de usuarios',
      'Resumen de usuarios',
      'Tabla de usuarios',
      'Roles',
      'Estado'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Crear usuario', permission: 'create' },
      { label: 'Ver usuario', permission: 'view' },
      { label: 'Editar usuario', permission: 'edit' },
      { label: 'Restablecer contrasena', permission: 'edit' },
      { label: 'Exportar Excel', permission: 'report' }
    ]
  },
  'gestion-sedes': {
    titulo: 'Gestion de Sedes',
    modulo: 'Administracion',
    elementosVisibles: [
      'Filtros de sedes',
      'Tabla de sedes',
      'Codigo',
      'Nombre',
      'Estado'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Crear sede', permission: 'create' },
      { label: 'Editar sede', permission: 'edit' },
      { label: 'Exportar Excel', permission: 'report' }
    ]
  },
  'gestion-cuadrillas': {
    titulo: 'Gestion de Cuadrillas',
    modulo: 'Administracion',
    elementosVisibles: [
      'Filtros de cuadrillas',
      'Tabla de cuadrillas',
      'Codigo',
      'Nombre',
      'Usuario responsable',
      'Estado'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Crear cuadrilla', permission: 'create' },
      { label: 'Ver cuadrilla', permission: 'view' },
      { label: 'Editar cuadrilla', permission: 'edit' },
      { label: 'Exportar Excel', permission: 'report' },
      { label: 'Exportar con auditoria', permission: 'report' }
    ]
  },
  'gestion-servicios': {
    titulo: 'Gestion de Servicios',
    modulo: 'Administracion',
    elementosVisibles: [
      'Filtros de servicios',
      'Tabla de servicios',
      'Codigo',
      'Nombre',
      'Sede',
      'Estado'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Crear servicio', permission: 'create' },
      { label: 'Ver servicio', permission: 'view' },
      { label: 'Editar servicio', permission: 'edit' },
      { label: 'Exportar Excel', permission: 'report' },
      { label: 'Exportar con auditoria', permission: 'report' }
    ]
  },
  'gestion-proveedores': {
    titulo: 'Gestion de Proveedores',
    modulo: 'Logistica',
    elementosVisibles: [
      'Filtros de proveedores',
      'Tabla de proveedores',
      'RUC',
      'Razon social',
      'Telefono',
      'Estado'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Crear proveedor', permission: 'create' },
      { label: 'Ver proveedor', permission: 'view' },
      { label: 'Editar proveedor', permission: 'edit' },
      { label: 'Exportar Excel', permission: 'report' },
      { label: 'Exportar con auditoria', permission: 'audit' }
    ]
  },
  'gestion-facturas-compra': {
    titulo: 'Gestion de Facturas',
    modulo: 'Logistica',
    elementosVisibles: [
      'Filtros de facturas',
      'Resumen de facturas',
      'Tabla de facturas',
      'Proveedor',
      'Numero de factura',
      'Fecha',
      'Observaciones'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Crear factura', permission: 'create' },
      { label: 'Ver factura', permission: 'view' }
    ]
  },
  'gestion-items': {
    titulo: 'Gestion de Items',
    modulo: 'Inventario',
    elementosVisibles: [
      'Filtros de items',
      'Tabla de items',
      'Codigo item',
      'Nombre',
      'Tipo',
      'Estado'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Crear item', permission: 'create' },
      { label: 'Ver item', permission: 'view' },
      { label: 'Editar item', permission: 'edit' },
      { label: 'Ver historial', permission: 'viewItemHistory' },
      { label: 'Exportar Excel', permission: 'report' },
      { label: 'Exportar con auditoria', permission: 'audit' }
    ]
  },
  'gestion-inventarios': {
    titulo: 'Gestion de Inventario',
    modulo: 'Inventario',
    elementosVisibles: [
      'Filtros de inventario',
      'Tabla de inventario por sede',
      'Sede',
      'Item',
      'Stock actual'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Asignar item a sede', permission: 'create' },
      { label: 'Exportar Excel', permission: 'report' },
      { label: 'Exportar con auditoria', permission: 'audit' }
    ]
  },
  'gestion-inventario-servicio': {
    titulo: 'Gestion de Inventario Servicio',
    modulo: 'Inventario',
    elementosVisibles: [
      'Filtros de inventario servicio',
      'Tabla de inventario por servicio',
      'Servicio',
      'Item',
      'Stock actual'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Asignar item a servicio', permission: 'create' },
      { label: 'Ver historial', permission: 'viewItemHistory' }
    ]
  },
  'gestion-conteo-fisico': {
    titulo: 'Conteo Fisico de Inventario',
    modulo: 'Inventario',
    elementosVisibles: [
      'Tipo inventario',
      'Ubicacion',
      'Observaciones',
      'Tabla de items',
      'Stock sistema',
      'Cantidad fisica',
      'Diferencia'
    ],
    accionesDisponibles: [
      'Cargar inventario',
      'Limpiar cantidades',
      'Generar reporte'
    ]
  },
  'reportes-discrepancia': {
    titulo: 'Reportes de Discrepancia',
    modulo: 'Inventario',
    elementosVisibles: [
      'Filtros de reportes',
      'Tabla de reportes',
      'Fecha de conteo',
      'Ubicacion',
      'Usuario',
      'Observaciones'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Ver detalle', permission: 'view' },
      { label: 'Descargar PDF', permission: 'report' },
      { label: 'Descargar Excel', permission: 'report' }
    ]
  },
  'gestion-movimientos': {
    titulo: 'Gestion de Movimientos',
    modulo: 'Movimientos',
    elementosVisibles: [
      'Filtros de movimientos',
      'Tabla de movimientos',
      'Tipo de movimiento',
      'Sede origen',
      'Sede destino',
      'Servicio',
      'Usuario',
      'Fecha'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Crear movimiento', permission: 'createMovimiento' },
      { label: 'Ver movimiento', permission: 'view' },
      { label: 'Exportar Excel', permission: 'report' }
    ]
  },
  'gestion-solicitudes-retiro': {
    titulo: 'Solicitudes de Retiro',
    modulo: 'Solicitudes',
    elementosVisibles: [
      'Filtros de solicitudes',
      'Resumen de solicitudes',
      'Tabla de solicitudes',
      'Estado',
      'Servicio',
      'Cuadrilla',
      'Items solicitados'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Crear solicitud', permission: 'createSolicitud' },
      { label: 'Ver solicitud', permission: 'view' },
      { label: 'Aprobar', permission: 'manageSolicitudes' },
      { label: 'Rechazar', permission: 'manageSolicitudes' },
      { label: 'Entregar', permission: 'manageSolicitudes' },
      { label: 'Registrar devolucion', permission: 'manageSolicitudes' },
      { label: 'Cerrar sin devolucion', permission: 'manageSolicitudes' },
      { label: 'Descargar comprobante de devolucion', permission: 'view' }
    ]
  },
  'chat-ia': {
    titulo: 'Chat Inteligente',
    modulo: 'Asistente IA',
    elementosVisibles: [
      'Historial del chat',
      'Caja de mensaje',
      'Boton enviar'
    ],
    accionesDisponibles: [
      'Enviar mensaje',
      'Limpiar chat'
    ]
  }
}
