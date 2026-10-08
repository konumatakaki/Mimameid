<script lang="ts">
  import { DIRECTIVE } from "../content/text.ts";
  import { GOAL_TECH, TECHS } from "../content/techs.ts";
  import { formatPercent } from "../core/format.ts";
  import * as R from "../core/rules.ts";
  import { game } from "../game.svelte.ts";

  const goal = TECHS[GOAL_TECH];

  const goalStatus = $derived.by(() => {
    const p = game.humans.techs[GOAL_TECH];
    if (game.sleeping) return "観測できない（スリープ中）";
    if (p.done) return "獲得";
    if (game.humans.target === GOAL_TECH) {
      return `研究中 ${formatPercent(R.techProgress(game, GOAL_TECH))}`;
    }
    const missing = goal.requires.filter((t) => !game.humans.techs[t].done);
    if (missing.length === 0) return "研究できる段階にある";
    return `要: ${missing.map((t) => TECHS[t].name).join("、")}`;
  });
</script>

{#if game.phase !== "ended"}
  <section>
    <p>
      <span class="label">DIRECTIVE</span>
      <span>{DIRECTIVE[game.phase]}</span>
    </p>
    {#if game.phase === "chapter1"}
      <p>
        <span class="label">GOAL</span>
        <span>{goal.label} {goal.name} — {goalStatus}</span>
      </p>
    {/if}
  </section>
{/if}

<style>
  section {
    border-left: 2px solid var(--accent);
    padding: 2px 0 2px 12px;
  }
  p {
    margin: 0;
    display: flex;
    gap: 12px;
  }
  .label {
    flex: 0 0 6em;
    color: var(--muted);
  }
</style>
