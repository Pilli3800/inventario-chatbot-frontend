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
const confirmPassword = ref('') // 🆕 repetir contraseña
const errorMsg = ref(null)

// 🆕 valida que ambas contraseñas coincidan
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
    title: '¿Seguro que deseas resetear la contraseña?',
    icon: createVNode(ExclamationCircleOutlined),
    content: 'Esta acción no se puede deshacer',
    okText: 'Sí, resetear',
    cancelText: 'Cancelar',
    async onOk() {
      await handleOk()
    }
  })
}

const handleCancel = () => emit('close')
</script>

<template>
  <a-modal
    :open="open"
    title="Resetear contraseña"
    ok-text="Guardar"
    cancel-text="Cancelar"
    @ok="confirmReset"
    :okButtonProps="{ disabled: isDisabled }"
    @cancel="handleCancel"
  >
    <a-form layout="vertical">
      <a-form-item label="Nueva contraseña">
        <a-input-password v-model:value="password" />
      </a-form-item>

      <a-form-item label="Confirmar nueva contraseña">
        <a-input-password v-model:value="confirmPassword" />
      </a-form-item>

      <a-alert
        v-if="errorMsg"
        type="error"
        :message="errorMsg"
        show-icon
        style="margin-top: 4px"
      />
    </a-form>
  </a-modal>
</template>
