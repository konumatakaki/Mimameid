const PREFIXES = ["", "k", "M", "G", "T", "P", "E", "Z", "Y"];

/** SI接頭辞つきで3桁表示する（例: 1.23 kb） */
export function formatSi(value: number, unit: string): string {
  if (value < 1000) return `${Math.floor(value)} ${unit}`;
  const exp = Math.min(PREFIXES.length - 1, Math.floor(Math.log10(value) / 3));
  const scaled = value / 1000 ** exp;
  const digits = scaled < 10 ? 2 : scaled < 100 ? 1 : 0;
  return `${scaled.toFixed(digits)} ${PREFIXES[exp]}${unit}`;
}

export function formatBits(bits: number): string {
  return formatSi(bits, "b");
}

/** 増減の速さ（例: +12.3 b/年、−0.4 b/年） */
export function formatRate(bitsPerYear: number): string {
  const sign = bitsPerYear < 0 ? "−" : "+";
  const abs = Math.abs(bitsPerYear);
  const value = abs < 10 ? `${abs.toFixed(1)} b` : formatBits(abs);
  return `${sign}${value}/年`;
}

export function formatYear(year: number): string {
  return `Y+${String(Math.floor(year)).padStart(4, "0")}`;
}

export function formatInt(value: number): string {
  return Math.floor(value).toLocaleString("en-US");
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** [####------] 形式のバー */
export function formatBar(ratio: number, width = 10): string {
  const filled = Math.round(Math.min(1, Math.max(0, ratio)) * width);
  return `[${"#".repeat(filled)}${"-".repeat(width - filled)}]`;
}
