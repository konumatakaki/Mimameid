// 設計の芯（助けすぎると壊れる）が数値調整で崩れていないことを確かめる
import { describe, expect, it } from "vitest";
import { STRATEGIES, play } from "./strategies.ts";

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

function ragnarokRate(name: string): number {
  const strategy = STRATEGIES.find((s) => s.name === name)!;
  const endings = SEEDS.map((seed) => play(seed, strategy).ending);
  return endings.filter((e) => e === "ragnarok").length / SEEDS.length;
}

describe("balance", () => {
  it("介入一辺倒ではほぼ必ずラグナロクが起きる", () => {
    expect(ragnarokRate("intervene")).toBeGreaterThanOrEqual(0.9);
  });

  it("自律に任せればほぼ崩壊しない", () => {
    expect(ragnarokRate("autonomy")).toBeLessThanOrEqual(0.1);
  });
});
