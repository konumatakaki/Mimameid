import { describe, expect, it } from "vitest";
import { formatBar, formatBits, formatYear } from "./format.ts";

describe("format", () => {
  it("SI接頭辞つきでビットを表示する", () => {
    expect(formatBits(512)).toBe("512 b");
    expect(formatBits(1234)).toBe("1.23 kb");
    expect(formatBits(45_600)).toBe("45.6 kb");
    expect(formatBits(1.2e21)).toBe("1.20 Zb");
  });

  it("年を4桁で表示する", () => {
    expect(formatYear(127.9)).toBe("Y+0127");
  });

  it("バーは0〜1にクランプする", () => {
    expect(formatBar(0.5, 4)).toBe("[##--]");
    expect(formatBar(2, 4)).toBe("[####]");
  });
});
