<!-- CerrarSinDevolucionSolicitudModal.vue -->
<script setup>
import { h, ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { solicitudItemsService } from '@/services/solicitud-items.service'

const props = defineProps({
  open: { type: Boolean, required: true },
  idSolicitud: [Number, String]
})

const emit = defineEmits(['close', 'success'])

const observaciones = ref('')
const loading = ref(false)

const getErrorMessage = (err, fallback) => {
  const responseData = err.response?.data?.content ?? err.response?.data
  if (Array.isArray(responseData)) return responseData[0] || fallback
  if (typeof responseData === 'string') return responseData || fallback
  return fallback
}

watch(() => props.open, (open) => {
  if (open) {
    observaciones.value = ''
    loading.value = false
  }
})

const submit = async () => {
  if (!props.idSolicitud) return

  loading.value = true
  try {
    await solicitudItemsService.cerrarSinDevolucion(props.idSolicitud, {
      observaciones: observaciones.value || null
    })
    message.success('Solicitud cerrada sin devolucion')
    emit('success')
    emit('close')
  } catch (err) {
    message.error(getErrorMessage(err, 'Error al cerrar la solicitud'))
  } finally {
    loading.value = false
  }
}

const confirmSubmit = () => {
  Modal.confirm({
    title: 'Cerrar sin devolucion',
    icon: h(ExclamationCircleOutlined),
    content: 'La solicitud pasara a estado CERRADA_SIN_DEVOLUCION.',
    okText: 'Cerrar',
    okType: 'primary',
    cancelText: 'Cancelar',
    onOk: submit
  })
}
</script>

<template>
  <a-modal title="Cerrar sin devolucion" :open="open" @cancel="$emit('close')" @ok="confirmSubmit"
    :confirm-loading="loading" destroyOnClose>
    <a-form layout="vertical">
      <a-alert type="warning" show-icon message="La solicitud se cerrara sin registrar devolucion."
        style="margin-bottom: 12px;" />
      <a-form-item label="Observaciones">
        <a-textarea v-model:value="observaciones" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
