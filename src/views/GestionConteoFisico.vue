<!-- GestionConteoFisico.vue -->
<script setup>
import { computed, h, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { sedeService } from '@/services/sede.service'
import { servicioService } from '@/services/servicio.service'
import { inventarioSedeService } from '@/services/inventario-sede.service'
import { inventarioServicioService } from '@/services/inventario-servicio.service'
import { conteoFisicoService } from '@/services/conteo-fisico.service'

const form = reactive({
  tipoInventario: 'SEDE',
  codigoUbicacion: undefined,
  observaciones: ''
})

const sedes = ref([])
const servicios = ref([])
const inventario = ref([])
const loadingUbicaciones = ref(false)
const loadingInventario = ref(false)
const saving = ref(false)

const columns = [
  { title: 'Codigo Item', dataIndex: 'codigoItem', width: 130 },
  { title: 'Nombre', dataIndex: 'nombreItem', width: 220 },
  { title: 'Tipo', dataIndex: 'tipoItem', width: 120 },
  { title: 'Stock Sistema', dataIndex: 'stockSistema', width: 120, align: 'right' },
  { title: 'Cantidad Fisica', dataIndex: 'cantidadFisica', width: 150 },
  { title: 'Diferencia', dataIndex: 'diferencia', width: 110, align: 'right' },
  { title: 'Observacion', dataIndex: 'observacion', width: 240 }
]

const getErrorMessage = (err, fallback) => {
  const responseData = err?.response?.data?.content ?? err?.response?.data
  if (Array.isArray(responseData)) return responseData[0] || fallback
  if (typeof responseData === 'string') return responseData || fallback
  return fallback
}

const getStock = (record) =>
  Number(record.stockActual ?? record.stock ?? 0)

const getCodigoItem = (record) =>
  record.codigoItem || record.item?.codigoItem

const getNombreItem = (record) =>
  record.nombreItem || record.item?.nombre || '-'

const onlyIntegerKey = (event) => {
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault()
  }
}

const onlyIntegerPaste = (event) => {
  const text = event.clipboardData?.getData('text') || ''
  if (!/^\d+$/.test(text)) {
    event.preventDefault()
  }
}

const mapInventarioRecord = (record) => ({
  id: record.id,
  codigoItem: getCodigoItem(record),
  nombreItem: getNombreItem(record),
  tipoItem: record.tipoItem || record.item?.tipo || '-',
  stockSistema: getStock(record),
  cantidadFisica: undefined,
  observacion: ''
})

const detallesContados = computed(() =>
  inventario.value
    .filter(item => item.cantidadFisica !== undefined && item.cantidadFisica !== null && item.cantidadFisica !== '')
    .map(item => ({
      codigoItem: item.codigoItem,
      stockSistema: item.stockSistema,
      cantidadFisica: Number(item.cantidadFisica),
      observacion: item.observacion || null
    }))
)

const totalConDiscrepancia = computed(() =>
  detallesContados.value.filter(item => item.cantidadFisica - item.stockSistema !== 0).length
)

const canLoadInventario = computed(() =>
  !!form.tipoInventario && !!form.codigoUbicacion
)

const canSubmit = computed(() =>
  detallesContados.value.length > 0 &&
  detallesContados.value.every(item => item.cantidadFisica >= 0)
)

const loadUbicaciones = async () => {
  loadingUbicaciones.value = true
  try {
    const [sedesResponse, serviciosResponse] = await Promise.all([
      sedeService.getActivas(),
      servicioService.search({
        enabled: true,
        page: 0,
        size: 1000,
        sort: 'nombre,asc'
      })
    ])
    sedes.value = sedesResponse.data.content
    servicios.value = serviciosResponse.data.content
  } finally {
    loadingUbicaciones.value = false
  }
}

const onTipoChange = () => {
  form.codigoUbicacion = undefined
  inventario.value = []
}

const cargarInventario = async () => {
  if (!canLoadInventario.value) {
    message.warning('Seleccione tipo de inventario y ubicacion')
    return
  }

  loadingInventario.value = true
  try {
    const params = {
      page: 0,
      size: 1000,
      conStock: undefined
    }

    const { data } = form.tipoInventario === 'SEDE'
      ? await inventarioSedeService.search({
        ...params,
        sedeCodigo: form.codigoUbicacion
      })
      : await inventarioServicioService.search({
        ...params,
        codigoServicio: form.codigoUbicacion
      })

    inventario.value = (data.content || []).map(mapInventarioRecord)
  } finally {
    loadingInventario.value = false
  }
}

const limpiarCantidades = () => {
  inventario.value = inventario.value.map(item => ({
    ...item,
    cantidadFisica: undefined,
    observacion: ''
  }))
}

const buildPayload = () => ({
  tipoInventario: form.tipoInventario,
  codigoUbicacion: form.codigoUbicacion,
  observaciones: form.observaciones || null,
  detalles: detallesContados.value
})

const submit = async () => {
  if (!canSubmit.value) {
    message.error('Ingrese al menos una cantidad fisica valida')
    return
  }

  saving.value = true
  try {
    await conteoFisicoService.create(buildPayload())
    message.success('Reporte de discrepancia generado')
    form.observaciones = ''
    limpiarCantidades()
  } catch (err) {
    message.error(getErrorMessage(err, 'No se pudo generar el reporte'))
  } finally {
    saving.value = false
  }
}

const confirmSubmit = () => {
  if (!canSubmit.value) {
    message.error('Ingrese al menos una cantidad fisica valida')
    return
  }

  Modal.confirm({
    title: 'Generar reporte de discrepancia',
    icon: h(ExclamationCircleOutlined),
    content: 'Se generara un reporte solo con los items que tienen cantidad fisica ingresada. No se actualizara el stock.',
    okText: 'Generar',
    okType: 'primary',
    cancelText: 'Cancelar',
    onOk: submit
  })
}

loadUbicaciones()
</script>

<template>
  <div>
    <h2>Conteo Fisico de Inventario</h2>

    <a-card size="small" style="margin-bottom: 16px">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :md="6">
            <a-form-item label="Tipo Inventario" required>
              <a-select v-model:value="form.tipoInventario" @change="onTipoChange">
                <a-select-option value="SEDE">SEDE</a-select-option>
                <a-select-option value="SERVICIO">SERVICIO</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="8">
            <a-form-item label="Ubicacion" required>
              <a-select v-model:value="form.codigoUbicacion" show-search allow-clear placeholder="Seleccione ubicacion"
                :loading="loadingUbicaciones" :dropdown-style="{ maxHeight: '280px', overflow: 'auto' }">
                <template v-if="form.tipoInventario === 'SEDE'">
                  <a-select-option v-for="sede in sedes" :key="sede.codigo" :value="sede.codigo">
                    {{ sede.codigo }} - {{ sede.nombre }}
                  </a-select-option>
                </template>
                <template v-else>
                  <a-select-option v-for="servicio in servicios" :key="servicio.codigo" :value="servicio.codigo">
                    {{ servicio.codigo }} - {{ servicio.nombre }}
                  </a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="10">
            <a-form-item label="Observaciones">
              <a-input v-model:value="form.observaciones" allow-clear />
            </a-form-item>
          </a-col>

          <a-col :md="24">
            <a-space wrap>
              <a-button type="primary" :disabled="!canLoadInventario" :loading="loadingInventario" @click="cargarInventario">
                Cargar inventario
              </a-button>
              <a-button :disabled="!inventario.length" @click="limpiarCantidades">
                Limpiar cantidades
              </a-button>
              <a-button type="primary" :disabled="!canSubmit" :loading="saving" @click="confirmSubmit">
                Generar reporte
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <a-alert type="info" show-icon
      message="Solo se enviaran los items con cantidad fisica ingresada. El reporte no actualiza stock."
      style="margin-bottom: 16px;" />

    <a-row :gutter="[16, 16]" style="margin-bottom: 16px;">
      <a-col :xs="24" :sm="8">
        <a-card size="small">
          <a-statistic title="Items cargados" :value="inventario.length" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card size="small">
          <a-statistic title="Items contados" :value="detallesContados.length" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card size="small">
          <a-statistic title="Con discrepancia" :value="totalConDiscrepancia" />
        </a-card>
      </a-col>
    </a-row>

    <a-empty v-if="!inventario.length && !loadingInventario" description="Seleccione una ubicacion y cargue inventario"
      style="margin-top: 48px" />

    <a-table
      v-else
      :columns="columns"
      :data-source="inventario"
      :loading="loadingInventario"
      row-key="codigoItem"
      :pagination="{ pageSize: 10, showSizeChanger: true }"
      :scroll="{ x: 1080 }"
      size="small"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'codigoItem'">
          <strong>{{ record.codigoItem }}</strong>
        </template>
        <template v-else-if="column.dataIndex === 'stockSistema'">
          <a-tag color="blue">{{ record.stockSistema }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'cantidadFisica'">
          <a-input-number
            v-model:value="record.cantidadFisica"
            :min="0"
            :precision="0"
            style="width: 100%"
            @keypress="onlyIntegerKey"
            @paste="onlyIntegerPaste"
          />
        </template>
        <template v-else-if="column.dataIndex === 'diferencia'">
          <template v-if="record.cantidadFisica !== undefined && record.cantidadFisica !== null && record.cantidadFisica !== ''">
            <a-tag :color="Number(record.cantidadFisica) - record.stockSistema === 0 ? 'green' : Number(record.cantidadFisica) - record.stockSistema > 0 ? 'blue' : 'red'">
              {{ Number(record.cantidadFisica) - record.stockSistema }}
            </a-tag>
          </template>
          <span v-else>-</span>
        </template>
        <template v-else-if="column.dataIndex === 'observacion'">
          <a-input v-model:value="record.observacion" allow-clear />
        </template>
      </template>
    </a-table>
  </div>
</template>
