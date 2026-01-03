<script setup>
import { ref, watch, createVNode } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { itemService } from '@/services/item.service'

const props = defineProps({
  open: Boolean
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const errorMsg = ref(null)
const formRef = ref(null)

/* Formulario */
const form = ref({
  codigoItem: '',
  nombre: '',
  tipo: '',
  descripcion: '',
  observaciones: '',
})

/* Validaciones */
const rules = {
  codigoItem: [
    { required: true, message: 'El código es obligatorio' }
  ],
  nombre: [
    { required: true, message: 'El nombre es obligatorio' }
  ],
  tipo: [
    { required: true, message: 'El tipo es obligatorio' }
  ]
}

/* Abrir modal */
watch(() => props.open, (value) => {
  if (value) {
    resetForm()
    errorMsg.value = null
    formRef.value?.clearValidate()
  }
})

const resetForm = () => {
  form.value = {
    codigoItem: '',
    nombre: '',
    tipo: '',
    descripcion: '',
    observaciones: ''
  }
}

/* Guardar */
const submit = () => {
  formRef.value.validate()
    .then(async () => {
      try {
        errorMsg.value = null
        loading.value = true

        await itemService.create(form.value)

        message.success('Item creado correctamente')
        emit('success')
        emit('close')
      } catch (err) {
        errorMsg.value = err.response?.data?.content || ['Error desconocido']
      } finally {
        loading.value = false
      }
    })
    .catch(() => {
      message.error('Corrige los errores marcados en rojo')
    })
}

const confirmSave = () => {
  Modal.confirm({
    title: '¿Guardar nuevo item?',
    icon: createVNode(ExclamationCircleOutlined),
    okText: 'Guardar',
    cancelText: 'Cancelar',
    onOk: submit
  })
}

const handleCancel = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Nuevo Item" ok-text="Guardar" cancel-text="Cancelar" :confirm-loading="loading"
    @ok="confirmSave" @cancel="handleCancel">
    <a-form layout="vertical" :rules="rules" :model="form" ref="formRef">
      <a-form-item label="Código" name="codigoItem">
        <a-input v-model:value="form.codigoItem" />
      </a-form-item>

      <a-form-item label="Nombre" name="nombre">
        <a-input v-model:value="form.nombre" />
      </a-form-item>

      <a-form-item label="Tipo" name="tipo">
        <a-select v-model:value="form.tipo" placeholder="Seleccione tipo">
          <a-select-option value="MATERIAL">MATERIAL</a-select-option>
          <a-select-option value="HERRAMIENTA">HERRAMIENTA</a-select-option>
          <a-select-option value="EQUIPO">EQUIPO</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Descripción">
        <a-textarea v-model:value="form.descripcion" />
      </a-form-item>

      <a-form-item label="Observaciones">
        <a-textarea v-model:value="form.observaciones" />
      </a-form-item>

      <!-- Errores de validación -->
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
