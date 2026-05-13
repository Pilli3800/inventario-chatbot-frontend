<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { proveedorService } from '@/services/proveedor.service'

defineProps({
  open: Boolean
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const errorMsg = ref(null)

const form = ref({
  ruc: '',
  nombre: '',
  email: '',
  telefono: '',
  observaciones: ''
})

const isDisabled = () =>
  !form.value.ruc || !form.value.nombre

const normalizeError = (err) => {
  const content = err.response?.data?.content
  if (Array.isArray(content)) return content.join(', ')
  return content || err.response?.data?.message || 'Error desconocido'
}

const submit = async () => {
  errorMsg.value = null
  loading.value = true

  try {
    await proveedorService.create(form.value)
    message.success('Proveedor creado correctamente')
    emit('success')
    emit('close')

    form.value = {
      ruc: '',
      nombre: '',
      email: '',
      telefono: '',
      observaciones: ''
    }
  } catch (err) {
    errorMsg.value = normalizeError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <a-modal title="Nuevo Proveedor" :open="open" ok-text="Guardar" cancel-text="Cancelar"
    :okButtonProps="{ disabled: isDisabled(), loading }" @ok="submit" @cancel="$emit('close')">
    <a-form layout="vertical">
      <a-form-item label="RUC" required>
        <a-input v-model:value="form.ruc" />
      </a-form-item>

      <a-form-item label="Nombre" required>
        <a-input v-model:value="form.nombre" />
      </a-form-item>

      <a-form-item label="Email">
        <a-input v-model:value="form.email" />
      </a-form-item>

      <a-form-item label="Telefono">
        <a-input v-model:value="form.telefono" :maxlength="9" />
      </a-form-item>

      <a-form-item label="Observaciones">
        <a-textarea v-model:value="form.observaciones" :maxlength="255" />
      </a-form-item>

      <a-alert v-if="errorMsg" type="error" show-icon style="margin-top: 8px" :message="errorMsg" />
    </a-form>
  </a-modal>
</template>
