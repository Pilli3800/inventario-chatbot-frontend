<!-- CreateMovimientoModal.vue -->
<script setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'

import { movimientosService } from '@/services/movimientos.service'
import { sedeService } from '@/services/sede.service'
import { itemService } from '@/services/item.service'
import { cuadrillaService } from '@/services/cuadrilla.service'
import { useAuthStore } from '@/stores/auth.store'

/* Props - Emits */
const props = defineProps({
  open: { type: Boolean, required: true }
})

const emit = defineEmits(['close', 'success'])
const authStore = useAuthStore()

/* Estado formulario (DTO) */
const form = ref({
  tipoMovimiento: undefined,
  codigoItem: undefined,
  cantidad: undefined,
  sedeOrigenCodigo: undefined,
  sedeDestinoCodigo: undefined,
  codigoCuadrilla: undefined,
  observaciones: ''
})

/* Tipos de movimientos por rol */
const tiposPermitidos = computed(() => {
  if (!authStore.isAuthenticated) return []

  if (authStore.hasRole('ROLE_LOGISTICA')) {
    return ['ENTRADA', 'TRANSFERENCIA']
  }

  if (authStore.hasRole('ROLE_JEFE_CUADRILLA')) {
    return ['DEVOLUCION']
  }

  return []
})


/* Flags por tipo */
const isEntrada = computed(() => form.value.tipoMovimiento === 'ENTRADA')
const isSalida = computed(() => form.value.tipoMovimiento === 'SALIDA')
const isTransferencia = computed(() => form.value.tipoMovimiento === 'TRANSFERENCIA')
const isDevolucion = computed(() => form.value.tipoMovimiento === 'DEVOLUCION')

/* Sedes */
const sedes = ref([])
const loadingSedes = ref(false)

const loadSedes = async () => {
  loadingSedes.value = true
  const { data } = await sedeService.getActivas()
  sedes.value = data.content
  loadingSedes.value = false
}

/* Items (autocomplete) */
const items = ref([])
const loadingItems = ref(false)

const buscarItems = async (texto) => {
  if (!texto || texto.length < 2) {
    items.value = []
    return
  }

  loadingItems.value = true
  try {
    const { data } = await itemService.search({
      codigoItem: texto,
      enabled: true,
      page: 0,
      size: 5
    })
    items.value = data.content
  } finally {
    loadingItems.value = false
  }
}

/* Cuadrillas (autocomplete) */
const cuadrillas = ref([])
const loadingCuadrillas = ref(false)

const buscarCuadrillas = async (texto) => {
  if (!texto || texto.length < 2) {
    cuadrillas.value = []
    return
  }

  loadingCuadrillas.value = true
  try {
    const { data } = await cuadrillaService.search({
      codigoCuadrilla: texto,
      enabled: true,
      page: 0,
      size: 5
    })
    cuadrillas.value = data.content
  } finally {
    loadingCuadrillas.value = false
  }
}

/* Validación */
const canSubmit = computed(() => {
  if (!form.value.tipoMovimiento) return false
  if (!form.value.codigoItem) return false
  if (!form.value.cantidad || form.value.cantidad <= 0) return false

  if (isEntrada.value && !form.value.sedeDestinoCodigo) return false

  if (isSalida.value) {
    if (!form.value.sedeOrigenCodigo) return false
    if (!form.value.codigoCuadrilla) return false
  }

  if (isTransferencia.value) {
    if (!form.value.sedeOrigenCodigo || !form.value.sedeDestinoCodigo) return false
    if (form.value.sedeOrigenCodigo === form.value.sedeDestinoCodigo) return false
  }

  if (isDevolucion.value) {
    if (!form.value.sedeDestinoCodigo) return false
    if (!form.value.codigoCuadrilla) return false
  }

  return true
})

/* Reset al abrir */
watch(() => props.open, (open) => {
  if (open) {
    form.value = {
      tipoMovimiento: undefined,
      codigoItem: undefined,
      cantidad: undefined,
      sedeOrigenCodigo: undefined,
      sedeDestinoCodigo: undefined,
      codigoCuadrilla: undefined,
      observaciones: ''
    }

    items.value = []
    cuadrillas.value = []
    loadSedes()
  }
})

/* Submit */
const submit = async () => {
  if (!canSubmit.value) {
    message.error('Complete los campos obligatorios')
    return
  }

  try {
    await movimientosService.create(form.value)
    message.success('Movimiento registrado correctamente')
    emit('success')
    emit('close')
  } catch (err) {
    const responseData = err.response?.data?.content;

    const errorMessage = Array.isArray(responseData)
      ? responseData[0]
      : responseData;

    message.error(errorMessage || 'Error al registrar movimiento');
  }
}
</script>

<template>
  <a-modal title="Registrar Movimiento" :open="open" @cancel="$emit('close')" @ok="submit"
    :ok-button-props="{ disabled: !canSubmit }" destroyOnClose>
    <a-form layout="vertical">

      <!-- TIPO -->
      <a-form-item label="Tipo de Movimiento" required>
        <a-select v-model:value="form.tipoMovimiento" allow-clear>
          <a-select-option v-for="t in tiposPermitidos" :key="t" :value="t">
            {{ t }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- ITEM -->
      <a-form-item label="Item" required>
        <a-select v-model:value="form.codigoItem" show-search placeholder="Buscar código de item" :filter-option="false"
          :loading="loadingItems" @search="buscarItems" allow-clear>
          <a-select-option v-for="item in items" :key="item.codigoItem" :value="item.codigoItem">
            {{ item.codigoItem }} - {{ item.nombre }} ({{ item.tipo }})
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- CANTIDAD -->
      <a-form-item label="Cantidad" required>
        <a-input-number v-model:value="form.cantidad" :min="1" style="width: 100%" />
      </a-form-item>

      <!-- SEDE ORIGEN -->
      <a-form-item v-if="isSalida || isTransferencia" label="Sede Origen" required>
        <a-select v-model:value="form.sedeOrigenCodigo" allow-clear :loading="loadingSedes">
          <a-select-option v-for="s in sedes" :key="s.codigo" :value="s.codigo">
            {{ s.codigo }} - {{ s.nombre }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- SEDE DESTINO -->
      <a-form-item v-if="isEntrada || isTransferencia || isDevolucion" label="Sede Destino" required>
        <a-select v-model:value="form.sedeDestinoCodigo" allow-clear :loading="loadingSedes">
          <a-select-option v-for="s in sedes" :key="s.codigo" :value="s.codigo">
            {{ s.codigo }} - {{ s.nombre }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- CUADRILLA -->
      <a-form-item v-if="isSalida || isDevolucion" label="Cuadrilla" required>
        <a-select v-model:value="form.codigoCuadrilla" show-search placeholder="Buscar cuadrilla" :filter-option="false"
          :loading="loadingCuadrillas" @search="buscarCuadrillas" allow-clear>
          <a-select-option v-for="c in cuadrillas" :key="c.codigoCuadrilla" :value="c.codigoCuadrilla">
            {{ c.codigoCuadrilla }} - {{ c.nombre }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- OBSERVACIONES -->
      <a-form-item label="Observaciones">
        <a-textarea v-model:value="form.observaciones" />
      </a-form-item>

    </a-form>
  </a-modal>
</template>
