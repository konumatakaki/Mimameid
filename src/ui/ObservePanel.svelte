<script lang="ts">
  import { describeLife, describeSigns } from "../core/describe.ts";
  import { formatBits, formatInt, formatRate } from "../core/format.ts";
  import * as R from "../core/rules.ts";
  import { game } from "../game.svelte.ts";
  import NoSignal from "./NoSignal.svelte";
  import Panel from "./Panel.svelte";
  import Stat from "./Stat.svelte";

  const h = $derived(game.humans);
  const contacted = $derived(
    game.phase !== "prologue" || game.contact.step >= 3,
  );
  const net = $derived(h.rates.own + h.rates.given - h.rates.decay);
  const backlog = $derived(h.latent / R.absorbRate(game));
</script>

<Panel title="OBSERVE">
  {#if !contacted}
    <NoSignal reason="NO CONTACT" />
  {:else if game.sleeping}
    <NoSignal />
  {:else}
    <Stat label="POPULATION">{formatInt(h.pop)}</Stat>
    <Stat label="USABLE">
      {formatBits(R.usable(game))}
      <span class:muted={net >= 0} class:warning={net < 0}
        >{formatRate(net)}</span
      >
    </Stat>
    <Stat label="">
      <span class="muted">
        自力 {formatRate(h.rates.own)} · 授与 {formatRate(h.rates.given)} · 劣化
        {formatRate(-h.rates.decay)}
      </span>
    </Stat>
    <Stat label="LATENT">
      {formatBits(h.latent)}
      {#if h.latent >= 1}
        <span class="muted">受け取りまで約{Math.ceil(backlog)}年</span>
      {/if}
    </Stat>

    <p class="report">{describeLife(game).join("")}</p>
    {#each describeSigns(game) as sign (sign)}
      <p class="warning">⚠ {sign}</p>
    {/each}
  {/if}
</Panel>

<style>
  .report {
    margin: 10px 0 0;
  }
  .warning {
    margin: 6px 0 0;
  }
</style>
