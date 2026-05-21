<script setup>
const props = defineProps({
  itemsMasMovidos: {
    type: Array,
    default: () => []
  },
  stockMovido: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

const columnasItemsMasMovidos = [
  { title: 'Codigo', dataIndex: 'codigoItem', width: 110 },
  { title: 'Item', dataIndex: 'nombreItem', ellipsis: true },
  {
    title: 'Movimientos',
    dataIndex: 'cantidadMovimientos',
    width: 130,
    align: 'right'
  }
]

const columnasStockMovido = [
  { title: 'Codigo', dataIndex: 'codigoItem', width: 110 },
  { title: 'Item', dataIndex: 'nombreItem', ellipsis: true },
  {
    title: 'Total movido',
    dataIndex: 'totalMovido',
    width: 130,
    align: 'right'
  }
]
</script>

<template>
  <a-row :gutter="[16, 16]">
    <a-col :xs="24" :lg="12">
      <a-card class="tabla-card" title="Items con mas movimientos">
        <a-table
          :columns="columnasItemsMasMovidos"
          :data-source="props.itemsMasMovidos"
          :loading="loading"
          row-key="codigoItem"
          size="small"
          :pagination="false"
          :scroll="{ x: 520 }"
        />
      </a-card>
    </a-col>

    <a-col :xs="24" :lg="12">
      <a-card class="tabla-card" title="Items con mayor stock movido">
        <a-table
          :columns="columnasStockMovido"
          :data-source="props.stockMovido"
          :loading="loading"
          row-key="codigoItem"
          size="small"
          :pagination="false"
          :scroll="{ x: 520 }"
        />
      </a-card>
    </a-col>
  </a-row>
</template>

<style scoped>
.tabla-card {
  height: 100%;
}
</style>
