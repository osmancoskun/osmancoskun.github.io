<script lang="ts">
	import { onMount } from 'svelte';

	let { onComplete }: { onComplete: () => void } = $props();

	let visibleLines = $state(0);
	let showPressKey = $state(false);

	const biosLines = [
		'American Megatrends Inc.',
		'AMIBIOS (C) 2024 American Megatrends, Inc.',
		'OSMANCOSKUN.COM BIOS v1.0.0',
		'',
		'CPU: CaffeineCore i9-Espresso @ 4.20 GHz (Turbo Brew Enabled)',
		'Speed: 4.20 GHz    Count: Too Many Tabs',
		'',
		'Memory Test:  ∞ KB OK (but Chrome wants more)',
		'',
		'Press DEL to run Setup',
		'Press F12 for Boot Menu',
		'',
		'Initializing USB Controllers... Done.',
		'  1 Mechanical Keyboard found. RGB: Maximum.',
		'',
		'Checking NVRAM...',
		'  640 KB ought to be enough for anybody',
		'',
		'Detecting Primary Master... SSD Portfolio v2.0',
		'Detecting Primary Slave... None',
		'Detecting Secondary Master... None',
		'Detecting Secondary Slave... None',
		'',
	];

	onMount(() => {
		let i = 0;
		const interval = setInterval(() => {
			if (i < biosLines.length) {
				visibleLines = ++i;
			} else {
				clearInterval(interval);
				showPressKey = true;
			}
		}, 200);

		const handleSkip = () => {
			clearInterval(interval);
			onComplete();
		};

		window.addEventListener('click', handleSkip);
		window.addEventListener('keydown', handleSkip);

		return () => {
			clearInterval(interval);
			window.removeEventListener('click', handleSkip);
			window.removeEventListener('keydown', handleSkip);
		};
	});

	$effect(() => {
		if (showPressKey) {
			const timeout = setTimeout(() => onComplete(), 2500);
			return () => clearTimeout(timeout);
		}
	});
</script>

<div class="fixed inset-0 bg-black text-white font-mono text-sm p-8 overflow-hidden select-none">
	<div class="max-w-3xl">
		{#each biosLines.slice(0, visibleLines) as line, i}
			{#if i === 0}
				<div class="text-[var(--color-cyan)] font-bold text-2xl mb-2">{line}</div>
			{:else if i === 2}
				<div class="text-[var(--color-yellow)] mb-2">{line}</div>
			{:else}
				<div class="leading-6 {line === '' ? 'h-4' : ''}">{line}&nbsp;</div>
			{/if}
		{/each}
	</div>

	{#if showPressKey}
		<div class="absolute bottom-8 left-8 text-[var(--color-fg-dim)] animate-pulse">
			Press any key to continue...
		</div>
	{/if}

	<div class="absolute bottom-8 right-8 text-[var(--color-fg-dim)] text-xs">
		Click or press any key to skip
	</div>
</div>
