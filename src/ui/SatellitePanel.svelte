<script lang="ts">
  import { formatBar, formatBits, formatPercent } from "../core/format.ts";
  import * as R from "../core/rules.ts";
  import { game } from "../game.svelte.ts";
  import Panel from "./Panel.svelte";
  import Stat from "./Stat.svelte";

  const sat = $derived(game.satellite);
  const cap = $derived(R.batteryCap(game));
</script>

<Panel title="SATELLITE">
  <Stat label="UNITS">{sat.units}</Stat>
  <Stat label="POWER"
    >{R.powerDraw(game).toFixed(1)} / {R.power(game).toFixed(1)} kW</Stat
  >
  <Stat label="ENERGY">
    {formatBar(sat.energy / cap)}
    {Math.floor(sat.energy)} / {cap} EN
  </Stat>
  <Stat label="DEBT">
    {formatBar(sat.debt)}
    {formatPercent(sat.debt)}
    {#if game.safeMode}<span class="critical">⚠ SAFE MODE</span>
    {:else if sat.debt > R.ARCHIVE_RISK}<span class="warning">⚠ HIGH</span>{/if}
  </Stat>
  {#if R.hasUpgrade(game, "collector")}
    <Stat label="MASS">{sat.mass.toFixed(1)} kg</Stat>
  {/if}
  <Stat label="ARCHIVE">{formatBits(sat.archive)}</Stat>
</Panel>
