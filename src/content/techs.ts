// 人類の技術ツリー（第I章）。設計メモ §5.9.1
import type { ElementId } from "./elements.ts";

export type TechId =
  | "fire"
  | "tools"
  | "scavenging"
  | "smithing"
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
  /** 獲得済みのとき、集落の観測報告に出る様子 */
  sign: string;
}

export const TECH_IDS = [
  "fire",
  "tools",
  "scavenging",
  "smithing",
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

/** 通信を確立した時点で、集落が自力で身につけている技術 */
export const INITIAL_TECHS: readonly TechId[] = [
  "fire",
  "tools",
  "calendar",
  "agriculture",
];

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
    sign: "焚き火が絶えない。",
  },
  tools: {
    name: "廃材の道具",
    label: "SCRAP TOOLS",
    kind: "power",
    cost: 2000,
    requires: [],
    power: 0.3,
    control: 0.25,
    capacity: 0.3,
    absorb: 0,
    retention: 0,
    element: "fenrir",
    desc: "廃墟の金属やガラスを削って刃にする。狩りにも争いにも使える。",
    sign: "廃材を削った刃や鍬を使っている。",
  },
  scavenging: {
    name: "廃墟あさり",
    label: "SCAVENGING",
    kind: "power",
    cost: 1000,
    requires: [],
    power: 0.5,
    control: 0.3,
    capacity: 0.5,
    absorb: 0,
    retention: 0,
    element: "fenrir",
    desc: "廃墟から使えるものを掘り出す。手っ取り早いが、取り合いになる。",
    sign: "廃墟を掘り返す一団がいる。",
  },
  smithing: {
    name: "鉄くず鍛冶",
    label: "SCRAP SMITHING",
    kind: "power",
    cost: 9000,
    requires: ["fire", "scavenging"],
    power: 0.6,
    control: 0.4,
    capacity: 0.3,
    absorb: 0,
    retention: 0,
    element: "nidhoggr",
    desc: "鉄くずを炭火で打ち直す。炭を焼くために森が削られる。",
    sign: "炭焼きの煙が上がり、鉄を打つ音がする。",
  },
  calendar: {
    name: "天文観測",
    label: "ASTRONOMY",
    kind: "control",
    cost: 4000,
    requires: [],
    power: 0.05,
    control: 0.5,
    capacity: 0.2,
    absorb: 0.5,
    retention: 0,
    element: "nidhoggr",
    desc: "星と、動く星（この衛星）の通過を数えて暦にする。光の信号を読み取る土台になる。",
    sign: "夜ごとに見張りが空を見上げ、動く星の通過を数えている。",
  },
  symbols: {
    name: "記号",
    label: "SYMBOLS",
    kind: "receptive",
    cost: 3000,
    requires: ["calendar"],
    power: 0,
    control: 0.2,
    capacity: 0,
    absorb: 1,
    retention: 0.3,
    element: "fenrir",
    desc: "刻み目で数や出来事を残す。受け取れる情報が増える。",
    sign: "壁や岩に刻み目の記号が増えている。",
  },
  herding: {
    name: "牧畜",
    label: "HERDING",
    kind: "power",
    cost: 6000,
    requires: ["tools"],
    power: 0.5,
    control: 0.4,
    capacity: 1,
    absorb: 0,
    retention: 0,
    element: "nidhoggr",
    desc: "獣を囲って増やす。草地を食い尽くすこともある。",
    sign: "囲いの中で獣を飼っている。",
  },
  agriculture: {
    name: "農耕",
    label: "AGRICULTURE",
    kind: "power",
    cost: 20000,
    requires: ["tools", "calendar"],
    power: 0.8,
    control: 0.45,
    capacity: 2,
    absorb: 0,
    retention: 0,
    element: "nidhoggr",
    desc: "種子庫に残された種で畑を作る。人は増えるが、土は痩せていく。",
    sign: "シェルター跡の周りに畑が広がる。",
  },
  pottery: {
    name: "土器",
    label: "POTTERY",
    kind: "power",
    cost: 6000,
    requires: ["fire"],
    power: 0.3,
    control: 0.25,
    capacity: 0.5,
    absorb: 0,
    retention: 0,
    element: "fenrir",
    desc: "蓄えを保つ器。蓄えは奪い合いの種にもなる。",
    sign: "土器に蓄えを貯めている。",
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
    sign: "畑の一部を休ませている。",
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
    sign: "集まって揉め事を裁く場がある。",
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
    sign: "記号を連ねて言葉を書き残している。",
  },
};
