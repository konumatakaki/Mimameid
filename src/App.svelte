<script lang="ts">
  import { game, resetGame } from "./game.svelte.ts";
  import EndingPanel from "./ui/EndingPanel.svelte";
  import Header from "./ui/Header.svelte";
  import LogPanel from "./ui/LogPanel.svelte";
  import ObservePanel from "./ui/ObservePanel.svelte";
  import SatellitePanel from "./ui/SatellitePanel.svelte";
  import ScanPanel from "./ui/ScanPanel.svelte";
  import SeedPanel from "./ui/SeedPanel.svelte";
  import SystemsPanel from "./ui/SystemsPanel.svelte";
  import TransmitPanel from "./ui/TransmitPanel.svelte";

  /** 何度か送信して反応が見えてから、種まきの欄を開く */
  const SEED_REVEAL_CLICKS = 3;

  function reset() {
    if (confirm("セーブを消して最初からやり直しますか？")) resetGame();
  }
</script>

<main>
  <Header />
  {#if game.phase === "ended"}
    <EndingPanel />
  {/if}
  <div class="grid">
    <div class="column">
      <SatellitePanel />
      {#if game.phase === "prologue"}
        <ScanPanel />
      {:else}
        <ObservePanel />
      {/if}
    </div>
    <div class="column">
      {#if game.phase === "chapter1"}
        <TransmitPanel />
        {#if game.stats.clicks >= SEED_REVEAL_CLICKS}<SeedPanel />{/if}
        <SystemsPanel />
      {/if}
      <LogPanel />
    </div>
  </div>
  <footer class="muted">
    MIMAMEID prototype · <button onclick={reset}>RESET</button>
  </footer>
</main>

<style>
  main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  @media (min-width: 800px) {
    .grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  .column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }
  footer {
    font-size: 12px;
  }
  footer button {
    font-size: 12px;
  }
</style>
