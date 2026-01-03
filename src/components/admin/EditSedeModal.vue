<script setup>
import { ref, watch, computed, createVNode } from 'vue'
import { Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { adminSedeService } from '@/services/admin-sede.service'

const props = defineProps({
  open: Boolean,
  codigoSede: String
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const errorMsg = ref(null)

const form = ref({
  codigo: '',
  nombre: '',
  descripcion: ''
})

/* Cargar sede */
const loadSede = async () => {
  if (!props.codigoSede) return

  loading.value = true
  try {
    const { data } = await adminSedeService.getSede(props.codigoSede)
    const sede = data.content

    form.value = {
      codigo: sede.codigo,
      nombre: sede.nombre || '',
      descripcion: sede.descripcion || ''
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.open, props.codigoSede],
  ([open, codigo]) => {
    if (open && codigo) {
      errorMsg.value = null
      loadSede()
    }
  },
  { immediate: true }
)

/* Validacion */
const isDisabled = computed(() => {
  return !form.value.nombre.trim() || !form.value.descripcion.trim()
})

/* Guardar */
const submit = async () => {
  try {
    errorMsg.value = null
    await adminSedeService.actualizarSede(props.codigoSede, {
      nombre: form.value.nombre,
      descripcion: form.value.descripcion
    })
    emit('success')
    emit('close')
  } catch (err) {
    errorMsg.value =
      err.response?.data?.content?.[0] || 'Error desconocido'
  }
}

/* Confirmacion */
const confirmEdit = () => {
  Modal.confirm({
    title: '¿Guardar cambios de la sede?',
    icon: createVNode(ExclamationCircleOutlined),
    okText: 'Guardar',
    cancelText: 'Cancelar',
    onOk: submit
  })
}

const handleCancel = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Editar Sede" ok-text="Guardar" cancel-text="Cancelar" @ok="confirmEdit"
    :okButtonProps="{ disabled: isDisabled }" @cancel="handleCancel">
    <a-form layout="vertical" :loading="loading">
      <a-form-item label="Código de sede">
        <a-input v-model:value="form.codigo" disabled />
      </a-form-item>

      <a-form-item label="Nombre">
        <a-input v-model:value="form.nombre" />
      </a-form-item>

      <a-form-item label="Descripción">
        <a-textarea v-model:value="form.descripcion" :rows="3" />
      </a-form-item>

      <a-alert v-if="errorMsg" type="error" :message="errorMsg" show-icon style="margin-top: 4px" />
    </a-form>
  </a-modal>
</template>
