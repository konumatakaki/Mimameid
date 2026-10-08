import { describe, expect, it } from "vitest";
import { RESPONSES } from "../content/text.ts";
import * as A from "./actions.ts";
import * as R from "./rules.ts";
import { advance } from "./sim.ts";
import { createState, type GameState } from "./state.ts";

/** 応答が届くまで、起動したまま待つ */
function waitForResponse(s: GameState): void {
  advance(s, R.RESPONSE_DELAY / R.AWAKE_SPEED + 0.1);
}

function started(seed = 1): GameState {
  const s = createState(seed);
  A.scan(s);
  for (let i = 0; i < R.BEACONS_NEEDED; i++) A.beacon(s);
  waitForResponse(s);
  A.handshake(s);
  return s;
}

describe("標準通信確立手続き", () => {
  it("走査・呼びかけ・応答・符号の取り決めを経て第I章が始まる", () => {
    const s = createState(1);
    expect(A.canBeacon(s)).toBe(false);
    A.scan(s);
    for (let i = 0; i < R.BEACONS_NEEDED; i++) A.beacon(s);
    expect(s.contact.step).toBe(2);
    expect(A.canHandshake(s)).toBe(false);

    waitForResponse(s);
    expect(s.contact.step).toBe(3);
    A.handshake(s);
    expect(s.phase).toBe("chapter1");
  });

  it("眠っている間は応答に気づけない", () => {
    const s = createState(1);
    A.scan(s);
    for (let i = 0; i < R.BEACONS_NEEDED; i++) A.beacon(s);
    A.setSleep(s, true);
    advance(s, 10);
    expect(s.contact.step).toBe(2);
    A.setSleep(s, false);
    advance(s, 0.1);
    expect(s.contact.step).toBe(3);
  });
});

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

  it("集落は天文観測と農耕を、理解した状態で持って始まる", () => {
    const s = createState(1);
    expect(s.humans.techs.calendar.done).toBe(true);
    expect(R.understanding(s, "agriculture")).toBe(1);
  });

  it("送信はエネルギーを使い、未活用ビットと負債を増やす", () => {
    const s = started();
    const before = { ...s.satellite };
    A.transmit(s);
    expect(s.satellite.energy).toBe(before.energy - R.TRANSMIT_COST);
    expect(s.humans.latent).toBe(R.bandwidth(s));
    expect(s.satellite.debt).toBeGreaterThan(before.debt);
  });

  it("送りすぎると応答が乱れ、同じ応答はログで1行にまとまる", () => {
    const s = started();
    A.transmit(s);
    expect(s.log.at(-1)?.text).toBe(RESPONSES[0].text);
    while (A.canTransmit(s)) A.transmit(s);
    const last = s.log.findLast((l) => l.kind === "response")!;
    expect(last.text).toBe(RESPONSES.at(-1)!.text);
    expect(last.count).toBeGreaterThan(1);
  });

  it("授与された技術は力にはなるが、制御にはなりにくい", () => {
    const own = started();
    own.humans.techs.herding = { own: 12500, given: 0, done: true };
    const granted = started();
    granted.humans.techs.herding = { own: 0, given: 12500, done: true };

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
