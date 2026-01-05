<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { inventarioSedeService } from '@/services/inventario-sede.service'
import { sedeService } from '@/services/sede.service'
import { itemService } from '@/services/item.service'

const props = defineProps({
  open: Boolean
})

const emit = defineEmits(['close', 'success'])

const form = ref({
  codigoItem: undefined,
  sedeCodigo: undefined
})

/* === SEDES === */
const sedes = ref([])
const loadingSedes = ref(false)

const loadSedes = async () => {
  loadingSedes.value = true
  const { data } = await sedeService.getActivas()
  sedes.value = data.content
  loadingSedes.value = false
}

/* === ITEMS (AUTOCOMPLETE) === */
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

/* Reset al abrir */
watch(() => props.open, (value) => {
  if (value) {
    form.value = {
      codigoItem: undefined,
      sedeCodigo: undefined
    }
    items.value = []
    loadSedes()
  }
})

/* Guardar */
const submit = async () => {
  try {
    await inventarioSedeService.asignar(form.value)
    message.success('Asignación creada correctamente')
    emit('success')
    emit('close')
  } catch (err) {
    message.error(err.response?.data?.content?.[0] || 'Error')
  }
}
</script>

<template>
  <a-modal :open="open" title="Asignar Item a Sede" ok-text="Guardar" cancel-text="Cancelar" @ok="submit"
    @cancel="emit('close')">
    <a-form layout="vertical">

      <!-- ITEM (AUTOCOMPLETE) -->
      <a-form-item label="Código Item" required>
        <a-select v-model:value="form.codigoItem" show-search placeholder="Escriba código de item"
          :filter-option="false" :loading="loadingItems" @search="buscarItems" allow-clear>
          <a-select-option v-for="item in items" :key="item.codigoItem" :value="item.codigoItem">
            {{ item.codigoItem }} - {{ item.nombre }} ({{ item.tipo }})
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- SEDE -->
      <a-form-item label="Sede" required>
        <a-select v-model:value="form.sedeCodigo" placeholder="Seleccione sede" :loading="loadingSedes" allow-clear>
          <a-select-option v-for="sede in sedes" :key="sede.codigo" :value="sede.codigo">
            {{ sede.codigo }} - {{ sede.nombre }}
          </a-select-option>
        </a-select>
      </a-form-item>

    </a-form>
  </a-modal>
</template>
