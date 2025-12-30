<script setup>
import { ref, watch } from 'vue'
import { itemService } from '@/services/item.service'

const props = defineProps({
  open: Boolean,
  codigoItem: String
})

const emit = defineEmits(['close'])

const loading = ref(false)

const item = ref({
  codigoItem: '',
  nombre: '',
  tipo: '',
  descripcion: '',
  observaciones: '',
  stockTotal: 0,
  stockDisponible: 0,
  enabled: false
})

const loadItem = async () => {
  if (!props.codigoItem) return
  loading.value = true

  const { data } = await itemService.get(props.codigoItem)
  const content = data.content

  item.value = {
    codigoItem: content.codigoItem,
    nombre: content.nombre,
    tipo: content.tipo,
    descripcion: content.descripcion || '',
    observaciones: content.observaciones || '',
    stockTotal: content.stockTotal,
    stockDisponible: content.stockDisponible,
    enabled: content.enabled
  }

  loading.value = false
}

watch(
  () => [props.open, props.codigoItem],
  ([open, codigoItem]) => {
    if (open && codigoItem) {
      loadItem()
    }
  },
  { immediate: true }
)

const handleClose = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Detalle del Item" ok-text="Cerrar" :cancelButtonProps="{ style: { display: 'none' } }"
    @ok="handleClose" @cancel="handleClose">
    <a-form layout="vertical" :loading="loading">
      <a-form-item label="Código">
        <a-input :value="item.codigoItem" disabled />
      </a-form-item>

      <a-form-item label="Nombre">
        <a-input :value="item.nombre" disabled />
      </a-form-item>

      <a-form-item label="Tipo">
        <a-input :value="item.tipo" disabled />
      </a-form-item>

      <a-form-item label="Descripción">
        <a-textarea :value="item.descripcion" disabled />
      </a-form-item>

      <a-form-item label="Observaciones">
        <a-textarea :value="item.observaciones" disabled />
      </a-form-item>

      <a-form-item label="Stock Total">
        <a-input :value="item.stockTotal" disabled />
      </a-form-item>

      <a-form-item label="Stock Disponible">
        <a-input :value="item.stockDisponible" disabled />
      </a-form-item>

      <a-form-item label="Activo">
        <a-switch :checked="item.enabled" disabled />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
