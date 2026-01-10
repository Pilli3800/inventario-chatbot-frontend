<script setup>
import { ref, watch } from 'vue'
import { cuadrillaService } from '@/services/cuadrilla.service'

const props = defineProps({
  open: Boolean,
  codigoCuadrilla: String
})

const emit = defineEmits(['close'])

const loading = ref(false)

const cuadrilla = ref({
  codigoCuadrilla: '',
  identUsuarioJefe: '',
  enabled: false
})

const loadCuadrilla = async () => {
  if (!props.codigoCuadrilla) return
  loading.value = true

  const { data } = await cuadrillaService.get(props.codigoCuadrilla)
  const c = data.content

  cuadrilla.value = {
    codigoCuadrilla: c.codigoCuadrilla,
    identUsuarioJefe: c.jefeCuadrillaUsuario,
    enabled: c.enabled
  }

  loading.value = false
}

watch(
  () => [props.open, props.codigoCuadrilla],
  ([open, codigo]) => {
    if (open && codigo) {
      loadCuadrilla()
    }
  },
  { immediate: true }
)

const handleClose = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Detalle de la Cuadrilla" ok-text="Cerrar"
    :cancelButtonProps="{ style: { display: 'none' } }" @ok="handleClose" @cancel="handleClose">

    <a-form layout="vertical" :loading="loading">
      <a-form-item label="Código">
        <a-input :value="cuadrilla.codigoCuadrilla" disabled />
      </a-form-item>

      <a-form-item label="Jefe de Cuadrilla">
        <a-input :value="cuadrilla.identUsuarioJefe" disabled />
      </a-form-item>

      <a-form-item label="Activo">
        <a-switch :checked="cuadrilla.enabled" disabled />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
