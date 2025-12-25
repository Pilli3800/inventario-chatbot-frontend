<script setup>
import { ref, watch, createVNode } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { adminUserService } from '@/services/admin-user.service'

const props = defineProps({
  open: Boolean
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const roles = ref([])
const errorMsg = ref(null)
const formRef = ref(null)

// form inicial
const form = ref({
  identUsuario: '',
  email: '',
  password: '',
  dni: '',
  nombres: '',
  apellidos: '',
  roles: []
})

// reglas de validación
const rules = {
  identUsuario: [
    { required: true, message: 'El usuario es obligatorio' }
  ],
  email: [
    { required: true, message: 'El email es obligatorio' },
    { type: 'email', message: 'Debe ser un email válido' }
  ],
  password: [
    { required: true, message: 'La contraseña es obligatoria' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/,
      message: 'Debe tener entre 8 y 20 caracteres, incluir mayúscula, minúscula, número y al menos uno de los siguientes símbolos: @ $ ! % * ? &'
    }
  ],
  dni: [
    { required: true, message: 'El DNI es obligatorio' },
    { pattern: /^\d{8}$/, message: 'Debe tener 8 dígitos numéricos' }
  ],
  nombres: [
    { required: true, message: 'Los nombres son obligatorios' },
    { pattern: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/, message: 'Solo letras' }
  ],
  apellidos: [
    { required: true, message: 'Los apellidos son obligatorios' },
    { pattern: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/, message: 'Solo letras' }
  ],
  roles: [
    { required: true, message: 'Debe seleccionar al menos un rol' }
  ]
}

// cargar roles al abrir modal
const loadRoles = async () => {
  const { data } = await adminUserService.getRoles()
  roles.value = data.content.map(r => r.description)
}

watch(() => props.open, (value) => {
  if (value) {
    loadRoles()
    resetForm()
    errorMsg.value = null
    formRef.value?.clearValidate()
  }
})

const resetForm = () => {
  form.value = {
    identUsuario: '',
    email: '',
    password: '',
    dni: '',
    nombres: '',
    apellidos: '',
    roles: []
  }
}

// Guardar
const submit = () => {
  formRef.value.validate().then(async () => {
    try {
      errorMsg.value = null
      loading.value = true

      await adminUserService.create(form.value)

      message.success('Usuario creado correctamente')
      emit('success')
      emit('close')
    } catch (err) {
      errorMsg.value = err.response?.data?.content || ['Error desconocido']
    } finally {
      loading.value = false
    }
  }).catch(() => {
    message.error('Corrige los errores marcados en rojo')
  })
}

const confirmSave = () => {
  Modal.confirm({
    title: '¿Guardar nuevo usuario?',
    icon: createVNode(ExclamationCircleOutlined),
    okText: 'Guardar',
    cancelText: 'Cancelar',
    onOk: submit
  })
}

const handleCancel = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Nuevo Usuario" ok-text="Guardar" cancel-text="Cancelar" @ok="confirmSave"
    @cancel="handleCancel">
    <a-form layout="vertical" :rules="rules" :model="form" ref="formRef">
      <a-form-item label="Usuario" name="identUsuario">
        <a-input v-model:value="form.identUsuario" />
      </a-form-item>

      <a-form-item label="Email" name="email">
        <a-input v-model:value="form.email" />
      </a-form-item>

      <a-form-item label="Contraseña" name="password">
        <a-input-password type="password" v-model:value="form.password" autocomplete="new-password" />
      </a-form-item>

      <a-form-item label="DNI" name="dni">
        <a-input v-model:value="form.dni" :maxlength="8" @keypress="e => {
          if (!/[0-9]/.test(e.key) || form.dni.length >= 8) {
            e.preventDefault()
          }
        }" />
      </a-form-item>

      <a-form-item label="Nombres" name="nombres">
        <a-input v-model:value="form.nombres"
          @keypress="e => !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/.test(e.key) && e.preventDefault()" />
      </a-form-item>

      <a-form-item label="Apellidos" name="apellidos">
        <a-input v-model:value="form.apellidos"
          @keypress="e => !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/.test(e.key) && e.preventDefault()" />
      </a-form-item>

      <a-form-item label="Roles" name="roles">
        <a-select mode="multiple" v-model:value="form.roles" placeholder="Seleccionar roles">
          <a-select-option v-for="r in roles" :key="r" :value="r">{{ r }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-alert v-if="errorMsg && Array.isArray(errorMsg)" type="error" show-icon style="margin-top: 8px">
        <template #message>
          Errores de validación:
        </template>
        <template #description>
          <ul style="margin-left: -20px">
            <li v-for="(err, i) in errorMsg" :key="i">
              {{ err }}
            </li>
          </ul>
        </template>
      </a-alert>
    </a-form>
  </a-modal>
</template>
