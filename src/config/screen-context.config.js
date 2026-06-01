export const screenContexts = {
  home: {
    titulo: 'Inicio',
    modulo: 'General',
    elementosVisibles: [
      'Mensaje de bienvenida con el usuario actual',
      'Texto: Iniciaste sesión correctamente',
      'Sección Configuración',
      'Texto: Seguridad y preferencias de la cuenta',
      'Botón Cambiar mi contraseña'
    ],
    accionesDisponibles: [
      'Abrir menú lateral',
      'Cambiar mi contraseña',
      'Abrir asistente IA'
    ]
  },
  'dashboard-solicitudes': {
    titulo: 'Dashboard - Solicitudes',
    modulo: 'Dashboard',
    elementosVisibles: [
      'Filtros de fecha',
      'Resumen de solicitudes',
      'Gráficos de solicitudes',
      'Pendientes de cierre',
      'Solicitudes por servicio',
      'Top cuadrillas'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      'Cambiar pestaña'
    ]
  },
  'dashboard-movimientos': {
    titulo: 'Dashboard - Movimientos',
    modulo: 'Dashboard',
    elementosVisibles: [
      'Filtros de fecha',
      'Resumen de movimientos',
      'Gráficos de movimientos',
      'Ítems más movidos',
      'Stock movido'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      'Cambiar pestaña'
    ]
  },
  'dashboard-asistente-ia': {
    titulo: 'Dashboard - Asistente IA',
    modulo: 'Dashboard',
    elementosVisibles: [
      'Filtros de fecha',
      'Resumen de uso del asistente IA',
      'Gráficos de consultas',
      'Top usuarios'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      'Cambiar pestaña'
    ]
  },
  'dashboard-consumo-anomalias': {
    titulo: 'Dashboard - Consumo - Anomalías',
    modulo: 'Consumo',
    elementosVisibles: [
      'Selector Anomalías',
      'Selector Evolución',
      'Selector Proyección',
      'Selector Alertas',
      'Formulario de anomalías de consumo',
      'Leyenda de criterio de anomalía con Z Score y score ML',
      'Tabla de resultados'
    ],
    accionesDisponibles: [
      'Detectar anomalías',
      'Cambiar pestaña'
    ]
  },
  'dashboard-consumo-evolucion': {
    titulo: 'Dashboard - Consumo - Evolución',
    modulo: 'Consumo',
    elementosVisibles: [
      'Selector Anomalías',
      'Selector Evolución',
      'Selector Proyección',
      'Selector Alertas',
      'Formulario de evolución de consumo',
      'Leyenda de consumo diario, tendencia, Z Score y evento destacado',
      'Gráfico de evolución',
      'Resumen de días evaluados, consumo total, eventos y max Z Score',
      'Tabla de evolución'
    ],
    accionesDisponibles: [
      'Buscar cuadrilla',
      'Buscar ítem',
      'Ver evolución',
      'Cambiar pestaña'
    ]
  },
  'dashboard-consumo-proyeccion': {
    titulo: 'Dashboard - Consumo - Proyección',
    modulo: 'Consumo',
    elementosVisibles: [
      'Selector Anomalías',
      'Selector Evolución',
      'Selector Proyección',
      'Selector Alertas',
      'Formulario de proyección de consumo',
      'Gráfico de proyección',
      'Resumen de períodos, consumo proyectado y promedio proyectado',
      'Tabla de proyección'
    ],
    accionesDisponibles: [
      'Buscar ítem',
      'Proyectar consumo',
      'Cambiar pestaña'
    ]
  },
  'dashboard-consumo-alertas': {
    titulo: 'Dashboard - Consumo - Alertas',
    modulo: 'Consumo',
    elementosVisibles: [
      'Selector Anomalías',
      'Selector Evolución',
      'Selector Proyección',
      'Selector Alertas',
      'Filtros de alertas por tipo, referencia, código de referencia y fechas',
      'Resumen de alertas por tipo y referencias faltantes',
      'Tabla de alertas'
    ],
    accionesDisponibles: [
      'Buscar alertas',
      'Limpiar filtros de alertas',
      'Cambiar pestaña'
    ]
  },
  'gestion-usuarios': {
    titulo: 'Gestión de Usuarios',
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
      { label: 'Restablecer contraseña', permission: 'edit' },
      { label: 'Exportar Excel', permission: 'report' }
    ]
  },
  'gestion-sedes': {
    titulo: 'Gestión de Sedes',
    modulo: 'Administración',
    elementosVisibles: [
      'Filtros de sedes',
      'Tabla de sedes',
      'Código',
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
    titulo: 'Gestión de Cuadrillas',
    modulo: 'Administración',
    elementosVisibles: [
      'Filtros de cuadrillas',
      'Tabla de cuadrillas',
      'Código',
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
      { label: 'Exportar con auditoría', permission: 'report' }
    ]
  },
  'gestion-servicios': {
    titulo: 'Gestión de Servicios',
    modulo: 'Administración',
    elementosVisibles: [
      'Filtros de servicios',
      'Tabla de servicios',
      'Código',
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
      { label: 'Exportar con auditoría', permission: 'report' }
    ]
  },
  'gestion-proveedores': {
    titulo: 'Gestión de Proveedores',
    modulo: 'Logística',
    elementosVisibles: [
      'Filtros de proveedores',
      'Tabla de proveedores',
      'RUC',
      'Razón social',
      'Teléfono',
      'Estado'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Crear proveedor', permission: 'create' },
      { label: 'Ver proveedor', permission: 'view' },
      { label: 'Editar proveedor', permission: 'edit' },
      { label: 'Exportar Excel', permission: 'report' },
      { label: 'Exportar con auditoría', permission: 'audit' }
    ]
  },
  'gestion-facturas-compra': {
    titulo: 'Gestión de Facturas',
    modulo: 'Logística',
    elementosVisibles: [
      'Filtros de facturas',
      'Resumen de facturas',
      'Tabla de facturas',
      'Proveedor',
      'Número de factura',
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
    titulo: 'Gestión de Ítems',
    modulo: 'Inventario',
    elementosVisibles: [
      'Filtros de ítems',
      'Tabla de ítems',
      'Código de ítem',
      'Nombre',
      'Tipo',
      'Estado'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Crear ítem', permission: 'create' },
      { label: 'Ver ítem', permission: 'view' },
      { label: 'Editar ítem', permission: 'edit' },
      { label: 'Ver historial', permission: 'viewItemHistory' },
      { label: 'Exportar Excel', permission: 'report' },
      { label: 'Exportar con auditoría', permission: 'audit' }
    ]
  },
  'gestion-inventarios': {
    titulo: 'Gestión de Inventario',
    modulo: 'Inventario',
    elementosVisibles: [
      'Filtros de inventario',
      'Tabla de inventario por sede',
      'Sede',
      'Ítem',
      'Stock actual'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Asignar ítem a sede', permission: 'create' },
      { label: 'Exportar Excel', permission: 'report' },
      { label: 'Exportar con auditoría', permission: 'audit' }
    ]
  },
  'gestion-inventario-servicio': {
    titulo: 'Gestión de Inventario Servicio',
    modulo: 'Inventario',
    elementosVisibles: [
      'Filtros de inventario servicio',
      'Tabla de inventario por servicio',
      'Servicio',
      'Ítem',
      'Stock actual'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Asignar ítem a servicio', permission: 'create' },
      { label: 'Ver historial', permission: 'viewItemHistory' }
    ]
  },
  'gestion-conteo-fisico': {
    titulo: 'Conteo Físico de Inventario',
    modulo: 'Inventario',
    elementosVisibles: [
      'Tipo inventario',
      'Ubicación',
      'Observaciones',
      'Tabla de ítems',
      'Stock sistema',
      'Cantidad física',
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
      'Ubicación',
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
    titulo: 'Gestión de Movimientos',
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
      'Ítems solicitados'
    ],
    accionesDisponibles: [
      'Buscar',
      'Limpiar',
      { label: 'Crear solicitud', permission: 'createSolicitud' },
      { label: 'Ver solicitud', permission: 'view' },
      { label: 'Aprobar', permission: 'manageSolicitudes' },
      { label: 'Rechazar', permission: 'manageSolicitudes' },
      { label: 'Entregar', permission: 'manageSolicitudes' },
      { label: 'Registrar devolución', permission: 'manageSolicitudes' },
      { label: 'Cerrar sin devolución', permission: 'manageSolicitudes' },
      { label: 'Descargar comprobante de devolución', permission: 'view' }
    ]
  },
  'chat-ia': {
    titulo: 'Chat Inteligente',
    modulo: 'Asistente IA',
    elementosVisibles: [
      'Historial del chat',
      'Caja de mensaje',
      'Botón enviar'
    ],
    accionesDisponibles: [
      'Enviar mensaje',
      'Limpiar chat'
    ]
  }
}
