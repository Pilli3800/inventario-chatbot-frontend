<!-- GestionChatIA.vue -->
<script setup>
import ChatIA from '@/components/chat/ChatIA.vue'
</script>

<template>
  <div>
    <h2>Asistente Inteligente</h2>

    <a-card style="max-width: 900px; margin: 0 auto; width: 100%;" :body-style="{ padding: 0 }">
      <div style="height: 70vh;">
        <ChatIA :showWelcome="true" />
      </div>
    </a-card>
  </div>
</template>
