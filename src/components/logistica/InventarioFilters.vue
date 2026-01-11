<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { sedeService } from '@/services/sede.service'

const emit = defineEmits(['search'])

const filters = reactive({
  sedeCodigo: undefined,
  nombreItem: '',
  codigoItem: '',
  tipoItem: '',
  conStock: undefined
})

const sedeSeleccionada = computed(() => !!filters.sedeCodigo)

const sedes = ref([])
const loadingSedes = ref(false)

const loadSedes = async () => {
  loadingSedes.value = true
  const { data } = await sedeService.getActivas()
  sedes.value = data.content
  loadingSedes.value = false
}

const onSearch = () => {
  emit('search', { ...filters })
}

const onReset = () => {
  Object.keys(filters).forEach(k => filters[k] = undefined)
  onSearch()
}

onMounted(loadSedes)
</script>

<template>
  <a-card size="small" style="margin-bottom: 16px">
    <a-form layout="vertical">
      <a-row :gutter="16">

        <!-- SEDE -->
        <a-col :md="6">
          <a-form-item label="Sede">
            <a-select v-model:value="filters.sedeCodigo" placeholder="Seleccione sede" allow-clear
              :loading="loadingSedes">
              <a-select-option v-for="sede in sedes" :key="sede.codigo" :value="sede.codigo">
                {{ sede.codigo }} - {{ sede.nombre }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- Nombre Item -->
        <a-col :md="6">
          <a-form-item label="Nombre Item">
            <a-input v-model:value="filters.nombreItem" allow-clear :disabled="!sedeSeleccionada" />
          </a-form-item>
        </a-col>

        <!-- Código Item -->
        <a-col :md="6">
          <a-form-item label="Código Item">
            <a-input v-model:value="filters.codigoItem" allow-clear :disabled="!sedeSeleccionada" />
          </a-form-item>
        </a-col>

        <!-- Tipo -->
        <a-col :md="6">
          <a-form-item label="Tipo">
            <a-select v-model:value="filters.tipoItem" allow-clear placeholder="Todos" style="width: 100%"
              :dropdownMatchSelectWidth="false" :disabled="!sedeSeleccionada">
              <a-select-option value="MATERIAL">MATERIAL</a-select-option>
              <a-select-option value="HERRAMIENTA">HERRAMIENTA</a-select-option>
              <a-select-option value="EQUIPO">EQUIPO</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- Con stock -->
        <a-col :md="6">
          <a-form-item label="Con stock">
            <a-select v-model:value="filters.conStock" allow-clear :disabled="!sedeSeleccionada">
              <a-select-option :value="true">Sí</a-select-option>
              <a-select-option :value="false">No</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- Botones -->
        <a-col :md="6">
          <a-form-item label=" ">
            <a-button type="primary" @click="onSearch" :disabled="!sedeSeleccionada">
              Buscar
            </a-button>
            <a-button style="margin-left: 8px" @click="onReset" :disabled="!sedeSeleccionada">
              Limpiar
            </a-button>
          </a-form-item>
        </a-col>

      </a-row>
    </a-form>
  </a-card>
</template>
