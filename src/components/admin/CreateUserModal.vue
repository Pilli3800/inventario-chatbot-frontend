<!-- CreateUserModal.vue -->
<script setup>
import { ref, watch, createVNode } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { adminUserService } from '@/services/admin-user.service'
import { computed } from 'vue'
import { userRules } from '@/validation/user.rules'

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

// Rules
const rules = {
  identUsuario: [
    { required: true, message: 'El usuario es obligatorio' }
  ],
  password: [
    { required: true, message: 'La contraseña es obligatoria' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/,
      message:
        'Debe tener entre 8 y 20 caracteres, incluir mayúscula, minúscula, número y al menos uno de los siguientes símbolos: @ $ ! % * ? &'
    }
  ],
  ...userRules
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

const passwordStrengthInfo = computed(() => {
  const p = form.value.password
  if (!p) return null

  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/\d/.test(p)) score++
  if (/[@$!%*?&]/.test(p)) score++

  if (score <= 1) {
    return { percent: 25, status: 'exception', text: 'Débil' }
  }
  if (score === 2) {
    return { percent: 50, status: 'normal', text: 'Aceptable' }
  }
  if (score === 3) {
    return { percent: 75, status: 'active', text: 'Buena' }
  }
  return { percent: 100, status: 'success', text: 'Fuerte' }
})

const handleCancel = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Nuevo Usuario" ok-text="Guardar" cancel-text="Cancelar" @ok="confirmSave"
    @cancel="handleCancel">
    <a-alert type="info" show-icon message="Complete los datos para registrar un nuevo usuario"
      style="margin-bottom: 12px" />
    <a-form layout="vertical" :rules="rules" :model="form" ref="formRef" autocomplete="off">

      <!-- Identificador del usuario -->
      <!--Dummy para evitar autocomplete-->
      <input type="text" style="display:none" autocomplete="username">
      <a-form-item label="Identificador del usuario" name="identUsuario">
        <a-input v-model:value="form.identUsuario" placeholder="Identificador del usuario" allow-clear
          autocomplete="new-username" />
      </a-form-item>

      <!-- Correo electrónico -->
      <a-form-item label="Email" name="email">
        <a-input v-model:value="form.email" placeholder="usuario@empresa.com" allow-clear />
      </a-form-item>

      <!-- Contraseña -->
      <!--Dummy para evitar autocomplete-->
      <input type="password" style="display:none" autocomplete="current-password">
      <a-form-item label="Contraseña" name="password">
        <a-tooltip title="Debe contener mayúscula, minúscula, número y símbolo de @ $ ! % * ? &">
          <a-input-password v-model:value="form.password" placeholder="Mínimo 8 caracteres" allow-clear
            autocomplete="new-password" />
        </a-tooltip>
      </a-form-item>
      <div v-if="passwordStrengthInfo" class="password-strength">
        <a-progress :percent="passwordStrengthInfo.percent" :status="passwordStrengthInfo.status" size="small"
          :show-info="false" />
        <span class="strength-text">
          {{ passwordStrengthInfo.text }}
        </span>
      </div>

      <!-- DNI -->
      <a-form-item label="DNI" name="dni">
        <a-input v-model:value="form.dni" placeholder="8 dígitos númericos" allow-clear :maxlength="8" @keypress="e => {
          if (!/[0-9]/.test(e.key) || form.dni.length >= 8) {
            e.preventDefault()
          }
        }" />
      </a-form-item>

      <a-form-item label="Nombres" name="nombres">
        <a-input v-model:value="form.nombres" placeholder="Juan Carlos" allow-clear
          @keypress="e => !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/.test(e.key) && e.preventDefault()" />
      </a-form-item>

      <a-form-item label="Apellidos" name="apellidos">
        <a-input v-model:value="form.apellidos" placeholder="Rodriguez Perez" allow-clear
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

<style scoped>
.password-strength {
  margin-top: 4px;
  /* MUY pequeño */
  display: flex;
  align-items: center;
  gap: 8px;
}

.strength-text {
  font-size: 12px;
  white-space: nowrap;
  color: rgba(0, 0, 0, 0.65);
}
</style>
