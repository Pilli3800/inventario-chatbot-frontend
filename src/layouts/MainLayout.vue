<!-- MainLayout.vue -->
<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

import AppNavbar from '@/components/AppNavbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'

import ChatIA from '@/components/chat/ChatIA.vue'
import { MessageOutlined } from '@ant-design/icons-vue'

const chatOpen = ref(false)
const collapsed = ref(true)

const authStore = useAuthStore()
const router = useRouter()

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}

// Cierra el sidebar en cada cambio de ruta (incluyendo clic en el logo/header)
watch(
  () => router.currentRoute.value.fullPath,
  () => { collapsed.value = true }
)

// Cierra y navega (si hace falta) al hacer clic en el título/logo del header
const goHome = () => {
  collapsed.value = true
  if (router.currentRoute.value.path !== '/home') {
    router.push('/home')
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <a-layout style="min-height: 100vh" :class="{ 'chat-open': chatOpen, 'sidebar-open': !collapsed }">
    <!-- Header visible -->
    <a-layout-header class="app-header">
      <AppNavbar
        @toggle-sidebar="toggleSidebar"
        @logout="handleLogout"
        @go-home="goHome"
      />
    </a-layout-header>

    <a-layout>
      <!-- Sidebar (debajo del header) -->
      <a-layout-sider class="app-sider" :collapsed="collapsed" :trigger="null" collapsed-width="0" width="260">
        <AppSidebar @navigate="collapsed = true" />
      </a-layout-sider>

      <!-- Content -->
      <a-layout-content class="app-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>

  <div v-if="!collapsed" class="sidebar-mask" @click="collapsed = true"></div>

  <a-button v-if="!chatOpen" type="primary" shape="circle" size="large" class="chat-float-btn" @click="chatOpen = true">
    <MessageOutlined />
  </a-button>

  <a-drawer title="Asistente Inteligente" placement="right" width="420" :open="chatOpen" @close="chatOpen = false"
    :mask="true">
    <div class="chat-drawer-container">
      <ChatIA />
    </div>
  </a-drawer>
</template>

<style scoped>
/* Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1100;
  background: #fff;
  padding: 0 16px;
}

/* Sidebar */
.app-sider {
  position: fixed;
  top: 64px;
  /* altura del header de AntD */
  left: 0;
  height: calc(100vh - 64px);
  z-index: 1000;
}

/* Content */
.app-content {
  margin: 16px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  overflow-x: hidden;
}

.chat-float-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1200;
}

.sidebar-mask {
  position: fixed;
  top: 64px; /* deja libre el header */
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 950;
}

.sidebar-open .app-sider {
  z-index: 1000;
}

.sidebar-open .app-header {
  z-index: 1100;
}

.chat-open .app-header,
.chat-open .app-sider {
  z-index: 900 !important;
  pointer-events: none;
}

.chat-drawer-container {
  height: calc(100vh - 120px);
}
</style>
