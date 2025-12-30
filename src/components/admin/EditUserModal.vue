<script setup>
import { ref, watch, computed, createVNode } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { adminUserService } from '@/services/admin-user.service'

const props = defineProps({
  open: Boolean,
  identUsuario: String
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const form = ref({
  identUsuario: '',
  email: '',
  dni: '',
  nombres: '',
  apellidos: '',
  roles: []
})

const roles = ref([])
const errorMsg = ref(null)

// Obtener roles disponibles
const loadRoles = async () => {
  const { data } = await adminUserService.getRoles()
  roles.value = data.content.map(r => r.description)
}

const loadUser = async () => {
  if (!props.identUsuario) return
  loading.value = true

  const { data } = await adminUserService.get(props.identUsuario)
  const user = data.content

  form.value = {
    identUsuario: user.identUsuario,
    email: user.email || '',
    dni: user.dni || '',
    nombres: user.nombres || '',
    apellidos: user.apellidos || '',
    enabled: user.enabled,
    roles: Array.isArray(user.roles) ? user.roles : []
  }

  loading.value = false
}

watch(
  () => [props.open, props.identUsuario],
  ([open, identUsuario]) => {
    if (open && identUsuario) {
      loadRoles()
      loadUser()
      errorMsg.value = null
    }
  },
  { immediate: true }
)


const isDisabled = computed(() => {
  return !form.value.email.trim() ||
    !form.value.nombres.trim() ||
    !form.value.apellidos.trim()
}

)

// Guardar
const submit = async () => {
  try {
    errorMsg.value = null
    await adminUserService.update(props.identUsuario, form.value)
    message.success('Usuario actualizado')
    emit('success')
    emit('close')
  } catch (err) {
    errorMsg.value = err.response?.data?.content?.[0] || 'Error desconocido'
  }
}

const confirmEdit = () => {
  Modal.confirm({
    title: '¿Guardar cambios del usuario?',
    icon: createVNode(ExclamationCircleOutlined),
    okText: 'Guardar',
    cancelText: 'Cancelar',
    onOk: submit
  })
}

const handleCancel = () => emit('close')

</script>

<template>
  <a-modal :open="open" title="Editar Usuario" ok-text="Guardar" cancel-text="Cancelar" @ok="confirmEdit"
    :okButtonProps="{ disabled: isDisabled }" @cancel="handleCancel">
    <a-form layout="vertical" :loading="loading">
      <a-form-item label="Ident Usuario">
        <a-input v-model:value="form.identUsuario" disabled />
      </a-form-item>

      <a-form-item label="Email">
        <a-input v-model:value="form.email" />
      </a-form-item>

      <a-form-item label="DNI">
        <a-input v-model:value="form.dni" />
      </a-form-item>

      <a-form-item label="Nombres">
        <a-input v-model:value="form.nombres" />
      </a-form-item>

      <a-form-item label="Apellidos">
        <a-input v-model:value="form.apellidos" />
      </a-form-item>

      <a-form-item label="Activo">
        <a-switch v-model:checked="form.enabled" />
      </a-form-item>

      <a-form-item label="Roles">
        <a-select mode="multiple" v-model:value="form.roles" placeholder="Seleccionar roles">
          <a-select-option v-for="r in roles" :key="r" :value="r">{{ r }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-alert v-if="errorMsg" type="error" :message="errorMsg" show-icon style="margin-top: 4px" />
    </a-form>
  </a-modal>
</template>
