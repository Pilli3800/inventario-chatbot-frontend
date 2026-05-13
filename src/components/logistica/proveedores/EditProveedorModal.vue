<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { proveedorService } from '@/services/proveedor.service'

const props = defineProps({
  open: Boolean,
  codigoProveedor: String
})

const emit = defineEmits(['close', 'success'])

const form = ref({
  ruc: '',
  nombre: '',
  email: '',
  telefono: '',
  observaciones: '',
  enabled: true
})

const load = async () => {
  if (!props.codigoProveedor) return

  const { data } = await proveedorService.get(props.codigoProveedor)
  const proveedor = data.content

  form.value = {
    ruc: proveedor.ruc,
    nombre: proveedor.nombre,
    email: proveedor.email,
    telefono: proveedor.telefono,
    observaciones: proveedor.observaciones,
    enabled: proveedor.enabled
  }
}

watch(
  () => [props.open, props.codigoProveedor],
  ([open, codigo]) => {
    if (open && codigo) {
      load()
    }
  },
  { immediate: true }
)

const submit = async () => {
  await proveedorService.update(props.codigoProveedor, form.value)
  message.success('Proveedor actualizado')
  emit('success')
  emit('close')
}
</script>

<template>
  <a-modal title="Editar Proveedor" :open="open" @ok="submit" @cancel="$emit('close')">
    <a-form layout="vertical">
      <a-form-item label="RUC">
        <a-input v-model:value="form.ruc" />
      </a-form-item>

      <a-form-item label="Nombre">
        <a-input v-model:value="form.nombre" />
      </a-form-item>

      <a-form-item label="Email">
        <a-input v-model:value="form.email" />
      </a-form-item>

      <a-form-item label="Telefono">
        <a-input v-model:value="form.telefono" :maxlength="9" />
      </a-form-item>

      <a-form-item label="Observaciones">
        <a-textarea v-model:value="form.observaciones" :maxlength="255" />
      </a-form-item>

      <a-form-item label="Activo">
        <a-switch v-model:checked="form.enabled" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
