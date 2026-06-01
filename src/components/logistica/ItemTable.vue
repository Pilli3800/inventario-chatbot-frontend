<script setup>
import { getItemImageUrl } from '@/services/item.service'

defineProps({
  data: Array,
  loading: Boolean,
  pagination: Object
})

const emit = defineEmits(['change'])

const columns = [
  { title: 'Imagen', dataIndex: 'imagenUrl', width: 88 },
  { title: 'Codigo', dataIndex: 'codigoItem', sorter: true },
  { title: 'Nombre', dataIndex: 'nombre', sorter: true },
  { title: 'Tipo', dataIndex: 'tipo' },
  { title: 'Estado', dataIndex: 'enabled' },
  { title: '', dataIndex: 'actions', fixed: 'right', width: 1 }
]

const handleChange = (pagination, filters, sorter) => {
  emit('change', pagination, filters, sorter)
}
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    :scroll="{ x: 'max-content' }"
    row-key="codigoItem"
    :pagination="{
      ...pagination,
      showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} items`,
    }"
    @change="handleChange"
  >
    <template #bodyCell="slotProps">
      <slot name="bodyCell" v-bind="slotProps" />

      <template v-if="slotProps.column.dataIndex === 'enabled'">
        <a-tag :color="slotProps.record.enabled ? 'green' : 'red'">
          {{ slotProps.record.enabled ? 'Activo' : 'Inactivo' }}
        </a-tag>
      </template>

      <template v-else-if="slotProps.column.dataIndex === 'imagenUrl'">
        <a-image
          v-if="slotProps.record.imagenUrl"
          :src="getItemImageUrl(slotProps.record.imagenUrl)"
          :width="48"
          :height="48"
          class="item-thumb"
        />
        <span v-else class="item-thumb-placeholder">Sin imagen</span>
      </template>
    </template>
  </a-table>
</template>

<style scoped>
.item-thumb {
  object-fit: cover;
  border-radius: 6px;
}

.item-thumb-placeholder {
  color: #94a3b8;
  font-size: 12px;
}
</style>
