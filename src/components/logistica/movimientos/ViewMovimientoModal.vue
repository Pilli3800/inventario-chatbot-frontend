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

const loadMovimiento = async () => {
  if (!props.idMovimiento) return

  const id = Number(props.idMovimiento)
  loading.value = true

  const { data } = await movimientosService.getById(id)
  movimiento.value = data

  loading.value = false
}

watch(
  () => [props.open, props.idMovimiento],
  ([open, id]) => {
    if (open && id) loadMovimiento()
  }
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
        <a-input :value="movimiento.tipoMovimiento" disabled />
      </a-form-item>

      <a-form-item label="Item">
        <a-input :value="`${movimiento.codigoItem} - ${movimiento.nombreItem}`" disabled />
      </a-form-item>

      <a-form-item label="Cantidad">
        <a-input :value="movimiento.cantidad" disabled />
      </a-form-item>

      <a-form-item label="Sede Origen">
        <a-input :value="movimiento.sedeOrigen || '—'" disabled />
      </a-form-item>

      <a-form-item label="Sede Destino">
        <a-input :value="movimiento.sedeDestino || '—'" disabled />
      </a-form-item>

      <a-form-item label="Cuadrilla">
        <a-input :value="movimiento.codigoCuadrilla || '—'" disabled />
      </a-form-item>

      <a-form-item label="Servicio">
        <a-input :value="movimiento.servicio.codigo + ' - ' + movimiento.servicio.nombre || '—'" disabled />
      </a-form-item>

      <a-form-item label="Usuario">
        <a-input :value="movimiento.usuario" disabled />
      </a-form-item>

      <a-form-item label="Observaciones">
        <a-textarea :value="movimiento.observaciones || '—'" disabled auto-size />
      </a-form-item>

    </a-form>
  </a-modal>
</template>
