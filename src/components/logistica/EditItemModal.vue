<script setup>
import { ref, watch, computed, createVNode } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { DeleteOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { getItemImageUrl, itemService } from '@/services/item.service'

const props = defineProps({
  open: Boolean,
  codigoItem: String
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const imageLoading = ref(false)
const errorMsg = ref(null)

const form = ref({
  codigoItem: '',
  nombre: '',
  tipo: '',
  descripcion: '',
  observaciones: '',
  imagenUrl: null,
  enabled: false
})

const getItemContent = (data) => data?.data ?? data?.content ?? data

const loadItem = async () => {
  if (!props.codigoItem) return
  loading.value = true

  try {
    const { data } = await itemService.get(props.codigoItem)
    const item = getItemContent(data)

    form.value = {
      codigoItem: item.codigoItem,
      nombre: item.nombre,
      tipo: item.tipo,
      descripcion: item.descripcion || '',
      observaciones: item.observaciones || '',
      imagenUrl: item.imagenUrl || null,
      enabled: item.enabled
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.open, props.codigoItem],
  ([open, codigoItem]) => {
    if (open && codigoItem) {
      loadItem()
      errorMsg.value = null
    }
  },
  { immediate: true }
)

const isDisabled = computed(() => {
  return !form.value.nombre.trim() || !form.value.tipo
})

const validateImage = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    message.error('Solo se permiten imagenes JPG, PNG o WEBP')
    return false
  }

  if (file.size > 2 * 1024 * 1024) {
    message.error('La imagen no debe superar 2 MB')
    return false
  }

  return true
}

const uploadImage = async (file) => {
  if (!validateImage(file)) return false
  imageLoading.value = true

  try {
    const { data } = await itemService.uploadImage(props.codigoItem, file)
    const item = getItemContent(data)
    form.value.imagenUrl = item.imagenUrl || null
    message.success('Imagen actualizada correctamente')
    emit('success')
  } catch (err) {
    message.error(err.response?.data?.content || 'No se pudo subir la imagen')
  } finally {
    imageLoading.value = false
  }

  return false
}

const deleteImage = async () => {
  imageLoading.value = true

  try {
    const { data } = await itemService.deleteImage(props.codigoItem)
    const item = getItemContent(data)
    form.value.imagenUrl = item.imagenUrl || null
    message.success('Imagen eliminada correctamente')
    emit('success')
  } catch (err) {
    message.error(err.response?.data?.content || 'No se pudo eliminar la imagen')
  } finally {
    imageLoading.value = false
  }
}

const confirmDeleteImage = () => {
  Modal.confirm({
    title: 'Eliminar imagen del item?',
    icon: createVNode(ExclamationCircleOutlined),
    okText: 'Eliminar',
    okType: 'danger',
    cancelText: 'Cancelar',
    onOk: deleteImage
  })
}

const submit = async () => {
  try {
    errorMsg.value = null

    await itemService.update(props.codigoItem, {
      nombre: form.value.nombre,
      descripcion: form.value.descripcion,
      tipo: form.value.tipo,
      enabled: form.value.enabled,
      observaciones: form.value.observaciones
    })

    message.success('Item actualizado correctamente')
    emit('success')
    emit('close')
  } catch (err) {
    errorMsg.value =
      err.response?.data?.content || 'Error desconocido'
  }
}

const confirmEdit = () => {
  Modal.confirm({
    title: 'Guardar cambios del item?',
    icon: createVNode(ExclamationCircleOutlined),
    okText: 'Guardar',
    cancelText: 'Cancelar',
    onOk: submit
  })
}

const handleCancel = () => emit('close')
</script>

<template>
  <a-modal
    :open="open"
    title="Editar Item"
    ok-text="Guardar"
    cancel-text="Cancelar"
    :okButtonProps="{ disabled: isDisabled }"
    @ok="confirmEdit"
    @cancel="handleCancel"
  >
    <a-form layout="vertical" :loading="loading">
      <a-form-item label="Imagen">
        <div class="item-image-panel">
          <a-image
            v-if="form.imagenUrl"
            :src="getItemImageUrl(form.imagenUrl)"
            :width="160"
            class="item-image"
          />
          <a-empty v-else description="Sin imagen" :image="false" />

          <a-space wrap>
            <a-upload
              :show-upload-list="false"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              :before-upload="uploadImage"
              :disabled="imageLoading"
            >
              <a-button :loading="imageLoading">
                <UploadOutlined />
                {{ form.imagenUrl ? 'Reemplazar imagen' : 'Subir imagen' }}
              </a-button>
            </a-upload>

            <a-button
              v-if="form.imagenUrl"
              danger
              :loading="imageLoading"
              @click="confirmDeleteImage"
            >
              <DeleteOutlined />
              Eliminar
            </a-button>
          </a-space>

          <div class="image-help">JPG, PNG o WEBP. Maximo 2 MB.</div>
        </div>
      </a-form-item>

      <a-form-item label="Codigo">
        <a-input v-model:value="form.codigoItem" disabled />
      </a-form-item>

      <a-form-item label="Nombre">
        <a-input v-model:value="form.nombre" />
      </a-form-item>

      <a-form-item label="Tipo">
        <a-select v-model:value="form.tipo">
          <a-select-option value="MATERIAL">MATERIAL</a-select-option>
          <a-select-option value="HERRAMIENTA">HERRAMIENTA</a-select-option>
          <a-select-option value="EQUIPO">EQUIPO</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Descripcion">
        <a-textarea v-model:value="form.descripcion" />
      </a-form-item>

      <a-form-item label="Observaciones">
        <a-textarea v-model:value="form.observaciones" />
      </a-form-item>

      <a-form-item label="Activo">
        <a-switch v-model:checked="form.enabled" />
      </a-form-item>

      <a-alert v-if="errorMsg" type="error" :message="errorMsg" show-icon style="margin-top: 6px" />
    </a-form>
  </a-modal>
</template>

<style scoped>
.item-image-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-image {
  max-height: 160px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.image-help {
  color: #64748b;
  font-size: 12px;
}
</style>
