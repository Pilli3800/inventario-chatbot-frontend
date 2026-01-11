<script setup>
import { ref, watch } from 'vue'
import { servicioService } from '@/services/servicio.service'

const props = defineProps({
  open: Boolean,
  codigoServicio: String
})

const emit = defineEmits(['close'])

const loading = ref(false)

const servicio = ref({
  codigo: '',
  nombre: '',
  descripcion: '',
  enabled: false
})

const loadServicio = async () => {
  if (!props.codigoServicio) return
  loading.value = true

  const { data } = await servicioService.get(props.codigoServicio)
  const s = data.content

  servicio.value = {
    codigo: s.codigo,
    nombre: s.nombre,
    descripcion: s.descripcion,
    enabled: s.enabled
  }

  loading.value = false
}

watch(
  () => [props.open, props.codigoServicio],
  ([open, codigo]) => {
    if (open && codigo) {
      loadServicio()
    }
  },
  { immediate: true }
)

const handleClose = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Detalle del Servicio" ok-text="Cerrar"
    :cancelButtonProps="{ style: { display: 'none' } }" @ok="handleClose" @cancel="handleClose">
    <a-form layout="vertical" :loading="loading">

      <!-- CÓDIGO -->
      <a-form-item label="Código">
        <a-input :value="servicio.codigo" disabled />
      </a-form-item>

      <!-- NOMBRE -->
      <a-form-item label="Nombre">
        <a-input :value="servicio.nombre" disabled />
      </a-form-item>

      <!-- DESCRIPCIÓN -->
      <a-form-item label="Descripción">
        <a-textarea :value="servicio.descripcion" disabled />
      </a-form-item>

      <!-- ESTADO -->
      <a-form-item label="Activo">
        <a-switch :checked="servicio.enabled" disabled />
      </a-form-item>

    </a-form>
  </a-modal>
</template>
