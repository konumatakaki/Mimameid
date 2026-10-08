// 画面とゲーム本体（core）のつなぎ。状態を Svelte のリアクティブな値として持ち、一定間隔で進める。
import { advance } from "./core/sim.ts";
import { createState, type GameState } from "./core/state.ts";
import { clearSave, loadSave, writeSave } from "./save.ts";

const TICK_MS = 100;
const SAVE_MS = 5000;
/** タブが裏にあった間の経過はここで打ち切る（オフライン進行は未実装） */
const MAX_TICK_SECONDS = 1;

function newGame(): GameState {
  return createState(Math.floor(Math.random() * 2 ** 32));
}

export const game: GameState = $state(loadSave() ?? newGame());

export function resetGame(): void {
  clearSave();
  Object.assign(game, newGame());
}

let last = performance.now();
setInterval(() => {
  const now = performance.now();
  advance(game, Math.min(MAX_TICK_SECONDS, (now - last) / 1000));
  last = now;
}, TICK_MS);

setInterval(() => writeSave(game), SAVE_MS);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) writeSave(game);
});
