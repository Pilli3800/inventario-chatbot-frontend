<script setup>
import { ref, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { inventarioServicioService } from '@/services/inventario-servicio.service'
import { servicioService } from '@/services/servicio.service'
import { itemService } from '@/services/item.service'

const props = defineProps({
  open: Boolean
})

const emit = defineEmits(['close', 'success'])

const form = ref({
  codigoItem: undefined,
  servicioCodigo: undefined
})

const servicios = ref([])
const loadingServicios = ref(false)

const items = ref([])
const loadingItems = ref(false)

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

watch(() => props.open, (value) => {
  if (value) {
    form.value = {
      codigoItem: undefined,
      servicioCodigo: undefined
    }
    items.value = []
    loadServicios()
  }
})

const canSubmit = computed(() =>
  !!form.value.codigoItem && !!form.value.servicioCodigo
)

const normalizeError = (err) => {
  const content = err.response?.data?.content
  if (Array.isArray(content)) return content.join(', ')
  return content || err.response?.data?.message || 'Error al crear asignacion'
}

const submit = async () => {
  if (!canSubmit.value) {
    message.error('Complete los campos obligatorios')
    return
  }

  try {
    await inventarioServicioService.asignar(form.value)
    message.success('Asignacion creada correctamente')
    emit('success')
    emit('close')
  } catch (err) {
    message.error(normalizeError(err))
  }
}
</script>

<template>
  <a-modal
    :open="open"
    title="Asignar Item a Servicio"
    ok-text="Guardar"
    cancel-text="Cancelar"
    :ok-button-props="{ disabled: !canSubmit }"
    @ok="submit"
    @cancel="emit('close')"
  >
    <a-form layout="vertical">
      <a-form-item label="Codigo Item" required>
        <a-select
          v-model:value="form.codigoItem"
          show-search
          placeholder="Escriba codigo de item"
          :filter-option="false"
          :loading="loadingItems"
          @search="buscarItems"
          allow-clear
        >
          <a-select-option v-for="item in items" :key="item.codigoItem" :value="item.codigoItem">
            {{ item.codigoItem }} - {{ item.nombre }} ({{ item.tipo }})
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Servicio" required>
        <a-select v-model:value="form.servicioCodigo" placeholder="Seleccione servicio" :loading="loadingServicios" allow-clear>
          <a-select-option v-for="servicio in servicios" :key="servicio.codigo" :value="servicio.codigo">
            {{ servicio.codigo }} - {{ servicio.nombre }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
