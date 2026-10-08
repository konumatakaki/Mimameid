// 人類の技術ツリー（第I章）。設計メモ §5.9.1
import type { ElementId } from "./elements.ts";

export type TechId =
  | "fire"
  | "tools"
  | "calendar"
  | "symbols"
  | "herding"
  | "agriculture"
  | "pottery"
  | "rotation"
  | "law"
  | "writing";

export type TechKind = "power" | "control" | "receptive";

export interface TechDef {
  name: string;
  label: string;
  kind: TechKind;
  /** 獲得に必要なビット */
  cost: number;
  requires: readonly TechId[];
  /** 1人あたりの活動規模への寄与 */
  power: number;
  /** 1人あたりの制御力への寄与。理解度を掛けてから効く */
  control: number;
  /** 人口上限の倍率への加算 */
  capacity: number;
  /** 受容力の倍率への加算 */
  absorb: number;
  /** 知識の劣化を抑える割合 */
  retention: number;
  /** この技術の力が押すティッピング要素 */
  element: ElementId;
  desc: string;
}

export const TECH_IDS = [
  "fire",
  "tools",
  "calendar",
  "symbols",
  "herding",
  "agriculture",
  "pottery",
  "rotation",
  "law",
  "writing",
] as const satisfies readonly TechId[];

/** 第I章の到達目標 */
export const GOAL_TECH: TechId = "writing";

export const TECHS: Record<TechId, TechDef> = {
  fire: {
    name: "火の管理",
    label: "FIRE",
    kind: "power",
    cost: 2000,
    requires: [],
    power: 0.3,
    control: 0.25,
    capacity: 0.3,
    absorb: 0,
    retention: 0,
    element: "nidhoggr",
    desc: "火を絶やさず運ぶ技術。森を焼いて拓くこともできる。",
  },
  tools: {
    name: "石器の改良",
    label: "TOOLS",
    kind: "power",
    cost: 2000,
    requires: [],
    power: 0.3,
    control: 0.25,
    capacity: 0.3,
    absorb: 0,
    retention: 0,
    element: "fenrir",
    desc: "刃を研ぎ出す技術。狩りにも争いにも使える。",
  },
  calendar: {
    name: "暦",
    label: "CALENDAR",
    kind: "control",
    cost: 4000,
    requires: [],
    power: 0.05,
    control: 0.5,
    capacity: 0.2,
    absorb: 0.5,
    retention: 0,
    element: "nidhoggr",
    desc: "夜空を横切る光（この衛星）の通過を数え、季節を知る。",
  },
  symbols: {
    name: "記号",
    label: "SYMBOLS",
    kind: "receptive",
    cost: 7500,
    requires: ["calendar"],
    power: 0,
    control: 0.2,
    capacity: 0,
    absorb: 1,
    retention: 0.3,
    element: "fenrir",
    desc: "刻み目で数や出来事を残す。受け取れる情報が増える。",
  },
  herding: {
    name: "牧畜",
    label: "HERDING",
    kind: "power",
    cost: 12500,
    requires: ["tools"],
    power: 0.5,
    control: 0.4,
    capacity: 1,
    absorb: 0,
    retention: 0,
    element: "nidhoggr",
    desc: "獣を囲って増やす。草地を食い尽くすこともある。",
  },
  agriculture: {
    name: "農耕",
    label: "AGRICULTURE",
    kind: "power",
    cost: 20000,
    requires: ["tools", "calendar"],
    power: 0.8,
    control: 0.6,
    capacity: 2,
    absorb: 0,
    retention: 0,
    element: "nidhoggr",
    desc: "種をまき、収穫する。人は増えるが、土は痩せていく。",
  },
  pottery: {
    name: "土器",
    label: "POTTERY",
    kind: "power",
    cost: 12500,
    requires: ["fire"],
    power: 0.3,
    control: 0.25,
    capacity: 0.5,
    absorb: 0,
    retention: 0,
    element: "fenrir",
    desc: "蓄えを保つ器。蓄えは奪い合いの種にもなる。",
  },
  rotation: {
    name: "輪作",
    label: "CROP ROTATION",
    kind: "control",
    cost: 30000,
    requires: ["agriculture"],
    power: 0.2,
    control: 0.8,
    capacity: 0.5,
    absorb: 0,
    retention: 0,
    element: "nidhoggr",
    desc: "畑を休ませながら使い回す。土の痩せ方を抑える。",
  },
  law: {
    name: "慣習法",
    label: "CUSTOMARY LAW",
    kind: "control",
    cost: 40000,
    requires: ["symbols", "agriculture"],
    power: 0,
    control: 0.9,
    capacity: 0,
    absorb: 0,
    retention: 0.1,
    element: "fenrir",
    desc: "争いを収める決まりごと。自分たちで決めたものほどよく守られる。",
  },
  writing: {
    name: "文字",
    label: "WRITING",
    kind: "receptive",
    cost: 100000,
    requires: ["symbols", "pottery", "law"],
    power: 0.1,
    control: 0.4,
    capacity: 0,
    absorb: 3,
    retention: 0.5,
    element: "fenrir",
    desc: "言葉を形にして残す。知識が世代を越えて残りやすくなる。",
  },
};
