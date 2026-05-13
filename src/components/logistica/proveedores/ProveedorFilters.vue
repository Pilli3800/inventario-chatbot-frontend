<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['search'])

const filters = reactive({
  codigo: '',
  ruc: '',
  nombre: '',
  email: '',
  enabled: undefined
})

const onSearch = () => {
  emit('search', { ...filters })
}

const onReset = () => {
  filters.codigo = ''
  filters.ruc = ''
  filters.nombre = ''
  filters.email = ''
  filters.enabled = undefined
  onSearch()
}
</script>

<template>
  <a-card size="small" style="margin-bottom: 16px">
    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :md="6">
          <a-form-item label="Código">
            <a-input v-model:value="filters.codigo" allow-clear placeholder="Código de Proveedor" />
          </a-form-item>
        </a-col>

        <a-col :md="6">
          <a-form-item label="RUC">
            <a-input v-model:value="filters.ruc" allow-clear placeholder="RUC de Proveedor" />
          </a-form-item>
        </a-col>

        <a-col :md="6">
          <a-form-item label="Nombre">
            <a-input v-model:value="filters.nombre" allow-clear placeholder="Nombre de Proveedor" />
          </a-form-item>
        </a-col>

        <a-col :md="6">
          <a-form-item label="Email">
            <a-input v-model:value="filters.email" allow-clear placeholder="Email de Proveedor" />
          </a-form-item>
        </a-col>

        <a-col :md="6">
          <a-form-item label="Estado">
            <a-select v-model:value="filters.enabled" allow-clear placeholder="Todos">
              <a-select-option :value="true">Activo</a-select-option>
              <a-select-option :value="false">Inactivo</a-select-option>
            </a-select>
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
