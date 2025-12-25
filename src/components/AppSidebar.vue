<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { menuItems } from '@/config/menu.config'

const router = useRouter()
const authStore = useAuthStore()
const emit = defineEmits(['navigate'])


const hasAccess = (item) => {
  if (!item.roles || item.roles.length === 0) {
    return true
  }
  return item.roles.some(role => authStore.roles.includes(role))
}

const filteredMenu = computed(() => {
  return menuItems
    .filter(hasAccess)
    .map(item => {
      if (item.children) {
        const children = item.children.filter(hasAccess)
        return children.length ? { ...item, children } : null
      }
      return item
    })
    .filter(Boolean)
})

const onMenuClick = ({ key }) => {
  const findRoute = (items) => {
    for (const item of items) {
      if (item.key === key && item.route) return item.route
      if (item.children) {
        const route = findRoute(item.children)
        if (route) return route
      }
    }
  }

  const route = findRoute(filteredMenu.value)
  if (route) {
    router.push(route)
    emit('navigate')
  }
}
</script>


<template>
  <a-menu theme="dark" mode="inline" @click="onMenuClick">
    <template v-for="item in filteredMenu" :key="item.key">
      <!-- Submenu -->
      <a-sub-menu v-if="item.children">
        <template #title>{{ item.label }}</template>

        <a-menu-item v-for="child in item.children" :key="child.key">
          {{ child.label }}
        </a-menu-item>
      </a-sub-menu>

      <!-- Item simple -->
      <a-menu-item v-else :key="item.key">
        {{ item.label }}
      </a-menu-item>
    </template>
  </a-menu>
</template>
