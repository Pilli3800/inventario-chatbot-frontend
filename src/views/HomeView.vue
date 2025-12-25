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
    <h2 style="margin-bottom: 12px">Configuración</h2>

    <!-- Cambiar contraseña -->
    <a-button type="link" @click="openChangePassword = true">
      Cambiar mi contraseña
    </a-button>
    <!-- Modal -->
    <ChangePasswordModal :open="openChangePassword" @close="openChangePassword = false"
      @success="openChangePassword = false" />
  </div>
</template>
