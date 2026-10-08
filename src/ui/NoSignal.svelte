<script lang="ts">
  let { reason = "SLEEPING" }: { reason?: string } = $props();
</script>

<p class="muted">-- NO SIGNAL / {reason} --</p>

<style>
  p {
    margin: 0;
  }
</style>
