// ブラウザなしで第I章を遊ぶ、決まった遊び方の型。バランス調整とテストで使う。
import { INSTITUTION_IDS } from "../src/content/institutions.ts";
import { UPGRADE_IDS } from "../src/content/upgrades.ts";
import * as A from "../src/core/actions.ts";
import * as R from "../src/core/rules.ts";
import { advance } from "../src/core/sim.ts";
import { createState, type GameState } from "../src/core/state.ts";

/** 1回の操作にかかる実時間（秒）の見積もり */
const SECONDS_PER_ACTION = 0.5;

export interface Strategy {
  name: string;
  /** 1回の起動中に行う操作 */
  act(s: GameState, doAction: (f: () => void) => boolean): void;
  /** 1回のスリープの長さ（年） */
  sleepYears: number;
}

function seedAll(s: GameState, run: (f: () => void) => boolean): void {
  for (const id of INSTITUTION_IDS) {
    while (A.canSeed(s, id) && run(() => A.seed(s, id)));
  }
}

function transmitAll(s: GameState, run: (f: () => void) => boolean): void {
  while (
    A.canTransmit(s) &&
    s.satellite.debt < 0.8 &&
    run(() => A.transmit(s))
  );
}

export const STRATEGIES: Strategy[] = [
  {
    name: "autonomy",
    sleepYears: 100,
    act: (s, run) => seedAll(s, run),
  },
  {
    name: "intervene",
    sleepYears: 50,
    act: (s, run) => transmitAll(s, run),
  },
  {
    name: "mixed",
    sleepYears: 50,
    act: (s, run) => {
      seedAll(s, run);
      transmitAll(s, run);
    },
  },
  {
    name: "builder",
    sleepYears: 50,
    act: (s, run) => {
      for (const id of UPGRADE_IDS)
        if (A.canUpgrade(s, id)) run(() => A.upgrade(s, id));
      if (R.hasUpgrade(s, "collector")) A.setCollecting(s, true);
      while (A.canReplicate(s) && run(() => A.replicate(s)));
      seedAll(s, run);
      transmitAll(s, run);
    },
  },
];

export interface Result {
  ending: GameState["ending"];
  years: number;
  minutes: number;
  givenShare: number;
  clicks: number;
  state: GameState;
}

export function play(
  seed: number,
  strategy: Strategy,
  maxYears = 10000,
): Result {
  const s = createState(seed);
  let seconds = 0;
  const run = (f: () => void) => {
    f();
    advance(s, SECONDS_PER_ACTION);
    seconds += SECONDS_PER_ACTION;
    return true;
  };
  run(() => A.scan(s));
  while (s.phase !== "ended" && s.year < maxYears) {
    if (!s.sleeping) strategy.act(s, run);
    A.setSleep(s, true);
    const sleepSeconds = strategy.sleepYears / R.SLEEP_SPEED;
    advance(s, sleepSeconds);
    seconds += sleepSeconds;
    A.setSleep(s, false);
  }
  const total = s.stats.ownBits + s.stats.givenBits;
  return {
    ending: s.ending,
    years: s.year,
    minutes: seconds / 60,
    givenShare: total > 0 ? s.stats.givenBits / total : 0,
    clicks: s.stats.clicks,
    state: s,
  };
}
