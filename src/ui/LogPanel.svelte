<script lang="ts">
  import { formatYear } from "../core/format.ts";
  import type { LogKind } from "../core/state.ts";
  import { game } from "../game.svelte.ts";
  import Panel from "./Panel.svelte";

  const SHOWN = 40;
  /** これより古い行は薄くする */
  const RECENT = 6;
  const TAG: Record<LogKind, string> = {
    system: "SYS",
    observe: "OBS",
    response: "RSP",
    warning: "WRN",
  };

  const entries = $derived(game.log.slice(-SHOWN).reverse());
</script>

<Panel title="LOG">
  <ol>
    {#each entries as entry, i (game.log.length - i)}
      <li class:old={i >= RECENT} class:latest={i === 0}>
        <span class="muted">{formatYear(entry.year)}</span>
        <span class="tag {entry.kind}">{TAG[entry.kind]}</span>
        <span>
          {entry.text}
          {#if entry.count > 1}<span class="muted">×{entry.count}</span>{/if}
        </span>
      </li>
    {/each}
  </ol>
</Panel>

<style>
  ol {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 13.5em;
    overflow-y: auto;
  }
  li {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 0 10px;
  }
  .latest {
    font-weight: bold;
  }
  .old {
    opacity: 0.6;
  }
  .tag {
    color: var(--muted);
  }
  .tag.observe {
    color: var(--text);
  }
  .tag.response {
    color: var(--accent);
  }
  .tag.warning {
    color: var(--warning);
  }
</style>
