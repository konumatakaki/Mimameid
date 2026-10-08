<script lang="ts">
  import { SEED_REVEAL_CLICKS } from "./core/rules.ts";
  import { game, resetGame } from "./game.svelte.ts";
  import ContactPanel from "./ui/ContactPanel.svelte";
  import Directive from "./ui/Directive.svelte";
  import EndingPanel from "./ui/EndingPanel.svelte";
  import Header from "./ui/Header.svelte";
  import KnowledgePanel from "./ui/KnowledgePanel.svelte";
  import LogPanel from "./ui/LogPanel.svelte";
  import ObservePanel from "./ui/ObservePanel.svelte";
  import SatellitePanel from "./ui/SatellitePanel.svelte";
  import SeedPanel from "./ui/SeedPanel.svelte";
  import SystemsPanel from "./ui/SystemsPanel.svelte";
  import TransmitPanel from "./ui/TransmitPanel.svelte";

  function reset() {
    if (confirm("セーブを消して最初からやり直しますか？")) resetGame();
  }
</script>

<main>
  <Header />
  <Directive />
  {#if game.phase === "ended"}
    <EndingPanel />
  {/if}
  <LogPanel />
  <div class="grid">
    <!-- 左: 地上（観測） / 右: 衛星（操作） -->
    <div class="column">
      <ObservePanel />
      {#if game.phase !== "prologue"}<KnowledgePanel />{/if}
    </div>
    <div class="column">
      <SatellitePanel />
      {#if game.phase === "prologue"}
        <ContactPanel />
      {:else if game.phase === "chapter1"}
        <TransmitPanel />
        {#if game.stats.clicks >= SEED_REVEAL_CLICKS}<SeedPanel />{/if}
        <SystemsPanel />
      {/if}
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
