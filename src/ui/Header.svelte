<script lang="ts">
  import { formatYear } from "../core/format.ts";
  import { game } from "../game.svelte.ts";

  const chapter = $derived(game.phase === "prologue" ? "PROLOGUE" : "CH.I");
  const mode = $derived(
    game.safeMode ? "SAFE MODE" : game.sleeping ? "SLEEP" : "AWAKE",
  );
</script>

<header>
  <h1>MIMIR // OPERATOR CONSOLE</h1>
  <p>
    {chapter} · {formatYear(game.year)} ·
    <span class:warning={game.sleeping}>{mode}</span>
  </p>
</header>

<style>
  header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 4px 16px;
    border-bottom: 1px solid var(--line);
    padding-bottom: 8px;
  }
  h1 {
    margin: 0;
    font-size: 16px;
    letter-spacing: 0.1em;
    color: var(--accent);
  }
  p {
    margin: 0;
  }
</style>
