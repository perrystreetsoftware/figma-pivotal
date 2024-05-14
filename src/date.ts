import { toDate } from "date-fns/toDate";
export { getWeek } from "date-fns/getWeek";
export { isValid as isValidDate } from "date-fns/isValid";

export function dateFormat(date: Date, includeDay: boolean = true): string {
  const dateString = toDate(date).toISOString().split("T")[0];
  return includeDay ? dateString : dateString.slice(0, -3);
}
