<script lang="ts">
  import { CONTACT, MANUAL } from "../content/text.ts";
  import * as A from "../core/actions.ts";
  import * as R from "../core/rules.ts";
  import { game } from "../game.svelte.ts";
  import Action from "./Action.svelte";
  import Panel from "./Panel.svelte";

  const c = $derived(game.contact);

  function mark(i: number): string {
    return i < c.step ? "[x]" : i === c.step ? "[>]" : "[ ]";
  }
</script>

<Panel title="STANDARD CONTACT PROCEDURE">
  <ol>
    {#each CONTACT.steps as step, i (step.label)}
      <li class:muted={i > c.step}>
        <span>{mark(i)}</span>
        <span>{i + 1}. {step.label}</span>
        <span class="muted">{step.name}</span>
        {#if i === 1}<span>{c.beacons}/{R.BEACONS_NEEDED}</span>{/if}
      </li>
    {/each}
  </ol>
  {#if c.step === 0}
    <Action
      label="SCAN SURFACE"
      detail="{R.SCAN_COST} EN"
      desc={MANUAL.scan}
      disabled={!A.canScan(game)}
      onclick={() => A.scan(game)}
    />
  {:else if c.step === 1}
    <Action
      label="SEND BEACON"
      detail="{R.BEACON_COST} EN"
      desc={MANUAL.beacon}
      disabled={!A.canBeacon(game)}
      onclick={() => A.beacon(game)}
    />
  {:else if c.step === 2}
    <p class="muted">応答を待っている……</p>
  {:else}
    <Action
      label="ESTABLISH CODE"
      detail="{R.HANDSHAKE_COST} EN"
      desc={MANUAL.handshake}
      disabled={!A.canHandshake(game)}
      onclick={() => A.handshake(game)}
    />
  {/if}
</Panel>

<style>
  ol {
    list-style: none;
    margin: 0 0 12px;
    padding: 0;
  }
  li {
    display: flex;
    flex-wrap: wrap;
    gap: 0 10px;
  }
  p {
    margin: 0;
  }
</style>
