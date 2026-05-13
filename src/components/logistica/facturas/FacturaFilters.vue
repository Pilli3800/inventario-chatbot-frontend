<script setup>
import { reactive, ref, onMounted } from 'vue'
import { proveedorService } from '@/services/proveedor.service'

const emit = defineEmits(['search'])

const proveedores = ref([])
const loadingProveedores = ref(false)

const filters = reactive({
  codigoProveedor: undefined,
  numeroFactura: ''
})

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

const filterSelectOption = (input, option) => {
  const value = String(option?.value || '').toLowerCase()
  const label = String(option?.label || '').toLowerCase()
  const search = String(input || '').toLowerCase()
  return value.includes(search) || label.includes(search)
}

const onSearch = () => {
  emit('search', {
    codigoProveedor: filters.codigoProveedor,
    numeroFactura: filters.numeroFactura
  })
}

const onReset = () => {
  filters.codigoProveedor = undefined
  filters.numeroFactura = ''
  onSearch()
}

onMounted(() => {
  loadProveedores()
})
</script>

<template>
  <a-card size="small" style="margin-bottom: 16px">
    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :md="8">
          <a-form-item label="Proveedor">
            <a-select
              v-model:value="filters.codigoProveedor"
              show-search
              allow-clear
              placeholder="Selecciona proveedor"
              :filter-option="filterSelectOption"
              :loading="loadingProveedores"
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
        </a-col>

        <a-col :md="8">
          <a-form-item label="Numero de Factura">
            <a-input
              v-model:value="filters.numeroFactura"
              allow-clear
              placeholder="Numero de factura"
            />
          </a-form-item>
        </a-col>

        <a-col :md="8">
          <a-form-item label=" ">
            <a-button type="primary" @click="onSearch">
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
