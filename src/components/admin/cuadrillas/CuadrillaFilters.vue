<script setup>
import { reactive, ref } from 'vue'
import { userService } from '@/services/user.service'

const emit = defineEmits(['search'])

/* === FILTROS === */
const filters = reactive({
  codigoCuadrilla: '',
  identUsuarioJefe: undefined,
  enabled: undefined
})

/* === JEFES (AUTOCOMPLETE REMOTO) === */
const jefesCuadrilla = ref([])
const loadingJefes = ref(false)

const buscarJefes = async (texto) => {
  if (!texto || texto.length < 2) {
    jefesCuadrilla.value = []
    return
  }

  loadingJefes.value = true

  try {
    const { data } = await userService.search({
      rol: 'JEFE_CUADRILLA',
      identUsuario: texto,
      enabled: true,
      page: 0,
      size: 5
    })

    jefesCuadrilla.value = data.content
  } finally {
    loadingJefes.value = false
  }
}

/* === ACCIONES === */
const onSearch = () => {
  emit('search', { ...filters })
}

const onReset = () => {
  filters.codigoCuadrilla = ''
  filters.identUsuarioJefe = undefined
  filters.enabled = undefined
  jefesCuadrilla.value = []
  onSearch()
}
</script>

<template>
  <a-card size="small" style="margin-bottom: 16px">
    <a-form layout="vertical">
      <a-row :gutter="16">

        <!-- CÓDIGO -->
        <a-col :md="8">
          <a-form-item label="Código">
            <a-input v-model:value="filters.codigoCuadrilla" allow-clear placeholder="Código de Cuadrilla" />
          </a-form-item>
        </a-col>

        <!-- JEFE (AUTOCOMPLETE REMOTO) -->
        <a-col :md="8">
          <a-form-item label="Jefe de Cuadrilla">
            <a-select v-model:value="filters.identUsuarioJefe" show-search placeholder="Código de Usuario"
              :filter-option="false" :loading="loadingJefes" @search="buscarJefes" allow-clear>

              <a-select-option v-for="u in jefesCuadrilla" :key="u.identUsuario" :value="u.identUsuario">

                {{ u.identUsuario }} - {{ u.nombres }} {{ u.apellidos }}

              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- ESTADO -->
        <a-col :md="8">
          <a-form-item label="Estado">
            <a-select v-model:value="filters.enabled" allow-clear placeholder="Todos">

              <a-select-option value="true">Activo</a-select-option>
              <a-select-option value="false">Inactivo</a-select-option>

            </a-select>
          </a-form-item>
        </a-col>

        <!-- BOTONES -->
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
