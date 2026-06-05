<script setup>
import { ref, watch } from 'vue'
import { getItemImageUrl, itemService } from '@/services/item.service'

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
  stockMinimo: null,
  descripcion: '',
  observaciones: '',
  imagenUrl: null,
  enabled: false
})

const loadItem = async () => {
  if (!props.codigoItem) return
  loading.value = true

  try {
    const { data } = await itemService.get(props.codigoItem)
    const content = data.content

    item.value = {
      codigoItem: content.codigoItem,
      nombre: content.nombre,
      tipo: content.tipo,
      stockMinimo: content.stockMinimo,
      descripcion: content.descripcion || '',
      observaciones: content.observaciones || '',
      imagenUrl: content.imagenUrl || null,
      enabled: content.enabled
    }
  } finally {
    loading.value = false
  }
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
  <a-modal
    :open="open"
    title="Detalle del ítem"
    ok-text="Cerrar"
    :cancelButtonProps="{ style: { display: 'none' } }"
    @ok="handleClose"
    @cancel="handleClose"
  >
    <a-form layout="vertical" :loading="loading">
      <a-form-item label="Imagen">
        <a-image
          v-if="item.imagenUrl"
          :src="getItemImageUrl(item.imagenUrl)"
          :width="180"
          class="item-image"
        />
        <a-empty v-else description="Sin imagen" :image="false" />
      </a-form-item>

      <a-form-item label="Código">
        <a-input :value="item.codigoItem" disabled />
      </a-form-item>

      <a-form-item label="Nombre">
        <a-input :value="item.nombre" disabled />
      </a-form-item>

      <a-form-item label="Tipo">
        <a-input :value="item.tipo" disabled />
      </a-form-item>

      <a-form-item label="Stock mínimo">
        <a-input-number :value="item.stockMinimo" disabled style="width: 100%" />
      </a-form-item>

      <a-form-item label="Descripción">
        <a-textarea :value="item.descripcion" disabled />
      </a-form-item>

      <a-form-item label="Observaciones">
        <a-textarea :value="item.observaciones" disabled />
      </a-form-item>

      <a-form-item label="Activo">
        <a-switch :checked="item.enabled" disabled />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped>
.item-image {
  max-height: 180px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
</style>
