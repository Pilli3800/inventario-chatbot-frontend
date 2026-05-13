<script setup>
import { computed } from 'vue'
import { ExportOutlined, MailOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  data: Array,
  loading: Boolean,
  pagination: Object,
  sorter: Object
})

const emit = defineEmits(['change'])

const columns = computed(() => [
  {
    title: 'Código',
    dataIndex: 'codigo',
    sorter: true,
    width: 110,
    sortOrder:
      props.sorter?.field === 'codigo'
        ? props.sorter.order
        : null
  },
  { title: 'RUC', dataIndex: 'ruc', width: 130 },
  { title: 'Nombre', dataIndex: 'nombre', width: 180 },
  { title: 'Telefono', dataIndex: 'telefono', width: 170 },
  { title: 'Email', dataIndex: 'email', width: 280 },
  { title: 'Observaciones', dataIndex: 'observaciones', width: 220 },
  { title: 'Estado', dataIndex: 'enabled', width: 100 },
  {
    title: '',
    dataIndex: 'actions',
    fixed: 'right',
    width: 60
  }
])

const handleChange = (pagination, filters, sorter) => {
  emit('change', pagination, filters, sorter)
}

const whatsappLink = (telefono) => {
  const rawPhone = String(telefono ?? '').replace(/\D/g, '')
  const phone = rawPhone.startsWith('51') ? rawPhone : `51${rawPhone}`
  return `https://api.whatsapp.com/send?phone=${phone}`
}

const mailtoLink = (email) => `mailto:${email}`
</script>

<template>
  <a-table :columns="columns" :data-source="data" :loading="loading" row-key="codigo" :scroll="{ x: 1120 }"
    :pagination="pagination" @change="handleChange">
    <template #bodyCell="slotProps">
      <slot name="bodyCell" v-bind="slotProps" />

      <template v-if="slotProps.column.dataIndex === 'enabled'">
        <a-tag :color="slotProps.record.enabled ? 'green' : 'red'">
          {{ slotProps.record.enabled ? 'Activo' : 'Inactivo' }}
        </a-tag>
      </template>

      <template v-else-if="slotProps.column.dataIndex === 'codigo'">
        <strong>{{ slotProps.record.codigo }}</strong>
      </template>

      <template v-else-if="slotProps.column.dataIndex === 'telefono'">
        <span v-if="slotProps.record.telefono" class="inline-action-cell">
          <span>{{ slotProps.record.telefono }}</span>
          <a-tooltip title="Abrir WhatsApp">
            <a :href="whatsappLink(slotProps.record.telefono)" target="_blank" rel="noopener noreferrer"
              class="icon-link">
              <ExportOutlined />
            </a>
          </a-tooltip>
        </span>
        <span v-else>-</span>
      </template>

      <template v-else-if="slotProps.column.dataIndex === 'email'">
        <span v-if="slotProps.record.email" class="inline-action-cell">
          <a-tooltip :title="slotProps.record.email">
            <span class="truncate-email">{{ slotProps.record.email }}</span>
          </a-tooltip>
          <a-tooltip title="Enviar correo">
            <a :href="mailtoLink(slotProps.record.email)" class="icon-link">
              <MailOutlined />
            </a>
          </a-tooltip>
        </span>
        <span v-else>-</span>
      </template>

      <template v-else-if="slotProps.column.dataIndex === 'observaciones'">
        <a-tooltip v-if="slotProps.record.observaciones" :title="slotProps.record.observaciones">
          <span class="truncate-observaciones">{{ slotProps.record.observaciones }}</span>
        </a-tooltip>
        <span v-else>-</span>
      </template>
    </template>
  </a-table>
</template>

<style scoped>
.truncate-email {
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.truncate-observaciones {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.inline-action-cell {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.icon-link {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}
</style>
