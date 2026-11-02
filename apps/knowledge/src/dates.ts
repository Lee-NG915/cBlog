const offset = 8 * 60 * 60 * 1000;
/** The editor always uses UTC+8, independently of the device timezone. */
export function toDisplayInput(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "";
  return new Date(Date.parse(value) + offset).toISOString().slice(0, 16);
}
export function fromDisplayInput(value: string) {
  return value ? new Date(value + "+08:00").toISOString() : null;
}
