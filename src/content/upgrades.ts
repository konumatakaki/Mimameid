// 衛星の強化（第I章の分）。設計メモ §5.9.2

export type UpgradeId = "optics" | "battery" | "radiator" | "collector";

export interface UpgradeDef {
  name: string;
  label: string;
  cost: number;
  desc: string;
}

export const UPGRADE_IDS = [
  "collector",
  "battery",
  "optics",
  "radiator",
] as const satisfies readonly UpgradeId[];

export const UPGRADES: Record<UpgradeId, UpgradeDef> = {
  collector: {
    name: "残骸回収",
    label: "DEBRIS COLLECTOR",
    cost: 100,
    desc: "軌道上の残骸を回収できるようにする。回収中は電力を 0.5 kW 使う。回収した質量は自己複製に使う。",
  },
  battery: {
    name: "蓄電セル増設",
    label: "CELL BANK",
    cost: 120,
    desc: "蓄電容量を1機あたり +100 EN する。",
  },
  optics: {
    name: "補償光学",
    label: "ADAPTIVE OPTICS",
    cost: 150,
    desc: "光信号の解像度を上げる。1回の送信量が4倍になる。",
  },
  radiator: {
    name: "放熱板",
    label: "RADIATOR",
    cost: 150,
    desc: "送信・種まき・強化で溜まる負債を40%減らす。",
  },
};
