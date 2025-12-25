<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const formState = ref({
  identUsuario: '',
  password: ''
})

const login = async () => {
  loading.value = true
  try {
    await authStore.login(formState.value)
    router.push('/home')
  } catch (err) {
    message.error(err.response?.data?.content || 'Error desconocido')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="max-width: 520px; margin: 40px auto;">
    <a-card title="Login">
      <a-form layout="vertical" :model="formState" @finish="login">
        <a-form-item label="Usuario">
          <a-input v-model:value="formState.identUsuario" placeholder="Usuario" />
        </a-form-item>

        <a-form-item label="Password">
          <a-input-password v-model:value="formState.password" placeholder="Password" />
        </a-form-item>

        <a-button type="primary" html-type="submit" :loading="loading">
          Cargar
        </a-button>
      </a-form>
    </a-card>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
}
</style>
