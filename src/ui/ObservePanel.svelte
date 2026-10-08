<script lang="ts">
  import { TECH_IDS, TECHS } from "../content/techs.ts";
  import { formatBits, formatInt, formatPercent } from "../core/format.ts";
  import * as R from "../core/rules.ts";
  import { game } from "../game.svelte.ts";
  import Panel from "./Panel.svelte";
  import Stat from "./Stat.svelte";

  const h = $derived(game.humans);
  const known = $derived(TECH_IDS.filter((id) => h.techs[id].done));
  const target = $derived(h.target);
</script>

<Panel title="OBSERVE">
  {#if game.sleeping}
    <p class="muted">-- NO SIGNAL / SLEEPING --</p>
  {:else}
    <Stat label="POPULATION">{formatInt(h.pop)}</Stat>
    <Stat label="USABLE">{formatBits(R.usable(game))}</Stat>
    <Stat label="LATENT">{formatBits(h.latent)}</Stat>
    {#if h.winter > 0}
      <Stat label="CLIMATE"><span class="warning">⚠ FIMBULWINTER</span></Stat>
    {/if}
    <h3>KNOWLEDGE</h3>
    {#if known.length === 0}
      <p class="muted">（獲得済みの技術は観測されていない）</p>
    {/if}
    <ul>
      {#each known as id (id)}
        <li>
          <span>{TECHS[id].label}</span>
          <span class="muted">{TECHS[id].name}</span>
          <span>理解 {formatPercent(R.understanding(game, id))}</span>
        </li>
      {/each}
    </ul>
    {#if target}
      <p>
        <span class="muted">RESEARCH</span>
        {TECHS[target].label}
        <span class="muted">{TECHS[target].name}</span>
        {formatPercent(
          (h.techs[target].own + h.techs[target].given) / TECHS[target].cost,
        )}
      </p>
    {/if}
  {/if}
</Panel>

<style>
  h3 {
    margin: 10px 0 4px;
    font-size: 12px;
    letter-spacing: 0.15em;
    color: var(--muted);
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    display: flex;
    flex-wrap: wrap;
    gap: 0 10px;
  }
  p {
    margin: 6px 0 0;
  }
</style>
