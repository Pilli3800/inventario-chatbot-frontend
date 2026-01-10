<script setup>
import { ref, watch, createVNode } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { adminCuadrillaService } from '@/services/admin-cuadrilla.service'
import { servicioService } from '@/services/servicio.service'
import { adminUserService } from '@/services/admin-user.service'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['close', 'success'])

/* Formulario */
const formRef = ref(null)
const form = ref({
  codigoCuadrilla: undefined,
  codigoUsuario: undefined,
  codigoServicio: undefined
})

const rules = {
  codigoCuadrilla: [{ required: true, message: 'El código es obligatorio' }],
  codigoUsuario: [{ required: true, message: 'El jefe es obligatorio' }],
  codigoServicio: [{ required: true, message: 'El servicio es obligatorio' }]
}

const loading = ref(false)
const errorMsg = ref(null)

/* Servicios */
const servicios = ref([])
const loadingServicios = ref(false)

const loadServicios = async () => {
  loadingServicios.value = true
  const { data } = await servicioService.search({ enabled: true })
  servicios.value = data.content
  loadingServicios.value = false
}

/* Jefes Autocomplete */
const jefesCuadrilla = ref([])
const loadingJefes = ref(false)

const buscarJefes = async (texto) => {
  if (!texto || texto.length < 2) {
    jefesCuadrilla.value = []
    return
  }

  loadingJefes.value = true

  try {
    const { data } = await adminUserService.search({
      rol: 'JEFE_CUADRILLA',
      identUsuario: texto,
      enabled: true,
      page: 0,
      size: 5
    })

    jefesCuadrilla.value = data.content
  } finally {
    loadingJefes.value = false
  }
}

/* Reset al abrir */
watch(() => props.open, (value) => {
  if (value) {
    loadServicios()

    jefesCuadrilla.value = []
    errorMsg.value = null
    formRef.value?.clearValidate()

    form.value = {
      codigoCuadrilla: undefined,
      codigoUsuario: undefined,
      codigoServicio: undefined
    }
  }
})

/* Guardar */
const submit = () => {
  formRef.value.validate().then(async () => {
    try {
      loading.value = true
      await adminCuadrillaService.create(form.value)
      message.success('Cuadrilla creada correctamente')
      emit('success')
      emit('close')
    } catch (err) {
      errorMsg.value = err.response?.data?.content || ['Error desconocido']
    } finally {
      loading.value = false
    }
  })
}

const confirmSave = () => {
  Modal.confirm({
    title: '¿Guardar nueva cuadrilla?',
    icon: createVNode(ExclamationCircleOutlined),
    okText: 'Guardar',
    cancelText: 'Cancelar',
    onOk: submit
  })
}
</script>

<template>
  <a-modal :open="open" title="Nueva Cuadrilla" ok-text="Guardar" cancel-text="Cancelar" :confirm-loading="loading"
    @ok="confirmSave" @cancel="emit('close')">

    <a-form layout="vertical" :model="form" :rules="rules" ref="formRef">

      <!-- Código -->
      <a-form-item label="Código" name="codigoCuadrilla">
        <a-input v-model:value="form.codigoCuadrilla" />
      </a-form-item>

      <!-- Jefe (Autocomplete) -->
      <a-form-item label="Jefe de Cuadrilla" name="codigoUsuario">
        <a-select v-model:value="form.codigoUsuario" show-search placeholder="Escriba usuario o nombre"
          :filter-option="false" :loading="loadingJefes" @search="buscarJefes" allow-clear>

          <a-select-option v-for="u in jefesCuadrilla" :key="u.identUsuario" :value="u.identUsuario">

            {{ u.identUsuario }} - {{ u.nombres }} {{ u.apellidos }}

          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- Servicio -->
      <a-form-item label="Servicio" name="codigoServicio">
        <a-select v-model:value="form.codigoServicio" placeholder="Seleccione servicio" :loading="loadingServicios"
          allow-clear>

          <a-select-option v-for="s in servicios" :key="s.codigo" :value="s.codigo">

            {{ s.codigo }} - {{ s.nombre }}

          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- Errores -->
      <a-alert v-if="errorMsg" type="error" show-icon style="margin-top: 8px" :message="'Errores de validación'"
        :description="errorMsg" />

    </a-form>
  </a-modal>
</template>
