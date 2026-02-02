<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const userName = computed(() => authStore.ident)

const openPasswordModal = () => {
  router.push({ query: { ...route.query, modal: 'password' } })
}
</script>

<template>
  <div style="padding: 24px">
    <h1>Bienvenido, <strong>{{ userName }} 👋</strong></h1>

    <p>Iniciaste sesión correctamente.</p>

    <a-divider />

    <!-- CONFIGURACIÓN -->
    <a-card style="width: 100%; max-width: 520px; border-radius: 10px;">
      <h3 style="margin-bottom: 4px;">Configuración</h3>
      <p style="margin: 0; color: #8c8c8c; font-size: 13px;">
        Seguridad y preferencias de la cuenta
      </p>

      <a-divider style="margin: 12px 0;" />

      <a-button block style="white-space: normal; height: auto;" @click="openPasswordModal">
        🔒 Cambiar mi contraseña
      </a-button>
    </a-card>
  </div>
</template>
