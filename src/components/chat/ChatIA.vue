<script setup>
import { ref, nextTick, onMounted, h } from 'vue'
import { message, Modal } from 'ant-design-vue'
import 'animate.css'
import { chatbotService } from '@/services/chatbot.service'
import { marked } from 'marked'
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined
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
const renderer = new marked.Renderer()
renderer.link = ({ href, title, tokens }) => {
  const text = tokens ? renderer.parser.parseInline(tokens) : href
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
}

/* Configuracion */
const COOLDOWN_SECONDS = 3
const INITIAL_MESSAGE = 'Hola \uD83D\uDC4B Soy tu asistente de inventario. \u00BFEn qu\u00E9 puedo ayudarte?'

/* Estado */
const inputKey = ref(0)
const messageId = ref(0)
const createMessage = (role, content) => ({
  id: ++messageId.value,
  role,
  content
})

const messages = ref([
  createMessage('assistant', INITIAL_MESSAGE)
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
const hasSession = ref(!!localStorage.getItem('sessionId'))

const syncSession = () => {
  hasSession.value = !!localStorage.getItem('sessionId')
}

const buildInitialMessages = () => ([
  createMessage('assistant', INITIAL_MESSAGE)
])

const resetMessages = () => {
  messages.value = buildInitialMessages()
}

const loadHistorial = async () => {
  try {
    const response = await chatbotService.getHistorial()

    syncSession()

    if (!response?.data?.content?.messages?.length) return

    messages.value = response.data.content.messages.map(item =>
      createMessage(item.role, item.message)
    )
    welcomeOpen.value = false
    await scrollToBottom()
  } catch (e) {
    console.error('Chat IA historial error:', e)
  }
}

const clearChat = () => {
  Modal.confirm({
    title: '\u00BFLimpiar chat?',
    icon: h(ExclamationCircleOutlined),
    content: 'Se eliminar\u00E1 la sesi\u00F3n actual del chat.',
    okText: 'Limpiar',
    okType: 'danger',
    cancelText: 'Cancelar',
    async onOk() {
      try {
        const response = await chatbotService.deleteSession()

        chatbotService.clearSession()
        syncSession()
        resetMessages()
        welcomeOpen.value = props.showWelcome
        await scrollToBottom()

        message.success(response?.data?.content || 'Sesion eliminada correctamente.')
      } catch (err) {
        message.error(err.response?.data?.content || 'No se pudo limpiar el chat')
      }
    }
  })
}

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
    const content = data?.content

    syncSession()

    thinkingMessage.content = typeof content === 'string'
      ? content
      : (content?.message || 'No se recibi\u00F3 una respuesta del asistente.')
  } catch (e) {
    console.error('Chat IA error:', e)

    thinkingMessage.content =
      '\u274C Ocurri\u00F3 un error al procesar tu mensaje.'
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

onMounted(() => {
  syncSession()
  loadHistorial()
})
</script>

<template>
  <a-card style="height:100%;" :body-style="{
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }">
    <div style="display:flex; justify-content:flex-end; margin-bottom:12px;">
      <a-dropdown trigger="click" placement="bottomRight">
        <a-button type="text">
          <EllipsisOutlined />
        </a-button>

        <template #overlay>
          <a-menu>
            <a-menu-item danger :disabled="!hasSession" @click="clearChat">
              Limpiar chat
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <!-- Mensajes -->
    <div ref="chatContainer" class="chat-container">
      <a-list :data-source="messages" :split="false" :row-key="item => item.id">
        <template #renderItem="{ item }">
          <a-list-item :key="item.id" :style="{
            justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
            '--animate-duration': '0.22s',
            animationTimingFunction: 'ease-out'
          }" :class="[
            item.role === 'user' ? 'is-user' : 'is-bot',
            'chat-message-item',
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

              <a-card size="small" :bordered="false" class="chat-bubble" :style="{
                background: item.role === 'user' ? '#e6f4ff' : '#f6ffed'
              }">
                <div class="chat-markdown" v-html="marked(item.content, { renderer })" />
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
              Escribiendo...
            </a-typography-text>
          </a-space>
        </a-list-item>
      </a-list>
    </div>

    <a-divider style="margin:12px 0" />

    <!-- Input-->
    <div style="display:flex; gap:8px">
      <a-input :key="inputKey" v-model:value="inputMessage" :placeholder="loading
        ? 'El asistente est\u00E1 respondiendo...'
        : (cooldownActive
          ? `Espera ${cooldownSecondsLeft}s para enviar otro mensaje...`
          : 'Ej: dime 5 items activos')" @pressEnter="sendMessage" :disabled="loading || cooldownActive" allow-clear />
      <a-tooltip :title="cooldownActive ? `Espera ${cooldownSecondsLeft}s para volver a enviar` : 'Enviar mensaje'">
        <a-button type="primary" :loading="loading" :disabled="!inputMessage.trim() || cooldownActive"
          @click="sendMessage">
          <SendOutlined />
        </a-button>
      </a-tooltip>
    </div>

    <!-- Modal de Bienvenida -->
    <a-modal v-model:open="welcomeOpen" title="&#128075; Bienvenido al Asistente Inteligente" :footer="null" centered>
      <a-space direction="vertical" size="middle" style="width: 100%">
        <a-alert type="info" show-icon message="&#128269; Buscar items por nombre, código o estado" />
        <a-alert type="info" show-icon message="&#128230; Consultar inventarios disponibles" />
        <a-alert type="info" show-icon message="&#128202; Revisar movimientos recientes" />
        <a-alert type="info" show-icon message="&#10067; Resolver dudas sobre el sistema" />
      </a-space>

      <a-divider />

      <a-button type="primary" block @click="welcomeOpen = false">
        Empezar
      </a-button>
    </a-modal>
  </a-card>
</template>

<style>
.chat-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
}

.chat-message-item {
  width: 100%;
}

.chat-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
}

.chat-row-reverse {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
}

.chat-bubble {
  width: min(100%, 100%);
  max-width: min(100%, 100%);
  min-width: 0;
  overflow: hidden;
}

.chat-markdown,
.chat-markdown * {
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.chat-markdown p,
.chat-markdown ul,
.chat-markdown ol,
.chat-markdown pre,
.chat-markdown code {
  white-space: pre-wrap;
}

.chat-markdown a {
  word-break: break-all;
}

.typing-fade {
  animation-direction: alternate;
}
</style>
