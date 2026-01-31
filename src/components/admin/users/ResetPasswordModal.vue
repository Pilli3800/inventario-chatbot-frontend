<!-- ResetPasswordModal.vue -->
<script setup>
import { ref, computed, watch, createVNode } from 'vue'
import { Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { adminUserService } from '@/services/admin-user.service'

const props = defineProps({
  open: Boolean,
  identUsuario: String
})

const emit = defineEmits(['close', 'success'])

const password = ref('')
const confirmPassword = ref('') // repetir contraseña
const errorMsg = ref(null)

// valida que ambas contraseñas coincidan
const passwordsMatch = computed(
  () =>
    password.value.trim() &&
    confirmPassword.value.trim() &&
    password.value === confirmPassword.value
)

// computed para habilitar/deshabilitar botón Guardar
const isDisabled = computed(() => {
  if (!password.value.trim()) return true
  if (!confirmPassword.value.trim()) return true
  if (!passwordsMatch.value) return true
  return false
})


watch([password, confirmPassword], () => {
  if (password.value && confirmPassword.value) {
    if (password.value === confirmPassword.value) {
      errorMsg.value = null
    } else {
      errorMsg.value = 'Las contraseñas deben coincidir'
    }
    return
  }

  errorMsg.value = null
})


const handleOk = async () => {
  if (passwordsMatch.value === false) {
    errorMsg.value = 'Las contraseñas deben coincidir'
    return
  }

  try {
    errorMsg.value = null
    await adminUserService.resetPassword(props.identUsuario, password.value)
    emit('success')
    emit('close')
  } catch (err) {
    errorMsg.value = err.response?.data?.content?.[0] || 'Error desconocido'
    errorMsg.value = errorMsg.value.replace(/^password:\s*/i, '')
  }
}

const confirmReset = () => {
  Modal.confirm({
    title: 'Confirmar restablecimiento',
    icon: createVNode(ExclamationCircleOutlined),
    content: 'La contraseña actual será reemplazada.',
    okText: 'Restablecer',
    cancelText: 'Cancelar',
    async onOk() {
      await handleOk()
    }
  })
}

const handleCancel = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  password.value = ''
  confirmPassword.value = ''
  errorMsg.value = null
}

watch(
  () => props.open,
  (value) => {
    if (value) {
      resetForm()
    }
  }
)

const passwordStrengthInfo = computed(() => {
  const p = password.value
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

</script>

<template>
  <a-modal :open="open" title="Resetear contraseña" ok-text="Guardar" cancel-text="Cancelar" @ok="confirmReset"
    :okButtonProps="{ disabled: isDisabled }" @cancel="handleCancel">
    <a-form layout="vertical" autocomplete="off">

      <a-alert type="info" show-icon
        message="Esta acción restablecerá la contraseña del usuario. El cambio no se puede deshacer."
        style="margin-bottom: 12px" />

      <!-- Dummy para evitar autocomplete -->
      <input type="password" style="display:none" autocomplete="current-password">
      <a-form-item label="Nueva contraseña">
        <a-input-password v-model:value="password" allow-clear placeholder="Ingrese la nueva contraseña"
          autocomplete="new-password" minlength="8" maxlength="20" />
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


      <a-form-item label="Confirmar nueva contraseña">
        <a-input-password v-model:value="confirmPassword" allow-clear placeholder="Repita la nueva contraseña"
          autocomplete="new-password" minlength="8" maxlength="20" />
      </a-form-item>

      <a-alert v-if="errorMsg" type="error" :message="errorMsg" show-icon style="margin-top: 4px" />
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
