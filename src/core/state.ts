import { ELEMENT_IDS, type ElementId } from "../content/elements.ts";
import {
  INSTITUTION_IDS,
  type InstitutionId,
} from "../content/institutions.ts";
import { TECH_IDS, type TechId } from "../content/techs.ts";
import type { UpgradeId } from "../content/upgrades.ts";
import { BOOT_LOG } from "../content/text.ts";

/** セーブ形式の版。形式を変えたら上げる */
export const SAVE_VERSION = 1;

export interface TechProgress {
  /** 自力で生んだビット */
  own: number;
  /** 衛星から授与されたビット */
  given: number;
  done: boolean;
}

export interface LogEntry {
  year: number;
  text: string;
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
    rng: seed >>> 0,
    year: 0,
    phase: "prologue",
    ending: null,
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
      pop: 40,
      usableOwn: 2000,
      usableGiven: 0,
      latent: 0,
      techs: record(TECH_IDS, () => ({ own: 0, given: 0, done: false })),
      target: null,
      institutions: record(INSTITUTION_IDS, () => 0),
      winter: 0,
    },
    stress: record(ELEMENT_IDS, () => 0),
    stages: record(ELEMENT_IDS, () => 0),
    tipped: [],
    log: BOOT_LOG.map((text) => ({ year: 0, text })),
    history: [],
    stats: { clicks: 0, ownBits: 0, givenBits: 0, sleeps: 0, winters: 0 },
  };
}

const LOG_LIMIT = 100;

export function addLog(s: GameState, text: string): void {
  s.log.push({ year: s.year, text });
  if (s.log.length > LOG_LIMIT) s.log.splice(0, s.log.length - LOG_LIMIT);
}
