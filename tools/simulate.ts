// 遊び方の型ごとに第I章を何度も回し、結末と所要時間をまとめて表示する。
// 実行: npm run simulate
import { STRATEGIES, play } from "./strategies.ts";

const RUNS = 40;

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

console.log("strategy   ragnarok writing timeout  years  minutes given clicks");
for (const strategy of STRATEGIES) {
  const results = Array.from({ length: RUNS }, (_, i) => play(i + 1, strategy));
  const count = (e: string | null) =>
    results.filter((r) => r.ending === e).length;
  console.log(
    [
      strategy.name.padEnd(10),
      String(count("ragnarok")).padStart(8),
      String(count("writing")).padStart(7),
      String(count(null)).padStart(7),
      mean(results.map((r) => r.years))
        .toFixed(0)
        .padStart(6),
      mean(results.map((r) => r.minutes))
        .toFixed(1)
        .padStart(8),
      mean(results.map((r) => r.givenShare))
        .toFixed(2)
        .padStart(5),
      mean(results.map((r) => r.clicks))
        .toFixed(0)
        .padStart(6),
    ].join(" "),
  );
}
