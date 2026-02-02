<!-- ProfileModal.vue -->
<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth.store'
import { userService } from '@/services/user.service'

const props = defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const auth = useAuthStore()
const loading = ref(false)
const user = ref({
  identUsuario: '',
  email: '',
  dni: '',
  nombres: '',
  apellidos: '',
  enabled: false,
  roles: []
})

const roleOptions = computed(() =>
  Array.isArray(user.value.roles)
    ? user.value.roles.map(r => ({ label: r, value: r }))
    : []
)

const loadUser = async () => {
  if (!auth.ident) return
  loading.value = true
  try {
    const { data } = await userService.get(auth.ident)
    const content = data.content || {}
    user.value = {
      identUsuario: content.identUsuario || auth.ident,
      email: content.email || '',
      dni: content.dni || '',
      nombres: content.nombres || '',
      apellidos: content.apellidos || '',
      enabled: Boolean(content.enabled),
      roles: Array.isArray(content.roles) ? content.roles : []
    }
  } catch (err) {
    message.error(err.response?.data?.content || 'No se pudo cargar el perfil')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) loadUser()
  },
  { immediate: true }
)

const handleClose = () => emit('close')
</script>

<template>
  <a-modal :open="props.open" title="Mi perfil" ok-text="Cerrar" :cancelButtonProps="{ style: { display: 'none' } }"
    :confirmLoading="loading" @ok="handleClose" @cancel="handleClose" :zIndex="1300">
    <a-spin :spinning="loading">
      <a-form layout="vertical">
        <a-form-item label="Identificador del usuario">
          <a-input :value="user.identUsuario" disabled />
        </a-form-item>

        <a-form-item label="Email">
          <a-input :value="user.email" disabled />
        </a-form-item>

        <a-form-item label="DNI">
          <a-input :value="user.dni" disabled />
        </a-form-item>

        <a-form-item label="Nombres">
          <a-input :value="user.nombres" disabled />
        </a-form-item>

        <a-form-item label="Apellidos">
          <a-input :value="user.apellidos" disabled />
        </a-form-item>

        <a-form-item label="Activo">
          <a-switch :checked="user.enabled" disabled />
        </a-form-item>

        <a-form-item label="Roles">
          <a-select :options="roleOptions" :value="user.roles" mode="multiple" disabled />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>
