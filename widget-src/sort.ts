export function getWeek(date: Date) {
  var dt = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - dt) / 86400000 + dt.getDay() + 1) / 7);
}

export function groupBy<K>(
  list: K[],
  keyGetter: (item: K) => string
): Map<string, K[]> {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}
