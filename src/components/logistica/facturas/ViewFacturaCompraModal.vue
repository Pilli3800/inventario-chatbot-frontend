<script setup>
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import { facturaCompraService } from '@/services/factura-compra.service'

const props = defineProps({
  open: Boolean,
  codigoProveedor: String,
  numeroFactura: String
})

const emit = defineEmits(['close'])

const loading = ref(false)
const factura = ref(null)

const loadFactura = async () => {
  if (!props.codigoProveedor || !props.numeroFactura) return

  loading.value = true
  try {
    const { data } = await facturaCompraService.get(props.codigoProveedor, props.numeroFactura)
    factura.value = data?.content ?? data
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.open, props.codigoProveedor, props.numeroFactura],
  ([open, codigoProveedor, numeroFactura]) => {
    if (open && codigoProveedor && numeroFactura) {
      loadFactura()
    }
  },
  { immediate: true }
)

const handleClose = () => emit('close')

const formatDate = (value) =>
  value ? dayjs(value).format('DD/MM/YYYY') : '-'
</script>

<template>
  <a-modal
    :open="open"
    title="Detalle de Factura de Compra"
    ok-text="Cerrar"
    :cancelButtonProps="{ style: { display: 'none' } }"
    @ok="handleClose"
    @cancel="handleClose"
  >
    <a-form v-if="factura" layout="vertical" :loading="loading">
      <a-form-item label="ID">
        <a-input :value="factura.id" disabled />
      </a-form-item>

      <a-form-item label="Proveedor">
        <a-input :value="`${factura.codigoProveedor} - ${factura.nombreProveedor}`" disabled />
      </a-form-item>

      <a-form-item label="RUC Proveedor">
        <a-input :value="factura.rucProveedor || '-'" disabled />
      </a-form-item>

      <a-form-item label="Numero de Factura">
        <a-input :value="factura.numeroFactura || '-'" disabled />
      </a-form-item>

      <a-form-item label="Serie">
        <a-input :value="factura.serie || '-'" disabled />
      </a-form-item>

      <a-form-item label="Correlativo">
        <a-input :value="factura.correlativo || '-'" disabled />
      </a-form-item>

      <a-form-item label="Fecha Emision">
        <a-input :value="formatDate(factura.fechaEmision)" disabled />
      </a-form-item>

      <a-form-item label="Observaciones">
        <a-textarea :value="factura.observaciones || '-'" disabled auto-size />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
