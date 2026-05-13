export function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}
