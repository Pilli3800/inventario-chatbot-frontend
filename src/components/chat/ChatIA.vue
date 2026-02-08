<script setup>
import { ref, nextTick } from 'vue'
import 'animate.css'
import { chatbotService } from '@/services/chatbot.service'
import { marked } from 'marked'
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import { THINKING_TEXTS } from '@/constants/chat/thinkingTexts'

/* Props */
const props = defineProps({
  showWelcome: {
    type: Boolean,
    default: false
  }
})

/* Configuracion de Markdown(libreria) */
marked.setOptions({ breaks: true })

/* Configuracion */
const COOLDOWN_SECONDS = 3

/* Estado */
const inputKey = ref(0)
const messageId = ref(0)
const createMessage = (role, content) => ({
  id: ++messageId.value,
  role,
  content
})

const messages = ref([
  createMessage('assistant', 'Hola 👋 Soy tu asistente de inventario. ¿En qué puedo ayudarte?')
])

const inputMessage = ref('')
const loading = ref(false)
const typing = ref(false)
const cooldownActive = ref(false)
const cooldownTimer = ref(null)
const cooldownInterval = ref(null)
const cooldownSecondsLeft = ref(0)
const chatContainer = ref(null)
const welcomeOpen = ref(props.showWelcome)

/*  Metodos  */
const startCooldown = () => {
  if (cooldownTimer.value) clearTimeout(cooldownTimer.value)
  if (cooldownInterval.value) clearInterval(cooldownInterval.value)

  cooldownActive.value = true
  cooldownSecondsLeft.value = COOLDOWN_SECONDS

  cooldownInterval.value = setInterval(() => {
    cooldownSecondsLeft.value = Math.max(0, cooldownSecondsLeft.value - 1)
    if (cooldownSecondsLeft.value === 0 && cooldownInterval.value) {
      clearInterval(cooldownInterval.value)
      cooldownInterval.value = null
    }
  }, 1000)

  cooldownTimer.value = setTimeout(() => {
    cooldownActive.value = false
    cooldownTimer.value = null
  }, COOLDOWN_SECONDS * 1000)
}
const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value || cooldownActive.value) return

  welcomeOpen.value = false

  const userMessage = inputMessage.value

  // Mensaje del usuario
  messages.value.push(createMessage('user', userMessage))

  inputMessage.value = ''
  inputMessage.value = ''
  inputKey.value++
  loading.value = true
  typing.value = true

  await scrollToBottom()

  const thinkingMessage = createMessage(
    'assistant',
    THINKING_TEXTS[Math.floor(Math.random() * THINKING_TEXTS.length)]
  )

  messages.value.push(thinkingMessage)
  await scrollToBottom()

  try {
    const { data } = await chatbotService.sendMessage(userMessage)

    thinkingMessage.content = typeof data.content === 'string'
      ? data.content
      : JSON.stringify(data.content, null, 2)

  } catch (e) {
    console.error('Chat IA error:', e)

    thinkingMessage.content =
      '❌ Ocurrió un error al procesar tu mensaje.'
  } finally {
    loading.value = false
    typing.value = false
    await scrollToBottom()

    startCooldown()
  }
}


const scrollToBottom = async () => {
  await nextTick()
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}
</script>

<template>
  <a-card style="height:100%;" :body-style="{
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }">
    <!-- Mensajes -->
    <div ref="chatContainer" style="flex:1; overflow-y:auto; padding-right:8px">
      <a-list :data-source="messages" :split="false" :row-key="item => item.id">
        <template #renderItem="{ item }">
          <a-list-item :key="item.id" :style="{
            justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
            '--animate-duration': '0.22s',
            animationTimingFunction: 'ease-out'
          }" :class="[
            item.role === 'user' ? 'is-user' : 'is-bot',
            'animate__animated',
            'animate__fadeInUp'
          ]">
            <a-space direction="horizontal" :class="item.role === 'user' ? 'chat-row-reverse' : 'chat-row'">
              <a-avatar :style="{
                backgroundColor: item.role === 'user' ? '#1677ff' : '#52c41a'
              }">
                <template #icon>
                  <component :is="item.role === 'user' ? UserOutlined : RobotOutlined" />
                </template>
              </a-avatar>

              <a-card size="small" :bordered="false" :style="{
                maxWidth: '600px',
                background: item.role === 'user' ? '#e6f4ff' : '#f6ffed'
              }">
                <div v-html="marked(item.content)" />
              </a-card>
            </a-space>
          </a-list-item>
        </template>

        <a-list-item v-if="typing" class="animate__animated animate__fadeIn animate__infinite typing-fade"
          :style="{ '--animate-duration': '0.6s' }"><a-space>
            <a-avatar style="background-color:#52c41a">
              <RobotOutlined />
            </a-avatar>
            <a-typography-text type="secondary">
              Escribiendo…
            </a-typography-text>
          </a-space>
        </a-list-item>
      </a-list>
    </div>

    <a-divider style="margin:12px 0" />

    <!-- Input-->
    <div style="display:flex; gap:8px">
      <a-input :key="inputKey" v-model:value="inputMessage" :placeholder="loading
        ? 'El asistente está respondiendo…'
        : (cooldownActive
          ? `Espera ${cooldownSecondsLeft}s para enviar otro mensaje…`
          : 'Ej: dime 5 items activos')" @pressEnter="sendMessage" :disabled="loading || cooldownActive" allow-clear />
      <a-tooltip :title="cooldownActive ? `Espera ${cooldownSecondsLeft}s para volver a enviar` : 'Enviar mensaje'">
        <a-button type="primary" :loading="loading" :disabled="!inputMessage.trim() || cooldownActive"
          @click="sendMessage">
          <SendOutlined />
        </a-button>
      </a-tooltip>
    </div>

    <!-- Modal de Bienvenida -->
    <a-modal v-model:open="welcomeOpen" title="👋 Bienvenido al Asistente Inteligente" :footer="null" centered>
      <a-space direction="vertical" size="middle" style="width: 100%">
        <a-alert type="info" show-icon message="🔍 Buscar items por nombre, código o estado" />
        <a-alert type="info" show-icon message="📦 Consultar inventarios disponibles" />
        <a-alert type="info" show-icon message="📊 Revisar movimientos recientes" />
        <a-alert type="info" show-icon message="❓ Resolver dudas sobre el sistema" />
      </a-space>

      <a-divider />

      <a-button type="primary" block @click="welcomeOpen = false">
        Empezar
      </a-button>
    </a-modal>
  </a-card>
</template>

<style>
.chat-row {
  display: flex;
  flex-direction: row;
}

.chat-row-reverse {
  display: flex;
  flex-direction: row-reverse;
}

.typing-fade {
  animation-direction: alternate;
}
</style>





