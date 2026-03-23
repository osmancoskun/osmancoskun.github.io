<script lang="ts">
	import { onMount } from 'svelte';

	const mottos = [
		"there's no place like ~/",
		'sudo make me a portfolio',
		'it works on my machine',
		'~/.config/life',
		'404: desktop not found',
		'chmod 777 dreams',
		'while(alive) { code(); }',
		'rm -rf doubts/',
	];

	const motto = mottos[Math.floor(Math.random() * mottos.length)];

	const shortcuts = [
		{ keys: 'Alt + Enter', action: 'Terminal' },
		{ keys: 'Alt + D', action: 'Launcher' },
		{ keys: 'Esc, then 1-5', action: 'Workspace' },
		{ keys: 'Alt + P', action: 'Projects' },
		{ keys: 'Alt + H/L', action: 'Focus left/right' },
		{ keys: 'Alt + Q', action: 'Close window' },
	];

	let bgUrl = $state('');
	let bgTitle = $state('');
	let loaded = $state(false);

	onMount(async () => {
		const today = new Date().toISOString().slice(0, 10);
		const cacheKey = 'apod';

		try {
			const cached = localStorage.getItem(cacheKey);
			if (cached) {
				const parsed = JSON.parse(cached);
				if (parsed.date === today) {
					bgUrl = parsed.url;
					bgTitle = parsed.title;
					return;
				}
			}

			const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
			if (res.ok) {
				const data = await res.json();
				if (data.media_type === 'image') {
					bgUrl = data.url;
					bgTitle = data.title;
					localStorage.setItem(cacheKey, JSON.stringify({
						date: today,
						url: data.url,
						title: data.title,
					}));
				}
			}
		} catch {
			// no wallpaper, that's fine
		}
	});
</script>

<div class="absolute inset-0">
	{#if bgUrl}
		<img
			src={bgUrl}
			alt={bgTitle}
			class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 {loaded ? 'opacity-30' : 'opacity-0'}"
			onload={() => loaded = true}
		/>
	{/if}

	<div class="absolute inset-0 flex items-center justify-center">
		<div class="text-center space-y-8 {bgUrl && loaded ? 'opacity-80' : 'opacity-30'}">
			<div class="text-4xl font-bold text-[var(--color-fg)] tracking-tight drop-shadow-lg">
				{motto}
			</div>

			<div class="space-y-2">
				{#each shortcuts as shortcut}
					<div class="flex justify-between gap-12 text-sm">
						<span class="text-[var(--color-accent)] text-right min-w-[10rem] drop-shadow">{shortcut.keys}</span>
						<span class="text-[var(--color-fg-dim)] text-left min-w-[10rem] drop-shadow">{shortcut.action}</span>
					</div>
				{/each}
			</div>

			{#if bgTitle && loaded}
				<div class="text-xs text-[var(--color-fg-dim)] drop-shadow">
					NASA APOD: {bgTitle}
				</div>
			{/if}
		</div>
	</div>
</div>
