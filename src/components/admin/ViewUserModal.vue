<script setup>
import { ref, watch } from 'vue'
import { userService } from '@/services/user.service'

const props = defineProps({
  open: Boolean,
  identUsuario: String
})

const emit = defineEmits(['close'])

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

const loadUser = async () => {
  if (!props.identUsuario) return
  loading.value = true

  const { data } = await userService.get(props.identUsuario)
  const content = data.content
  user.value = {
    identUsuario: content.identUsuario,
    email: content.email || '',
    dni: content.dni || '',
    nombres: content.nombres || '',
    apellidos: content.apellidos || '',
    enabled: content.enabled,
    roles: Array.isArray(content.roles) ? content.roles : []
  }

  loading.value = false
}

watch(
  () => [props.open, props.identUsuario],
  ([open, identUsuario]) => {
    if (open && identUsuario) {
      loadUser()
    }
  },
  { immediate: true }
)


const handleClose = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Detalle del Usuario" ok-text="Cerrar" :cancelButtonProps="{ style: { display: 'none' } }"
    @ok="handleClose" @cancel="handleClose">
    <a-form layout="vertical">
      <a-form-item label="Ident Usuario">
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
        <a-select :value="user.roles" mode="multiple" disabled />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
