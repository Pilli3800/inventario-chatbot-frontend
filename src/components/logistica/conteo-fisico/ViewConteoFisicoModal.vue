<!-- ViewConteoFisicoModal.vue -->
<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { conteoFisicoService } from '@/services/conteo-fisico.service'
import { formatDateTime } from '@/utils/date'

const props = defineProps({
  open: Boolean,
  idConteo: [Number, String]
})

defineEmits(['close'])

const loading = ref(false)
const loadingPdf = ref(false)
const loadingDownload = ref(false)
const conteo = ref(null)
const pdfUrl = ref('')
const pdfError = ref('')

const detalleColumns = [
  { title: 'Codigo Item', dataIndex: 'codigoItem', width: 130 },
  { title: 'Nombre', dataIndex: 'nombreItem', width: 220 },
  { title: 'Stock Sistema', dataIndex: 'stockSistema', width: 120, align: 'right' },
  { title: 'Cantidad Fisica', dataIndex: 'cantidadFisica', width: 130, align: 'right' },
  { title: 'Diferencia', dataIndex: 'diferencia', width: 110, align: 'right' },
  { title: 'Observacion', dataIndex: 'observacion', width: 240 }
]

const loadConteo = async () => {
  if (!props.idConteo) return

  loading.value = true
  try {
    const { data } = await conteoFisicoService.getById(props.idConteo)
    conteo.value = data?.data ?? data?.content ?? data
  } finally {
    loading.value = false
  }
}

const revokePdfUrl = () => {
  if (pdfUrl.value) {
    globalThis.URL.revokeObjectURL(pdfUrl.value)
    pdfUrl.value = ''
  }
}

const loadPdf = async () => {
  if (!props.idConteo) return

  revokePdfUrl()
  loadingPdf.value = true
  pdfError.value = ''
  try {
    const response = await conteoFisicoService.descargarPdf(props.idConteo)
    const blob = response?.data instanceof Blob
      ? response.data
      : new Blob([response.data], { type: 'application/pdf' })
    pdfUrl.value = globalThis.URL.createObjectURL(blob)
  } catch {
    pdfError.value = 'No se pudo cargar el PDF del reporte'
  } finally {
    loadingPdf.value = false
  }
}

const downloadBlobResponse = (response, fallbackName) => {
  const blob = response?.data instanceof Blob
    ? response.data
    : new Blob([response.data])

  const url = globalThis.URL.createObjectURL(blob)
  let filename = fallbackName
  const disposition = response.headers?.['content-disposition']
  if (disposition) {
    const match = disposition.match(/filename="?(.+)"?/)
    if (match?.[1]) filename = match[1]
  }

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  globalThis.URL.revokeObjectURL(url)
}

const descargarPdf = async () => {
  if (!props.idConteo) return

  loadingDownload.value = true
  try {
    const response = await conteoFisicoService.descargarPdf(props.idConteo)
    downloadBlobResponse(response, `conteo_fisico_${props.idConteo}.pdf`)
  } catch {
    message.error('No se pudo descargar el PDF')
  } finally {
    loadingDownload.value = false
  }
}

const descargarExcel = async () => {
  if (!props.idConteo) return

  loadingDownload.value = true
  try {
    const response = await conteoFisicoService.descargarExcel(props.idConteo)
    downloadBlobResponse(response, `conteo_fisico_${props.idConteo}.xlsx`)
  } catch {
    message.error('No se pudo descargar el Excel')
  } finally {
    loadingDownload.value = false
  }
}

watch(
  () => [props.open, props.idConteo],
  ([open, id]) => {
    if (open && id) {
      loadConteo()
      loadPdf()
    } else {
      revokePdfUrl()
    }
  },
  { immediate: true }
)

onBeforeUnmount(revokePdfUrl)
</script>

<template>
  <a-modal :open="open" title="Reporte de Conteo Fisico" ok-text="Cerrar"
    :cancelButtonProps="{ style: { display: 'none' } }" width="1100px"
    @ok="$emit('close')" @cancel="$emit('close')">
    <template #footer>
      <a-space>
        <a-button :loading="loadingDownload" @click="descargarExcel">
          Descargar Excel
        </a-button>
        <a-button type="primary" :loading="loadingDownload" @click="descargarPdf">
          Descargar PDF
        </a-button>
        <a-button @click="$emit('close')">
          Cerrar
        </a-button>
      </a-space>
    </template>

    <a-spin :spinning="loading">
      <template v-if="conteo">
        <a-spin :spinning="loadingPdf">
          <iframe v-if="pdfUrl" :src="pdfUrl" class="pdf-frame" />
          <a-alert v-else-if="pdfError" type="warning" show-icon :message="pdfError" style="margin-bottom: 16px;" />
        </a-spin>

        <a-collapse v-if="pdfError" ghost>
          <a-collapse-panel key="detalle" header="Ver detalle de datos">
            <a-descriptions bordered size="small" :column="2" style="margin-bottom: 16px;">
              <a-descriptions-item label="ID">{{ conteo.id }}</a-descriptions-item>
              <a-descriptions-item label="Tipo">{{ conteo.tipoInventario }}</a-descriptions-item>
              <a-descriptions-item label="Ubicacion">
                {{ conteo.codigoUbicacion }} - {{ conteo.nombreUbicacion || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="Fecha">{{ formatDateTime(conteo.fechaConteo) }}</a-descriptions-item>
              <a-descriptions-item label="Usuario">
                {{ conteo.codigoUsuario || '-' }} - {{ conteo.nombreUsuario || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="Items">
                {{ conteo.totalItems || 0 }} / discrepancias: {{ conteo.itemsConDiscrepancia || 0 }}
              </a-descriptions-item>
              <a-descriptions-item label="Observaciones" :span="2">
                {{ conteo.observaciones || '-' }}
              </a-descriptions-item>
            </a-descriptions>

            <a-table
              :columns="detalleColumns"
              :data-source="conteo.detalles || []"
              row-key="codigoItem"
              size="small"
              :pagination="false"
              :scroll="{ x: 980 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'diferencia'">
                  <a-tag :color="record.diferencia === 0 ? 'green' : record.diferencia > 0 ? 'blue' : 'red'">
                    {{ record.diferencia }}
                  </a-tag>
                </template>
                <template v-else-if="column.dataIndex === 'observacion'">
                  {{ record.observacion || '-' }}
                </template>
              </template>
            </a-table>
          </a-collapse-panel>
        </a-collapse>
      </template>
    </a-spin>
  </a-modal>
</template>

<style scoped>
.pdf-frame {
  width: 100%;
  height: 72vh;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}
</style>
