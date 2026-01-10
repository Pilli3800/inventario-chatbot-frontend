<script setup>
import { ref, watch, computed, createVNode } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { adminCuadrillaService } from '@/services/admin-cuadrilla.service'
import { cuadrillaService } from '@/services/cuadrilla.service'
import { servicioService } from '@/services/servicio.service'
import { adminUserService } from '@/services/admin-user.service'

const props = defineProps({
  open: Boolean,
  codigoCuadrilla: String
})

const emit = defineEmits(['close', 'success'])

/* === FORM === */
const loading = ref(false)
const errorMsg = ref(null)

const form = ref({
  codigoCuadrilla: '',
  codigoUsuario: undefined,
  codigoServicio: undefined
})

/* === SERVICIOS (TODOS ACTIVOS) === */
const servicios = ref([])
const loadingServicios = ref(false)

const loadServicios = async () => {
  loadingServicios.value = true
  const { data } = await servicioService.search({ enabled: true })
  servicios.value = data.content
  loadingServicios.value = false
}

/* === JEFES (AUTOCOMPLETE REMOTO) === */
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

/* === CARGAR CUADRILLA === */
const loadCuadrilla = async () => {
  if (!props.codigoCuadrilla) return
  loading.value = true

  const { data } = await cuadrillaService.get(props.codigoCuadrilla)
  const c = data.content

  form.value = {
    codigoCuadrilla: c.codigoCuadrilla,
    codigoUsuario: c.jefeCuadrillaUsuario,
    codigoServicio: c.codigoServicio
  }

  loading.value = false
}

/* === WATCH === */
watch(
  () => [props.open, props.codigoCuadrilla],
  ([open, codigo]) => {
    if (open && codigo) {
      errorMsg.value = null
      loadServicios()
      loadCuadrilla()
    }
  },
  { immediate: true }
)

/* === VALIDACIÓN === */
const isDisabled = computed(
  () => !form.value.codigoUsuario || !form.value.codigoServicio
)

/* === GUARDAR === */
const submit = async () => {
  try {
    await adminCuadrillaService.update(props.codigoCuadrilla, {
      codigoUsuario: form.value.codigoUsuario,
      codigoServicio: form.value.codigoServicio
    })

    message.success('Cuadrilla actualizada correctamente')
    emit('success')
    emit('close')
  } catch (err) {
    errorMsg.value = err.response?.data?.content || 'Error desconocido'
  }
}

const confirmEdit = () => {
  Modal.confirm({
    title: '¿Guardar cambios de la cuadrilla?',
    icon: createVNode(ExclamationCircleOutlined),
    okText: 'Guardar',
    cancelText: 'Cancelar',
    onOk: submit
  })
}

const handleCancel = () => emit('close')
</script>

<template>
  <a-modal :open="open" title="Editar Cuadrilla" ok-text="Guardar" cancel-text="Cancelar"
    :okButtonProps="{ disabled: isDisabled }" @ok="confirmEdit" @cancel="handleCancel">

    <a-form layout="vertical" :loading="loading">

      <!-- CÓDIGO (SOLO LECTURA) -->
      <a-form-item label="Código">
        <a-input :value="form.codigoCuadrilla" disabled />
      </a-form-item>

      <!-- JEFE (AUTOCOMPLETE) -->
      <a-form-item label="Jefe de Cuadrilla">
        <a-select v-model:value="form.codigoUsuario" show-search placeholder="Escriba usuario o nombre"
          :filter-option="false" :loading="loadingJefes" @search="buscarJefes" allow-clear>

          <a-select-option v-for="u in jefesCuadrilla" :key="u.identUsuario" :value="u.identUsuario">
            {{ u.identUsuario }} - {{ u.nombres }} {{ u.apellidos }}
          </a-select-option>

        </a-select>
      </a-form-item>

      <!-- SERVICIO (SELECT NORMAL) -->
      <a-form-item label="Servicio">
        <a-select v-model:value="form.codigoServicio" placeholder="Seleccione servicio" :loading="loadingServicios"
          allow-clear>

          <a-select-option v-for="s in servicios" :key="s.codigo" :value="s.codigo">
            {{ s.codigo }} - {{ s.nombre }}
          </a-select-option>

        </a-select>
      </a-form-item>

      <!-- ERRORES -->
      <a-alert v-if="errorMsg" type="error" show-icon style="margin-top: 8px" :message="errorMsg" />

    </a-form>
  </a-modal>
</template>
