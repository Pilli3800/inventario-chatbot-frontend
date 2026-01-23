import dayjs from 'dayjs'

export const formatDateTime = (value) => {
  if (!value) return '—'
  return dayjs(value).format('DD/MM/YYYY HH:mm')
}
