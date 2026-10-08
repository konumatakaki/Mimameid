// 集落の観測報告。状態から暮らしぶりと危険の兆候を文章にする。
import { ELEMENT_IDS, ELEMENTS } from "../content/elements.ts";
import { INSTITUTION_IDS, INSTITUTIONS } from "../content/institutions.ts";
import { TECH_IDS, TECHS } from "../content/techs.ts";
import type { GameState } from "./state.ts";

const SIZES = [
  { below: 60, name: "小さな集団" },
  { below: 150, name: "集落" },
  { below: 300, name: "大きな集落" },
  { below: Infinity, name: "谷じゅうに広がる集落" },
];

export function describeLife(s: GameState): string[] {
  const h = s.humans;
  const size = SIZES.find((x) => h.pop < x.below)!.name;
  const lines = [
    `谷の${size}、約${Math.floor(h.pop)}人。旧時代のシェルター跡を拠点にしている。`,
  ];
  for (const id of TECH_IDS) if (h.techs[id].done) lines.push(TECHS[id].sign);
  for (const id of INSTITUTION_IDS) {
    const n = h.institutions[id];
    if (n > 0) lines.push(INSTITUTIONS[id].sign(n));
  }
  return lines;
}

export function describeSigns(s: GameState): string[] {
  const signs: string[] = [];
  if (s.humans.winter > 0) signs.push("長い冬の中にある。夏が来ない。");
  for (const e of ELEMENT_IDS) {
    if (s.tipped.includes(e)) signs.push(ELEMENTS[e].tipped);
    else if (s.stages[e] > 0) signs.push(ELEMENTS[e].signs[s.stages[e] - 1]);
  }
  return signs;
}
