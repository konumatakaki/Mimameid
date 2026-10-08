// 制度（インクリメンタルの「生産設備」）。設計メモ §5.5
import type { TechId } from "./techs.ts";

export type InstitutionId = "circle" | "workshop" | "apprentice";

export interface InstitutionDef {
  name: string;
  label: string;
  /** 1つ目の種まきに必要なエネルギー。数が増えるたびに COST_GROWTH 倍 */
  baseCost: number;
  /** 1つあたりに必要な人手 */
  staff: number;
  /** 1つあたりが自力で生むビット/年 */
  output: number;
  /** 1つあたりの知識の劣化を抑える割合 */
  retention: number;
  requires: readonly TechId[];
  desc: string;
  /** 集落の観測報告に出る様子 */
  sign: (count: number) => string;
}

export const INSTITUTION_IDS = [
  "circle",
  "workshop",
  "apprentice",
] as const satisfies readonly InstitutionId[];

export const COST_GROWTH = 1.5;

export const INSTITUTIONS: Record<InstitutionId, InstitutionDef> = {
  circle: {
    name: "語り部の輪",
    label: "STORY CIRCLE",
    baseCost: 10,
    staff: 4,
    output: 2,
    retention: 0.03,
    requires: [],
    desc: "旧世界の話と暮らしの知恵を、物語にして口伝えする集まりの型を送る。知識の劣化も少し抑える。",
    sign: (n) => `夜ごとに語り部の火が${n}つ灯る。`,
  },
  workshop: {
    name: "修繕小屋",
    label: "REPAIR SHED",
    baseCost: 40,
    staff: 8,
    output: 6,
    retention: 0,
    requires: ["tools"],
    desc: "廃材を直して使い回し、工夫を試す場の型を送る。",
    sign: (n) => `修繕小屋の煙が${n}か所から上がる。`,
  },
  apprentice: {
    name: "徒弟制",
    label: "APPRENTICESHIP",
    baseCost: 120,
    staff: 12,
    output: 15,
    retention: 0.02,
    requires: ["symbols"],
    desc: "技を師から弟子へ受け渡す仕組みの型を送る。",
    sign: (n) => `師について技を学ぶ若者たちがいる（${n}組）。`,
  },
};
