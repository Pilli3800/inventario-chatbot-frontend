<!-- RechazarSolicitudModal.vue -->
<script setup>
import { ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { h } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { solicitudItemsService } from '@/services/solicitud-items.service'

const props = defineProps({
  open: { type: Boolean, required: true },
  idSolicitud: [Number, String]
})

const emit = defineEmits(['close', 'success'])

const observaciones = ref('')

watch(() => props.open, (open) => {
  if (open) {
    observaciones.value = ''
  }
})

const submit = async () => {
  if (!props.idSolicitud) return

  try {
    await solicitudItemsService.rechazar(props.idSolicitud, {
      observaciones: observaciones.value || null
    })
    message.success('Solicitud rechazada')
    emit('success')
    emit('close')
  } catch (err) {
    const responseData = err.response?.data?.content
    const errorMessage = Array.isArray(responseData)
      ? responseData[0]
      : responseData
    message.error(errorMessage || 'Error al rechazar la solicitud')
  }
}

const confirmSubmit = () => {
  Modal.confirm({
    title: '¿Rechazar solicitud?',
    icon: h(ExclamationCircleOutlined),
    content: 'La solicitud quedará en estado RECHAZADA.',
    okText: 'Rechazar',
    okType: 'danger',
    cancelText: 'Cancelar',
    onOk: submit
  })
}
</script>

<template>
  <a-modal title="Rechazar Solicitud" :open="open" @cancel="$emit('close')" @ok="confirmSubmit" destroyOnClose>
    <a-form layout="vertical">
      <a-alert type="warning" show-icon message="La solicitud quedará en estado RECHAZADA." style="margin-bottom: 12px;" />
      <a-form-item label="Observaciones">
        <a-textarea v-model:value="observaciones" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
