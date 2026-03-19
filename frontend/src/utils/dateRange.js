/**
 * Convert a time range label to a { start, end } date pair.
 * Labels: "Last 7 Days", "Last 30 Days", "Last 90 Days", "YTD", "Last Year"
 */
export function getDateRange(label) {
  const now = new Date();
  const end = new Date(now);
  let start;

  switch (label) {
    case 'Last 7 Days':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case 'Last 30 Days':
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      break;
    case 'Last 90 Days':
      start = new Date(now);
      start.setDate(start.getDate() - 90);
      break;
    case 'YTD':
      start = new Date(now.getFullYear(), 0, 1); // Jan 1st
      break;
    case 'Last Year': {
      const y = now.getFullYear() - 1;
      start = new Date(y, 0, 1);
      end.setTime(new Date(y, 11, 31, 23, 59, 59).getTime());
      break;
    }
    default:
      start = new Date(now);
      start.setDate(start.getDate() - 30);
  }

  return { start, end };
}

/**
 * Filter an array of items by a date field within the selected time range.
 * @param {Array} items - array of objects
 * @param {string} timeRange - one of the header labels
 * @param {string} dateField - key to read from each item (default: 'created_at')
 * @returns {Array} filtered items
 */
export function filterByDateRange(items, timeRange, dateField = 'created_at') {
  if (!items || !items.length || !timeRange) return items;
  const { start, end } = getDateRange(timeRange);
  return items.filter(item => {
    const val = item[dateField];
    if (!val) return false;
    const d = new Date(val);
    return d >= start && d <= end;
  });
}
