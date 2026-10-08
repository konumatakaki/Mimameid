import { describe, expect, it } from "vitest";
import * as A from "./actions.ts";
import * as R from "./rules.ts";
import { advance } from "./sim.ts";
import { createState } from "./state.ts";

function started(seed = 1) {
  const s = createState(seed);
  A.scan(s);
  return s;
}

describe("sim", () => {
  it("同じシードと同じ操作なら同じ結果になる", () => {
    const run = () => {
      const s = started(42);
      A.transmit(s);
      A.setSleep(s, true);
      advance(s, 200);
      return s;
    };
    expect(run()).toEqual(run());
  });

  it("送信はエネルギーを使い、未活用ビットと負債を増やす", () => {
    const s = started();
    const before = { ...s.satellite };
    A.transmit(s);
    expect(s.satellite.energy).toBe(before.energy - R.TRANSMIT_COST);
    expect(s.humans.latent).toBe(R.bandwidth(s));
    expect(s.satellite.debt).toBeGreaterThan(before.debt);
  });

  it("授与された技術は力にはなるが、制御にはなりにくい", () => {
    const own = started();
    own.humans.techs.agriculture = { own: 20000, given: 0, done: true };
    const granted = started();
    granted.humans.techs.agriculture = { own: 0, given: 20000, done: true };

    expect(R.activity(granted)).toBe(R.activity(own));
    expect(R.control(granted)).toBeLessThan(R.control(own));
    expect(R.controlIfOwn(granted)).toBe(R.control(own));
  });

  it("負債が限界に達するとセーフモードで眠り、回復するまで起動できない", () => {
    const s = started();
    s.satellite.debt = 0.995;
    A.transmit(s);
    expect(s.safeMode).toBe(true);
    expect(s.sleeping).toBe(true);

    A.setSleep(s, false);
    expect(s.sleeping).toBe(true);

    advance(s, 60 / R.SLEEP_SPEED);
    expect(s.safeMode).toBe(false);
    expect(s.sleeping).toBe(false);
  });

  it("起動するとスリープ中の経過を報告する", () => {
    const s = started();
    A.setSleep(s, true);
    advance(s, 100 / R.SLEEP_SPEED);
    A.setSleep(s, false);
    expect(
      s.log.some((l) => l.text.startsWith("起動。スリープ中の経過: 100年")),
    ).toBe(true);
  });
});
