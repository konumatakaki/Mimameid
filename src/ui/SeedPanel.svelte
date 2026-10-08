<script lang="ts">
  import { INSTITUTION_IDS, INSTITUTIONS } from "../content/institutions.ts";
  import { MANUAL } from "../content/text.ts";
  import { TECHS } from "../content/techs.ts";
  import * as A from "../core/actions.ts";
  import * as R from "../core/rules.ts";
  import { game } from "../game.svelte.ts";
  import Action from "./Action.svelte";
  import Panel from "./Panel.svelte";

  function detail(id: (typeof INSTITUTION_IDS)[number]): string {
    const def = INSTITUTIONS[id];
    if (A.seedLocked(game, id)) {
      return `要: ${def.requires.map((t) => TECHS[t].name).join("、")}`;
    }
    const cost = Math.ceil(R.seedCost(game, id));
    return `×${game.humans.institutions[id]} · ${cost} EN · 人手 ${def.staff} · ${def.output} b/年`;
  }
</script>

<Panel title="SEED">
  <p class="muted">{MANUAL.seed}</p>
  <p>STAFF {R.staffUsed(game)} / {R.staffCap(game)}</p>
  {#each INSTITUTION_IDS as id (id)}
    <Action
      label={INSTITUTIONS[id].label}
      detail={detail(id)}
      desc="{INSTITUTIONS[id].name}: {INSTITUTIONS[id].desc}"
      disabled={!A.canSeed(game, id)}
      onclick={() => A.seed(game, id)}
    />
  {/each}
</Panel>

<style>
  p {
    margin: 0 0 8px;
    font-size: 12px;
  }
</style>
