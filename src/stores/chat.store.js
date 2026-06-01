import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messageId: 0,
    messages: [],
    hasSession: false,
    loading: false,
    typing: false
  }),

  actions: {
    createMessage(role, content) {
      return {
        id: ++this.messageId,
        role,
        content
      }
    },

    ensureInitial(initialMessage) {
      if (!this.messages.length) {
        this.messages = [this.createMessage('assistant', initialMessage)]
      }
    },

    reset(initialMessage) {
      this.messageId = 0
      this.messages = [this.createMessage('assistant', initialMessage)]
    },

    setMessages(items) {
      this.messageId = 0
      this.messages = items.map(item =>
        this.createMessage(item.role, item.message)
      )
    },

    pushMessage(role, content) {
      const message = this.createMessage(role, content)
      this.messages.push(message)
      return message
    },

    syncSession() {
      this.hasSession = !!localStorage.getItem('sessionId')
    },

    setLoading(value) {
      this.loading = value
    },

    setTyping(value) {
      this.typing = value
    }
  }
})
