export function elapsedSince(timestamp, now = Date.now()) {
  if (!Number.isFinite(timestamp)) return 'time unknown';
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60000));
  if (!minutes) return 'just now';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`;
  return `${Math.floor(hours / 24)} d${hours % 24 ? ` ${hours % 24} h` : ''}`;
}

export function contactStatus(contact) {
  return contact.open === true ? 'Open' : contact.open === false ? 'Closed' : 'Unavailable';
}
