<script lang="ts">
  import type { Snippet } from "svelte";

  let { label, children }: { label: string; children: Snippet } = $props();
</script>

<div class="stat">
  <span class="label">{label}</span>
  <span>{@render children()}</span>
</div>

<style>
  .stat {
    display: flex;
    gap: 12px;
  }
  .label {
    flex: 0 0 9.5em;
    color: var(--muted);
  }
</style>
