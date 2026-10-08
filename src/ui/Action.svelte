<script lang="ts">
  let {
    label,
    detail = "",
    desc = "",
    disabled = false,
    onclick,
  }: {
    label: string;
    detail?: string;
    desc?: string;
    disabled?: boolean;
    onclick: () => void;
  } = $props();
</script>

<div class="action">
  <div class="row">
    <button {disabled} {onclick}>{label}</button>
    {#if detail}<span class="muted">{detail}</span>{/if}
  </div>
  {#if desc}<p class="muted">{desc}</p>{/if}
</div>

<style>
  .action + :global(.action) {
    margin-top: 10px;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 12px;
  }
  p {
    margin: 4px 0 0;
    font-size: 12px;
  }
</style>
