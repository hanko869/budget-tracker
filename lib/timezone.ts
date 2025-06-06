// Beijing timezone utilities (UTC+8)
// These functions only affect display and new date inputs, not existing database data

export const getBeiJingDate = (): string => {
  const now = new Date()
  // Beijing is UTC+8
  const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000))
  return beijingTime.toISOString().split('T')[0]
}

export const formatDateForBeijing = (dateString: string): string => {
  // Display dates as-is since they're already in YYYY-MM-DD format
  // This preserves existing data while ensuring consistent display
  return dateString
}

export const getBeiJingDateTime = (): string => {
  const now = new Date()
  // Beijing is UTC+8
  const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000))
  return beijingTime.toISOString()
} 