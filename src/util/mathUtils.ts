function roundToTwo(num) {
  return Math.round(num * 100 + Number.EPSILON) / 100;
}

export function sumObjectsByKey(...objs: any[]) {
  return objs.reduce((a, b) => {
    for (let k in b) {
      if (typeof b[k] === "number") a[k] = roundToTwo((a[k] ?? 0) + b[k]);
    }
    return a;
  }, {});
}
