<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { servicioService } from '@/services/servicio.service'

const emit = defineEmits(['search'])

const filters = reactive({
  codigoServicio: undefined,
  nombreItem: '',
  codigoItem: '',
  tipoItem: undefined,
  enabledItem: undefined,
  conStock: undefined
})

const servicios = ref([])
const loadingServicios = ref(false)
const servicioSeleccionado = computed(() => !!filters.codigoServicio)

const loadServicios = async () => {
  loadingServicios.value = true
  try {
    const { data } = await servicioService.search({
      enabled: true,
      page: 0,
      size: 1000,
      sort: 'nombre,asc'
    })
    servicios.value = data.content
  } finally {
    loadingServicios.value = false
  }
}

const filterSelectOption = (input, option) => {
  const value = String(option?.value || '').toLowerCase()
  const label = String(option?.label || '').toLowerCase()
  const search = String(input || '').toLowerCase()
  return value.includes(search) || label.includes(search)
}

const onSearch = () => {
  emit('search', { ...filters })
}

const onReset = () => {
  filters.codigoServicio = undefined
  filters.nombreItem = ''
  filters.codigoItem = ''
  filters.tipoItem = undefined
  filters.enabledItem = undefined
  filters.conStock = undefined
  onSearch()
}

onMounted(loadServicios)
</script>

<template>
  <a-card size="small" style="margin-bottom: 16px">
    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :md="6">
          <a-form-item label="Servicio">
            <a-select
              v-model:value="filters.codigoServicio"
              show-search
              allow-clear
              placeholder="Seleccione servicio"
              :loading="loadingServicios"
              :filter-option="filterSelectOption"
              :dropdown-style="{ maxHeight: '280px', overflow: 'auto' }"
            >
              <a-select-option
                v-for="servicio in servicios"
                :key="servicio.codigo"
                :value="servicio.codigo"
                :label="`${servicio.codigo} - ${servicio.nombre}`"
              >
                {{ servicio.codigo }} - {{ servicio.nombre }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :md="6">
          <a-form-item label="Nombre Item">
            <a-input v-model:value="filters.nombreItem" allow-clear :disabled="!servicioSeleccionado" />
          </a-form-item>
        </a-col>

        <a-col :md="6">
          <a-form-item label="Codigo Item">
            <a-input v-model:value="filters.codigoItem" allow-clear :disabled="!servicioSeleccionado" />
          </a-form-item>
        </a-col>

        <a-col :md="6">
          <a-form-item label="Tipo Item">
            <a-select v-model:value="filters.tipoItem" allow-clear placeholder="Todos" :disabled="!servicioSeleccionado">
              <a-select-option value="MATERIAL">MATERIAL</a-select-option>
              <a-select-option value="HERRAMIENTA">HERRAMIENTA</a-select-option>
              <a-select-option value="EQUIPO">EQUIPO</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :md="6">
          <a-form-item label="Estado Item">
            <a-select v-model:value="filters.enabledItem" allow-clear placeholder="Todos" :disabled="!servicioSeleccionado">
              <a-select-option :value="true">Activo</a-select-option>
              <a-select-option :value="false">Inactivo</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :md="6">
          <a-form-item label="Con stock">
            <a-select v-model:value="filters.conStock" allow-clear placeholder="Todos" :disabled="!servicioSeleccionado">
              <a-select-option :value="true">Si</a-select-option>
              <a-select-option :value="false">No</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :md="8">
          <a-form-item label=" ">
            <a-button type="primary" @click="onSearch" :disabled="!servicioSeleccionado">
              Buscar
            </a-button>
            <a-button style="margin-left: 8px" @click="onReset">
              Limpiar
            </a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-card>
</template>
