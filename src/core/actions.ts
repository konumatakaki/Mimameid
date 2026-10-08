// プレイヤーの操作。can* は画面のボタンの有効・無効にも使う。
import { INSTITUTIONS, type InstitutionId } from "../content/institutions.ts";
import { TEXT, SCAN_LOG } from "../content/text.ts";
import { UPGRADES, type UpgradeId } from "../content/upgrades.ts";
import * as R from "./rules.ts";
import { addDebt, fallAsleep, wakeUp } from "./sim.ts";
import { addLog, type GameState } from "./state.ts";

function active(s: GameState): boolean {
  return !s.sleeping && s.phase !== "ended";
}

export function canScan(s: GameState): boolean {
  return (
    active(s) && s.phase === "prologue" && s.satellite.energy >= R.SCAN_COST
  );
}

export function scan(s: GameState): void {
  if (!canScan(s)) return;
  s.satellite.energy -= R.SCAN_COST;
  s.phase = "chapter1";
  for (const line of SCAN_LOG) addLog(s, line);
}

export function canTransmit(s: GameState): boolean {
  return (
    active(s) && s.phase === "chapter1" && s.satellite.energy >= R.TRANSMIT_COST
  );
}

export function transmit(s: GameState): void {
  if (!canTransmit(s)) return;
  s.satellite.energy -= R.TRANSMIT_COST;
  s.humans.latent += R.bandwidth(s);
  s.stats.clicks += 1;
  addDebt(s, R.TRANSMIT_DEBT * R.debtFactor(s));
}

export function seedLocked(s: GameState, id: InstitutionId): boolean {
  return !INSTITUTIONS[id].requires.every((t) => s.humans.techs[t].done);
}

export function canSeed(s: GameState, id: InstitutionId): boolean {
  return (
    active(s) &&
    s.phase === "chapter1" &&
    !seedLocked(s, id) &&
    s.satellite.energy >= R.seedCost(s, id) &&
    R.staffUsed(s) + INSTITUTIONS[id].staff <= R.staffCap(s)
  );
}

export function seed(s: GameState, id: InstitutionId): void {
  if (!canSeed(s, id)) return;
  s.satellite.energy -= R.seedCost(s, id);
  s.humans.institutions[id] += 1;
  if (Object.values(s.humans.institutions).reduce((a, b) => a + b) === 1) {
    addLog(s, TEXT.firstSeed);
  }
  addDebt(s, R.SEED_DEBT * R.debtFactor(s));
}

export function canUpgrade(s: GameState, id: UpgradeId): boolean {
  return (
    active(s) && !R.hasUpgrade(s, id) && s.satellite.energy >= UPGRADES[id].cost
  );
}

export function upgrade(s: GameState, id: UpgradeId): void {
  if (!canUpgrade(s, id)) return;
  s.satellite.energy -= UPGRADES[id].cost;
  s.satellite.upgrades.push(id);
  addDebt(s, R.UPGRADE_DEBT * R.debtFactor(s));
}

export function setCollecting(s: GameState, on: boolean): void {
  if (!R.hasUpgrade(s, "collector")) return;
  s.satellite.collecting = on;
}

export function canReplicate(s: GameState): boolean {
  const cost = R.replicateCost(s);
  return (
    active(s) &&
    R.hasUpgrade(s, "collector") &&
    s.satellite.mass >= cost.mass &&
    s.satellite.energy >= cost.energy
  );
}

export function replicate(s: GameState): void {
  if (!canReplicate(s)) return;
  const cost = R.replicateCost(s);
  s.satellite.mass -= cost.mass;
  s.satellite.energy -= cost.energy;
  s.satellite.units += 1;
  addLog(s, TEXT.replicated(s.satellite.units));
}

export function setSleep(s: GameState, on: boolean): void {
  if (s.phase === "ended") return;
  if (on) fallAsleep(s);
  else wakeUp(s);
}
