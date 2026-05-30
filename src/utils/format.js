export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'ETB0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatNumber = (number) => {
  if (!number && number !== 0) return '0'
  return new Intl.NumberFormat('en-US').format(number)
}

export const formatPercentage = (value) => {
  if (!value && value !== 0) return '0%'
  return `${value.toFixed(2)}%`
}