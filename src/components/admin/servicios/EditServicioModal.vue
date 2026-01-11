<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { servicioService } from '@/services/servicio.service'

const props = defineProps({
  open: Boolean,
  codigoServicio: String
})

const emit = defineEmits(['close', 'success'])

const form = ref({
  nombreServicio: '',
  descripcionServicio: '',
  enabled: true
})

const load = async () => {
  if (!props.codigoServicio) return

  const { data } = await servicioService.get(props.codigoServicio)

  form.value = {
    nombreServicio: data.content.nombre,
    descripcionServicio: data.content.descripcion,
    enabled: data.content.enabled
  }
}

watch(
  () => [props.open, props.codigoServicio],
  ([open, codigo]) => {
    if (open && codigo) {
      load()
    }
  },
  { immediate: true }
)

const submit = async () => {
  await servicioService.update(props.codigoServicio, form.value)
  message.success('Servicio actualizado')
  emit('success')
  emit('close')
}
</script>

<template>
  <a-modal title="Editar Servicio" :open="open" @ok="submit" @cancel="$emit('close')">
    <a-form layout="vertical">
      <a-form-item label="Nombre">
        <a-input v-model:value="form.nombreServicio" />
      </a-form-item>

      <a-form-item label="Descripción">
        <a-textarea v-model:value="form.descripcionServicio" />
      </a-form-item>

      <a-form-item label="Activo">
        <a-switch v-model:checked="form.enabled" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
