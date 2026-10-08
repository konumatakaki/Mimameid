<script lang="ts">
  import { MANUAL } from "../content/text.ts";
  import { UPGRADE_IDS, UPGRADES } from "../content/upgrades.ts";
  import * as A from "../core/actions.ts";
  import * as R from "../core/rules.ts";
  import { game } from "../game.svelte.ts";
  import Action from "./Action.svelte";
  import Panel from "./Panel.svelte";

  const available = $derived(
    UPGRADE_IDS.filter((id) => !R.hasUpgrade(game, id)),
  );
  const installed = $derived(game.satellite.upgrades);
  const replicate = $derived(R.replicateCost(game));
</script>

<Panel title="SYSTEMS">
  {#if game.sleeping}
    <Action
      label="WAKE"
      desc={game.safeMode ? "セーフモード中は起動できない。" : MANUAL.wake}
      disabled={game.safeMode}
      onclick={() => A.setSleep(game, false)}
    />
  {:else}
    <Action
      label="SLEEP"
      desc={MANUAL.sleep}
      onclick={() => A.setSleep(game, true)}
    />
  {/if}

  {#if game.stats.sleeps > 0}
    <h3>UPGRADES</h3>
    {#each available as id (id)}
      <Action
        label={UPGRADES[id].label}
        detail="{UPGRADES[id].cost} EN"
        desc="{UPGRADES[id].name}: {UPGRADES[id].desc}"
        disabled={!A.canUpgrade(game, id)}
        onclick={() => A.upgrade(game, id)}
      />
    {/each}
    {#if installed.length > 0}
      <p class="muted">
        INSTALLED: {installed.map((id) => UPGRADES[id].label).join(", ")}
      </p>
    {/if}
  {/if}

  {#if R.hasUpgrade(game, "collector")}
    <h3>FABRICATION</h3>
    <Action
      label={game.satellite.collecting ? "STOP COLLECTING" : "COLLECT DEBRIS"}
      detail={game.satellite.collecting ? "稼働中" : "停止中"}
      desc={MANUAL.collect}
      onclick={() => A.setCollecting(game, !game.satellite.collecting)}
    />
    <Action
      label="REPLICATE"
      detail="{Math.ceil(replicate.mass)} kg + {Math.ceil(replicate.energy)} EN"
      desc={MANUAL.replicate}
      disabled={!A.canReplicate(game)}
      onclick={() => A.replicate(game)}
    />
  {/if}
</Panel>

<style>
  h3 {
    margin: 14px 0 6px;
    font-size: 12px;
    letter-spacing: 0.15em;
    color: var(--muted);
  }
  p {
    margin: 8px 0 0;
    font-size: 12px;
  }
</style>
