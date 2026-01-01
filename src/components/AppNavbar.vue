<script setup>
import { MenuOutlined } from '@ant-design/icons-vue'

defineEmits(['toggle-sidebar', 'logout'])
</script>

<template>
  <div style="display: flex; justify-content: space-between; align-items: center;  user-select: none">
    <div style="display: flex; align-items: center; gap: 12px">
      <MenuOutlined style="font-size: 18px; cursor: pointer" @click="$emit('toggle-sidebar')" />
      <router-link to="/home" style="text-decoration: none; color: inherit">
        <strong style="cursor: pointer">Sistema Inventario</strong>
      </router-link>
    </div>

    <a-button type="primary" danger @click="$emit('logout')">
      Salir
    </a-button>
  </div>
</template>
