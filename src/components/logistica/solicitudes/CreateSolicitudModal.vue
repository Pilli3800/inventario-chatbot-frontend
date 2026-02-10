<!-- CreateSolicitudModal.vue -->
<script setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'

import { solicitudItemsService } from '@/services/solicitud-items.service'
import { sedeService } from '@/services/sede.service'
import { cuadrillaService } from '@/services/cuadrilla.service'
import { itemService } from '@/services/item.service'
import { useAuthStore } from '@/stores/auth.store'

const props = defineProps({
  open: { type: Boolean, required: true }
})

const emit = defineEmits(['close', 'success'])
const authStore = useAuthStore()
const isJefeCuadrilla = computed(() =>
  authStore.hasRole('ROLE_JEFE_CUADRILLA') || authStore.hasRole('JEFE_CUADRILLA')
)

const form = ref({
  codigoCuadrilla: undefined,
  sedeOrigenCodigo: undefined,
  observaciones: '',
  detalles: []
})

const resetForm = () => {
  form.value = {
    codigoCuadrilla: undefined,
    sedeOrigenCodigo: undefined,
    observaciones: '',
    detalles: [{ codigoItem: undefined, cantidad: 1 }]
  }
}

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

const cuadrillas = ref([])
const loadingCuadrillas = ref(false)

const buscarCuadrillas = async (texto) => {
  if (!texto || texto.length < 1) {
    cuadrillas.value = []
    return
  }

  loadingCuadrillas.value = true
  try {
    const { data } = await cuadrillaService.search({
      codigoCuadrilla: texto,
      ...(isJefeCuadrilla.value && authStore.ident
        ? { identUsuarioJefe: authStore.ident }
        : {}),
      enabled: true,
      page: 0,
      size: 5
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
      size: 5
    })
    cuadrillas.value = data.content
  } finally {
    loadingCuadrillas.value = false
  }
}

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

const addDetalle = () => {
  form.value.detalles.push({ codigoItem: undefined, cantidad: 1 })
}

const removeDetalle = (index) => {
  form.value.detalles.splice(index, 1)
}

const hasDuplicateItems = computed(() => {
  const codes = form.value.detalles
    .map(d => d.codigoItem)
    .filter(Boolean)
  return new Set(codes).size !== codes.length
})

const canSubmit = computed(() => {
  if (!form.value.codigoCuadrilla) return false
  if (!form.value.sedeOrigenCodigo) return false
  if (!form.value.detalles.length) return false
  if (hasDuplicateItems.value) return false

  return form.value.detalles.every(
    d => d.codigoItem && d.cantidad && d.cantidad > 0
  )
})

watch(() => props.open, (open) => {
  if (open) {
    resetForm()
    items.value = []
    cuadrillas.value = []
    loadSedes()
    loadCuadrillasJefe()
  }
})

const submit = async () => {
  if (!canSubmit.value) {
    message.error('Complete los campos obligatorios')
    return
  }

  try {
    await solicitudItemsService.create(form.value)
    message.success('Solicitud creada correctamente')
    emit('success')
    emit('close')
  } catch (err) {
    const responseData = err.response?.data?.content

    const errorMessage = Array.isArray(responseData)
      ? responseData[0]
      : responseData

    message.error(errorMessage || 'Error al crear la solicitud')
  }
}
</script>

<template>
  <a-modal title="Nueva Solicitud de Items" :open="open" @cancel="$emit('close')" @ok="submit"
    :ok-button-props="{ disabled: !canSubmit }" destroyOnClose>
    <a-form layout="vertical">
      <a-form-item label="Cuadrilla" required>
        <a-select v-model:value="form.codigoCuadrilla" show-search allow-clear placeholder="Buscar cuadrilla"
          :filter-option="false" :loading="loadingCuadrillas" @search="buscarCuadrillas">
          <a-select-option v-for="c in cuadrillas" :key="c.codigoCuadrilla" :value="c.codigoCuadrilla">
            <div style="line-height: 1.2;">
              <span>{{ c.codigoCuadrilla }}</span>
              <br />
              <span style="color: #888; font-size: 12px;">
                {{ c.jefeCuadrillaNombresyApellidos || '—' }}
              </span>
            </div>
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Sede Origen" required>
        <a-select v-model:value="form.sedeOrigenCodigo" allow-clear :loading="loadingSedes">
          <a-select-option v-for="s in sedes" :key="s.codigo" :value="s.codigo">
            {{ s.codigo }} - {{ s.nombre }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Observaciones">
        <a-textarea v-model:value="form.observaciones" />
      </a-form-item>

      <a-divider style="margin: 12px 0;">Detalles</a-divider>

      <div v-for="(detalle, index) in form.detalles" :key="index" class="detalle-row">
        <a-row :gutter="12">
          <a-col :span="14">
            <a-form-item :label="`Item #${index + 1}`" required>
              <a-select v-model:value="detalle.codigoItem" show-search allow-clear placeholder="Buscar item"
                :filter-option="false" :loading="loadingItems" @search="buscarItems">
                <a-select-option v-for="item in items" :key="item.codigoItem" :value="item.codigoItem">
                  {{ item.codigoItem }} - {{ item.nombre }} ({{ item.tipo }})
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="6">
            <a-form-item label="Cantidad" required>
              <a-input-number v-model:value="detalle.cantidad" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :span="4" class="delete-col">
            <a-button type="text" danger @click="removeDetalle(index)" :disabled="form.detalles.length === 1">
              Eliminar
            </a-button>
          </a-col>
        </a-row>
      </div>

      <a-button type="dashed" block @click="addDetalle">
        + Agregar item
      </a-button>

      <a-alert v-if="hasDuplicateItems" type="warning" show-icon
        message="No puedes repetir el mismo item en el detalle." style="margin-top: 12px;" />
    </a-form>
  </a-modal>
</template>

<style scoped>
.detalle-row {
  padding: 8px 0;
}

.delete-col {
  display: flex;
  align-items: center;
  padding-top: 22px;
}
</style>
