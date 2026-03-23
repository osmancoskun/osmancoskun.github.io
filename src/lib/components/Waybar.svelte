<script lang="ts">
	import { onMount } from 'svelte';

	let time = $state('');
	let date = $state('');
	let mem = $state(0);
	let cpu = $state(0);
	let bat = $state(100);
	let netUp = $state(0);
	let netDown = $state(0);

	let activeWorkspace = $state(1);

	function rand(min: number, max: number): number {
		return Math.round((Math.random() * (max - min) + min) * 10) / 10;
	}

	function updateStats() {
		const now = new Date();
		time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
		date = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

		mem = rand(3.2, 6.8);
		cpu = Math.round(rand(10, 38));
		bat = Math.max(15, bat - rand(0, 0.3));
		netUp = rand(1.1, 9.9);
		netDown = rand(1.1, 9.9);
	}

	onMount(() => {
		updateStats();
		const interval = setInterval(updateStats, 1000);
		return () => clearInterval(interval);
	});

	export function setWorkspace(n: number) {
		activeWorkspace = n;
	}
</script>

<div class="h-8 bg-[var(--color-bar-bg)] border-b border-[var(--color-border)] flex items-center justify-between px-2 font-mono text-xs text-[var(--color-bar-fg)] select-none shrink-0">
	<!-- Left: Workspaces + title -->
	<div class="flex items-center gap-1">
		{#each [1, 2, 3, 4, 5] as ws}
			<button
				class="px-2.5 py-1 rounded-sm transition-colors {ws === activeWorkspace
					? 'bg-[var(--color-accent)] text-[var(--color-bar-bg)] font-bold'
					: 'hover:bg-[var(--color-surface)]'}"
				onclick={() => activeWorkspace = ws}
			>
				{ws}
			</button>
		{/each}
		<span class="ml-3 text-[var(--color-fg-dim)]">osman@osmancoskun ~</span>
	</div>

	<!-- Right: System tray -->
	<div class="flex items-center gap-3">
		<span class="text-[var(--color-green)]" style="font-variant-numeric: tabular-nums">↓ {netDown.toFixed(1)} ↑ {netUp.toFixed(1)} MB/s</span>
		<span style="font-variant-numeric: tabular-nums">cpu: {cpu}%</span>
		<span style="font-variant-numeric: tabular-nums">mem: {mem.toFixed(1)}G</span>
		<span class="text-[var(--color-yellow)]" style="font-variant-numeric: tabular-nums">bat: {Math.round(bat)}%</span>
		<span class="text-[var(--color-fg)]" style="font-variant-numeric: tabular-nums">{time}</span>
		<span class="text-[var(--color-fg-dim)]">{date}</span>
	</div>
</div>
