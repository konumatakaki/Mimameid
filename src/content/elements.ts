// ティッピング要素。名前は旧企業の予測モデル HEIMDALL の指標名。
// 第I章（谷）では2つだけを扱う。

export type ElementId = "nidhoggr" | "fenrir";

export interface ElementDef {
  label: string;
  meaning: string;
  /** 臨界負荷が STAGES の各段階を越えたときの観測報告 */
  signs: readonly [string, string, string];
  tipped: string;
}

export const ELEMENT_IDS: readonly ElementId[] = ["nidhoggr", "fenrir"];

export const STAGES = [0.4, 0.65, 0.85] as const;

export const ELEMENTS: Record<ElementId, ElementDef> = {
  nidhoggr: {
    label: "NÍÐHÖGGR",
    meaning: "土壌・生態系の劣化",
    signs: [
      "谷の斜面で表土の流出が見られる。",
      "獲物の群れが谷に戻らなくなった。",
      "泉が濁り、収穫が年ごとに細っている。",
    ],
    tipped: "谷の土が死んだ。草が根を張らない。",
  },
  fenrir: {
    label: "FENRIR",
    meaning: "社会・制度の暴走",
    signs: [
      "集落の周りに柵が築かれはじめた。",
      "倉をめぐる争いの痕跡がある。",
      "集団が二つに割れ、互いを避けている。",
    ],
    tipped: "柵が焼かれた。争いが谷を覆っている。",
  },
};
