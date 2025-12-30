<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['search'])

const filters = reactive({
  nombre: '',
  codigoItem: '',
  tipo: '',
  enabled: undefined
})

const onSearch = () => {
  emit('search', { ...filters })
}

const onReset = () => {
  Object.keys(filters).forEach(k => filters[k] = undefined)
  onSearch()
}
</script>

<template>
  <a-card size="small" style="margin-bottom: 16px">
    <a-form layout="vertical">
      <a-row :gutter="16">

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="Nombre">
            <a-input v-model:value="filters.nombre" allow-clear />
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="Código">
            <a-input v-model:value="filters.codigoItem" allow-clear />
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="Tipo">
            <a-select v-model:value="filters.tipo" allow-clear placeholder="Todos" style="width: 100%">
              <a-select-option value="MATERIAL">MATERIAL</a-select-option>
              <a-select-option value="HERRAMIENTA">HERRAMIENTA</a-select-option>
              <a-select-option value="EQUIPO">EQUIPO</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="Estado">
            <a-select v-model:value="filters.enabled" allow-clear placeholder="Todos" style="width: 100%">
              <a-select-option value="true">Activo</a-select-option>
              <a-select-option value="false">Inactivo</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
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
