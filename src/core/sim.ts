// 時間を進める。画面に依存しない純粋な処理で、同じ状態と経過時間なら必ず同じ結果になる。
import { ELEMENT_IDS, ELEMENTS, STAGES } from "../content/elements.ts";
import { INSTITUTION_IDS, INSTITUTIONS } from "../content/institutions.ts";
import { GOAL_TECH, TECH_IDS, TECHS, type TechId } from "../content/techs.ts";
import { ENDING, TEXT } from "../content/text.ts";
import { nextRandom } from "./rng.ts";
import * as R from "./rules.ts";
import { addLog, type GameState } from "./state.ts";

const MAX_STEP = 0.25; // 年

/** 実時間の経過秒ぶん、ゲームを進める */
export function advance(s: GameState, realSeconds: number): void {
  let years = realSeconds * (s.sleeping ? R.SLEEP_SPEED : R.AWAKE_SPEED);
  while (years > 0 && s.phase !== "ended") {
    const dt = Math.min(MAX_STEP, years);
    step(s, dt);
    years -= dt;
  }
}

function step(s: GameState, dt: number): void {
  s.year += dt;
  stepSatellite(s, dt);
  stepHumans(s, dt);
  stepWinter(s, dt);
  stepTipping(s, dt);
  if (s.humans.techs[GOAL_TECH].done) endChapter(s, "writing");
  sampleHistory(s);
}

// --- 衛星 ---

function stepSatellite(s: GameState, dt: number): void {
  const sat = s.satellite;
  const spare = Math.max(0, R.power(s) - R.powerDraw(s));
  sat.energy = Math.min(
    R.batteryCap(s),
    sat.energy + spare * R.CHARGE_PER_KW * dt,
  );
  if (sat.collecting) sat.mass += R.COLLECT_RATE * dt;

  if (s.sleeping) {
    sat.debt = Math.max(0, sat.debt - R.SLEEP_RECOVERY * dt);
    if (s.safeMode && sat.debt <= R.SAFE_MODE_EXIT) {
      s.safeMode = false;
      wakeUp(s);
      addLog(s, TEXT.safeModeExit);
    }
  } else {
    addDebt(s, R.AWAKE_DEBT * sat.units * dt);
  }
  if (sat.debt > R.ARCHIVE_RISK) sat.archive *= 1 - R.ARCHIVE_LOSS * dt;
}

export function addDebt(s: GameState, amount: number): void {
  s.satellite.debt = Math.min(1, s.satellite.debt + amount);
  if (s.satellite.debt >= 1 && !s.safeMode) {
    s.safeMode = true;
    addLog(s, TEXT.safeMode);
    fallAsleep(s);
  }
}

// --- スリープ ---

export function fallAsleep(s: GameState): void {
  if (s.sleeping) return;
  s.sleeping = true;
  s.stats.sleeps += 1;
  s.sleepSnapshot = {
    year: s.year,
    pop: s.humans.pop,
    usable: R.usable(s),
    techs: R.doneTechs(s),
    institutions: totalInstitutions(s),
    stages: { ...s.stages },
    tipped: [...s.tipped],
    winters: s.stats.winters,
  };
  if (!s.safeMode) addLog(s, TEXT.sleep);
}

export function wakeUp(s: GameState): void {
  if (!s.sleeping || s.safeMode) return;
  s.sleeping = false;
  const snap = s.sleepSnapshot;
  s.sleepSnapshot = null;
  if (!snap || s.phase === "prologue") return;

  // スリープ中は観測できないので、起動時に差分だけを報告する
  const years = Math.floor(s.year - snap.year);
  addLog(s, `起動。スリープ中の経過: ${years}年。`);
  addLog(
    s,
    `人口 ${Math.floor(snap.pop)} → ${Math.floor(s.humans.pop)}。活用可能ビット ${Math.floor(snap.usable)} → ${Math.floor(R.usable(s))}。`,
  );
  const learned = R.doneTechs(s).filter((id) => !snap.techs.includes(id));
  if (learned.length > 0) {
    const names = learned.map((id) => TECHS[id].name).join("、");
    addLog(s, `新たに観測された技術: ${names}。`);
  }
  const winters = s.stats.winters - snap.winters;
  if (winters > 0) addLog(s, `フィンブルの冬の痕跡: ${winters}回。`);
  const lost = snap.institutions - totalInstitutions(s);
  if (lost > 0) addLog(s, `放棄された制度: ${lost}。`);
  for (const e of ELEMENT_IDS) {
    if (s.tipped.includes(e) && !snap.tipped.includes(e)) {
      addLog(s, ELEMENTS[e].tipped);
    } else if (s.stages[e] > snap.stages[e]) {
      addLog(s, ELEMENTS[e].signs[s.stages[e] - 1]);
    }
  }
}

function totalInstitutions(s: GameState): number {
  return INSTITUTION_IDS.reduce(
    (sum, id) => sum + s.humans.institutions[id],
    0,
  );
}

// --- 人類 ---

function stepHumans(s: GameState, dt: number): void {
  const h = s.humans;
  const winterLoss = h.winter > 0 ? R.WINTER_DECLINE * h.pop : 0;
  const growth = R.GROWTH * h.pop * (1 - h.pop / R.capacity(s));
  h.pop = Math.max(R.MIN_POP, h.pop + (growth - winterLoss) * dt);
  abandonInstitutions(s);

  const absorbed = Math.min(h.latent, R.absorbRate(s) * dt);
  h.latent -= absorbed;
  h.latent *= 1 - R.LATENT_DECAY * (h.winter > 0 ? 3 : 1) * dt;

  const own = R.ownRate(s) * dt;
  const keep = 1 - R.knowledgeDecay(s) * dt;
  h.usableOwn = (h.usableOwn + own) * keep;
  h.usableGiven = (h.usableGiven + absorbed) * keep;
  s.stats.ownBits += own;
  s.stats.givenBits += absorbed;
  research(s, own, absorbed);
}

/** 人手が足りなくなった制度を、人手の大きいものから放棄する */
function abandonInstitutions(s: GameState): void {
  const h = s.humans;
  for (const id of [...INSTITUTION_IDS].reverse()) {
    while (h.institutions[id] > 0 && R.staffUsed(s) > R.staffCap(s)) {
      h.institutions[id] -= 1;
      if (!s.sleeping) addLog(s, TEXT.abandoned(INSTITUTIONS[id].name));
    }
  }
}

function research(s: GameState, own: number, given: number): void {
  const h = s.humans;

  // 授与されたまま理解されていない技術を、自力のビットの一部で消化する
  const undigested = TECH_IDS.find(
    (id) => h.techs[id].done && h.techs[id].own < TECHS[id].cost,
  );
  if (undigested) {
    const digest = own * R.DIGEST_SHARE;
    const p = h.techs[undigested];
    p.own = Math.min(TECHS[undigested].cost, p.own + digest);
    own -= digest;
  }

  while (own + given > 0) {
    h.target ??= pickTarget(s);
    if (!h.target) return;
    const p = h.techs[h.target];
    const need = TECHS[h.target].cost - p.own - p.given;
    const total = own + given;
    if (total < need) {
      p.own += own;
      p.given += given;
      return;
    }
    const f = need / total;
    p.own += own * f;
    p.given += given * f;
    own -= own * f;
    given -= given * f;
    p.done = true;
    if (!s.sleeping) {
      const u = Math.round(R.understanding(s, h.target) * 100);
      addLog(
        s,
        `観測: 集団が「${TECHS[h.target].name}」を獲得した。理解度 ${u}%。`,
      );
    }
    h.target = null;
  }
}

const KIND_WEIGHT = { power: 3, control: 1, receptive: 1.5 } as const;

/** 次に研究する技術は人類が選ぶ。差し迫った力を求めがち */
function pickTarget(s: GameState): TechId | null {
  const options = TECH_IDS.filter(
    (id) => !s.humans.techs[id].done && R.techAvailable(s, id),
  );
  if (options.length === 0) return null;
  const weights = options.map((id) => KIND_WEIGHT[TECHS[id].kind]);
  let roll = nextRandom(s) * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < options.length; i++) {
    roll -= weights[i];
    if (roll < 0) return options[i];
  }
  return options[options.length - 1];
}

// --- フィンブルの冬 ---

function stepWinter(s: GameState, dt: number): void {
  const h = s.humans;
  if (h.winter > 0) {
    h.winter = Math.max(0, h.winter - dt);
    if (h.winter === 0 && !s.sleeping) addLog(s, TEXT.winterEnd);
    return;
  }
  if (nextRandom(s) < 1 - Math.exp(-R.WINTER_RATE * dt)) {
    h.winter = R.WINTER_MIN + nextRandom(s) * R.WINTER_SPAN;
    h.pop = Math.max(R.MIN_POP, h.pop * R.WINTER_SHOCK);
    s.stats.winters += 1;
    if (!s.sleeping) addLog(s, TEXT.winterStart);
  }
}

// --- ティッピング ---

function stepTipping(s: GameState, dt: number): void {
  const overshoot = Math.max(0, R.activity(s) - R.control(s));
  const scale = s.humans.pop / R.PRESSURE_REF_POP;
  const shares = R.elementShares(s);
  const cascade = s.tipped.length > 0 ? R.CASCADE : 0;

  for (const e of ELEMENT_IDS) {
    if (s.tipped.includes(e)) continue;
    const push = R.STRESS_GAIN * overshoot * shares[e] * scale + cascade;
    s.stress[e] = Math.max(
      0,
      s.stress[e] + (push - R.STRESS_RECOVERY * s.stress[e]) * dt,
    );

    const stage = STAGES.filter((x) => s.stress[e] >= x).length;
    if (stage > s.stages[e] && !s.sleeping) {
      addLog(s, ELEMENTS[e].signs[stage - 1]);
    }
    s.stages[e] = stage;

    if (s.stress[e] >= 1) {
      s.tipped.push(e);
      if (!s.sleeping) addLog(s, ELEMENTS[e].tipped);
    }
  }
  if (s.tipped.length === ELEMENT_IDS.length) endChapter(s, "ragnarok");
}

// --- 章の終わりと記録 ---

function endChapter(s: GameState, ending: "ragnarok" | "writing"): void {
  if (s.phase === "ended") return;
  s.safeMode = false;
  wakeUp(s);
  s.phase = "ended";
  s.ending = ending;
  for (const line of ENDING[ending].lines) addLog(s, line);
  sampleHistory(s, true);
}

function sampleHistory(s: GameState, force = false): void {
  const last = s.history.at(-1);
  if (!force && last && s.year - last.year < R.HISTORY_INTERVAL) return;
  s.history.push({
    year: s.year,
    pop: s.humans.pop,
    usable: R.usable(s),
    activity: R.activity(s),
    control: R.control(s),
    controlIfOwn: R.controlIfOwn(s),
    stress: { ...s.stress },
  });
}
