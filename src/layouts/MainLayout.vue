<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

import AppNavbar from '@/components/AppNavbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'

const collapsed = ref(true)

const authStore = useAuthStore()
const router = useRouter()

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <a-layout style="min-height: 100vh">
    <!-- Header SIEMPRE visible -->
    <a-layout-header class="app-header">
      <AppNavbar
        @toggle-sidebar="toggleSidebar"
        @logout="handleLogout"
      />
    </a-layout-header>

    <a-layout>
      <!-- Sidebar overlay (debajo del header) -->
      <a-layout-sider
        class="app-sider"
        :collapsed="collapsed"
        :trigger="null"
        collapsed-width="0"
        width="260"
      >
        <AppSidebar @navigate="collapsed = true" />
      </a-layout-sider>

      <!-- Content -->
      <a-layout-content class="app-content"
      style="overflow: auto; height: calc(100vh - 64px)">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
/* HEADER siempre arriba */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1100;
  background: #fff;
  padding: 0 16px;
}

/* SIDEBAR overlay pero debajo del header */
.app-sider {
  position: fixed;
  top: 64px; /* altura del header de AntD */
  left: 0;
  height: calc(100vh - 64px);
  z-index: 1000;
}

/* CONTENIDO */
.app-content {
  margin: 16px;
}
</style>

