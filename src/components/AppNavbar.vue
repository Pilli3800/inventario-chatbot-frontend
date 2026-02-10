<script setup>
import { computed } from 'vue'
import { MenuOutlined, UserOutlined, DownOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth.store'

const emit = defineEmits(['toggle-sidebar', 'logout', 'go-home', 'open-password', 'open-profile'])

const authStore = useAuthStore()
const userName = computed(() => authStore.ident || 'Usuario')

const handleMenuClick = ({ key }) => {
  if (key === 'open-profile') emit('open-profile')
  if (key === 'open-password') emit('open-password')
  if (key === 'logout') emit('logout')
}
</script>

<template>
  <div style="display: flex; justify-content: space-between; align-items: center; user-select: none">
    <div style="display: flex; align-items: center; gap: 12px">
      <MenuOutlined style="font-size: 18px; cursor: pointer" @click="$emit('toggle-sidebar')" />
      <router-link to="/home" style="text-decoration: none; color: inherit" @click="$emit('go-home')">
        <strong style="cursor: pointer">Sistema Inventario</strong>
      </router-link>
    </div>

    <a-dropdown placement="bottomRight" :trigger="['click']" :z-index="1500">
      <a-button type="text" style="padding: 6px 10px; height: auto;">
        <UserOutlined style="color: #1677ff; font-size: 16px;" />
        <span style="margin-left: 8px; color: #1677ff; font-weight: 600;">{{ userName }}</span>
        <DownOutlined style="margin-left: 6px; font-size: 12px; color: #8c8c8c;" />
      </a-button>
      <template #overlay>
        <a-menu @click="handleMenuClick">
          <a-menu-item key="open-profile">👤 Perfil</a-menu-item>
          <a-menu-item key="open-password">🔒 Cambiar contraseña</a-menu-item>
          <a-menu-divider />
          <a-menu-item key="logout" disabled>
            <a-button type="primary" danger block size="small" @click.stop="emit('logout')">Cerrar sesión</a-button>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>
