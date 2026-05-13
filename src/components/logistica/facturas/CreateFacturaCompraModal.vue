<script setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

import { facturaCompraService } from '@/services/factura-compra.service'
import { proveedorService } from '@/services/proveedor.service'

const props = defineProps({
  open: Boolean
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const loadingProveedores = ref(false)
const errorMsg = ref(null)

const proveedores = ref([])
const modoIngreso = ref('numeroFactura')

const form = ref({
  codigoProveedor: undefined,
  numeroFactura: '',
  serie: '',
  correlativo: '',
  fechaEmision: undefined,
  observaciones: ''
})

const filterSelectOption = (input, option) => {
  const value = String(option?.value || '').toLowerCase()
  const label = String(option?.label || '').toLowerCase()
  const search = String(input || '').toLowerCase()
  return value.includes(search) || label.includes(search)
}

const loadProveedores = async () => {
  loadingProveedores.value = true
  try {
    const { data } = await proveedorService.search({
      enabled: true,
      page: 0,
      size: 1000,
      sort: 'nombre,asc'
    })
    proveedores.value = data.content
  } finally {
    loadingProveedores.value = false
  }
}

const resetForm = () => {
  form.value = {
    codigoProveedor: undefined,
    numeroFactura: '',
    serie: '',
    correlativo: '',
    fechaEmision: undefined,
    observaciones: ''
  }
  modoIngreso.value = 'numeroFactura'
  errorMsg.value = null
}

const normalizeError = (err) => {
  const content = err.response?.data?.content
  if (Array.isArray(content)) return content.join(', ')
  return content || err.response?.data?.message || 'Error al registrar factura'
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      resetForm()
      loadProveedores()
    }
  },
  { immediate: true }
)

watch(modoIngreso, (modo) => {
  if (modo === 'numeroFactura') {
    form.value.serie = ''
    form.value.correlativo = ''
  } else {
    form.value.numeroFactura = ''
  }
})

const isDisabled = computed(() => {
  if (!form.value.codigoProveedor) return true

  const numeroFactura = String(form.value.numeroFactura || '').trim()
  const serie = String(form.value.serie || '').trim()
  const correlativo = String(form.value.correlativo || '').trim()

  if (modoIngreso.value === 'numeroFactura') {
    return !numeroFactura || (serie && correlativo)
  }

  return !(serie && correlativo) || !!numeroFactura
})

const buildPayload = () => {
  const payload = {
    codigoProveedor: form.value.codigoProveedor,
    fechaEmision: form.value.fechaEmision
      ? dayjs(form.value.fechaEmision).format('YYYY-MM-DD')
      : undefined,
    observaciones: String(form.value.observaciones || '').trim() || undefined
  }

  if (modoIngreso.value === 'numeroFactura') {
    payload.numeroFactura = String(form.value.numeroFactura || '').trim()
  } else {
    payload.serie = String(form.value.serie || '').trim()
    payload.correlativo = String(form.value.correlativo || '').trim()
  }

  return payload
}

const submit = async () => {
  if (isDisabled.value) {
    message.error('Complete los campos obligatorios')
    return
  }

  loading.value = true
  errorMsg.value = null
  try {
    await facturaCompraService.create(buildPayload())
    message.success('Factura registrada correctamente')
    emit('success')
    emit('close')
    resetForm()
  } catch (err) {
    errorMsg.value = normalizeError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <a-modal
    title="Nueva Factura de Compra"
    :open="open"
    ok-text="Guardar"
    cancel-text="Cancelar"
    :okButtonProps="{ disabled: isDisabled, loading }"
    @ok="submit"
    @cancel="$emit('close')"
  >
    <a-form layout="vertical">
      <a-form-item label="Proveedor" required>
        <a-select
          v-model:value="form.codigoProveedor"
          show-search
          placeholder="Selecciona proveedor"
          :filter-option="filterSelectOption"
          :loading="loadingProveedores"
          allow-clear
          :dropdown-style="{ maxHeight: '280px', overflow: 'auto' }"
        >
          <a-select-option
            v-for="p in proveedores"
            :key="p.codigo"
            :value="p.codigo"
            :label="`${p.codigo} - ${p.nombre}`"
          >
            {{ p.codigo }} - {{ p.nombre }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Modo de ingreso" required>
        <a-radio-group v-model:value="modoIngreso">
          <a-radio value="numeroFactura">Numero completo</a-radio>
          <a-radio value="serieCorrelativo">Serie + correlativo</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item v-if="modoIngreso === 'numeroFactura'" label="Numero de Factura" required>
        <a-input v-model:value="form.numeroFactura" />
      </a-form-item>

      <a-row v-else :gutter="12">
        <a-col :span="12">
          <a-form-item label="Serie" required>
            <a-input v-model:value="form.serie" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Correlativo" required>
            <a-input v-model:value="form.correlativo" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="Fecha Emision">
        <a-date-picker v-model:value="form.fechaEmision" style="width: 100%" placeholder="Selecciona fecha" />
      </a-form-item>

      <a-form-item label="Observaciones">
        <a-textarea v-model:value="form.observaciones" :maxlength="255" />
      </a-form-item>

      <a-alert v-if="errorMsg" type="error" show-icon style="margin-top: 8px" :message="errorMsg" />
    </a-form>
  </a-modal>
</template>
