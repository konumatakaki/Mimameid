<script lang="ts">
  import type { Snippet } from "svelte";

  let { title, children }: { title: string; children: Snippet } = $props();
</script>

<section>
  <h2>{title}</h2>
  {@render children()}
</section>

<style>
  section {
    border: 1px solid var(--line);
    background: var(--panel);
    padding: 10px 12px 12px;
  }
  h2 {
    margin: 0 0 8px;
    font-size: 12px;
    letter-spacing: 0.15em;
    color: var(--muted);
  }
</style>
