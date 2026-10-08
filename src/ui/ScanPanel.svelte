<script lang="ts">
  import * as A from "../core/actions.ts";
  import { SCAN_COST } from "../core/rules.ts";
  import { MANUAL } from "../content/text.ts";
  import { game } from "../game.svelte.ts";
  import Action from "./Action.svelte";
  import Panel from "./Panel.svelte";
</script>

<Panel title="SURFACE">
  <Action
    label="SCAN SURFACE"
    detail="{SCAN_COST} EN"
    desc={MANUAL.scan}
    disabled={!A.canScan(game)}
    onclick={() => A.scan(game)}
  />
</Panel>
