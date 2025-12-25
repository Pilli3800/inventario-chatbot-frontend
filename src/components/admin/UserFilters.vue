<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['search'])

const filters = reactive({
  nombres: '',
  apellidos: '',
  email: '',
  identUsuario: '',
  dni: '',
  enabled: undefined,
  rol: ''
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
          <a-form-item label="Nombres">
            <a-input v-model:value="filters.nombres" allow-clear />
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="Apellidos">
            <a-input v-model:value="filters.apellidos" allow-clear />
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="Email">
            <a-input v-model:value="filters.email" allow-clear />
          </a-form-item>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="Usuario">
            <a-input v-model:value="filters.identUsuario" allow-clear />
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
            <a-button type="primary" @click="onSearch">Buscar</a-button>
            <a-button style="margin-left: 8px" @click="onReset">Limpiar</a-button>
          </a-form-item>
        </a-col>

      </a-row>
    </a-form>
  </a-card>
</template>
