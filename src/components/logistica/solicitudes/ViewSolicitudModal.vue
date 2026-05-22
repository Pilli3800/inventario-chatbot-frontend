<!-- ViewSolicitudModal.vue -->
<script setup>
import { ref, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { solicitudItemsService } from '@/services/solicitud-items.service'
import { valeSalidaService } from '@/services/vale-salida.service'
import { comprobanteDevolucionService } from '@/services/comprobante-devolucion.service'
import { formatDateTime } from '@/utils/date'

const props = defineProps({
  open: Boolean,
  idSolicitud: [Number, String]
})

const emit = defineEmits(['close'])

const loading = ref(false)
const solicitud = ref(null)
const valeSalida = ref(null)
const comprobanteDevolucion = ref(null)
const loadingValeSalida = ref(false)
const loadingValePdf = ref(false)
const valeSalidaError = ref('')
const loadingComprobanteDevolucion = ref(false)
const loadingComprobantePdf = ref(false)
const comprobanteDevolucionError = ref('')
const activeKeys = ref(['timeline'])

const isValeSalidaDisponible = computed(() =>
  ['ENTREGADO', 'DEVUELTA', 'CERRADA_SIN_DEVOLUCION'].includes(solicitud.value?.estado)
)
const isSolicitudDevuelta = computed(() => solicitud.value?.estado === 'DEVUELTA')

const getErrorMessage = (err, fallback) => {
  const responseData = err?.response?.data?.content ?? err?.response?.data
  if (Array.isArray(responseData)) return responseData[0] || fallback
  if (typeof responseData === 'string') return responseData || fallback
  return fallback
}

const loadValeSalidaPorSolicitud = async (solicitudId) => {
  loadingValeSalida.value = true
  valeSalidaError.value = ''
  try {
    const { data } = await valeSalidaService.getBySolicitudId(solicitudId)
    valeSalida.value = data?.content ?? data
  } catch (err) {
    valeSalida.value = null
    valeSalidaError.value = getErrorMessage(err, 'No se pudo cargar el vale de salida')
  } finally {
    loadingValeSalida.value = false
  }
}

const loadComprobanteDevolucionPorSolicitud = async (solicitudId) => {
  loadingComprobanteDevolucion.value = true
  comprobanteDevolucionError.value = ''
  try {
    const { data } = await comprobanteDevolucionService.getBySolicitudId(solicitudId)
    comprobanteDevolucion.value = data?.content ?? data
  } catch (err) {
    comprobanteDevolucion.value = null
    comprobanteDevolucionError.value = getErrorMessage(err, 'No se pudo cargar el comprobante de devolucion')
  } finally {
    loadingComprobanteDevolucion.value = false
  }
}

const loadSolicitud = async () => {
  if (!props.idSolicitud) return

  const id = Number(props.idSolicitud)
  loading.value = true
  try {
    const { data } = await solicitudItemsService.getById(id)
    const record = data?.content ?? data
    solicitud.value = record

    valeSalida.value = null
    valeSalidaError.value = ''
    comprobanteDevolucion.value = null
    comprobanteDevolucionError.value = ''
    if (['ENTREGADO', 'DEVUELTA', 'CERRADA_SIN_DEVOLUCION'].includes(record?.estado)) {
      await loadValeSalidaPorSolicitud(id)
    }
    if (record?.estado === 'DEVUELTA') {
      await loadComprobanteDevolucionPorSolicitud(id)
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.open, props.idSolicitud],
  ([open, id]) => {
    if (open && id) loadSolicitud()
  },
  { immediate: true }
)

const buildUserLabel = (codigo, nombre) => {
  if (codigo && nombre) return `${codigo} - ${nombre}`
  if (codigo) return codigo
  if (nombre) return nombre
  return null
}

const getSolicitante = (record) =>
  buildUserLabel(
    record?.codigoSolicitante || record?.solicitante?.identUsuario || record?.identSolicitante,
    record?.nombreSolicitante || record?.solicitanteNombre
  )

const getAprobacionLabel = (record) =>
  buildUserLabel(record?.codigoUsuarioAprobacion, record?.nombreUsuarioAprobacion)

const getRechazoLabel = (record) =>
  buildUserLabel(record?.codigoUsuarioRechazo, record?.nombreUsuarioRechazo)

const getEntregaCuadrillaLabel = (record) =>
  buildUserLabel(record?.codigoCuadrilla, record?.nombreJefeCuadrilla)

const getDevolucionLabel = (record) =>
  buildUserLabel(record?.codigoUsuarioDevolucion, record?.nombreUsuarioDevolucion)

const getCierreLabel = (record) =>
  buildUserLabel(record?.codigoUsuarioCierre, record?.nombreUsuarioCierre)

const getCodigoCuadrilla = (record) =>
  record?.codigoCuadrilla ||
  record?.cuadrilla?.codigoCuadrilla ||
  record?.cuadrillaCodigo

const getServicioOrigen = (record) =>
  record?.servicioOrigenCodigo ||
  record?.servicioOrigen?.codigo ||
  record?.servicioOrigen

const downloadBlobResponse = (response, fallbackName) => {
  const blob = response?.data instanceof Blob
    ? response.data
    : new Blob([response.data], { type: 'application/pdf' })

  const url = globalThis.URL.createObjectURL(blob)
  let filename = fallbackName
  const disposition = response.headers?.['content-disposition']
  if (disposition) {
    const match = disposition.match(/filename="?(.+)"?/)
    if (match?.[1]) filename = match[1]
  }

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  globalThis.URL.revokeObjectURL(url)
}

const descargarValeSalidaPdf = async () => {
  const valeId = valeSalida.value?.id
  if (!valeId) {
    message.warning('No hay vale de salida disponible para descargar')
    return
  }

  loadingValePdf.value = true
  try {
    const response = await valeSalidaService.descargarPdf(valeId)
    downloadBlobResponse(response, `vale_salida_${valeSalida.value?.numeroVale || valeId}.pdf`)
  } catch (err) {
    message.error(getErrorMessage(err, 'No se pudo descargar el vale de salida'))
  } finally {
    loadingValePdf.value = false
  }
}

const descargarComprobanteDevolucionPdf = async () => {
  const comprobanteId = comprobanteDevolucion.value?.id
  if (!comprobanteId) {
    message.warning('No hay comprobante de devolucion disponible para descargar')
    return
  }

  loadingComprobantePdf.value = true
  try {
    const response = await comprobanteDevolucionService.descargarPdf(comprobanteId)
    downloadBlobResponse(response, `comprobante_devolucion_${comprobanteDevolucion.value?.numeroComprobante || comprobanteId}.pdf`)
  } catch (err) {
    message.error(getErrorMessage(err, 'No se pudo descargar el comprobante de devolucion'))
  } finally {
    loadingComprobantePdf.value = false
  }
}

const detalleColumns = [
  { title: 'Codigo Item', dataIndex: 'codigoItem' },
  { title: 'Nombre', dataIndex: 'nombreItem' },
  { title: 'Cantidad', dataIndex: 'cantidad' }
]

const timelineItems = (record) => {
  const estado = record?.estado
  const isApproved = ['APROBADA', 'ENTREGADO', 'DEVUELTA', 'CERRADA_SIN_DEVOLUCION'].includes(estado)
  const isRejected = estado === 'RECHAZADA'
  const isDelivered = ['ENTREGADO', 'DEVUELTA', 'CERRADA_SIN_DEVOLUCION'].includes(estado)

  const order = isRejected
    ? ['PENDIENTE', 'RECHAZADA']
    : estado === 'DEVUELTA'
      ? ['PENDIENTE', 'APROBADA', 'ENTREGADO', 'DEVUELTA']
      : estado === 'CERRADA_SIN_DEVOLUCION'
        ? ['PENDIENTE', 'APROBADA', 'ENTREGADO', 'CERRADA_SIN_DEVOLUCION']
    : ['PENDIENTE', 'APROBADA', 'ENTREGADO']

  const maxKey = estado === 'DEVUELTA' || estado === 'CERRADA_SIN_DEVOLUCION'
    ? estado
    : isDelivered
      ? 'ENTREGADO'
    : isRejected
      ? 'RECHAZADA'
      : isApproved
        ? 'APROBADA'
        : 'PENDIENTE'
  const maxIndex = order.indexOf(maxKey)
  const reachedForLine = (key) => order.indexOf(key) <= maxIndex

  const stateColor = {
    PENDIENTE: '#1890ff',
    APROBADA: 'green',
    RECHAZADA: 'red',
    ENTREGADO: '#1890ff',
    DEVUELTA: 'purple',
    CERRADA_SIN_DEVOLUCION: 'gray'
  }

  const colorFor = (key) => (reachedForLine(key) ? stateColor[key] : 'gray')

const itemsByKey = {
    PENDIENTE: {
      key: 'PENDIENTE',
      label: 'PENDIENTE',
      color: colorFor('PENDIENTE'),
      reached: reachedForLine('PENDIENTE'),
      enabled: true,
      timestamp: record?.fechaSolicitud || record?.fcCreacion || record?.fechaCreacion,
      meta: getSolicitante(record),
      observacion: record?.observaciones
    },
    APROBADA: {
      key: 'APROBADA',
      label: 'APROBADA',
      color: colorFor('APROBADA'),
      reached: reachedForLine('APROBADA'),
      enabled: reachedForLine('APROBADA'),
      timestamp: reachedForLine('APROBADA') ? record?.fechaAprobacion : null,
      meta: reachedForLine('APROBADA') ? getAprobacionLabel(record) : null,
      observacion: reachedForLine('APROBADA') ? record?.observacionesAprobacion : null
    },
    RECHAZADA: {
      key: 'RECHAZADA',
      label: 'RECHAZADA',
      color: colorFor('RECHAZADA'),
      reached: reachedForLine('RECHAZADA'),
      enabled: reachedForLine('RECHAZADA'),
      timestamp: reachedForLine('RECHAZADA') ? record?.fechaAprobacion : null,
      meta: reachedForLine('RECHAZADA') ? getRechazoLabel(record) : null,
      observacion: reachedForLine('RECHAZADA') ? record?.observacionesAprobacion : null
    },
    ENTREGADO: {
      key: 'ENTREGADO',
      label: 'ENTREGADO',
      color: colorFor('ENTREGADO'),
      reached: reachedForLine('ENTREGADO'),
      enabled: reachedForLine('ENTREGADO'),
      timestamp: reachedForLine('ENTREGADO') ? record?.fechaEntrega : null,
      meta: reachedForLine('ENTREGADO') ? getEntregaCuadrillaLabel(record) : null,
      observacion: reachedForLine('ENTREGADO') ? record?.observacionesEntrega : null
    },
    DEVUELTA: {
      key: 'DEVUELTA',
      label: 'DEVUELTA',
      color: colorFor('DEVUELTA'),
      reached: reachedForLine('DEVUELTA'),
      enabled: reachedForLine('DEVUELTA'),
      timestamp: reachedForLine('DEVUELTA') ? record?.fechaDevolucion : null,
      meta: reachedForLine('DEVUELTA') ? getDevolucionLabel(record) : null,
      observacion: reachedForLine('DEVUELTA') ? record?.observacionesDevolucion : null
    },
    CERRADA_SIN_DEVOLUCION: {
      key: 'CERRADA_SIN_DEVOLUCION',
      label: 'CERRADA_SIN_DEVOLUCION',
      color: colorFor('CERRADA_SIN_DEVOLUCION'),
      reached: reachedForLine('CERRADA_SIN_DEVOLUCION'),
      enabled: reachedForLine('CERRADA_SIN_DEVOLUCION'),
      timestamp: reachedForLine('CERRADA_SIN_DEVOLUCION') ? record?.fechaCierre : null,
      meta: reachedForLine('CERRADA_SIN_DEVOLUCION') ? getCierreLabel(record) : null,
      observacion: reachedForLine('CERRADA_SIN_DEVOLUCION') ? record?.observacionesCierre : null
    }
  }

  return order.map((key) => itemsByKey[key])
}

const handleClose = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Detalle de Solicitud" ok-text="Cerrar"
    :cancelButtonProps="{ style: { display: 'none' } }" @ok="handleClose" @cancel="handleClose">
    <a-form layout="vertical" :loading="loading" v-if="solicitud">
      <div style="margin-bottom: 8px; color: #595959;">
        Numero de solicitud: <strong>{{ solicitud.id }}</strong>
      </div>
      <a-collapse v-model:activeKey="activeKeys" expand-icon-position="end" ghost>
        <a-collapse-panel key="timeline">
          <template #header>
            <span style="font-weight: 600;">1. Linea de tiempo</span>
          </template>
          <a-timeline>
            <a-timeline-item
              v-for="item in timelineItems(solicitud)"
              :key="item.key"
              :color="item.color"
              :class="{ reached: item.reached }"
            >
              <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 600;">{{ item.label }}</span>
                <span :style="{ color: item.enabled ? '#888' : '#bfbfbf' }">
                  {{ item.timestamp ? formatDateTime(item.timestamp) : '—' }}
                </span>
                <span v-if="item.meta" :style="{ color: item.enabled ? '#888' : '#bfbfbf' }">
                  {{ item.meta }}
                </span>
                <span v-if="item.observacion" :style="{ color: item.enabled ? '#888' : '#bfbfbf' }">
                  {{ item.observacion }}
                </span>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-collapse-panel>

        <a-collapse-panel key="detalles">
          <template #header>
            <span style="font-weight: 600;">2. Detalles (Items)</span>
          </template>
          <a-table :columns="detalleColumns" :data-source="solicitud.detalles || []" row-key="id"
            :pagination="false" size="small">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'codigoItem'">
                {{ record.codigoItem || record.item?.codigoItem || '—' }}
              </template>

              <template v-else-if="column.dataIndex === 'nombreItem'">
                {{ record.nombreItem || record.item?.nombre || '—' }}
              </template>

              <template v-else-if="column.dataIndex === 'cantidad'">
                <span style="font-weight: 600;">{{ record.cantidad }}</span>
              </template>
            </template>
          </a-table>
        </a-collapse-panel>

        <a-collapse-panel key="info">
          <template #header>
            <span style="font-weight: 600;">3. Información general</span>
          </template>
          <a-form-item label="Numero de solicitud">
            <a-input :value="solicitud.id || '—'" disabled />
          </a-form-item>

          <a-form-item label="Estado">
            <a-input :value="solicitud.estado" disabled />
          </a-form-item>

          <a-form-item label="Fecha Solicitud">
            <a-input :value="formatDateTime(solicitud.fechaSolicitud || solicitud.fechaCreacion || solicitud.createdAt)" disabled />
          </a-form-item>

          <a-form-item label="Solicitante">
            <a-input :value="getSolicitante(solicitud) || '—'" disabled />
          </a-form-item>

          <a-form-item label="Cuadrilla">
            <a-input :value="getCodigoCuadrilla(solicitud) || '—'" disabled />
          </a-form-item>

          <a-form-item label="Servicio Origen">
            <a-input :value="getServicioOrigen(solicitud) || '—'" disabled />
          </a-form-item>

          <a-form-item label="Observaciones">
            <a-textarea :value="solicitud.observaciones || '—'" disabled auto-size />
          </a-form-item>

          <a-form-item label="Observaciones Aprobacion">
            <a-textarea :value="solicitud.observacionesAprobacion || '—'" disabled auto-size />
          </a-form-item>

          <a-form-item label="Observaciones Entrega">
            <a-textarea :value="solicitud.observacionesEntrega || '—'" disabled auto-size />
          </a-form-item>

          <template v-if="solicitud.fechaDevolucion || solicitud.codigoUsuarioDevolucion || solicitud.observacionesDevolucion">
            <a-form-item label="Fecha Devolucion">
              <a-input :value="solicitud.fechaDevolucion ? formatDateTime(solicitud.fechaDevolucion) : '-'" disabled />
            </a-form-item>

            <a-form-item label="Usuario Devolucion">
              <a-input :value="getDevolucionLabel(solicitud) || '-'" disabled />
            </a-form-item>

            <a-form-item label="Observaciones Devolucion">
              <a-textarea :value="solicitud.observacionesDevolucion || '-'" disabled auto-size />
            </a-form-item>
          </template>

          <template v-if="solicitud.fechaCierre || solicitud.codigoUsuarioCierre || solicitud.observacionesCierre">
            <a-form-item label="Fecha Cierre">
              <a-input :value="solicitud.fechaCierre ? formatDateTime(solicitud.fechaCierre) : '-'" disabled />
            </a-form-item>

            <a-form-item label="Usuario Cierre">
              <a-input :value="getCierreLabel(solicitud) || '-'" disabled />
            </a-form-item>

            <a-form-item label="Observaciones Cierre">
              <a-textarea :value="solicitud.observacionesCierre || '-'" disabled auto-size />
            </a-form-item>
          </template>
        </a-collapse-panel>
        <a-collapse-panel v-if="isValeSalidaDisponible" key="vale-salida">
          <template #header>
            <span style="font-weight: 600;">4. Vale de salida</span>
          </template>

          <a-spin :spinning="loadingValeSalida">
            <template v-if="valeSalida">
              <a-form-item label="Numero de vale">
                <a-input :value="valeSalida.numeroVale || '-'" disabled />
              </a-form-item>

              <a-form-item label="Fecha de generacion">
                <a-input :value="valeSalida.fechaGeneracion ? formatDateTime(valeSalida.fechaGeneracion) : '-'" disabled />
              </a-form-item>

              <a-form-item label="Acciones">
                <a-button type="primary" :loading="loadingValePdf" @click="descargarValeSalidaPdf">
                  Descargar vale de salida (PDF)
                </a-button>
              </a-form-item>
            </template>

            <a-alert v-else type="warning" show-icon :message="valeSalidaError || 'No hay vale de salida disponible.'" />
          </a-spin>
        </a-collapse-panel>
        <a-collapse-panel v-if="isSolicitudDevuelta" key="comprobante-devolucion">
          <template #header>
            <span style="font-weight: 600;">5. Comprobante de devolucion</span>
          </template>

          <a-spin :spinning="loadingComprobanteDevolucion">
            <template v-if="comprobanteDevolucion">
              <a-form-item label="Numero de comprobante">
                <a-input :value="comprobanteDevolucion.numeroComprobante || '-'" disabled />
              </a-form-item>

              <a-form-item label="Fecha de generacion">
                <a-input :value="comprobanteDevolucion.fechaGeneracion ? formatDateTime(comprobanteDevolucion.fechaGeneracion) : '-'" disabled />
              </a-form-item>

              <a-form-item label="Acciones">
                <a-button type="primary" :loading="loadingComprobantePdf" @click="descargarComprobanteDevolucionPdf">
                  Descargar comprobante de devolucion (PDF)
                </a-button>
              </a-form-item>
            </template>

            <a-alert v-else type="warning" show-icon
              :message="comprobanteDevolucionError || 'No hay comprobante de devolucion disponible.'" />
          </a-spin>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </a-modal>
</template>

<style scoped>
:deep(.ant-timeline-item.reached .ant-timeline-item-tail) {
  border-left-color: #1890ff;
}
</style>

