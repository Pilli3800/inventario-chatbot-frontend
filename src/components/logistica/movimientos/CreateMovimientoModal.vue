<!-- CreateMovimientoModal.vue -->
<script setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

import { movimientosService } from '@/services/movimientos.service'
import { sedeService } from '@/services/sede.service'
import { itemService } from '@/services/item.service'
import { cuadrillaService } from '@/services/cuadrilla.service'
import { servicioService } from '@/services/servicio.service'
import { proveedorService } from '@/services/proveedor.service'
import { facturaCompraService } from '@/services/factura-compra.service'
import { useAuthStore } from '@/stores/auth.store'

const props = defineProps({
  open: { type: Boolean, required: true }
})

const emit = defineEmits(['close', 'success'])
const authStore = useAuthStore()

const OPTIONAL_FIELDS = [
  'sedeOrigenCodigo',
  'sedeDestinoCodigo',
  'codigoServicio',
  'codigoProveedor',
  'numeroFactura',
  'serieFactura',
  'correlativoFactura',
  'fechaEmisionFactura',
  'codigoCuadrilla'
]

const TIPO_CONFIG = {
  ENTRADA: {
    alert: {
      message: 'Flujo: Externo -> Sede',
      description: 'Registra una entrada de stock desde una fuente externa hacia una sede destino.',
      type: 'success'
    },
    visibleFields: ['sedeDestinoCodigo'],
    requiredFields: ['sedeDestinoCodigo']
  },
  COMPRA: {
    alert: {
      message: 'Flujo: Proveedor -> Sede',
      description: 'Registra una compra con proveedor y numero de factura hacia la sede destino.',
      type: 'success'
    },
    visibleFields: [
      'sedeDestinoCodigo',
      'codigoProveedor',
      'numeroFactura',
      'serieFactura',
      'correlativoFactura',
      'fechaEmisionFactura'
    ],
    requiredFields: ['sedeDestinoCodigo', 'codigoProveedor'],
    sections: [
      { label: '1. Datos del movimiento' },
      { label: '2. Datos de factura' }
    ]
  },
  TRANSFERENCIA: {
    alert: {
      message: 'Flujo: Sede -> Sede',
      description: 'Transfiere stock entre sedes. La sede origen y destino deben ser distintas.',
      type: 'info'
    },
    visibleFields: ['sedeOrigenCodigo', 'sedeDestinoCodigo'],
    requiredFields: ['sedeOrigenCodigo', 'sedeDestinoCodigo']
  },
  TRANSFERENCIA_SERVICIO: {
    alert: {
      message: 'Flujo: Sede -> Servicio',
      description: 'Mueve stock desde una sede origen hacia el inventario del servicio.',
      type: 'info'
    },
    visibleFields: ['sedeOrigenCodigo', 'codigoServicio'],
    requiredFields: ['sedeOrigenCodigo', 'codigoServicio']
  },
  SALIDA: {
    alert: {
      message: 'Flujo: Sede -> Cuadrilla',
      description: 'Registra una salida de stock desde sede hacia cuadrilla.',
      type: 'warning'
    },
    visibleFields: ['sedeOrigenCodigo', 'codigoCuadrilla'],
    requiredFields: ['sedeOrigenCodigo', 'codigoCuadrilla']
  },
  SALIDA_CUADRILLA: {
    alert: {
      message: 'Flujo: Servicio -> Cuadrilla',
      description: 'Registra una salida desde inventario de servicio hacia cuadrilla.',
      type: 'warning'
    },
    visibleFields: ['codigoCuadrilla'],
    requiredFields: ['codigoCuadrilla']
  },
  RETORNO_A_SEDE: {
    alert: {
      message: 'Flujo: Servicio -> Sede',
      description: 'Registra retorno de sobrante desde servicio hacia sede destino.',
      type: 'info'
    },
    visibleFields: ['codigoServicio', 'sedeDestinoCodigo'],
    requiredFields: ['codigoServicio', 'sedeDestinoCodigo']
  },
  AJUSTE: {
    alert: {
      message: 'Ajuste administrativo de stock',
      description: 'Permite sumar o restar stock en una sede o en un servicio. Requiere observaciones.',
      type: 'warning'
    },
    visibleFields: ['sedeDestinoCodigo', 'codigoServicio'],
    requiredFields: []
  }
}

const form = ref({
  tipoMovimiento: undefined,
  codigoItem: undefined,
  cantidad: undefined,
  sedeOrigenCodigo: undefined,
  sedeDestinoCodigo: undefined,
  codigoServicio: undefined,
  codigoProveedor: undefined,
  numeroFactura: '',
  serieFactura: '',
  correlativoFactura: '',
  fechaEmisionFactura: undefined,
  codigoCuadrilla: undefined,
  observaciones: ''
})
const facturaModo = ref('existente')

const isLogistica = computed(() => authStore.hasRole('ROLE_LOGISTICA'))
const isJefeCuadrilla = computed(() => authStore.hasRole('ROLE_JEFE_CUADRILLA'))

const tiposPermitidos = computed(() => {
  if (!authStore.isAuthenticated) return []
  if (isLogistica.value) {
    return ['ENTRADA', 'COMPRA', 'TRANSFERENCIA', 'TRANSFERENCIA_SERVICIO', 'RETORNO_A_SEDE', 'AJUSTE']
  }
  if (isJefeCuadrilla.value) {
    return []
  }
  return []
})

const tipoConfig = computed(() => TIPO_CONFIG[form.value.tipoMovimiento] || null)
const tipoMovimientoInfo = computed(() => tipoConfig.value?.alert || null)
const compraSections = computed(() => tipoConfig.value?.sections || [])
const isAjuste = computed(() => form.value.tipoMovimiento === 'AJUSTE')

const hasField = (field) => tipoConfig.value?.visibleFields?.includes(field) || false
const isRequiredField = (field) => tipoConfig.value?.requiredFields?.includes(field) || false

const filterSelectOption = (input, option) => {
  const value = String(option?.value || '').toLowerCase()
  const label = String(option?.label || '').toLowerCase()
  const search = String(input || '').toLowerCase()
  return value.includes(search) || label.includes(search)
}

const sedes = ref([])
const loadingSedes = ref(false)
const loadSedes = async () => {
  loadingSedes.value = true
  try {
    const { data } = await sedeService.getActivas()
    sedes.value = data.content
  } finally {
    loadingSedes.value = false
  }
}

const items = ref([])
const loadingItems = ref(false)
const loadItems = async () => {
  loadingItems.value = true
  try {
    const { data } = await itemService.search({
      enabled: true,
      page: 0,
      size: 1000,
      sort: 'codigoItem,asc'
    })
    items.value = data.content
  } finally {
    loadingItems.value = false
  }
}

const cuadrillas = ref([])
const loadingCuadrillas = ref(false)
const buscarCuadrillas = async (texto = '') => {
  loadingCuadrillas.value = true
  try {
    const params = {
      enabled: true,
      page: 0,
      size: 20
    }

    if (texto?.trim()) {
      params.codigoCuadrilla = texto.trim()
    }

    const { data } = await cuadrillaService.search(params)
    cuadrillas.value = data.content
  } finally {
    loadingCuadrillas.value = false
  }
}

const servicios = ref([])
const loadingServicios = ref(false)
const buscarServicios = async (texto) => {
  if (!texto || texto.length < 1) {
    servicios.value = []
    return
  }
  loadingServicios.value = true
  try {
    const { data } = await servicioService.search({
      codigo: texto,
      enabled: true,
      page: 0,
      size: 5
    })
    servicios.value = data.content
  } finally {
    loadingServicios.value = false
  }
}

const proveedores = ref([])
const loadingProveedores = ref(false)
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

const facturasCompra = ref([])
const loadingFacturasCompra = ref(false)
const loadFacturasCompra = async () => {
  loadingFacturasCompra.value = true
  try {
    const params = {
      page: 0,
      size: 1000,
      sort: 'id,desc'
    }
    if (form.value.codigoProveedor) {
      params.codigoProveedor = form.value.codigoProveedor
    }
    const { data } = await facturaCompraService.search(params)
    facturasCompra.value = data.content
  } finally {
    loadingFacturasCompra.value = false
  }
}

const getFacturaFecha = (factura) =>
  factura?.fechaEmision || factura?.fechaEmisionFactura || null

const onFacturaExistenteChange = (numeroFactura) => {
  if (!numeroFactura) {
    form.value.fechaEmisionFactura = undefined
    return
  }
  const selected = facturasCompra.value.find(f => f.numeroFactura === numeroFactura)
  const fecha = getFacturaFecha(selected)
  form.value.fechaEmisionFactura = fecha ? dayjs(fecha) : undefined
}

const canSubmit = computed(() => {
  if (!form.value.tipoMovimiento) return false
  if (!form.value.codigoItem) return false
  if (form.value.cantidad === undefined || form.value.cantidad === null) return false
  if (isAjuste.value) {
    if (form.value.cantidad === 0) return false
    if (!String(form.value.observaciones || '').trim()) return false

    const hasSedeDestino = !!form.value.sedeDestinoCodigo
    const hasServicio = !!form.value.codigoServicio
    if (hasSedeDestino === hasServicio) return false
  } else if (form.value.cantidad <= 0) {
    return false
  }

  const required = tipoConfig.value?.requiredFields || []
  for (const field of required) {
    const value = form.value[field]
    if (typeof value === 'string') {
      if (!value.trim()) return false
    } else if (!value) {
      return false
    }
  }

  if (form.value.tipoMovimiento === 'COMPRA') {
    const numero = String(form.value.numeroFactura || '').trim()
    const serie = String(form.value.serieFactura || '').trim()
    const correlativo = String(form.value.correlativoFactura || '').trim()

    const hasExistente = !!numero
    const hasNueva = !!serie && !!correlativo

    if (facturaModo.value === 'existente') return hasExistente && !hasNueva
    if (facturaModo.value === 'nueva') return hasNueva && !hasExistente
    return false
  }

  if (form.value.tipoMovimiento === 'TRANSFERENCIA') {
    return form.value.sedeOrigenCodigo !== form.value.sedeDestinoCodigo
  }

  return true
})

const resetForm = () => {
  form.value = {
    tipoMovimiento: undefined,
    codigoItem: undefined,
    cantidad: undefined,
    sedeOrigenCodigo: undefined,
    sedeDestinoCodigo: undefined,
    codigoServicio: undefined,
    codigoProveedor: undefined,
    numeroFactura: '',
    serieFactura: '',
    correlativoFactura: '',
    fechaEmisionFactura: undefined,
    codigoCuadrilla: undefined,
    observaciones: ''
  }
  facturaModo.value = 'existente'
}

watch(() => props.open, (open) => {
  if (open) {
    resetForm()
    loadItems()
    loadProveedores()
    facturasCompra.value = []
    cuadrillas.value = []
    servicios.value = []
    loadSedes()
  }
})

watch(() => form.value.tipoMovimiento, () => {
  for (const field of OPTIONAL_FIELDS) {
    form.value[field] = ['numeroFactura', 'serieFactura', 'correlativoFactura'].includes(field) ? '' : undefined
  }
  facturaModo.value = 'existente'
})

watch(facturaModo, (modo) => {
  if (modo === 'existente') {
    form.value.serieFactura = ''
    form.value.correlativoFactura = ''
    if (form.value.codigoProveedor) loadFacturasCompra()
  } else if (modo === 'nueva') {
    form.value.numeroFactura = ''
    facturasCompra.value = []
    form.value.fechaEmisionFactura = undefined
  }
})

watch(() => form.value.codigoProveedor, () => {
  form.value.numeroFactura = ''
  form.value.fechaEmisionFactura = undefined
  if (facturaModo.value === 'existente') {
    loadFacturasCompra()
  }
})

watch(() => form.value.sedeDestinoCodigo, (sedeDestinoCodigo) => {
  if (isAjuste.value && sedeDestinoCodigo) {
    form.value.codigoServicio = undefined
  }
})

watch(() => form.value.codigoServicio, (codigoServicio) => {
  if (isAjuste.value && codigoServicio) {
    form.value.sedeDestinoCodigo = undefined
  }
})

const buildPayload = () => {
  const payload = {
    tipoMovimiento: form.value.tipoMovimiento,
    codigoItem: form.value.codigoItem,
    cantidad: form.value.cantidad,
    observaciones: form.value.observaciones || undefined
  }

  const visible = tipoConfig.value?.visibleFields || []
  for (const field of visible) {
    if (form.value.tipoMovimiento === 'COMPRA' && ['numeroFactura', 'serieFactura', 'correlativoFactura'].includes(field)) {
      continue
    }

    const rawValue = form.value[field]
    const value = field === 'fechaEmisionFactura' && rawValue
      ? dayjs(rawValue).format('YYYY-MM-DD')
      : (typeof rawValue === 'string' ? rawValue.trim() : rawValue)

    if (value !== undefined && value !== null && value !== '') {
      payload[field] = value
    }
  }

  if (form.value.tipoMovimiento === 'COMPRA') {
    if (facturaModo.value === 'existente') {
      payload.numeroFactura = String(form.value.numeroFactura || '').trim()
    } else if (facturaModo.value === 'nueva') {
      payload.serieFactura = String(form.value.serieFactura || '').trim()
      payload.correlativoFactura = String(form.value.correlativoFactura || '').trim()
    }
  }

  return payload
}

const submit = async () => {
  if (!canSubmit.value) {
    message.error('Complete los campos obligatorios')
    return
  }

  try {
    await movimientosService.create(buildPayload())
    message.success('Movimiento registrado correctamente')
    emit('success')
    emit('close')
  } catch (err) {
    const responseData = err.response?.data?.content
    const errorMessage = Array.isArray(responseData) ? responseData[0] : responseData
    message.error(errorMessage || 'Error al registrar movimiento')
  }
}
</script>

<template>
  <a-modal title="Registrar Movimiento" :open="open" @cancel="$emit('close')" @ok="submit"
    :ok-button-props="{ disabled: !canSubmit }" destroyOnClose>
    <a-form layout="vertical">
      <a-form-item label="Tipo de Movimiento" required>
        <a-select v-model:value="form.tipoMovimiento" allow-clear>
          <a-select-option v-for="t in tiposPermitidos" :key="t" :value="t">
            {{ t }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-alert v-if="tipoMovimientoInfo" :message="tipoMovimientoInfo.message" :description="tipoMovimientoInfo.description"
        :type="tipoMovimientoInfo.type" show-icon style="margin-bottom: 16px;" />

      <template v-if="compraSections.length">
        <a-collapse :default-active-key="['movimiento', 'factura']" style="margin-bottom: 8px;">
          <a-collapse-panel key="movimiento" :header="compraSections[0].label">
            <a-form-item label="Item" required>
              <a-select v-model:value="form.codigoItem" show-search placeholder="Selecciona item"
                :filter-option="filterSelectOption" :loading="loadingItems" allow-clear
                :dropdown-style="{ maxHeight: '280px', overflow: 'auto' }">
                <a-select-option v-for="item in items" :key="item.codigoItem" :value="item.codigoItem"
                  :label="`${item.codigoItem} - ${item.nombre} (${item.tipo})`">
                  {{ item.codigoItem }} - {{ item.nombre }} ({{ item.tipo }})
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="Cantidad" required>
              <a-input-number v-model:value="form.cantidad" :min="1" style="width: 100%" />
            </a-form-item>

            <a-form-item label="Sede Destino" :required="isRequiredField('sedeDestinoCodigo')">
              <a-select v-model:value="form.sedeDestinoCodigo" allow-clear :loading="loadingSedes">
                <a-select-option v-for="s in sedes" :key="s.codigo" :value="s.codigo">
                  {{ s.codigo }} - {{ s.nombre }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="Observaciones">
              <a-textarea v-model:value="form.observaciones" />
            </a-form-item>
          </a-collapse-panel>

          <a-collapse-panel key="factura" :header="compraSections[1].label">
            <a-form-item label="Modo de factura" required>
              <a-radio-group v-model:value="facturaModo">
                <a-radio value="existente">Factura existente</a-radio>
                <a-radio value="nueva">Factura nueva</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item label="Proveedor" :required="isRequiredField('codigoProveedor')">
              <a-select v-model:value="form.codigoProveedor" show-search placeholder="Buscar proveedor"
                :filter-option="filterSelectOption" :loading="loadingProveedores" allow-clear
                :dropdown-style="{ maxHeight: '280px', overflow: 'auto' }">
                <a-select-option v-for="p in proveedores" :key="p.codigo" :value="p.codigo"
                  :label="`${p.codigo} - ${p.nombre}`">
                  {{ p.codigo }} - {{ p.nombre }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item v-if="facturaModo === 'existente'" label="Numero de Factura" required>
              <a-select v-model:value="form.numeroFactura" show-search allow-clear
                placeholder="Buscar factura existente" :filter-option="filterSelectOption" :loading="loadingFacturasCompra"
                :disabled="!form.codigoProveedor" @change="onFacturaExistenteChange"
                :dropdown-style="{ maxHeight: '280px', overflow: 'auto' }">
                <a-select-option v-for="f in facturasCompra" :key="f.numeroFactura" :value="f.numeroFactura"
                  :label="f.numeroFactura">
                  {{ f.numeroFactura }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-row v-else :gutter="12">
              <a-col :span="12">
                <a-form-item label="Serie de Factura" required>
                  <a-input v-model:value="form.serieFactura" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="Correlativo de Factura" required>
                  <a-input v-model:value="form.correlativoFactura" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="Fecha de Emision de Factura">
              <a-date-picker v-model:value="form.fechaEmisionFactura" style="width: 100%"
                placeholder="Selecciona fecha" :disabled="facturaModo === 'existente'" />
            </a-form-item>
          </a-collapse-panel>
        </a-collapse>
      </template>

      <template v-else>
        <a-form-item label="Item" required>
          <a-select v-model:value="form.codigoItem" show-search placeholder="Selecciona item"
            :filter-option="filterSelectOption" :loading="loadingItems" allow-clear
            :dropdown-style="{ maxHeight: '280px', overflow: 'auto' }">
            <a-select-option v-for="item in items" :key="item.codigoItem" :value="item.codigoItem"
              :label="`${item.codigoItem} - ${item.nombre} (${item.tipo})`">
              {{ item.codigoItem }} - {{ item.nombre }} ({{ item.tipo }})
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Cantidad" required>
          <a-input-number v-model:value="form.cantidad" :min="isAjuste ? undefined : 1" style="width: 100%" />
        </a-form-item>

        <a-form-item v-if="hasField('sedeOrigenCodigo')" label="Sede Origen"
          :required="isRequiredField('sedeOrigenCodigo')">
          <a-select v-model:value="form.sedeOrigenCodigo" allow-clear :loading="loadingSedes">
            <a-select-option v-for="s in sedes" :key="s.codigo" :value="s.codigo">
              {{ s.codigo }} - {{ s.nombre }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="hasField('sedeDestinoCodigo')" label="Sede Destino"
          :required="isRequiredField('sedeDestinoCodigo')">
          <a-select v-model:value="form.sedeDestinoCodigo" allow-clear :loading="loadingSedes">
            <a-select-option v-for="s in sedes" :key="s.codigo" :value="s.codigo">
              {{ s.codigo }} - {{ s.nombre }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="hasField('codigoServicio')" label="Servicio" :required="isRequiredField('codigoServicio')">
          <a-select v-model:value="form.codigoServicio" show-search placeholder="Buscar servicio" :filter-option="false"
            :loading="loadingServicios" @search="buscarServicios" allow-clear>
            <a-select-option v-for="s in servicios" :key="s.codigo" :value="s.codigo">
              {{ s.codigo }} - {{ s.nombre }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="hasField('codigoProveedor')" label="Proveedor" :required="isRequiredField('codigoProveedor')">
          <a-select v-model:value="form.codigoProveedor" show-search placeholder="Buscar proveedor"
            :filter-option="filterSelectOption" :loading="loadingProveedores" allow-clear
            :dropdown-style="{ maxHeight: '280px', overflow: 'auto' }">
            <a-select-option v-for="p in proveedores" :key="p.codigo" :value="p.codigo"
              :label="`${p.codigo} - ${p.nombre}`">
              {{ p.codigo }} - {{ p.nombre }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="hasField('numeroFactura')" label="Numero de Factura"
          :required="isRequiredField('numeroFactura')">
          <a-input v-model:value="form.numeroFactura" />
        </a-form-item>

        <a-form-item v-if="hasField('codigoCuadrilla')" label="Cuadrilla" :required="isRequiredField('codigoCuadrilla')">
          <a-select v-model:value="form.codigoCuadrilla" show-search placeholder="Buscar cuadrilla"
            :filter-option="false" :loading="loadingCuadrillas" @search="buscarCuadrillas"
            @focus="!cuadrillas.length && buscarCuadrillas()" allow-clear>
            <a-select-option v-for="c in cuadrillas" :key="c.codigoCuadrilla" :value="c.codigoCuadrilla">
              {{ c.codigoCuadrilla }} - {{ c.jefeCuadrillaNombresyApellidos || '-' }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Observaciones" :required="isAjuste">
          <a-textarea v-model:value="form.observaciones" />
        </a-form-item>
      </template>
    </a-form>
  </a-modal>
</template>
