<!-- ViewMovimientoModal.vue -->
<script setup>
import { ref, watch } from 'vue'
import { movimientosService } from '@/services/movimientos.service'
import dayjs from 'dayjs'

const props = defineProps({
  open: Boolean,
  idMovimiento: [Number, String]
})

const emit = defineEmits(['close'])

const loading = ref(false)
const movimiento = ref(null)

const EMPTY_VALUE = '-'

const formatItem = (movimiento) => {
  const codigo = movimiento?.codigoItem
  const nombre = movimiento?.nombreItem

  if (codigo && nombre) return `${codigo} - ${nombre}`
  return codigo || nombre || EMPTY_VALUE
}

const formatServicio = (servicio) => {
  if (!servicio) return EMPTY_VALUE

  const codigo = servicio.codigo
  const nombre = servicio.nombre

  if (codigo && nombre) return `${codigo} - ${nombre}`
  return codigo || nombre || EMPTY_VALUE
}

const loadMovimiento = async () => {
  if (!props.idMovimiento) return

  const id = Number(props.idMovimiento)
  loading.value = true

  try {
    const { data } = await movimientosService.getById(id)
    movimiento.value = data
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.open, props.idMovimiento],
  ([open, id]) => {
    if (open && id) loadMovimiento()
  },
  { immediate: true }
)

const handleClose = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Detalle de Movimiento" ok-text="Cerrar"
    :cancelButtonProps="{ style: { display: 'none' } }" @ok="handleClose" @cancel="handleClose">
    <a-form layout="vertical" :loading="loading" v-if="movimiento">

      <a-form-item label="Fecha">
        <a-input :value="dayjs(movimiento.fechaMovimiento).format('DD/MM/YYYY HH:mm')" disabled />
      </a-form-item>

      <a-form-item label="Tipo de Movimiento">
        <a-input :value="movimiento.tipoMovimiento || EMPTY_VALUE" disabled />
      </a-form-item>

      <a-form-item label="Item">
        <a-input :value="formatItem(movimiento)" disabled />
      </a-form-item>

      <a-form-item label="Cantidad">
        <a-input :value="movimiento.cantidad ?? EMPTY_VALUE" disabled />
      </a-form-item>

      <a-form-item label="Sede Origen">
        <a-input :value="movimiento.sedeOrigen || EMPTY_VALUE" disabled />
      </a-form-item>

      <a-form-item label="Sede Destino">
        <a-input :value="movimiento.sedeDestino || EMPTY_VALUE" disabled />
      </a-form-item>

      <a-form-item label="Cuadrilla">
        <a-input :value="movimiento.codigoCuadrilla || EMPTY_VALUE" disabled />
      </a-form-item>

      <a-form-item label="Servicio">
        <a-input :value="formatServicio(movimiento.servicio)" disabled />
      </a-form-item>

      <a-form-item label="Usuario">
        <a-input :value="movimiento.usuario || EMPTY_VALUE" disabled />
      </a-form-item>

      <a-form-item label="Observaciones">
        <a-textarea :value="movimiento.observaciones || EMPTY_VALUE" disabled auto-size />
      </a-form-item>

    </a-form>
  </a-modal>
</template>
