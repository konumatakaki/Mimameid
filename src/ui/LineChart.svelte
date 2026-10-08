<script lang="ts">
  import { formatYear } from "../core/format.ts";

  interface Series {
    label: string;
    /** CSS の色（例: var(--series-1)） */
    color: string;
    values: number[];
  }

  let {
    title,
    years,
    series,
    threshold,
  }: {
    title: string;
    years: number[];
    series: Series[];
    threshold?: { value: number; label: string };
  } = $props();

  const HEIGHT = 150;
  const PAD = { top: 10, right: 14, bottom: 22, left: 34 };
  const TABLE_ROWS = 12;

  let width = $state(320);
  let hover = $state<number | null>(null);

  function niceMax(v: number): number {
    if (v <= 0) return 1;
    const half = 10 ** Math.floor(Math.log10(v)) / 2;
    return Math.ceil(v / half) * half;
  }

  const maxY = $derived(
    niceMax(
      Math.max(threshold?.value ?? 0, ...series.flatMap((s) => s.values)) *
        1.05,
    ),
  );
  const ticks = $derived([0, maxY / 2, maxY]);
  const index = $derived(hover ?? years.length - 1);
  const plotWidth = $derived(Math.max(1, width - PAD.left - PAD.right));

  function x(i: number): number {
    return (
      PAD.left + (years.length > 1 ? i / (years.length - 1) : 0) * plotWidth
    );
  }

  function y(v: number): number {
    return PAD.top + (1 - v / maxY) * (HEIGHT - PAD.top - PAD.bottom);
  }

  function path(values: number[]): string {
    return values
      .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join("");
  }

  function clampIndex(i: number): number {
    return Math.min(years.length - 1, Math.max(0, i));
  }

  function onpointermove(e: PointerEvent) {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const ratio = (e.clientX - rect.left - PAD.left) / plotWidth;
    hover = clampIndex(Math.round(ratio * (years.length - 1)));
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    hover = clampIndex(index + (e.key === "ArrowLeft" ? -1 : 1));
  }

  const tableRows = $derived(
    Array.from({ length: Math.min(TABLE_ROWS, years.length) }, (_, k) =>
      Math.round(
        (k * (years.length - 1)) /
          Math.max(1, Math.min(TABLE_ROWS, years.length) - 1),
      ),
    ),
  );
</script>

<figure>
  <figcaption>{title}</figcaption>
  <p class="readout">
    <span class="muted">{formatYear(years[index] ?? 0)}</span>
    {#each series as s (s.label)}
      <span class="key">
        <svg width="16" height="8" aria-hidden="true">
          <line
            x1="0"
            x2="16"
            y1="4"
            y2="4"
            stroke={s.color}
            stroke-width="2"
          />
        </svg>
        <strong>{(s.values[index] ?? 0).toFixed(2)}</strong>
        <span class="muted">{s.label}</span>
      </span>
    {/each}
  </p>
  <div bind:clientWidth={width}>
    <svg
      {width}
      height={HEIGHT}
      role="slider"
      aria-label="{title}（左右キーで時点を選ぶ）"
      aria-valuemin={0}
      aria-valuemax={years.length - 1}
      aria-valuenow={index}
      aria-valuetext={formatYear(years[index] ?? 0)}
      tabindex="0"
      {onpointermove}
      onpointerleave={() => (hover = null)}
      {onkeydown}
    >
      {#each ticks as t (t)}
        <line
          class="grid"
          x1={PAD.left}
          x2={width - PAD.right}
          y1={y(t)}
          y2={y(t)}
        />
        <text class="tick" x={PAD.left - 6} y={y(t) + 4} text-anchor="end"
          >{t}</text
        >
      {/each}
      {#if threshold}
        <line
          class="threshold"
          x1={PAD.left}
          x2={width - PAD.right}
          y1={y(threshold.value)}
          y2={y(threshold.value)}
        />
        <text class="tick" x={PAD.left + 4} y={y(threshold.value) - 4}>
          {threshold.label}
        </text>
      {/if}
      <text class="tick" x={PAD.left} y={HEIGHT - 4}
        >{formatYear(years[0] ?? 0)}</text
      >
      <text class="tick" x={width - PAD.right} y={HEIGHT - 4} text-anchor="end">
        {formatYear(years.at(-1) ?? 0)}
      </text>
      {#each series as s (s.label)}
        <path d={path(s.values)} stroke={s.color} />
      {/each}
      {#if hover !== null}
        <line
          class="crosshair"
          x1={x(index)}
          x2={x(index)}
          y1={PAD.top}
          y2={HEIGHT - PAD.bottom}
        />
      {/if}
      {#each series as s (s.label)}
        <circle
          cx={x(index)}
          cy={y(s.values[index] ?? 0)}
          r="4"
          fill={s.color}
        />
      {/each}
    </svg>
  </div>
  <details>
    <summary class="muted">TABLE</summary>
    <table>
      <thead>
        <tr>
          <th>YEAR</th>
          {#each series as s (s.label)}<th>{s.label}</th>{/each}
        </tr>
      </thead>
      <tbody>
        {#each tableRows as i (i)}
          <tr>
            <td>{formatYear(years[i])}</td>
            {#each series as s (s.label)}<td>{s.values[i].toFixed(2)}</td
              >{/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </details>
</figure>

<style>
  figure {
    margin: 16px 0 0;
  }
  figcaption {
    font-size: 12px;
    letter-spacing: 0.1em;
    color: var(--muted);
  }
  .readout {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 14px;
    margin: 4px 0;
    font-size: 12px;
  }
  .key {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  svg[role="slider"] {
    display: block;
    touch-action: pan-y;
  }
  svg[role="slider"]:focus-visible {
    outline: 2px solid var(--accent);
  }
  path {
    fill: none;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  circle {
    stroke: var(--panel);
    stroke-width: 2;
  }
  .grid {
    stroke: var(--line);
    stroke-width: 1;
  }
  .threshold {
    stroke: var(--muted);
    stroke-width: 1;
  }
  .crosshair {
    stroke: var(--muted);
    stroke-width: 1;
  }
  .tick {
    fill: var(--muted);
    font-size: 10px;
  }
  table {
    border-collapse: collapse;
    font-size: 12px;
    margin-top: 4px;
  }
  th,
  td {
    padding: 0 10px 0 0;
    text-align: right;
  }
  th {
    color: var(--muted);
    font-weight: normal;
  }
</style>
