<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import ChangePasswordModal from '@/components/user/ChangePasswordModal.vue'

const authStore = useAuthStore()

const userName = computed(() => authStore.ident)
const roles = computed(() => authStore.roles || [])

//Modal de cambio de contraseña
const openChangePassword = ref(false)
</script>

<template>
  <div style="padding: 24px">
    <h1>Bienvenido, <strong>{{ userName }} 👋</strong></h1>

    <p>Iniciaste sesión correctamente.</p>

    <div v-if="roles.length">
      <p><strong>Roles:</strong></p>
      <ul>
        <li v-for="r in roles" :key="r">{{ r }}</li>
      </ul>
    </div>

    <a-divider />

    <!-- CONFIGURACIÓN -->
    <a-card style="width: 100%; max-width: 520px; border-radius: 10px;">
      <h3 style="margin-bottom: 4px;">Configuración</h3>
      <p style="margin: 0; color: #8c8c8c; font-size: 13px;">
        Seguridad y preferencias de la cuenta
      </p>

      <a-divider style="margin: 12px 0;" />

      <a-button block style="white-space: normal; height: auto;" @click="openChangePassword = true">
        🔒 Cambiar mi contraseña
      </a-button>
    </a-card>

    <!-- Modal -->
    <ChangePasswordModal :open="openChangePassword" @close="openChangePassword = false"
      @success="openChangePassword = false" />
  </div>
</template>
