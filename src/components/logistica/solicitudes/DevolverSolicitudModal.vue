<!-- DevolverSolicitudModal.vue -->
<script setup>
import { computed, h, ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { solicitudItemsService } from '@/services/solicitud-items.service'

const props = defineProps({
  open: { type: Boolean, required: true },
  idSolicitud: [Number, String]
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const solicitud = ref(null)
const observaciones = ref('')
const cantidades = ref({})

const getErrorMessage = (err, fallback) => {
  const responseData = err.response?.data?.content ?? err.response?.data
  if (Array.isArray(responseData)) return responseData[0] || fallback
  if (typeof responseData === 'string') return responseData || fallback
  return fallback
}

const getCodigoItem = (detalle) =>
  detalle.codigoItem ||
  detalle.item?.codigoItem

const getNombreItem = (detalle) =>
  detalle.nombreItem ||
  detalle.item?.nombre ||
  '-'

const getCantidadSolicitada = (detalle) =>
  Number(detalle.cantidad || 0)

const setCantidad = (detalle, value) => {
  cantidades.value[getCodigoItem(detalle)] = value
}

const detalles = computed(() => solicitud.value?.detalles || [])

const payloadDetalles = computed(() =>
  detalles.value
    .map((detalle) => ({
      codigoItem: getCodigoItem(detalle),
      cantidad: Number(cantidades.value[getCodigoItem(detalle)] || 0),
      cantidadSolicitud: getCantidadSolicitada(detalle)
    }))
    .filter((detalle) => detalle.cantidad > 0)
)

const validationError = computed(() => {
  for (const detalle of payloadDetalles.value) {
    if (!detalle.codigoItem) return 'Hay un item sin codigo'
    if (!detalle.cantidad || detalle.cantidad <= 0) return 'Ingrese cantidades mayores a 0'
    if (detalle.cantidad > detalle.cantidadSolicitud) {
      return `La cantidad a devolver supera la cantidad solicitada para el item: ${detalle.codigoItem}`
    }
  }

  if (!payloadDetalles.value.length) return 'Ingrese al menos una cantidad a devolver'
  return ''
})

const canSubmit = computed(() => !loading.value && !validationError.value)

const resetForm = () => {
  solicitud.value = null
  observaciones.value = ''
  cantidades.value = {}
}

const loadSolicitud = async () => {
  if (!props.idSolicitud) return

  loading.value = true
  try {
    const { data } = await solicitudItemsService.getById(props.idSolicitud)
    solicitud.value = data?.content ?? data
    cantidades.value = {}
  } catch (err) {
    message.error(getErrorMessage(err, 'No se pudo cargar la solicitud'))
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.open, props.idSolicitud],
  ([open, id]) => {
    if (open && id) {
      resetForm()
      loadSolicitud()
    }
  }
)

const submit = async () => {
  if (!props.idSolicitud) return

  if (validationError.value) {
    message.error(validationError.value)
    return
  }

  const payload = {
    observaciones: observaciones.value || null,
    detalles: payloadDetalles.value.map(({ codigoItem, cantidad }) => ({
      codigoItem,
      cantidad
    }))
  }

  loading.value = true
  try {
    await solicitudItemsService.devolver(props.idSolicitud, payload)
    message.success('Solicitud devuelta')
    emit('success')
    emit('close')
  } catch (err) {
    message.error(getErrorMessage(err, 'Error al devolver la solicitud'))
  } finally {
    loading.value = false
  }
}

const confirmSubmit = () => {
  if (validationError.value) {
    message.error(validationError.value)
    return
  }

  Modal.confirm({
    title: 'Devolver solicitud',
    icon: h(ExclamationCircleOutlined),
    content: 'Se registrara la devolucion de las cantidades indicadas.',
    okText: 'Devolver',
    okType: 'primary',
    cancelText: 'Cancelar',
    onOk: submit
  })
}
</script>

<template>
  <a-modal title="Devolver Solicitud" :open="open" @cancel="$emit('close')" @ok="confirmSubmit"
    :ok-button-props="{ disabled: !canSubmit }" destroyOnClose>
    <a-spin :spinning="loading">
      <a-form layout="vertical">
        <a-alert type="info" show-icon message="Ingrese solo las cantidades a devolver."
          style="margin-bottom: 12px;" />

        <a-table :data-source="detalles" :row-key="getCodigoItem" :pagination="false" size="small" style="margin-bottom: 12px;">
          <a-table-column title="Item">
            <template #default="{ record }">
              <div style="line-height: 1.2;">
                <a-typography-text>{{ getCodigoItem(record) || '-' }}</a-typography-text>
                <br />
                <a-typography-text type="secondary" style="font-size: 12px">
                  {{ getNombreItem(record) }}
                </a-typography-text>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="Solicitado" width="100">
            <template #default="{ record }">
              {{ getCantidadSolicitada(record) }}
            </template>
          </a-table-column>
          <a-table-column title="A devolver" width="140">
            <template #default="{ record }">
              <a-input-number :value="cantidades[getCodigoItem(record)]" :min="0"
                :max="getCantidadSolicitada(record)" style="width: 100%" @change="(value) => setCantidad(record, value)" />
            </template>
          </a-table-column>
        </a-table>

        <a-alert v-if="validationError" type="warning" show-icon :message="validationError"
          style="margin-bottom: 12px;" />

        <a-form-item label="Observaciones">
          <a-textarea v-model:value="observaciones" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>
