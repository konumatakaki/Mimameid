<script lang="ts">
  import { MANUAL } from "../content/text.ts";
  import * as A from "../core/actions.ts";
  import { formatBits } from "../core/format.ts";
  import * as R from "../core/rules.ts";
  import { game } from "../game.svelte.ts";
  import Action from "./Action.svelte";
  import NoSignal from "./NoSignal.svelte";
  import Panel from "./Panel.svelte";
</script>

<Panel title="TRANSMIT">
  {#if game.sleeping}
    <NoSignal />
  {:else}
    <Action
      label="LIGHT SIGNAL"
      detail="{formatBits(R.bandwidth(game))} / {R.TRANSMIT_COST} EN"
      desc={MANUAL.transmit}
      disabled={!A.canTransmit(game)}
      onclick={() => A.transmit(game)}
    />
  {/if}
</Panel>
