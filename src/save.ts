import { SAVE_VERSION, type GameState } from "./core/state.ts";

const KEY = "mimameid.save";

// localStorage はプライベートモードなどで使えないことがある。そのときは保存せずに遊べるようにする。

export function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as GameState;
    return data.version === SAVE_VERSION ? data : null;
  } catch {
    return null;
  }
}

export function writeSave(s: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // 保存できない環境では何もしない
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 同上
  }
}
