<!-- ChangePasswordModal.vue -->
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
const passwordStrengthInfo = computed(() => {
  const p = nuevaPassword.value
  if (!p) return null

  let score = 0
  if (p.length >= 8 && p.length <= 20) score++
  if (/[A-Z]/.test(p)) score++
  if (/[a-z]/.test(p)) score++
  if (/\d/.test(p)) score++
  if (/[@$!%*?&]/.test(p)) score++

  if (score <= 2) {
    return { percent: 25, status: 'exception', text: 'Débil' }
  }
  if (score === 3) {
    return { percent: 50, status: 'normal', text: 'Aceptable' }
  }
  if (score === 4) {
    return { percent: 75, status: 'active', text: 'Buena' }
  }
  return { percent: 100, status: 'success', text: 'Fuerte' }
})


const actualPasswordsMatch = computed(
  () =>
    actualPassword.value.trim() &&
    confirmActualPassword.value.trim() &&
    actualPassword.value === confirmActualPassword.value
)

const isStrongPassword = computed(
  () => passwordStrengthInfo.value?.percent === 100
)

const isDisabled = computed(() => {
  if (!actualPassword.value.trim()) return true
  if (!confirmActualPassword.value.trim()) return true
  if (!nuevaPassword.value.trim()) return true
  if (!actualPasswordsMatch.value) return true
  if (!isStrongPassword.value) return true   // 🔴 NUEVO
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

      <a-alert type="info" show-icon
        message="Si olvidas tu contraseña y no puedes acceder, solicita al administrador que la restablezca."
        style="margin-bottom: 12px" />

      <a-form-item label="Contraseña actual">
        <a-input-password v-model:value="actualPassword" :minlength="8" :maxlength="20" allow-clear />
      </a-form-item>

      <a-form-item label="Confirmar contraseña actual">
        <a-input-password v-model:value="confirmActualPassword" :minlength="8" :maxlength="20" allow-clear />
      </a-form-item>

      <a-form-item label="Nueva contraseña">
        <a-input-password v-model:value="nuevaPassword" placeholder="Ingrese la nueva contraseña"
          autocomplete="new-password" :minlength="8" :maxlength="20" allow-clear />
      </a-form-item>

      <div v-if="passwordStrengthInfo" class="password-strength">
        <a-progress :percent="passwordStrengthInfo.percent" :status="passwordStrengthInfo.status" size="small"
          :show-info="false" />
        <span class="strength-text">
          {{ passwordStrengthInfo.text }}
        </span>
      </div>

      <p v-if="passwordStrengthInfo && passwordStrengthInfo.percent < 100" class="password-hint">
        Use entre 8 y 20 caracteres, con mayúscula, minúscula, número y símbolo @ $ ! % * ? &
      </p>

      <a-alert v-if="errorMsg" type="error" :message="errorMsg" show-icon style="margin-top: 8px" />
    </a-form>
  </a-modal>
</template>

<style scoped>
.password-strength {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.strength-text {
  font-size: 12px;
  white-space: nowrap;
  color: rgba(0, 0, 0, 0.65);
}

.password-hint {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 2px;
}
</style>
