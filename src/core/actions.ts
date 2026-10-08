// プレイヤーの操作。can* は画面のボタンの有効・無効にも使う。
import { INSTITUTIONS, type InstitutionId } from "../content/institutions.ts";
import { CONTACT, RESPONSES, TEXT } from "../content/text.ts";
import { UPGRADES, type UpgradeId } from "../content/upgrades.ts";
import * as R from "./rules.ts";
import { addDebt, fallAsleep, wakeUp } from "./sim.ts";
import { addLog, type GameState } from "./state.ts";

function active(s: GameState): boolean {
  return !s.sleeping && s.phase !== "ended";
}

// --- 標準通信確立手続き（序章） ---

function contactStep(s: GameState, step: number, cost: number): boolean {
  return (
    active(s) &&
    s.phase === "prologue" &&
    s.contact.step === step &&
    s.satellite.energy >= cost
  );
}

export function canScan(s: GameState): boolean {
  return contactStep(s, 0, R.SCAN_COST);
}

export function scan(s: GameState): void {
  if (!canScan(s)) return;
  s.satellite.energy -= R.SCAN_COST;
  s.contact.step = 1;
  for (const line of CONTACT.scanLog) addLog(s, line, "observe");
}

export function canBeacon(s: GameState): boolean {
  return contactStep(s, 1, R.BEACON_COST);
}

export function beacon(s: GameState): void {
  if (!canBeacon(s)) return;
  s.satellite.energy -= R.BEACON_COST;
  s.contact.beacons += 1;
  addLog(s, CONTACT.beaconLog(s.contact.beacons, R.BEACONS_NEEDED));
  if (s.contact.beacons >= R.BEACONS_NEEDED) {
    s.contact.step = 2;
    s.contact.responseAt = s.year + R.RESPONSE_DELAY;
    addLog(s, CONTACT.waitLog);
  }
}

export function canHandshake(s: GameState): boolean {
  return contactStep(s, 3, R.HANDSHAKE_COST);
}

export function handshake(s: GameState): void {
  if (!canHandshake(s)) return;
  s.satellite.energy -= R.HANDSHAKE_COST;
  s.phase = "chapter1";
  for (const line of CONTACT.handshakeLog) addLog(s, line);
}

// --- 第I章 ---

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
  // 集落は受け取れた分だけ、きれいに応答を返す
  const backlog = s.humans.latent / R.absorbRate(s);
  const response = RESPONSES.find((r) => backlog <= r.backlogYears)!;
  addLog(s, response.text, "response");
  if (s.stats.clicks === R.SEED_REVEAL_CLICKS) addLog(s, TEXT.seedHint);
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
  addLog(s, TEXT.seeded(INSTITUTIONS[id].name));
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
  addLog(s, TEXT.upgraded(UPGRADES[id].name));
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
