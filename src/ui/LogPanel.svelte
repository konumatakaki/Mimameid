<script lang="ts">
  import { formatYear } from "../core/format.ts";
  import { game } from "../game.svelte.ts";
  import Panel from "./Panel.svelte";

  const SHOWN = 40;
  const entries = $derived(game.log.slice(-SHOWN).reverse());
</script>

<Panel title="LOG">
  <ol>
    {#each entries as entry, i (game.log.length - i)}
      <li>
        <span class="muted">{formatYear(entry.year)}</span>
        <span>{entry.text}</span>
      </li>
    {/each}
  </ol>
</Panel>

<style>
  ol {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 360px;
    overflow-y: auto;
  }
  li {
    display: flex;
    gap: 12px;
  }
  li span:first-child {
    flex: none;
  }
</style>
