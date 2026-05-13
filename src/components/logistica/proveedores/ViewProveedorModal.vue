<script setup>
import { ref, watch } from 'vue'
import { proveedorService } from '@/services/proveedor.service'

const props = defineProps({
  open: Boolean,
  codigoProveedor: String
})

const emit = defineEmits(['close'])

const loading = ref(false)

const proveedor = ref({
  codigo: '',
  ruc: '',
  nombre: '',
  email: '',
  telefono: '',
  observaciones: '',
  enabled: false
})

const loadProveedor = async () => {
  if (!props.codigoProveedor) return
  loading.value = true

  const { data } = await proveedorService.get(props.codigoProveedor)
  const p = data.content

  proveedor.value = {
    codigo: p.codigo,
    ruc: p.ruc,
    nombre: p.nombre,
    email: p.email,
    telefono: p.telefono,
    observaciones: p.observaciones,
    enabled: p.enabled
  }

  loading.value = false
}

watch(
  () => [props.open, props.codigoProveedor],
  ([open, codigo]) => {
    if (open && codigo) {
      loadProveedor()
    }
  },
  { immediate: true }
)

const handleClose = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Detalle del Proveedor" ok-text="Cerrar"
    :cancelButtonProps="{ style: { display: 'none' } }" @ok="handleClose" @cancel="handleClose">
    <a-form layout="vertical" :loading="loading">
      <a-form-item label="Código">
        <a-input :value="proveedor.codigo" disabled />
      </a-form-item>

      <a-form-item label="RUC">
        <a-input :value="proveedor.ruc" disabled />
      </a-form-item>

      <a-form-item label="Nombre">
        <a-input :value="proveedor.nombre" disabled />
      </a-form-item>

      <a-form-item label="Email">
        <a-input :value="proveedor.email" disabled />
      </a-form-item>

      <a-form-item label="Telefono">
        <a-input :value="proveedor.telefono" disabled />
      </a-form-item>

      <a-form-item label="Observaciones">
        <a-textarea :value="proveedor.observaciones" disabled />
      </a-form-item>

      <a-form-item label="Activo">
        <a-switch :checked="proveedor.enabled" disabled />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
