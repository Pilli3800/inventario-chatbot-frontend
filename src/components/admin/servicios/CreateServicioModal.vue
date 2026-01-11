<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { adminServicioService } from '@/services/admin-servicio.service'

defineProps({
  open: Boolean
})

const emit = defineEmits(['close', 'success'])

/* === FORM === */
const loading = ref(false)
const errorMsg = ref(null)

const form = ref({
  codigoServicio: '',
  nombreServicio: '',
  descripcionServicio: ''
})

/* === VALIDACIÓN === */
const isDisabled = () =>
  !form.value.codigoServicio || !form.value.nombreServicio

/* === GUARDAR === */
const submit = async () => {
  errorMsg.value = null
  loading.value = true

  try {
    await adminServicioService.create(form.value)
    message.success('Servicio creado correctamente')
    emit('success')
    emit('close')

    // reset
    form.value = {
      codigoServicio: '',
      nombreServicio: '',
      descripcionServicio: ''
    }
  } catch (err) {
    errorMsg.value =
      err.response?.data?.content ||
      err.response?.data?.message ||
      'Error desconocido'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <a-modal title="Nuevo Servicio" :open="open" ok-text="Guardar" cancel-text="Cancelar"
    :okButtonProps="{ disabled: isDisabled(), loading }" @ok="submit" @cancel="$emit('close')">
    <a-form layout="vertical">

      <!-- CÓDIGO -->
      <a-form-item label="Código" required>
        <a-input v-model:value="form.codigoServicio" />
      </a-form-item>

      <!-- NOMBRE -->
      <a-form-item label="Nombre" required>
        <a-input v-model:value="form.nombreServicio" />
      </a-form-item>

      <!-- DESCRIPCIÓN -->
      <a-form-item label="Descripción">
        <a-textarea v-model:value="form.descripcionServicio" />
      </a-form-item>

      <!-- ERROR BACKEND -->
      <a-alert v-if="errorMsg" type="error" show-icon style="margin-top: 8px" :message="errorMsg" />

    </a-form>
  </a-modal>
</template>
