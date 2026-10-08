import { ELEMENT_IDS, type ElementId } from "../content/elements.ts";
import {
  INSTITUTION_IDS,
  type InstitutionId,
} from "../content/institutions.ts";
import {
  INITIAL_TECHS,
  TECH_IDS,
  TECHS,
  type TechId,
} from "../content/techs.ts";
import type { UpgradeId } from "../content/upgrades.ts";
import { BOOT_LOG } from "../content/text.ts";

/** セーブ形式の版。形式を変えたら上げる */
export const SAVE_VERSION = 2;

export interface TechProgress {
  /** 自力で生んだビット */
  own: number;
  /** 衛星から授与されたビット */
  given: number;
  done: boolean;
}

/** system: 衛星自身 / observe: 地上の観測 / response: 集落からの応答 / warning: 危険の兆候 */
export type LogKind = "system" | "observe" | "response" | "warning";

export interface LogEntry {
  year: number;
  text: string;
  kind: LogKind;
  /** 同じ行が続いたときにまとめた回数 */
  count: number;
}

/** 章の振り返り用の記録 */
export interface Sample {
  year: number;
  pop: number;
  usable: number;
  activity: number;
  control: number;
  /** すべて自力で理解していた場合の制御力 */
  controlIfOwn: number;
  stress: Record<ElementId, number>;
}

/** スリープ前の様子。起動時に差分を報告する */
export interface SleepSnapshot {
  year: number;
  pop: number;
  usable: number;
  techs: TechId[];
  institutions: number;
  stages: Record<ElementId, number>;
  tipped: ElementId[];
  winters: number;
}

export interface GameState {
  version: number;
  rng: number;
  /** 起動からの経過年 */
  year: number;
  phase: "prologue" | "chapter1" | "ended";
  ending: "ragnarok" | "writing" | null;
  /** 標準通信確立手続きの進み具合（序章） */
  contact: {
    /** 0: 走査前 / 1: 呼びかけ中 / 2: 応答待ち / 3: 符号の取り決め待ち */
    step: number;
    beacons: number;
    responseAt: number | null;
  };
  sleeping: boolean;
  safeMode: boolean;
  sleepSnapshot: SleepSnapshot | null;
  satellite: {
    units: number;
    /** EN */
    energy: number;
    /** 0〜1。1に達するとセーフモード */
    debt: number;
    /** kg */
    mass: number;
    /** bits */
    archive: number;
    collecting: boolean;
    upgrades: UpgradeId[];
  };
  humans: {
    pop: number;
    usableOwn: number;
    usableGiven: number;
    latent: number;
    techs: Record<TechId, TechProgress>;
    target: TechId | null;
    institutions: Record<InstitutionId, number>;
    /** フィンブルの冬の残り年数（0なら冬ではない） */
    winter: number;
    /** 直近の、活用可能ビットの増減（bits/年） */
    rates: { own: number; given: number; decay: number };
  };
  stress: Record<ElementId, number>;
  stages: Record<ElementId, number>;
  tipped: ElementId[];
  log: LogEntry[];
  history: Sample[];
  stats: {
    clicks: number;
    ownBits: number;
    givenBits: number;
    sleeps: number;
    winters: number;
  };
}

function record<K extends string, V>(keys: readonly K[], value: () => V) {
  return Object.fromEntries(keys.map((k) => [k, value()])) as Record<K, V>;
}

export function createState(seed: number): GameState {
  return {
    version: SAVE_VERSION,
    // 近いシード同士で最初の乱数が似ないよう、かき混ぜてから使う
    rng: Math.imul(seed, 0x9e3779b1) >>> 0,
    year: 0,
    phase: "prologue",
    ending: null,
    contact: { step: 0, beacons: 0, responseAt: null },
    sleeping: false,
    safeMode: false,
    sleepSnapshot: null,
    satellite: {
      units: 1,
      energy: 100,
      debt: 0.2,
      mass: 0,
      archive: 1.2e21,
      collecting: false,
      upgrades: [],
    },
    humans: {
      pop: 80,
      usableOwn: 8000,
      usableGiven: 0,
      latent: 0,
      techs: Object.fromEntries(
        TECH_IDS.map((id) => {
          const known = INITIAL_TECHS.includes(id);
          const own = known ? TECHS[id].cost : 0;
          return [id, { own, given: 0, done: known }];
        }),
      ) as Record<TechId, TechProgress>,
      target: null,
      institutions: record(INSTITUTION_IDS, () => 0),
      winter: 0,
      rates: { own: 0, given: 0, decay: 0 },
    },
    stress: record(ELEMENT_IDS, () => 0),
    stages: record(ELEMENT_IDS, () => 0),
    tipped: [],
    log: BOOT_LOG.map((text) => ({ year: 0, text, kind: "system", count: 1 })),
    history: [],
    stats: { clicks: 0, ownBits: 0, givenBits: 0, sleeps: 0, winters: 0 },
  };
}

const LOG_LIMIT = 100;

export function addLog(
  s: GameState,
  text: string,
  kind: LogKind = "system",
): void {
  const last = s.log.at(-1);
  if (last && last.text === text && last.kind === kind) {
    last.count += 1;
    last.year = s.year;
    return;
  }
  s.log.push({ year: s.year, text, kind, count: 1 });
  if (s.log.length > LOG_LIMIT) s.log.splice(0, s.log.length - LOG_LIMIT);
}
