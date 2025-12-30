<script setup>
import { ref, watch, computed, createVNode } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { itemService } from '@/services/item.service'

const props = defineProps({
  open: Boolean,
  codigoItem: String
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const errorMsg = ref(null)

/* Formulario */
const form = ref({
  codigoItem: '',
  nombre: '',
  tipo: '',
  descripcion: '',
  observaciones: '',
  stockTotal: 0,
  stockDisponible: 0,
  enabled: false
})

/* Cargar item */
const loadItem = async () => {
  if (!props.codigoItem) return
  loading.value = true

  const { data } = await itemService.get(props.codigoItem)
  const item = data.content

  form.value = {
    codigoItem: item.codigoItem,
    nombre: item.nombre,
    tipo: item.tipo,
    descripcion: item.descripcion || '',
    observaciones: item.observaciones || '',
    stockTotal: item.stockTotal,
    stockDisponible: item.stockDisponible,
    enabled: item.enabled
  }

  loading.value = false
}

watch(
  () => [props.open, props.codigoItem],
  ([open, codigoItem]) => {
    if (open && codigoItem) {
      loadItem()
      errorMsg.value = null
    }
  },
  { immediate: true }
)

/* Deshabilitar campos */
const isDisabled = computed(() => {
  return !form.value.nombre.trim() || !form.value.tipo
})

/* Guardar  */
const submit = async () => {
  try {
    errorMsg.value = null

    await itemService.update(props.codigoItem, {
      nombre: form.value.nombre,
      descripcion: form.value.descripcion,
      tipo: form.value.tipo,
      stockTotal: form.value.stockTotal,
      stockDisponible: form.value.stockDisponible,
      enabled: form.value.enabled,
      observaciones: form.value.observaciones
    })

    message.success('Item actualizado correctamente')
    emit('success')
    emit('close')
  } catch (err) {
    errorMsg.value =
      err.response?.data?.content || 'Error desconocido'
  }
}

/* Confirmar */
const confirmEdit = () => {
  Modal.confirm({
    title: '¿Guardar cambios del item?',
    icon: createVNode(ExclamationCircleOutlined),
    okText: 'Guardar',
    cancelText: 'Cancelar',
    onOk: submit
  })
}

const handleCancel = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Editar Item" ok-text="Guardar" cancel-text="Cancelar"
    :okButtonProps="{ disabled: isDisabled }" @ok="confirmEdit" @cancel="handleCancel">
    <a-form layout="vertical" :loading="loading">
      <a-form-item label="Código">
        <a-input v-model:value="form.codigoItem" disabled />
      </a-form-item>

      <a-form-item label="Nombre">
        <a-input v-model:value="form.nombre" />
      </a-form-item>

      <a-form-item label="Tipo">
        <a-select v-model:value="form.tipo">
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

      <!-- Campos de solo lectura -->
      <a-form-item label="Stock Total">
        <a-input-number v-model:value="form.stockTotal" disabled style="width:100%" />
      </a-form-item>

      <a-form-item label="Stock Disponible">
        <a-input-number v-model:value="form.stockDisponible" disabled style="width:100%" />
      </a-form-item>

      <a-form-item label="Activo">
        <a-switch v-model:checked="form.enabled" />
      </a-form-item>

      <a-alert v-if="errorMsg" type="error" :message="errorMsg" show-icon style="margin-top: 6px" />
    </a-form>
  </a-modal>
</template>
