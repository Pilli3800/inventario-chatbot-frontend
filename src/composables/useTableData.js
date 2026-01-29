// useTableData.js
import { ref } from 'vue'

export function useTableData({
  service,
  defaultSort = null,
  pageSize = 10
}) {
  // estado
  const data = ref([])
  const loading = ref(false)

  const pagination = ref({
    current: 1,
    pageSize,
    total: 0
  })

  const activeFilters = ref({})

  const sorter = ref(defaultSort)

  // util: limpiar filtros vacíos
  const cleanObject = (obj = {}) =>
    Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) => v !== undefined && v !== null && v !== ''
      )
    )

  // carga principal
  const load = async (filters = activeFilters.value) => {
    loading.value = true

    const cleanFilters = cleanObject(filters)

    // aplicar sort
    if (!cleanFilters.sort && sorter.value) {
      const dir = sorter.value.order === 'ascend' ? 'asc' : 'desc'
      cleanFilters.sort = `${sorter.value.field},${dir}`
    }

    const { data: response } = await service({
      ...cleanFilters,
      page: pagination.value.current - 1,
      size: pagination.value.pageSize
    })

    data.value = response.content
    pagination.value.total = response.totalElements
    loading.value = false
  }

  // tabla (paginación + sort)
  const onTableChange = (pager, _filters, tableSorter) => {
    pagination.value.current = pager.current
    pagination.value.pageSize = pager.pageSize

    if (tableSorter?.field && tableSorter?.order) {
      sorter.value = tableSorter
    } else {
      sorter.value = null
    }

    let sort
    if (sorter.value) {
      const dir = sorter.value.order === 'ascend' ? 'asc' : 'desc'
      sort = `${sorter.value.field},${dir}`
    }

    load({
      ...activeFilters.value,
      sort
    })
  }

  // filtros
  const onSearch = (filters) => {
    pagination.value.current = 1
    activeFilters.value = { ...filters }
    load(filters)
  }

  return {
    data,
    loading,
    pagination,
    sorter,
    filters: activeFilters,
    load,
    onTableChange,
    onSearch
  }
}
