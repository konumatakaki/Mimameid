// 定数と、状態から導かれる量。数値はすべて暫定（tools/simulate.ts で調整する）
import { ELEMENT_IDS, type ElementId } from "../content/elements.ts";
import {
  COST_GROWTH,
  INSTITUTION_IDS,
  INSTITUTIONS,
  type InstitutionId,
} from "../content/institutions.ts";
import { TECH_IDS, TECHS, type TechId } from "../content/techs.ts";
import type { UpgradeId } from "../content/upgrades.ts";
import type { GameState } from "./state.ts";

// 時間（ゲーム内の年 / 実時間の秒）
export const AWAKE_SPEED = 0.2;
export const SLEEP_SPEED = 5;

// 衛星
export const UNIT_POWER = 1; // kW / 機
export const CHARGE_PER_KW = 2; // EN / kW / 年
export const CELL_CAPACITY = 100; // EN / 機
export const COLLECT_DRAW = 0.5; // kW
export const COLLECT_RATE = 2; // kg / 年
export const AWAKE_DEBT = 0.004; // / 機 / 年
export const SLEEP_RECOVERY = 0.01; // / 年
export const SAFE_MODE_EXIT = 0.5;
export const ARCHIVE_RISK = 0.8;
export const ARCHIVE_LOSS = 0.001; // / 年
export const SCAN_COST = 10;
export const TRANSMIT_COST = 5;
export const TRANSMIT_DEBT = 0.01;
export const BASE_BANDWIDTH = 256; // bits / 回 / 機
export const SEED_DEBT = 0.02;
export const UPGRADE_DEBT = 0.03;
export const REPLICATE_MASS = 50; // kg（機体が増えるたびに REPLICATE_GROWTH 倍）
export const REPLICATE_ENERGY = 60;
export const REPLICATE_GROWTH = 1.6;

// 人類
export const BASE_CAPACITY = 60;
export const GROWTH = 0.02; // / 年
export const WINTER_DECLINE = 0.05; // / 年
export const MIN_POP = 10;
export const ABSORB_PER_CAPITA = 3; // bits / 人 / 年
export const LATENT_DECAY = 0.02; // / 年
export const KNOWLEDGE_DECAY = 0.01; // / 年
export const NATURAL_RESEARCH = 0.01; // bits / 人 / 年
export const DIGEST_SHARE = 0.3;
export const STAFF_SHARE = 0.5;
export const MAX_RETENTION = 0.9;
export const KNOWLEDGE_SCALE = 10000; // bits

// ティッピング
export const PRESSURE_REF_POP = 300;
export const STRESS_GAIN = 0.035; // / 年
export const STRESS_RECOVERY = 0.01; // / 年
export const CASCADE = 0.01; // / 年

// フィンブルの冬
export const WINTER_RATE = 1 / 400; // 回 / 年
export const WINTER_MIN = 10; // 年
export const WINTER_SPAN = 20; // 年
export const WINTER_SHOCK = 0.85; // 始まった瞬間の人口倍率

export const HISTORY_INTERVAL = 10; // 年

export function hasUpgrade(s: GameState, id: UpgradeId): boolean {
  return s.satellite.upgrades.includes(id);
}

export function power(s: GameState): number {
  return s.satellite.units * UNIT_POWER;
}

export function powerDraw(s: GameState): number {
  return s.satellite.collecting ? COLLECT_DRAW : 0;
}

export function batteryCap(s: GameState): number {
  const perUnit = CELL_CAPACITY * (hasUpgrade(s, "battery") ? 2 : 1);
  return s.satellite.units * perUnit;
}

export function bandwidth(s: GameState): number {
  return BASE_BANDWIDTH * s.satellite.units * (hasUpgrade(s, "optics") ? 4 : 1);
}

export function debtFactor(s: GameState): number {
  return hasUpgrade(s, "radiator") ? 0.6 : 1;
}

export function replicateCost(s: GameState): { mass: number; energy: number } {
  const scale = REPLICATE_GROWTH ** (s.satellite.units - 1);
  return { mass: REPLICATE_MASS * scale, energy: REPLICATE_ENERGY * scale };
}

export function doneTechs(s: GameState): TechId[] {
  return TECH_IDS.filter((id) => s.humans.techs[id].done);
}

/** 理解度。自力で生んだビットの割合 */
export function understanding(s: GameState, id: TechId): number {
  return Math.min(1, s.humans.techs[id].own / TECHS[id].cost);
}

function sumDone(s: GameState, f: (id: TechId) => number): number {
  return doneTechs(s).reduce((sum, id) => sum + f(id), 0);
}

/** 1人あたりの活動規模 */
export function activity(s: GameState): number {
  return 1 + sumDone(s, (id) => TECHS[id].power);
}

/** 1人あたりの制御力。授与された知識は理解された分しか効かない */
export function control(s: GameState): number {
  return 1 + sumDone(s, (id) => TECHS[id].control * understanding(s, id));
}

export function controlIfOwn(s: GameState): number {
  return 1 + sumDone(s, (id) => TECHS[id].control);
}

/** 各ティッピング要素が活動規模の超過分を受け持つ割合 */
export function elementShares(s: GameState): Record<ElementId, number> {
  const weights = Object.fromEntries(
    ELEMENT_IDS.map((e) => [e, 0.5]),
  ) as Record<ElementId, number>;
  for (const id of doneTechs(s)) weights[TECHS[id].element] += TECHS[id].power;
  const total = ELEMENT_IDS.reduce((sum, e) => sum + weights[e], 0);
  for (const e of ELEMENT_IDS) weights[e] /= total;
  return weights;
}

export function capacity(s: GameState): number {
  const base = BASE_CAPACITY * (1 + sumDone(s, (id) => TECHS[id].capacity));
  return s.tipped.includes("nidhoggr") ? base * 0.4 : base;
}

export function absorbRate(s: GameState): number {
  return (
    s.humans.pop *
    ABSORB_PER_CAPITA *
    (1 + sumDone(s, (id) => TECHS[id].absorb))
  );
}

export function usable(s: GameState): number {
  return s.humans.usableOwn + s.humans.usableGiven;
}

/** 自力で生むビット/年。知識が多いほど、新しい知識も生まれやすい */
export function ownRate(s: GameState): number {
  const h = s.humans;
  const institutions = INSTITUTION_IDS.reduce(
    (sum, id) => sum + h.institutions[id] * INSTITUTIONS[id].output,
    0,
  );
  const base = h.pop * NATURAL_RESEARCH + institutions;
  const knowledge = 1 + Math.sqrt(usable(s) / KNOWLEDGE_SCALE);
  const winter = h.winter > 0 ? 0.3 : 1;
  const strife = s.tipped.includes("fenrir") ? 0.5 : 1;
  return base * knowledge * winter * strife;
}

export function knowledgeDecay(s: GameState): number {
  const fromTechs = sumDone(s, (id) => TECHS[id].retention);
  const fromCircles =
    s.humans.institutions.circle * INSTITUTIONS.circle.retention +
    s.humans.institutions.apprentice * INSTITUTIONS.apprentice.retention;
  const retention = Math.min(MAX_RETENTION, fromTechs + fromCircles);
  const winter = s.humans.winter > 0 ? 3 : 1;
  return KNOWLEDGE_DECAY * (1 - retention) * winter;
}

export function staffUsed(s: GameState): number {
  return INSTITUTION_IDS.reduce(
    (sum, id) => sum + s.humans.institutions[id] * INSTITUTIONS[id].staff,
    0,
  );
}

export function staffCap(s: GameState): number {
  return Math.floor(s.humans.pop * STAFF_SHARE);
}

export function seedCost(s: GameState, id: InstitutionId): number {
  return INSTITUTIONS[id].baseCost * COST_GROWTH ** s.humans.institutions[id];
}

export function techAvailable(s: GameState, id: TechId): boolean {
  return TECHS[id].requires.every((r) => s.humans.techs[r].done);
}
