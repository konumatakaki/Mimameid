<script lang="ts">
  import { ELEMENT_IDS, ELEMENTS } from "../content/elements.ts";
  import { ENDING } from "../content/text.ts";
  import { formatBits, formatInt, formatPercent } from "../core/format.ts";
  import * as R from "../core/rules.ts";
  import { game, resetGame } from "../game.svelte.ts";
  import LineChart from "./LineChart.svelte";
  import Panel from "./Panel.svelte";
  import Stat from "./Stat.svelte";

  const ending = $derived(ENDING[game.ending ?? "writing"]);
  const history = $derived(game.history);
  const years = $derived(history.map((h) => h.year));
  const total = $derived(game.stats.ownBits + game.stats.givenBits);
  const peakPop = $derived(Math.max(...history.map((h) => h.pop)));

  function newGame() {
    if (confirm("最初からやり直しますか？")) resetGame();
  }
</script>

<Panel title={ending.title}>
  {#each ending.lines as line (line)}<p>{line}</p>{/each}

  <Stat label="ELAPSED">{Math.floor(game.year)} 年</Stat>
  <Stat label="PEAK POPULATION">{formatInt(peakPop)}</Stat>
  <Stat label="USABLE">{formatBits(R.usable(game))}</Stat>
  <Stat label="GRANTED SHARE">
    {formatPercent(total > 0 ? game.stats.givenBits / total : 0)}
    <span class="muted">（人類が得た知識のうち、衛星が授与した割合）</span>
  </Stat>

  <LineChart
    title="ACTIVITY / CONTROL（1人あたり）"
    {years}
    series={[
      {
        label: "ACTIVITY",
        color: "var(--series-1)",
        values: history.map((h) => h.activity),
      },
      {
        label: "CONTROL",
        color: "var(--series-2)",
        values: history.map((h) => h.control),
      },
      {
        label: "CONTROL IF OWN",
        color: "var(--series-3)",
        values: history.map((h) => h.controlIfOwn),
      },
    ]}
  />
  <p class="muted note">
    ACTIVITY が CONTROL を上回っている間、臨界負荷が溜まる。CONTROL IF OWN
    は、授与された知識もすべて自力で理解していた場合の制御力。CONTROL
    との差が、授与による制御の欠損。
  </p>

  <LineChart
    title="臨界負荷（HEIMDALL による再構成）"
    {years}
    threshold={{ value: 1, label: "TIPPING" }}
    series={ELEMENT_IDS.map((e, i) => ({
      label: ELEMENTS[e].label,
      color: `var(--series-${i + 1})`,
      values: history.map((h) => h.stress[e]),
    }))}
  />

  <p class="end">— 試作はここまで —</p>
  <button onclick={newGame}>NEW GAME</button>
</Panel>

<style>
  p {
    margin: 0 0 8px;
  }
  .note {
    font-size: 12px;
  }
  .end {
    margin-top: 16px;
  }
</style>
