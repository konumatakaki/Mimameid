<script lang="ts">
  import { GOAL_TECH, TECH_IDS, TECHS, type TechId } from "../content/techs.ts";
  import { formatPercent } from "../core/format.ts";
  import * as R from "../core/rules.ts";
  import { game } from "../game.svelte.ts";
  import NoSignal from "./NoSignal.svelte";
  import Panel from "./Panel.svelte";

  type Status = "done" | "research" | "open" | "locked";

  const KIND = { power: "力", control: "制御", receptive: "受容" } as const;
  const MARK: Record<Status, string> = {
    done: "[x]",
    research: "[>]",
    open: "[ ]",
    locked: "[-]",
  };
  const ORDER: Status[] = ["done", "research", "open", "locked"];

  function status(id: TechId): Status {
    if (game.humans.techs[id].done) return "done";
    if (game.humans.target === id) return "research";
    return R.techAvailable(game, id) ? "open" : "locked";
  }

  function detail(id: TechId, st: Status): string {
    if (st === "done")
      return `理解 ${formatPercent(R.understanding(game, id))}`;
    if (st === "research") {
      return `研究中 ${formatPercent(R.techProgress(game, id))}`;
    }
    if (st === "open") return "";
    const missing = TECHS[id].requires.filter(
      (t) => !game.humans.techs[t].done,
    );
    return `要: ${missing.map((t) => TECHS[t].name).join("、")}`;
  }

  const rows = $derived(
    TECH_IDS.map((id) => ({ id, st: status(id) })).sort(
      (a, b) => ORDER.indexOf(a.st) - ORDER.indexOf(b.st),
    ),
  );
</script>

<Panel title="KNOWLEDGE">
  {#if game.sleeping}
    <NoSignal />
  {:else}
    <p class="muted note">
      アーカイブの技術体系と、集落が身につけたもの。理解度は、自力で身につけた割合。
    </p>
    <ul>
      {#each rows as { id, st } (id)}
        <li class:muted={st === "locked"}>
          <span>{MARK[st]}</span>
          <span>{TECHS[id].label}</span>
          <span class="muted">{TECHS[id].name}・{KIND[TECHS[id].kind]}</span>
          <span>{detail(id, st)}</span>
          {#if id === GOAL_TECH}<span class="goal">GOAL</span>{/if}
        </li>
      {/each}
    </ul>
  {/if}
</Panel>

<style>
  .note {
    margin: 0 0 8px;
    font-size: 12px;
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
  .goal {
    color: var(--accent);
  }
</style>
