<script setup>
import { MenuOutlined } from '@ant-design/icons-vue'

defineEmits(['toggle-sidebar', 'logout'])
</script>

<template>
  <div style="display: flex; justify-content: space-between; align-items: center">
    <div style="display: flex; align-items: center; gap: 12px">
      <MenuOutlined style="font-size: 18px; cursor: pointer" @click="$emit('toggle-sidebar')" />
      <strong>Sistema Inventario</strong>
    </div>

    <a-button type="primary" danger @click="$emit('logout')">
      Salir
    </a-button>
  </div>
</template>
