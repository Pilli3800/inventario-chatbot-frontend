<!-- SolicitudFilters.vue -->
<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import { servicioService } from '@/services/servicio.service'
import { userService } from '@/services/user.service'
import { cuadrillaService } from '@/services/cuadrilla.service'
import { useAuthStore } from '@/stores/auth.store'

const emit = defineEmits(['search'])
const authStore = useAuthStore()
const isJefeCuadrilla = computed(() =>
  authStore.hasRole('ROLE_JEFE_CUADRILLA') || authStore.hasRole('JEFE_CUADRILLA')
)

const filters = reactive({
  estado: undefined,
  servicioOrigenCodigo: undefined,
  codigoCuadrilla: undefined,
  identUsuario: undefined,
  fechaInicio: undefined,
  fechaFin: undefined
})

const servicios = ref([])
const loadingServicios = ref(false)

const buscarServicios = async (texto = '') => {
  loadingServicios.value = true
  try {
    const params = {
      codigo: texto || '',
      enabled: true,
      page: 0,
      size: 1000
    }
    const { data } = await servicioService.search(params)
    servicios.value = data.content
  } finally {
    loadingServicios.value = false
  }
}

const usuarios = ref([])
const loadingUsuarios = ref(false)

const buscarUsuarios = async (texto) => {
  loadingUsuarios.value = true
  try {
    const { data } = await userService.search({
      identUsuario: texto || '',
      page: 0,
      size: 1000,
      sort: 'identUsuario,asc'
    })
    usuarios.value = data.content
  } finally {
    loadingUsuarios.value = false
  }
}

const cuadrillas = ref([])
const loadingCuadrillas = ref(false)

const buscarCuadrillas = async (texto) => {
  loadingCuadrillas.value = true
  try {
    const { data } = await cuadrillaService.search({
      codigoCuadrilla: texto || '',
      ...(isJefeCuadrilla.value && authStore.ident
        ? { identUsuarioJefe: authStore.ident }
        : {}),
      enabled: true,
      page: 0,
      size: 1000
    })
    cuadrillas.value = data.content
  } finally {
    loadingCuadrillas.value = false
  }
}

const loadCuadrillasJefe = async () => {
  if (!isJefeCuadrilla.value || !authStore.ident) return

  loadingCuadrillas.value = true
  try {
    const { data } = await cuadrillaService.search({
      identUsuarioJefe: authStore.ident,
      enabled: true,
      page: 0,
      size: 1000
    })
    cuadrillas.value = data.content
  } finally {
    loadingCuadrillas.value = false
  }
}

const onSearch = () => {
  const identUsuarioParam =
    isJefeCuadrilla.value && authStore.ident
      ? authStore.ident
      : filters.identUsuario

  emit('search', {
    estado: filters.estado,
    servicioOrigenCodigo: filters.servicioOrigenCodigo,
    codigoCuadrilla: filters.codigoCuadrilla,
    identUsuario: identUsuarioParam,
    fechaDesde: filters.fechaInicio
      ? dayjs(filters.fechaInicio).format('YYYY-MM-DD')
      : undefined,
    fechaHasta: filters.fechaFin
      ? dayjs(filters.fechaFin).format('YYYY-MM-DD')
      : undefined
  })
}

const onReset = () => {
  filters.estado = undefined
  filters.servicioOrigenCodigo = undefined
  filters.codigoCuadrilla = undefined
  filters.identUsuario = undefined
  filters.fechaInicio = undefined
  filters.fechaFin = undefined
  onSearch()
}

onMounted(() => buscarServicios(''))
onMounted(loadCuadrillasJefe)
onMounted(() => buscarUsuarios(''))
onMounted(() => buscarCuadrillas(''))
</script>

<template>
  <a-card size="small" style="margin-bottom: 16px">
    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :md="6">
          <a-form-item label="Estado">
            <a-select v-model:value="filters.estado" allow-clear placeholder="Todos">
              <a-select-option value="PENDIENTE">PENDIENTE</a-select-option>
              <a-select-option value="APROBADA">APROBADA</a-select-option>
              <a-select-option value="RECHAZADA">RECHAZADA</a-select-option>
              <a-select-option value="ENTREGADO">ENTREGADO</a-select-option>
              <a-select-option value="DEVUELTA">DEVUELTA</a-select-option>
              <a-select-option value="CERRADA_SIN_DEVOLUCION">CERRADA_SIN_DEVOLUCION</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :md="6">
          <a-form-item label="Servicio Origen">
            <a-select v-model:value="filters.servicioOrigenCodigo" show-search allow-clear placeholder="Buscar servicio"
              :filter-option="false" :loading="loadingServicios" @search="buscarServicios">
              <a-select-option v-for="s in servicios" :key="s.codigo" :value="s.codigo">
                {{ s.codigo }} - {{ s.nombre }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :md="6">
          <a-form-item label="Cuadrilla">
            <a-select v-model:value="filters.codigoCuadrilla" show-search allow-clear placeholder="Buscar cuadrilla"
              :filter-option="false" :loading="loadingCuadrillas" @search="buscarCuadrillas">
              <a-select-option v-for="c in cuadrillas" :key="c.codigoCuadrilla" :value="c.codigoCuadrilla">
                <div style="line-height: 1.2;">
                  <span>{{ c.codigoCuadrilla }}</span>
                  <br />
                  <span style="color: #888; font-size: 12px;">
                    {{ c.jefeCuadrillaNombresyApellidos || '-' }}
                  </span>
                  <br />
                  <span style="color: #888; font-size: 12px;">
                    {{ c.codigoServicio }} - {{ c.nombreServicio || '-' }}
                  </span>
                </div>
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :md="6">
          <a-form-item label="Solicitante">
            <a-select v-model:value="filters.identUsuario" show-search allow-clear placeholder="Buscar solicitante"
              :filter-option="false" :loading="loadingUsuarios" @search="buscarUsuarios" :disabled="isJefeCuadrilla">
              <a-select-option v-for="u in usuarios" :key="u.identUsuario" :value="u.identUsuario">
                {{ u.identUsuario }} - {{ u.nombres }} {{ u.apellidos }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :md="3">
          <a-form-item label="Desde">
            <a-date-picker v-model:value="filters.fechaInicio" style="width: 100%" placeholder="Selecciona fecha" />
          </a-form-item>
        </a-col>

        <a-col :md="3">
          <a-form-item label="Hasta">
            <a-date-picker v-model:value="filters.fechaFin" style="width: 100%" placeholder="Selecciona fecha" />
          </a-form-item>
        </a-col>

        <a-col :md="6">
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
