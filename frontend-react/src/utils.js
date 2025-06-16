export function formatDate(timestamp) {
  if (!timestamp) return '';
  // Asegurar que el timestamp se interprete como UTC añadiendo 'Z' si no está presente
  let ts = timestamp;
  if (!ts.endsWith('Z')) {
    ts = ts + 'Z';
  }
  const date = new Date(ts);
  // Mostrar la fecha y hora en UTC
  return date.toLocaleString('es-ES', { timeZone: 'UTC', hour12: false });
}

export function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours % 24}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes % 60}m`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m ${diffSeconds % 60}s`;
  } else {
    return `${diffSeconds}s`;
  }
}
