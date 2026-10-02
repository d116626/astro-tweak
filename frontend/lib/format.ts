const nf = (maximumFractionDigits: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits });

/** Número com precisão adaptada à magnitude: 0,012 / 0,5 / 8,2 / 318 / 12.400. */
export function formatValue(value: number): string {
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : value >= 1 ? 2 : value >= 0.1 ? 2 : 3;
  return nf(digits).format(value);
}

/** Dias para períodos curtos, anos para os longos. */
export function formatPeriod(days: number): string {
  return days >= 730
    ? `${nf(1).format(days / 365.256)} anos`
    : `${nf(days < 10 ? 1 : 0).format(days)} dias`;
}
