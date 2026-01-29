<!-- EditUserModal.vue -->
<script setup>
import { ref, watch, computed, createVNode } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { adminUserService } from '@/services/admin-user.service'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/stores/auth.store'
import { userRules } from '@/validation/user.rules'


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

const authStore = useAuthStore()

const formRef = ref(null)

// Rules
const rules = userRules;

// Obtener roles disponibles
const loadRoles = async () => {
  const { data } = await adminUserService.getRoles()
  roles.value = data.content.map(r => r.description)
}

// util: si es el usuario actual
const isSelf = computed(() => {
  return props.identUsuario === authStore.ident
})

const loadUser = async () => {
  if (!props.identUsuario) return
  loading.value = true

  const { data } = await userService.get(props.identUsuario)
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

watch(
  () => props.open,
  (open) => {
    if (!open) {
      formRef.value?.clearValidate()
    }
  }
)

// Guardar
const submit = () => {
  formRef.value.validate().then(async () => {
    try {
      errorMsg.value = null
      await adminUserService.update(props.identUsuario, form.value)
      message.success('Usuario actualizado')
      emit('success')
      emit('close')
    } catch (err) {
      errorMsg.value = err.response?.data?.content?.[0] || 'Error desconocido'
    }
  }).catch(() => {
    message.error('Corrige los errores marcados en rojo')
  })
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
    @cancel="handleCancel">
    <a-form layout="vertical" :loading="loading" :model="form" :rules="rules" ref="formRef">
      <a-form-item label="Identificador del usuario" name="identUsuario">
        <a-input v-model:value="form.identUsuario" disabled />
      </a-form-item>

      <a-form-item label="Email" name="email">
        <a-input v-model:value="form.email" placeholder="usuario@empresa.com" allow-clear />
      </a-form-item>

      <a-form-item label="DNI" name="dni">
        <a-input v-model:value="form.dni" placeholder="8 dígitos numéricos" allow-clear :maxlength="8" @keypress="e => {
          if (!/[0-9]/.test(e.key) || form.dni.length >= 8) {
            e.preventDefault()
          }
        }" />
      </a-form-item>

      <a-form-item label="Nombres" name="nombres">
        <a-input v-model:value="form.nombres" placeholder="Juan Carlos" allow-clear @keypress="e =>
          !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/.test(e.key) && e.preventDefault()
        " />
      </a-form-item>

      <a-form-item label="Apellidos" name="apellidos">
        <a-input v-model:value="form.apellidos" placeholder="Rodriguez Perez" allow-clear @keypress="e =>
          !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/.test(e.key) && e.preventDefault()
        " />
      </a-form-item>

      <a-form-item label="Activo">
        <a-tooltip v-if="isSelf" title="No puedes desactivarte a ti mismo">
          <span>
            <a-switch v-model:checked="form.enabled" :disabled="true" />
          </span>
        </a-tooltip>

        <a-switch v-else v-model:checked="form.enabled" />
      </a-form-item>


      <a-form-item label="Roles" name="roles">
        <a-select mode="multiple" v-model:value="form.roles" placeholder="Seleccionar roles">
          <a-select-option v-for="r in roles" :key="r" :value="r" :disabled="isSelf && r === 'ADMINISTRACION'">
            {{ r }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-alert v-if="errorMsg" type="error" :message="errorMsg" show-icon style="margin-top: 4px" />
    </a-form>
  </a-modal>
</template>
