<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue'


const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const formState = ref({
  identUsuario: '',
  password: ''
})

const login = async () => {
  loading.value = true

  const hide = message.loading('Cargando sesión...', 0)

  try {
    await authStore.login(formState.value)

    // Delay para mostrar el mensaje de carga
    setTimeout(() => {
      hide()
      router.push('/home')
    }, 500)

  } catch (err) {
    hide()
    message.error(err.response?.data?.content || 'Error desconocido')
  } finally {
    loading.value = false
  }
}

const canSubmit = computed(() => {
  return (
    formState.value.identUsuario.trim() !== '' &&
    formState.value.password.trim() !== ''
  )
})

</script>

<template>
  <div class="login-wrapper">
    <a-card class="login-card" :bordered="false">
      <!-- Header -->
      <div class="login-header">
        <div class="login-icon">
          <LockOutlined />
        </div>
        <h1>Bienvenido</h1>
        <p>Inicia sesión para acceder al sistema</p>
      </div>

      <!-- Form -->
      <a-form layout="vertical" :model="formState" @finish="login">
        <a-form-item label="Usuario">
          <a-input v-model:value="formState.identUsuario" :maxLength="20" placeholder="USER001" size="large">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="Contraseña">
          <a-input-password v-model:value="formState.password" :maxLength="20" placeholder="••••••••••••"
            size="large" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading" :disabled="!canSubmit">
            Iniciar sesión →
          </a-button>
        </a-form-item>
      </a-form>

      <!-- Footer -->
      <div class="login-footer">
        <span>Acceso exclusivo para usuarios autorizados</span>
      </div>
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

.login-wrapper {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.login-card {
  width: 420px;
  padding: 24px 28px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 14px;
  background: #e6f4ff;
  /* azul claro AntD */
  color: #1677ff;
  /* azul principal */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}


.login-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.login-header p {
  margin-top: 8px;
  color: #8c8c8c;
  font-size: 14px;
}

.login-footer {
  margin-top: 16px;
  text-align: center;
  font-size: 12px;
  color: #999;
}
</style>
