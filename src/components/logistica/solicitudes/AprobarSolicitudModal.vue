<!-- AprobarSolicitudModal.vue -->
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
const errorMessages = ref([])
const showAllErrors = ref(false)

watch(() => props.open, (open) => {
  if (open) {
    observaciones.value = ''
    errorMessages.value = []
    showAllErrors.value = false
  }
})

const submit = async () => {
  if (!props.idSolicitud) return

  try {
    errorMessages.value = []
    showAllErrors.value = false
    await solicitudItemsService.aprobar(props.idSolicitud, {
      observaciones: observaciones.value || null
    })
    message.success('Solicitud aprobada')
    emit('success')
    emit('close')
  } catch (err) {
    const responseData = err.response?.data?.content
    if (Array.isArray(responseData)) {
      errorMessages.value = responseData
    } else if (typeof responseData === 'string') {
      errorMessages.value = [responseData]
    } else {
      errorMessages.value = ['Error al aprobar la solicitud']
    }
  }
}

const confirmSubmit = () => {
  Modal.confirm({
    title: '¿Aprobar solicitud?',
    icon: h(ExclamationCircleOutlined),
    content: 'Se validará stock y se registrará la salida.',
    okText: 'Aprobar',
    okType: 'primary',
    cancelText: 'Cancelar',
    onOk: submit
  })
}
</script>

<template>
  <a-modal title="Aprobar Solicitud" :open="open" @cancel="$emit('close')" @ok="confirmSubmit" destroyOnClose>
    <a-form layout="vertical">
      <a-alert type="info" show-icon message="Se validará stock y se registrará la salida."
        style="margin-bottom: 12px;" />

      <a-alert v-if="errorMessages.length" type="error" show-icon style="margin-bottom: 12px;">
        <template #message>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>Se encontraron {{ errorMessages.length }} errores</span>
            <a-button type="link" size="small" @click="showAllErrors = !showAllErrors">
              {{ showAllErrors ? 'Ocultar' : 'Ver detalles' }}
            </a-button>
          </div>
        </template>
        <template #description>
          <div :style="{
            maxHeight: showAllErrors ? '200px' : '96px',
            overflow: 'auto',
            paddingRight: '4px'
          }">
            <div v-for="(msg, idx) in (showAllErrors ? errorMessages : errorMessages.slice(0, 3))" :key="idx">
              {{ msg }}
            </div>
            <div v-if="!showAllErrors && errorMessages.length > 5" style="margin-top: 6px; color: #888;">
              y {{ errorMessages.length - 5 }} mÃ¡s...
            </div>
          </div>
        </template>
      </a-alert>

      <a-form-item label="Observaciones">
        <a-textarea v-model:value="observaciones" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
