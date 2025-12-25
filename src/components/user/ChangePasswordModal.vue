<script setup>
import { ref, computed, watch, createVNode } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { authService } from '@/services/auth.service'

const emit = defineEmits(['close', 'success'])

const actualPassword = ref('')
const confirmActualPassword = ref('')
const nuevaPassword = ref('')
const errorMsg = ref(null)

/* =========================
   VALIDACIONES
========================= */

const actualPasswordsMatch = computed(
  () =>
    actualPassword.value.trim() &&
    confirmActualPassword.value.trim() &&
    actualPassword.value === confirmActualPassword.value
)

const isDisabled = computed(() => {
  if (!actualPassword.value.trim()) return true
  if (!confirmActualPassword.value.trim()) return true
  if (!nuevaPassword.value.trim()) return true
  if (!actualPasswordsMatch.value) return true
  return false
})

watch([actualPassword, confirmActualPassword], () => {
  if (
    actualPassword.value &&
    confirmActualPassword.value &&
    actualPassword.value !== confirmActualPassword.value
  ) {
    errorMsg.value = 'Debes colocar tu contraseña actual dos veces'
  } else {
    errorMsg.value = null
  }
})

/* =========================
   ACTIONS
========================= */

const handleChangePassword = async () => {
  if (!actualPasswordsMatch.value) {
    errorMsg.value = 'La contraseña actual no coincide'
    return
  }

  try {
    errorMsg.value = null

    await authService.changePassword({
      actualPassword: actualPassword.value,
      nuevaPassword: nuevaPassword.value
    })

    message.success('Contraseña cambiada correctamente')

    emit('success')
    emit('close')
    resetForm()
  } catch (err) {

    errorMsg.value =
      err.response?.data?.content || 'Error al cambiar la contraseña'
  }
}

const confirmChange = () => {
  Modal.confirm({
    title: '¿Deseas cambiar tu contraseña?',
    icon: createVNode(ExclamationCircleOutlined),
    content: 'Deberás usar la nueva contraseña a partir de ahora',
    okText: 'Sí, cambiar',
    cancelText: 'Cancelar',
    async onOk() {
      await handleChangePassword()
    }
  })
}

const handleCancel = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  actualPassword.value = ''
  confirmActualPassword.value = ''
  nuevaPassword.value = ''
  errorMsg.value = null
}
</script>

<template>
  <a-modal title="Cambiar contraseña" ok-text="Cambiar" cancel-text="Cancelar" :okButtonProps="{ disabled: isDisabled }"
    @ok="confirmChange" @cancel="handleCancel">
    <a-form layout="vertical">
      <a-form-item label="Contraseña actual">
        <a-input-password v-model:value="actualPassword" />
      </a-form-item>

      <a-form-item label="Confirmar contraseña actual">
        <a-input-password v-model:value="confirmActualPassword" />
      </a-form-item>

      <a-form-item label="Nueva contraseña">
        <a-input-password v-model:value="nuevaPassword"
          placeholder="Mín. 8 caracteres, mayúscula, minúscula, número y símbolo" />
      </a-form-item>

      <a-alert v-if="errorMsg" type="error" :message="errorMsg" show-icon style="margin-top: 8px" />
    </a-form>
  </a-modal>
</template>
