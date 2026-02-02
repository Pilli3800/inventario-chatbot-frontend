<!-- MovimientoFilters.vue -->
<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { sedeService } from '@/services/sede.service'
import { userService } from '@/services/user.service'
import { usePermissions } from '@/composables/usePermissions'
import { cuadrillaService } from '@/services/cuadrilla.service'
import { servicioService } from '@/services/servicio.service'
import { itemService } from '@/services/item.service'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth.store'

const emit = defineEmits(['search'])
const { canAudit } = usePermissions()

const authStore = useAuthStore()

const cuadrillas = ref([])
const loadingCuadrillas = ref(false)

const servicios = ref([])
const loadingServicios = ref(false)

/* Filtros */
const filters = reactive({
  tipoMovimiento: undefined,
  codigoItem: undefined,
  sedeOrigen: undefined,
  sedeDestino: undefined,
  usuario: undefined,
  codigoCuadrilla: undefined,    // identUsuario
  codigoServicio: undefined,
  fechaInicio: undefined,
  fechaFin: undefined
})

/* Tipos de movimientos por rol */
const tiposPermitidos = computed(() => {
  if (!authStore.isAuthenticated) return []

  if (
    authStore.hasRole('ROLE_GERENCIA') ||
    authStore.hasRole('ROLE_LOGISTICA') || authStore.hasRole('ROLE_ADMINISTRACION')
  ) {
    return ['ENTRADA', 'SALIDA', 'TRANSFERENCIA', 'DEVOLUCION']
  }

  if (authStore.hasRole('ROLE_JEFE_CUADRILLA')) {
    return ['SALIDA', 'DEVOLUCION']
  }

  return []
})

/* Sedes */
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

/* Usuarios (autocomplete) */
const usuarios = ref([])
const loadingUsuarios = ref(false)

const buscarUsuarios = async (texto) => {
  if (!texto || texto.length < 2) {
    usuarios.value = []
    return
  }

  loadingUsuarios.value = true
  try {
    const { data } = await userService.search({
      identUsuario: texto,
      page: 0,
      size: 5
    })
    usuarios.value = data.content
  } finally {
    loadingUsuarios.value = false
  }
}

const buscarCuadrillas = async (texto) => {
  if (!texto || texto.length < 1) {
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

/* Acciones */
const onSearch = () => {
  emit('search', {
    tipoMovimiento: filters.tipoMovimiento,
    codigoItem: filters.codigoItem,
    sedeOrigen: filters.sedeOrigen,
    sedeDestino: filters.sedeDestino,
    usuario: filters.usuario,
    codigoCuadrilla: filters.codigoCuadrilla,
    codigoServicio: filters.codigoServicio,
    fechaDesde: filters.fechaInicio
      ? dayjs(filters.fechaInicio).format('YYYY-MM-DD')
      : undefined,
    fechaHasta: filters.fechaFin
      ? dayjs(filters.fechaFin).format('YYYY-MM-DD')
      : undefined
  })
}

const onReset = () => {
  filters.tipoMovimiento = undefined
  filters.codigoItem = undefined
  filters.sedeOrigen = undefined
  filters.sedeDestino = undefined
  filters.usuario = undefined
  filters.codigoCuadrilla = undefined
  filters.codigoServicio = undefined
  filters.fechaInicio = undefined
  filters.fechaFin = undefined
  onSearch()
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

const buscarServicios = async (texto) => {
  if (!texto || texto.length < 2) {
    servicios.value = []
    return
  }

  loadingServicios.value = true
  try {
    const params = {
      codigo: texto,
      ...(canAudit ? {} : { enabled: true }),
      page: 0,
      size: 5
    }

    const { data } = await servicioService.search(params)
    servicios.value = data.content
  } finally {
    loadingServicios.value = false
  }
}

onMounted(() => {
  loadSedes()
})
</script>

<template>
  <a-card size="small" style="margin-bottom: 16px">
    <a-form layout="vertical">
      <a-row :gutter="16">

        <!-- TIPO MOVIMIENTO -->
        <a-col :md="6">
          <a-form-item label="Tipo de Movimiento">
            <a-select v-model:value="filters.tipoMovimiento" allow-clear placeholder="Todos">
              <a-select-option v-for="t in tiposPermitidos" :key="t" :value="t">
                {{ t }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- ITEM -->
        <a-col :md="6">
          <a-form-item label="Item">
            <a-select v-model:value="filters.codigoItem" show-search allow-clear placeholder="Buscar código de item"
              :filter-option="false" :loading="loadingItems" @search="buscarItems">
              <a-select-option v-for="item in items" :key="item.codigoItem" :value="item.codigoItem">
                {{ item.codigoItem }} - {{ item.nombre }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- SERVICIO -->
        <a-col :md="6" v-if="canAudit">
          <a-form-item label="Servicio">
            <a-select v-model:value="filters.codigoServicio" show-search allow-clear placeholder="Buscar servicio"
              :filter-option="false" :loading="loadingServicios" @search="buscarServicios">
              <a-select-option v-for="s in servicios" :key="s.codigo" :value="s.codigo">
                {{ s.codigo }} - {{ s.nombre }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- USUARIO (SOLO AUDITORÍA) -->
        <a-col :md="6" v-if="canAudit">
          <a-form-item label="Usuario">
            <a-select v-model:value="filters.usuario" show-search allow-clear placeholder="Buscar usuario"
              :filter-option="false" :loading="loadingUsuarios" @search="buscarUsuarios">
              <a-select-option v-for="u in usuarios" :key="u.identUsuario" :value="u.identUsuario">
                {{ u.identUsuario }} - {{ u.nombres }} {{ u.apellidos }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- CUADRILLA (solo auditoría) -->
        <a-col :md="6" v-if="canAudit">
          <a-form-item label="Cuadrilla">
            <a-select v-model:value="filters.codigoCuadrilla" show-search allow-clear placeholder="Buscar cuadrilla"
              :filter-option="false" :loading="loadingCuadrillas" @search="buscarCuadrillas">
              <a-select-option v-for="c in cuadrillas" :key="c.codigoCuadrilla" :value="c.codigoCuadrilla">
                {{ c.codigoCuadrilla }} — {{ c.jefeCuadrillaUsuario }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- SEDE ORIGEN -->
        <a-col :md="6">
          <a-form-item label="Sede Origen">
            <a-select v-model:value="filters.sedeOrigen" allow-clear placeholder="Seleccione sede origen"
              :loading="loadingSedes">
              <a-select-option v-for="s in sedes" :key="s.codigo" :value="s.codigo">
                {{ s.codigo }} - {{ s.nombre }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- SEDE DESTINO -->
        <a-col :md="6">
          <a-form-item label="Sede Destino">
            <a-select v-model:value="filters.sedeDestino" allow-clear placeholder="Seleccione sede destino"
              :loading="loadingSedes">
              <a-select-option v-for="s in sedes" :key="s.codigo" :value="s.codigo">
                {{ s.codigo }} - {{ s.nombre }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- FECHA DESDE -->
        <a-col :md="3">
          <a-form-item label="Desde">
            <a-date-picker v-model:value="filters.fechaInicio" style="width: 100%" placeholder="Selecciona fecha" />
          </a-form-item>
        </a-col>

        <!-- FECHA HASTA -->
        <a-col :md="3">
          <a-form-item label="Hasta">
            <a-date-picker v-model:value="filters.fechaFin" style="width: 100%" placeholder="Selecciona fecha" />
          </a-form-item>
        </a-col>

        <!-- BOTONES -->
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
