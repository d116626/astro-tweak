const nf = (maximumFractionDigits: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits });

/** 8 -> "8x", 0.5 -> "0,5x", 0.0123 -> "0,012x". */
export function formatTimes(ratio: number): string {
  const digits = ratio >= 10 ? 0 : ratio >= 1 ? 1 : ratio >= 0.1 ? 2 : 3;
  return `${nf(digits).format(ratio)}x`;
}

export function formatKm(km: number): string {
  return `${nf(0).format(km)} km`;
}

export function formatDays(days: number): string {
  return `${nf(days < 10 ? 1 : 0).format(days)} dias`;
}

export function formatDegrees(deg: number): string {
  return `${nf(deg < 1 ? 2 : 1).format(deg)}°`;
}
