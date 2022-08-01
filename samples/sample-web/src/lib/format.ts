export function number(num: number, maximumFractionDigits = 2): string {
  return num.toLocaleString("en", { maximumFractionDigits });
}
export function percent(num: number, maximumFractionDigits = 2): string {
  if (isNaN(num)) return "";
  return number(num * 100, maximumFractionDigits) + " %";
}
export function currency(num: number, currency?: string, includeCents: boolean = true): string {
  const maximumFractionDigits = includeCents ? 2 : 0;
  const minimumFractionDigits = includeCents ? 2 : 0;
  const opt = { maximumFractionDigits, minimumFractionDigits } as any;
  if (currency) {
    opt.currency = currency;
  }
  return num.toLocaleString("en", opt);
}

export function Rand(x?: number): string {
  if (x) {
    return "R " + currency(x);
  }
  return "";
}
