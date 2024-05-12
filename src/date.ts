export function dateFormat(date: Date): string {
  return date.toISOString().split("T")[0];
}
